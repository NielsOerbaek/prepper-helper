import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { sendPushNotification } from "@/lib/web-push";

// Send a test notification to the current user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's push subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: session.user.id },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: "No push subscriptions found. Please enable notifications first." },
        { status: 400 }
      );
    }

    // Find items close to expiration for this user
    const userStashes = await prisma.stashMember.findMany({
      where: { userId: session.user.id },
      select: { stashId: true },
    });

    const stashIds = userStashes.map(s => s.stashId);
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const expiringItems = await prisma.item.findMany({
      where: {
        stashId: { in: stashIds },
        expirationDate: {
          lte: sevenDaysFromNow,
          not: null,
        },
      },
      orderBy: { expirationDate: 'asc' },
    });

    let title = "Test";
    let body = "Notifikationer virker";
    let url = "/";

    // Categorize items
    const expired = expiringItems.filter(item => {
      const days = Math.ceil((item.expirationDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return days <= 0;
    });
    const expiringSoon = expiringItems.filter(item => {
      const days = Math.ceil((item.expirationDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return days > 0 && days <= 7;
    });

    if (expired.length > 0) {
      title = "Udløbsadvarsel";
      body = expired.length === 1
        ? `${expired[0].name} er udløbet`
        : `${expired.length} varer er udløbet`;
      url = "/inventory?expiration=expired";
    } else if (expiringSoon.length > 0) {
      title = "Udløbsadvarsel";
      body = expiringSoon.length === 1
        ? `${expiringSoon[0].name} udløber snart`
        : `${expiringSoon.length} varer udløber snart`;
      url = "/inventory?expiration=soon";
    }

    // Send to all subscriptions
    const results = await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          const success = await sendPushNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            { title, body, url, tag: "test-notification" }
          );

          // If subscription is invalid, delete it
          if (!success) {
            await prisma.pushSubscription.delete({ where: { id: sub.id } });
          }

          return success;
        } catch {
          return false;
        }
      })
    );

    const successCount = results.filter(Boolean).length;

    return NextResponse.json({
      success: true,
      sent: successCount,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error("[Push Test] Error:", error);
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 }
    );
  }
}

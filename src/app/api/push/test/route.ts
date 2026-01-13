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

    // Find the item closest to expiration for this user
    const userStashes = await prisma.stashMember.findMany({
      where: { userId: session.user.id },
      select: { stashId: true },
    });

    const stashIds = userStashes.map(s => s.stashId);

    const closestExpiringItem = await prisma.item.findFirst({
      where: {
        stashId: { in: stashIds },
        expirationDate: { not: null },
      },
      orderBy: { expirationDate: 'asc' },
      include: { stash: true },
    });

    let title = "Test Notification";
    let body = "Push notifications are working!";
    let url = "/";

    if (closestExpiringItem && closestExpiringItem.expirationDate) {
      const daysUntil = Math.ceil(
        (closestExpiringItem.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntil <= 0) {
        body = `${closestExpiringItem.name} has expired!`;
      } else if (daysUntil === 1) {
        body = `${closestExpiringItem.name} expires tomorrow!`;
      } else {
        body = `${closestExpiringItem.name} expires in ${daysUntil} days`;
      }
      title = "Expiration Alert";
      url = "/expiring";
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

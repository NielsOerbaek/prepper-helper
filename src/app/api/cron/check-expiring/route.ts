import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendPushNotification } from "@/lib/web-push";

// Vercel Cron Job endpoint - runs daily at 7am UTC
// Configured in vercel.json
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (supports both header formats)
    const authHeader = request.headers.get("authorization");
    const apiKeyHeader = request.headers.get("x-api-key");
    const cronSecret = process.env.CRON_SECRET || process.env.CRON_API_KEY;

    const isAuthorized =
      (authHeader && authHeader === `Bearer ${cronSecret}`) ||
      (apiKeyHeader && apiKeyHeader === cronSecret);

    if (cronSecret && !isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const notificationThresholds = [7, 3, 1, 0]; // Days before expiration to notify

    // Get all items expiring within 7 days
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const expiringItems = await prisma.item.findMany({
      where: {
        expirationDate: {
          lte: sevenDaysFromNow,
          not: null,
        },
      },
      include: {
        stash: {
          include: {
            members: {
              include: {
                user: {
                  include: {
                    pushSubscriptions: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    let notificationsSent = 0;
    let subscriptionsRemoved = 0;

    for (const item of expiringItems) {
      if (!item.expirationDate) continue;

      const daysUntil = Math.ceil(
        (item.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Only notify on threshold days
      if (!notificationThresholds.includes(daysUntil)) continue;

      let title = "Expiration Alert";
      let body: string;

      if (daysUntil <= 0) {
        body = `${item.name} has expired!`;
      } else if (daysUntil === 1) {
        body = `${item.name} expires tomorrow!`;
      } else {
        body = `${item.name} expires in ${daysUntil} days`;
      }

      // Send to all stash members with push subscriptions
      for (const member of item.stash.members) {
        for (const subscription of member.user.pushSubscriptions) {
          try {
            const success = await sendPushNotification(
              {
                endpoint: subscription.endpoint,
                keys: { p256dh: subscription.p256dh, auth: subscription.auth },
              },
              {
                title,
                body,
                url: "/inventory?expiration=expired",
                tag: `expiring-${item.id}-${daysUntil}`,
                requireInteraction: daysUntil <= 1,
              }
            );

            if (success) {
              notificationsSent++;
            } else {
              // Subscription is invalid, remove it
              await prisma.pushSubscription.delete({
                where: { id: subscription.id },
              });
              subscriptionsRemoved++;
            }
          } catch (error) {
            console.error("[Cron Check Expiring] Error sending notification:", error);
          }
        }
      }
    }

    console.log(`[Cron] Checked ${expiringItems.length} items, sent ${notificationsSent} notifications`);

    return NextResponse.json({
      success: true,
      itemsChecked: expiringItems.length,
      notificationsSent,
      subscriptionsRemoved,
    });
  } catch (error) {
    console.error("[Cron Check Expiring] Error:", error);
    return NextResponse.json(
      { error: "Failed to check expiring items" },
      { status: 500 }
    );
  }
}

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

    // Get all items expiring within 7 days grouped by user
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

    // Group items by user
    const userItems = new Map<string, {
      expired: string[];
      tomorrow: string[];
      soon: string[];
      subscriptions: { id: string; endpoint: string; p256dh: string; auth: string }[];
    }>();

    for (const item of expiringItems) {
      if (!item.expirationDate) continue;

      const daysUntil = Math.ceil(
        (item.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      for (const member of item.stash.members) {
        const userId = member.user.id;

        if (!userItems.has(userId)) {
          userItems.set(userId, {
            expired: [],
            tomorrow: [],
            soon: [],
            subscriptions: member.user.pushSubscriptions.map(s => ({
              id: s.id,
              endpoint: s.endpoint,
              p256dh: s.p256dh,
              auth: s.auth,
            })),
          });
        }

        const userData = userItems.get(userId)!;

        if (daysUntil <= 0) {
          userData.expired.push(item.name);
        } else if (daysUntil === 1) {
          userData.tomorrow.push(item.name);
        } else if (daysUntil <= 7) {
          userData.soon.push(item.name);
        }
      }
    }

    let notificationsSent = 0;
    let subscriptionsRemoved = 0;

    // Send one notification per user with aggregated info
    for (const [, userData] of userItems) {
      if (userData.subscriptions.length === 0) continue;

      const notifications: { title: string; body: string; url: string; tag: string; requireInteraction: boolean }[] = [];

      // Expired items notification
      if (userData.expired.length > 0) {
        const body = userData.expired.length === 1
          ? `${userData.expired[0]} er udløbet`
          : `${userData.expired.length} varer er udløbet`;
        notifications.push({
          title: "Udløbsadvarsel",
          body,
          url: "/inventory?expiration=expired",
          tag: "expired-items",
          requireInteraction: true,
        });
      }

      // Tomorrow expiring notification
      if (userData.tomorrow.length > 0) {
        const body = userData.tomorrow.length === 1
          ? `${userData.tomorrow[0]} udløber i morgen`
          : `${userData.tomorrow.length} varer udløber i morgen`;
        notifications.push({
          title: "Udløbsadvarsel",
          body,
          url: "/inventory?expiration=soon",
          tag: "expiring-tomorrow",
          requireInteraction: true,
        });
      }

      // Soon expiring notification (2-7 days)
      if (userData.soon.length > 0) {
        const body = userData.soon.length === 1
          ? `${userData.soon[0]} udløber snart`
          : `${userData.soon.length} varer udløber snart`;
        notifications.push({
          title: "Udløbsadvarsel",
          body,
          url: "/inventory?expiration=soon",
          tag: "expiring-soon",
          requireInteraction: false,
        });
      }

      // Send notifications to all user subscriptions
      for (const notification of notifications) {
        for (const subscription of userData.subscriptions) {
          try {
            const success = await sendPushNotification(
              {
                endpoint: subscription.endpoint,
                keys: { p256dh: subscription.p256dh, auth: subscription.auth },
              },
              notification
            );

            if (success) {
              notificationsSent++;
            } else {
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

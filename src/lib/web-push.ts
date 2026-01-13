import webpush from 'web-push';

// VAPID keys should be generated once and stored in environment variables
// Generate with: npx web-push generate-vapid-keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:admin@prep.raakode.dk',
    vapidPublicKey,
    vapidPrivateKey
  );
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

export async function sendPushNotification(
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  },
  payload: PushPayload
): Promise<boolean> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.error('[WebPush] VAPID keys not configured');
    return false;
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify(payload)
    );
    return true;
  } catch (error) {
    console.error('[WebPush] Error sending notification:', error);
    // If subscription is expired or invalid, return false
    if ((error as { statusCode?: number }).statusCode === 410) {
      // Subscription has expired or been unsubscribed
      return false;
    }
    throw error;
  }
}

export function getVapidPublicKey(): string {
  return vapidPublicKey;
}

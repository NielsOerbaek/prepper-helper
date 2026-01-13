"use client";

import { useState, useEffect, useCallback } from "react";

export interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission;
  error: string | null;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: true,
    permission: "default",
    error: null,
  });

  // Check support and subscription status on mount
  useEffect(() => {
    const checkSupport = async () => {
      const isSupported =
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;

      if (!isSupported) {
        setState((prev) => ({
          ...prev,
          isSupported: false,
          isLoading: false,
        }));
        return;
      }

      try {
        const permission = Notification.permission;
        let isSubscribed = false;

        // Check if already subscribed
        const registration = await navigator.serviceWorker.getRegistration("/push-sw.js");
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          isSubscribed = !!subscription;
        }

        setState({
          isSupported: true,
          isSubscribed,
          isLoading: false,
          permission,
          error: null,
        });
      } catch (error) {
        console.error("[PushNotifications] Error checking status:", error);
        setState((prev) => ({
          ...prev,
          isSupported: true,
          isLoading: false,
          error: "Failed to check notification status",
        }));
      }
    };

    checkSupport();
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          permission,
          error: "Notification permission denied",
        }));
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register("/push-sw.js");
      await navigator.serviceWorker.ready;

      // Get VAPID public key
      const vapidResponse = await fetch("/api/push/vapid-public-key");
      if (!vapidResponse.ok) {
        throw new Error("Failed to get VAPID public key");
      }
      const { publicKey } = await vapidResponse.json();

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      // Send subscription to server
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(subscription.getKey("p256dh")),
            auth: arrayBufferToBase64(subscription.getKey("auth")),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save subscription");
      }

      setState({
        isSupported: true,
        isSubscribed: true,
        isLoading: false,
        permission: "granted",
        error: null,
      });

      return true;
    } catch (error) {
      console.error("[PushNotifications] Error subscribing:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to subscribe",
      }));
      return false;
    }
  }, []);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.getRegistration("/push-sw.js");
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          // Unsubscribe from push manager
          await subscription.unsubscribe();

          // Remove from server
          await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          });
        }
      }

      setState((prev) => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (error) {
      console.error("[PushNotifications] Error unsubscribing:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to unsubscribe",
      }));
      return false;
    }
  }, []);

  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/push/test", { method: "POST" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send test notification");
      }
      return true;
    } catch (error) {
      console.error("[PushNotifications] Error sending test:", error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to send test notification",
      }));
      return false;
    }
  }, []);

  return {
    ...state,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
}

// Helper functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return "";
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

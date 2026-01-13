"use client";

import { useState, useEffect, useCallback } from "react";

export interface NotificationSettings {
  enabled: boolean;
  expirationAlerts: boolean;
  daysBeforeExpiration: number;
}

const STORAGE_KEY = "notification-settings";

const defaultSettings: NotificationSettings = {
  enabled: false,
  expirationAlerts: true,
  daysBeforeExpiration: 7,
};

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    const supported = "Notification" in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
    }

    // Load saved settings
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch {
      return false;
    }
  }, [isSupported]);

  const updateSettings = useCallback((updates: Partial<NotificationSettings>) => {
    setSettings((prev) => {
      const newSettings = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      return newSettings;
    });
  }, []);

  const enableNotifications = useCallback(async () => {
    if (!isSupported) return false;

    if (permission !== "granted") {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    updateSettings({ enabled: true });
    return true;
  }, [isSupported, permission, requestPermission, updateSettings]);

  const disableNotifications = useCallback(() => {
    updateSettings({ enabled: false });
  }, [updateSettings]);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!isSupported || permission !== "granted" || !settings.enabled) {
        return null;
      }

      try {
        return new Notification(title, {
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
          ...options,
        });
      } catch {
        return null;
      }
    },
    [isSupported, permission, settings.enabled]
  );

  const sendExpirationAlert = useCallback(
    (itemName: string, daysUntilExpiration: number) => {
      if (!settings.expirationAlerts) return null;

      let body: string;
      if (daysUntilExpiration <= 0) {
        body = `${itemName} has expired!`;
      } else if (daysUntilExpiration === 1) {
        body = `${itemName} expires tomorrow!`;
      } else {
        body = `${itemName} expires in ${daysUntilExpiration} days`;
      }

      return sendNotification("Expiration Alert", {
        body,
        tag: `expiration-${itemName}`,
        requireInteraction: daysUntilExpiration <= 1,
      });
    },
    [settings.expirationAlerts, sendNotification]
  );

  return {
    settings,
    permission,
    isSupported,
    updateSettings,
    enableNotifications,
    disableNotifications,
    requestPermission,
    sendNotification,
    sendExpirationAlert,
  };
}

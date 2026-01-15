"use client";

import { useState, useEffect, useCallback } from "react";
import { usePwaStatus } from "./use-pwa-status";
import { usePushNotifications } from "./use-push-notifications";

const STORAGE_KEY = "setup-guide-dismissed";

export interface SetupStep {
  id: "account" | "install" | "notifications";
  isComplete: boolean;
  isLoading: boolean;
}

export interface SetupGuideState {
  steps: SetupStep[];
  completedCount: number;
  totalCount: number;
  isComplete: boolean;
  isDismissed: boolean;
  isLoading: boolean;
  showInstallStep: boolean;
  notificationsSupported: boolean;
  dismiss: () => void;
  reset: () => void;
  subscribeToNotifications: () => Promise<boolean>;
  isSubscribing: boolean;
}

export function useSetupGuide(): SetupGuideState {
  const [isDismissed, setIsDismissed] = useState(true); // Start dismissed to prevent flash
  const [isInitialized, setIsInitialized] = useState(false);

  const { isInstalled, isSupported: pwaSupported, isLoading: pwaLoading } = usePwaStatus();
  const { isSubscribed, isLoading: notifLoading, subscribe, isSupported: notifSupported } = usePushNotifications();

  // Load dismissed state from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const dismissed = localStorage.getItem(STORAGE_KEY) === "true";
    setIsDismissed(dismissed);
    setIsInitialized(true);
  }, []);

  const dismiss = useCallback(() => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "true");
    }
  }, []);

  const reset = useCallback(() => {
    setIsDismissed(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Only include install step if PWA is supported on this platform
  const showInstallStep = pwaSupported && !isInstalled;

  const steps: SetupStep[] = [
    {
      id: "account",
      isComplete: true, // Always complete since user must be logged in
      isLoading: false,
    },
    // Only include install step if supported
    ...(pwaSupported
      ? [
          {
            id: "install" as const,
            isComplete: isInstalled,
            isLoading: pwaLoading,
          },
        ]
      : []),
    {
      id: "notifications",
      isComplete: isSubscribed,
      isLoading: notifLoading,
    },
  ];

  const completedCount = steps.filter((s) => s.isComplete).length;
  const totalCount = steps.length;
  const isComplete = completedCount === totalCount;
  const isLoading = !isInitialized || pwaLoading || notifLoading;

  return {
    steps,
    completedCount,
    totalCount,
    isComplete,
    isDismissed,
    isLoading,
    showInstallStep,
    notificationsSupported: notifSupported,
    dismiss,
    reset,
    subscribeToNotifications: subscribe,
    isSubscribing: notifLoading,
  };
}

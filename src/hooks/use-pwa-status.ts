"use client";

import { useState, useEffect } from "react";

export interface PwaStatus {
  isInstalled: boolean;
  isSupported: boolean;
  isLoading: boolean;
}

export function usePwaStatus(): PwaStatus {
  const [status, setStatus] = useState<PwaStatus>({
    isInstalled: false,
    isSupported: false,
    isLoading: true,
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Check if running in standalone mode (installed PWA)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    // Check if PWA installation is supported
    // - iOS Safari (has navigator.standalone property)
    // - Browsers with beforeinstallprompt support
    // - Mobile browsers generally support Add to Home Screen
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isMobile = isIOS || isAndroid;
    const hasInstallPrompt = "onbeforeinstallprompt" in window;

    // PWA is supported on mobile devices or browsers with install prompt
    const isSupported = isMobile || hasInstallPrompt;

    setStatus({
      isInstalled: isStandalone,
      isSupported,
      isLoading: false,
    });

    // Listen for display mode changes
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleChange = (e: MediaQueryListEvent) => {
      setStatus((prev) => ({
        ...prev,
        isInstalled: e.matches,
      }));
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return status;
}

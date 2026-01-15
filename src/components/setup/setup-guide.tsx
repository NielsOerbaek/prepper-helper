"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSetupGuide } from "@/hooks/use-setup-guide";
import { useLanguage } from "@/lib/language-context";
import { Download, Bell, Check, X, Share } from "lucide-react";
import { toast } from "sonner";

export function SetupGuide() {
  const { t } = useLanguage();
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  const [showNotifUnsupportedMsg, setShowNotifUnsupportedMsg] = useState(false);
  const {
    steps,
    isComplete,
    isDismissed,
    isLoading,
    dismiss,
    subscribeToNotifications,
    isSubscribing,
    notificationsSupported,
  } = useSetupGuide();

  // Don't render if loading, complete, or dismissed
  if (isLoading || isComplete || isDismissed) {
    return null;
  }

  const installStep = steps.find((s) => s.id === "install");
  const notifStep = steps.find((s) => s.id === "notifications");

  const handleEnableNotifications = async () => {
    if (!notificationsSupported) {
      setShowNotifUnsupportedMsg(true);
      return;
    }
    const success = await subscribeToNotifications();
    if (success) {
      toast.success(t("toast.notificationsEnabled"));
    } else {
      toast.error(t("toast.notificationsFailed"));
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold">{t("setup.title")}</h3>
            <p className="text-xs text-muted-foreground">{t("setup.description")}</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={dismiss}
            className="h-6 w-6 text-muted-foreground hover:text-foreground -mr-1"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">{t("setup.dismiss")}</span>
          </Button>
        </div>

        {/* Tasks Row */}
        <div className="flex flex-wrap gap-2">
          {/* Account Task - Always complete */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-700 text-sm">
            <Check className="h-4 w-4" />
            <span>{t("setup.accountComplete")}</span>
          </div>

          {/* Install Task - Only show if PWA supported and not installed */}
          {installStep && !installStep.isComplete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInstallInstructions(!showInstallInstructions)}
              className="h-auto py-1.5 px-3 rounded-full text-sm gap-2"
            >
              <Download className="h-4 w-4" />
              <span>{t("setup.installTitle")}</span>
            </Button>
          )}
          {installStep?.isComplete && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-700 text-sm">
              <Check className="h-4 w-4" />
              <span>{t("setup.installComplete")}</span>
            </div>
          )}

          {/* Notifications Task */}
          {notifStep?.isComplete ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-700 text-sm">
              <Check className="h-4 w-4" />
              <span>{t("setup.notificationsComplete")}</span>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnableNotifications}
              disabled={isSubscribing}
              className={`h-auto py-1.5 px-3 rounded-full text-sm gap-2 ${
                !notificationsSupported ? "opacity-60" : ""
              }`}
            >
              <Bell className="h-4 w-4" />
              <span>{t("setup.notificationsTitle")}</span>
            </Button>
          )}
        </div>

        {/* Install Instructions - Show when user clicks install button */}
        {showInstallInstructions && installStep && !installStep.isComplete && (
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
            <Share className="h-3.5 w-3.5 flex-shrink-0" />
            {t("setup.installInstructions")}
          </p>
        )}

        {/* Notifications unsupported message */}
        {showNotifUnsupportedMsg && !notificationsSupported && (
          <p className="text-xs text-muted-foreground mt-3">
            {t("setup.notificationsUnsupported")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

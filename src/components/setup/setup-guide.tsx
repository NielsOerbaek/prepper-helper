"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSetupGuide } from "@/hooks/use-setup-guide";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useLanguage } from "@/lib/language-context";
import { User, Download, Bell, Check, X } from "lucide-react";
import { toast } from "sonner";

export function SetupGuide() {
  const { t } = useLanguage();
  const { steps, isComplete, isDismissed, isLoading, showInstallStep, dismiss } = useSetupGuide();
  const { subscribe, isLoading: notifLoading } = usePushNotifications();

  // Don't render if loading, complete, or dismissed
  if (isLoading || isComplete || isDismissed) {
    return null;
  }

  const accountStep = steps.find((s) => s.id === "account");
  const installStep = steps.find((s) => s.id === "install");
  const notifStep = steps.find((s) => s.id === "notifications");

  const handleEnableNotifications = async () => {
    const success = await subscribe();
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
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm">
              <Download className="h-4 w-4" />
              <span>{t("setup.installTitle")}</span>
            </div>
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
              disabled={notifLoading}
              className="h-auto py-1.5 px-3 rounded-full text-sm gap-2"
            >
              <Bell className="h-4 w-4" />
              <span>{t("setup.notificationsTitle")}</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

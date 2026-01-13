"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { User, Bell, Shield, Info, BellOff, BellRing, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";

export default function SettingsPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [isSendingTest, setIsSendingTest] = useState(false);
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    error,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = usePushNotifications();

  const handleEnableNotifications = async () => {
    const success = await subscribe();
    if (success) {
      toast.success(t("toast.notificationsEnabled"));
    } else if (error) {
      toast.error(error);
    } else {
      toast.error(t("toast.notificationsFailed"));
    }
  };

  const handleDisableNotifications = async () => {
    const success = await unsubscribe();
    if (success) {
      toast.info(t("toast.notificationsDisabled"));
    }
  };

  const handleTestNotification = async () => {
    setIsSendingTest(true);
    try {
      const success = await sendTestNotification();
      if (success) {
        toast.success(t("settings.testNotificationSent"));
      } else {
        toast.error(t("settings.testNotificationFailed"));
      }
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("settings.title")}</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("settings.account")}
            </CardTitle>
            <CardDescription>{t("settings.accountDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("settings.emailLabel")}</span>
              <span className="text-sm text-muted-foreground">
                {session?.user?.email || t("settings.notSetPromise")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("settings.nameLabel")}</span>
              <span className="text-sm text-muted-foreground">
                {session?.user?.name || t("settings.notSet")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("settings.userId")}</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {session?.user?.id}
              </code>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t("settings.notifications")}
            </CardTitle>
            <CardDescription>{t("settings.notificationsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isSupported ? (
              <div className="flex items-center gap-3 text-muted-foreground">
                <BellOff className="h-5 w-5" />
                <p className="text-sm">
                  {t("settings.notificationsNotSupported")}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">{t("settings.pushNotifications")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("settings.pushDescription")}
                    </p>
                  </div>
                  {isSubscribed ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDisableNotifications}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <BellOff className="mr-2 h-4 w-4" />
                      )}
                      {t("settings.disable")}
                    </Button>
                  ) : (
                    <Button size="sm" onClick={handleEnableNotifications} disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <BellRing className="mr-2 h-4 w-4" />
                      )}
                      {t("settings.enable")}
                    </Button>
                  )}
                </div>

                {permission === "denied" && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {t("settings.notificationsBlocked")}
                  </div>
                )}

                {isSubscribed && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="space-y-0.5">
                      <Label>{t("settings.testNotification")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.testNotificationDescription")}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTestNotification}
                      disabled={isSendingTest}
                    >
                      {isSendingTest ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      {t("settings.sendTest")}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t("settings.security")}
            </CardTitle>
            <CardDescription>{t("settings.securityDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t("settings.authMethod")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("settings.authMethodDescription")}
                </p>
              </div>
              <Badge variant="outline">
                {session?.user?.email ? t("settings.emailPassword") : t("settings.promiseAuth")}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {t("settings.about")}
            </CardTitle>
            <CardDescription>{t("settings.aboutDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("settings.version")}</span>
              <span className="text-sm text-muted-foreground">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("settings.aiProvider")}</span>
              <span className="text-sm text-muted-foreground">Anthropic Claude</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("settings.storage")}</span>
              <span className="text-sm text-muted-foreground">MinIO (S3-compatible)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

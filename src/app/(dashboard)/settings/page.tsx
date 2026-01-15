"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { User, Bell, Shield, BellOff, BellRing, Send, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";

export default function SettingsPage() {
  const { t } = useLanguage();
  const { data: session, update: updateSession } = useSession();
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [editName, setEditName] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
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

  const handleEditName = () => {
    setEditName(session?.user?.name || "");
    setShowEditName(true);
  };

  const handleSaveName = async () => {
    if (!editName.trim()) {
      toast.error(t("settings.nameRequired"));
      return;
    }

    setIsUpdatingName(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });

      if (!response.ok) throw new Error("Failed to update name");

      await updateSession({ name: editName.trim() });
      setShowEditName(false);
      toast.success(t("settings.nameUpdated"));
    } catch {
      toast.error(t("toast.updateFailed"));
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleEnableNotifications = async (e?: React.MouseEvent | React.TouchEvent) => {
    // Prevent double-firing on touch devices
    if (e) {
      e.preventDefault();
    }
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
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {session?.user?.name || t("settings.notSet")}
                </span>
                <Button variant="ghost" size="sm" onClick={handleEditName}>
                  <Pencil className="h-3 w-3" />
                </Button>
              </div>
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
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
                      className="shrink-0 self-start sm:self-center"
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <BellOff className="mr-2 h-4 w-4" />
                      )}
                      {t("settings.disable")}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleEnableNotifications}
                      disabled={isLoading}
                      className="shrink-0 self-start sm:self-center touch-manipulation"
                    >
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
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t">
                    <div className="space-y-0.5 min-w-0">
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
                      className="shrink-0 self-start sm:self-center"
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
      </div>

      <Dialog open={showEditName} onOpenChange={setShowEditName}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("settings.editName")}</DialogTitle>
            <DialogDescription>{t("settings.editNameDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("settings.nameLabel")}</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder={t("auth.yourName")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditName(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSaveName} disabled={isUpdatingName}>
              {isUpdatingName && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

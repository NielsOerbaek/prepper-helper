"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExpirationBadge } from "@/components/items/expiration-badge";
import { useLanguage } from "@/lib/language-context";
import { TranslationKey } from "@/lib/translations";
import { useStash } from "@/lib/stash-context";
import { Package, ClipboardList, AlertTriangle, ArrowRight, Camera, Mail, Check, X } from "lucide-react";
import { toast } from "sonner";

interface DashboardStats {
  totalItems: number;
  expiringSoonItems: number; // within 30 days
  expiredItems: number;
  checklistProgress: { checked: number; total: number };
  uncheckedItems: Array<{ id: string; name: string }>;
  recentItems: Array<{
    id: string;
    name: string;
    expirationDate: Date | null;
  }>;
}

interface UserInvitation {
  id: string;
  stashId: string;
  stashName: string;
  createdAt: string;
  expiresAt: string;
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const { currentStash, isLoading: stashLoading, refreshStashes, setCurrentStash, stashes } = useStash();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userInvitations, setUserInvitations] = useState<UserInvitation[]>([]);

  const fetchUserInvitations = useCallback(async () => {
    try {
      const response = await fetch("/api/invitations");
      if (!response.ok) throw new Error("Failed to fetch invitations");
      const data = await response.json();
      setUserInvitations(data);
    } catch (error) {
      console.error("Failed to fetch invitations:", error);
    }
  }, []);

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      });

      if (!response.ok) throw new Error("Failed to accept invitation");

      const data = await response.json();
      toast.success(t("stash.invitationAccepted"));
      await refreshStashes();
      fetchUserInvitations();

      // Switch to the new stash
      const newStash = stashes.find((s) => s.id === data.stashId);
      if (newStash) {
        setCurrentStash(newStash);
      }
    } catch {
      toast.error(t("toast.updateFailed"));
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline" }),
      });

      if (!response.ok) throw new Error("Failed to decline invitation");

      toast.success(t("stash.invitationDeclined"));
      fetchUserInvitations();
    } catch {
      toast.error(t("toast.updateFailed"));
    }
  };

  useEffect(() => {
    async function fetchStats() {
      if (!currentStash) {
        setStats({
          totalItems: 0,
          expiringSoonItems: 0,
          expiredItems: 0,
          checklistProgress: { checked: 0, total: 0 },
          uncheckedItems: [],
          recentItems: [],
        });
        setLoading(false);
        return;
      }

      try {
        const stashParam = `stashId=${currentStash.id}`;
        const [itemsRes, checklistRes] = await Promise.all([
          fetch(`/api/items?${stashParam}`),
          fetch(`/api/checklist?${stashParam}`),
        ]);

        const items = await itemsRes.json();
        const checklist = await checklistRes.json();

        // Handle potential error responses
        const itemsArray = Array.isArray(items) ? items : [];
        const checklistArray = Array.isArray(checklist) ? checklist : [];

        // Calculate expiring and expired items
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        let expiringSoonCount = 0;
        let expiredCount = 0;

        itemsArray.forEach((item: { expirationDate: string | null }) => {
          if (item.expirationDate) {
            const expDate = new Date(item.expirationDate);
            if (expDate < now) {
              expiredCount++;
            } else if (expDate <= thirtyDaysFromNow) {
              expiringSoonCount++;
            }
          }
        });

        const uncheckedItems = checklistArray
          .filter((item: { isChecked: boolean }) => !item.isChecked)
          .slice(0, 3)
          .map((item: { id: string; name: string }) => ({ id: item.id, name: item.name }));

        setStats({
          totalItems: itemsArray.length,
          expiringSoonItems: expiringSoonCount,
          expiredItems: expiredCount,
          checklistProgress: {
            checked: checklistArray.filter((item: { isChecked: boolean }) => item.isChecked).length,
            total: checklistArray.length,
          },
          uncheckedItems,
          recentItems: itemsArray.slice(0, 5).map((item: { id: string; name: string; expirationDate: string | null }) => ({
            ...item,
            expirationDate: item.expirationDate ? new Date(item.expirationDate) : null,
          })),
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!stashLoading) {
      fetchStats();
    }
  }, [currentStash, stashLoading]);

  useEffect(() => {
    fetchUserInvitations();
  }, [fetchUserInvitations]);

  if (loading || stashLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t("nav.dashboard")}</h1>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const checklistPercentage = stats?.checklistProgress
    ? Math.round((stats.checklistProgress.checked / stats.checklistProgress.total) * 100) || 0
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("nav.dashboard")}</h1>
      </div>

      {/* Pending Invitations */}
      {userInvitations.length > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5" />
              {t("stash.yourInvitations")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userInvitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between gap-2 p-3 rounded-lg border bg-background">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{invitation.stashName}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("stash.expiresAt")}: {new Date(invitation.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAcceptInvitation(invitation.id)}>
                    <Check className="h-4 w-4 mr-1" />
                    {t("common.accept")}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDeclineInvitation(invitation.id)}>
                    <X className="h-4 w-4 mr-1" />
                    {t("common.decline")}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Compact Scanner Button */}
      <Card className="bg-gradient-to-r from-primary/20 via-primary/10 to-background border-primary/30">
        <CardContent className="py-4">
          <Link href="/inventory?scan=true" className="flex items-center gap-4">
            <div className="rounded-full bg-primary/15 p-3 flex-shrink-0">
              <Camera className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold">{t("dashboard.scanAnItem")}</h2>
              <p className="text-sm text-muted-foreground truncate">{t("dashboard.scanDescription")}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </Link>
        </CardContent>
      </Card>

      {/* Three compact metrics */}
      <div className="grid grid-cols-3 gap-2">
        <Link href="/inventory" className="block">
          <Card className="h-full hover:bg-muted/50 transition-colors">
            <CardContent className="p-3 text-center">
              <Package className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-2xl font-bold">{stats?.totalItems || 0}</div>
              <p className="text-xs text-muted-foreground">{t("dashboard.totalItems")}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/expiring" className="block">
          <Card className={`h-full hover:bg-muted/50 transition-colors ${stats?.expiringSoonItems ? "border-yellow-500" : ""}`}>
            <CardContent className="p-3 text-center">
              <AlertTriangle className={`h-5 w-5 mx-auto mb-1 ${stats?.expiringSoonItems ? "text-yellow-500" : "text-muted-foreground"}`} />
              <div className="text-2xl font-bold">{stats?.expiringSoonItems || 0}</div>
              <p className="text-xs text-muted-foreground">{t("dashboard.expiring30Days")}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/expiring" className="block">
          <Card className={`h-full hover:bg-muted/50 transition-colors ${stats?.expiredItems ? "border-red-500" : ""}`}>
            <CardContent className="p-3 text-center">
              <X className={`h-5 w-5 mx-auto mb-1 ${stats?.expiredItems ? "text-red-500" : "text-muted-foreground"}`} />
              <div className="text-2xl font-bold">{stats?.expiredItems || 0}</div>
              <p className="text-xs text-muted-foreground">{t("dashboard.expired")}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle>{t("dashboard.recentItems")}</CardTitle>
            <CardDescription>{t("dashboard.recentItemsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            {stats?.recentItems && stats.recentItems.length > 0 ? (
              <div className="space-y-2">
                {stats.recentItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 overflow-hidden">
                    <span className="font-medium truncate text-sm flex-1 min-w-0">{item.name}</span>
                    <ExpirationBadge expirationDate={item.expirationDate} />
                  </div>
                ))}
                <Button variant="ghost" className="w-full mt-2" size="sm" asChild>
                  <Link href="/inventory">
                    {t("dashboard.viewAllItems")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t("dashboard.noItemsYet")}</p>
                <Button className="mt-2" size="sm" asChild>
                  <Link href="/inventory?scan=true">{t("dashboard.addFirstItem")}</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Link href="/checklist" className="block min-w-0">
          <Card className="h-full hover:bg-muted/50 transition-colors overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>{t("dashboard.checklistProgress")}</CardTitle>
                <ClipboardList className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </div>
              <CardDescription>
                {stats?.checklistProgress.checked} / {stats?.checklistProgress.total} {t("dashboard.itemsChecked")}
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-hidden">
              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-2 mb-3">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${checklistPercentage}%` }}
                />
              </div>

              {/* Unchecked items examples */}
              {stats?.uncheckedItems && stats.uncheckedItems.length > 0 ? (
                <div className="space-y-1 overflow-hidden">
                  <p className="text-xs text-muted-foreground mb-2">{t("dashboard.stillNeeded")}:</p>
                  {stats.uncheckedItems.map((item) => {
                    const displayName = item.name.startsWith("checklist.item.")
                      ? t(item.name as TranslationKey)
                      : item.name;
                    return (
                      <div key={item.id} className="flex items-center gap-2 text-sm overflow-hidden">
                        <div className="h-4 w-4 rounded border border-muted-foreground/30 flex-shrink-0" />
                        <span className="truncate flex-1 min-w-0">{displayName}</span>
                      </div>
                    );
                  })}
                </div>
              ) : stats?.checklistProgress.total === 0 ? (
                <p className="text-sm text-muted-foreground">{t("dashboard.noChecklist")}</p>
              ) : (
                <p className="text-sm text-green-600">{t("dashboard.allChecked")}</p>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExpirationBadge } from "@/components/items/expiration-badge";
import { useLanguage } from "@/lib/language-context";
import { Package, ClipboardList, AlertTriangle, ArrowRight, Camera } from "lucide-react";

interface DashboardStats {
  totalItems: number;
  expiringItems: number;
  checklistProgress: { checked: number; total: number };
  recentItems: Array<{
    id: string;
    name: string;
    expirationDate: Date | null;
  }>;
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [itemsRes, checklistRes, expiringRes] = await Promise.all([
          fetch("/api/items"),
          fetch("/api/checklist"),
          fetch("/api/items?expiringSoon=true"),
        ]);

        const items = await itemsRes.json();
        const checklist = await checklistRes.json();
        const expiring = await expiringRes.json();

        setStats({
          totalItems: items.length,
          expiringItems: expiring.length,
          checklistProgress: {
            checked: checklist.filter((item: { isChecked: boolean }) => item.isChecked).length,
            total: checklist.length,
          },
          recentItems: items.slice(0, 5).map((item: { id: string; name: string; expirationDate: string | null }) => ({
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

    fetchStats();
  }, []);

  if (loading) {
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

      {/* Prominent Scanner Button */}
      <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-background border-primary/30">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="rounded-full bg-primary/15 p-4 mb-4">
            <Camera className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t("dashboard.scanAnItem")}</h2>
          <p className="text-center mb-4 text-muted-foreground">{t("dashboard.scanDescription")}</p>
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
            <Link href="/scan">
              <Camera className="mr-2 h-5 w-5" />
              {t("dashboard.startScanner")}
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.totalItems")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalItems || 0}</div>
            <p className="text-xs text-muted-foreground">{t("dashboard.itemsInInventory")}</p>
          </CardContent>
        </Card>

        <Card className={stats?.expiringItems ? "border-yellow-500" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("nav.expiringSoon")}</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${stats?.expiringItems ? "text-yellow-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.expiringItems || 0}</div>
            <p className="text-xs text-muted-foreground">{t("dashboard.itemsExpiring7Days")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.checklistProgress")}</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checklistPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {stats?.checklistProgress.checked} {t("common.of")} {stats?.checklistProgress.total} {t("dashboard.itemsChecked")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.recentItems")}</CardTitle>
            <CardDescription>{t("dashboard.recentItemsDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recentItems && stats.recentItems.length > 0 ? (
              <div className="space-y-3">
                {stats.recentItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span className="font-medium truncate flex-1 mr-2">{item.name}</span>
                    <ExpirationBadge expirationDate={item.expirationDate} />
                  </div>
                ))}
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/inventory">
                    {t("dashboard.viewAllItems")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{t("dashboard.noItemsYet")}</p>
                <Button className="mt-2" asChild>
                  <Link href="/scan">{t("dashboard.addFirstItem")}</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.quickActions")}</CardTitle>
            <CardDescription>{t("dashboard.quickActionsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/scan">
                <Camera className="mr-2 h-4 w-4" />
                {t("dashboard.scanNewItem")}
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/checklist">
                <ClipboardList className="mr-2 h-4 w-4" />
                {t("dashboard.reviewChecklist")}
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/expiring">
                <AlertTriangle className="mr-2 h-4 w-4" />
                {t("dashboard.checkExpiringItems")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExpirationBadge } from "@/components/items/expiration-badge";
import { ItemDetailsModal } from "@/components/items/item-details-modal";
import { ScanVerifyDialog } from "@/components/items/scan-verify-dialog";
import { CameraCapture } from "@/components/photos/camera-capture";
import { getExpirationStatus } from "@/types";
import { Category } from "@prisma/client";
import { AlertTriangle, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useLanguage } from "@/lib/language-context";
import { useStash } from "@/lib/stash-context";
import { getCategoryKey } from "@/lib/translations";

interface Photo {
  id: string;
  minioKey: string;
  originalName: string | null;
}

interface Item {
  id: string;
  name: string;
  description: string | null;
  category: Category;
  quantity: number;
  expirationDate: Date;
  createdAt: Date;
  photos: Photo[];
}

export default function ExpiringPage() {
  const { t, language } = useLanguage();
  const { currentStash, isLoading: stashLoading } = useStash();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [detailsItem, setDetailsItem] = useState<Item | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!currentStash) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/items?stashId=${currentStash.id}`);
      const data = await response.json();

      // Filter and sort items with expiration dates
      const itemsWithDates = data
        .filter((item: { expirationDate: string | null }) => item.expirationDate)
        .map((item: { id: string; name: string; description: string | null; category: Category; quantity: number; expirationDate: string; createdAt: string; photos: Photo[] }) => ({
          ...item,
          expirationDate: new Date(item.expirationDate),
          createdAt: new Date(item.createdAt),
        }))
        .sort((a: Item, b: Item) => a.expirationDate.getTime() - b.expirationDate.getTime());

      setItems(itemsWithDates);
    } catch (error) {
      console.error("Failed to fetch items:", error);
      toast.error(t("toast.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [currentStash, t]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      const response = await fetch(`/api/items/${deleteConfirmId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete item");

      setItems((prev) => prev.filter((item) => item.id !== deleteConfirmId));
      toast.success(t("toast.itemDeleted"));
    } catch {
      toast.error(t("toast.deleteFailed"));
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleEditItem = async (values: {
    name: string;
    description?: string;
    category: Category;
    quantity: number;
    expirationDate?: string;
  }) => {
    if (!editingItem) return;

    try {
      const response = await fetch(`/api/items/${editingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Failed to update item");

      toast.success(t("toast.itemUpdated"));
      setEditingItem(null);
      fetchItems();
    } catch {
      toast.error(t("toast.updateFailed"));
      throw new Error("Failed to update item");
    }
  };

  const openCameraForItem = (itemId: string) => {
    setCurrentItemId(itemId);
    setShowCamera(true);
  };

  const handlePhotoCapture = async (file: File, base64: string) => {
    if (!currentItemId) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("itemId", currentItemId);

      const uploadResponse = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error("Failed to upload photo");

      const { photo } = await uploadResponse.json();

      toast.info(t("toast.aiAnalyzing"));
      const analyzeResponse = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoId: photo.id,
          imageBase64: base64,
          mimeType: file.type,
          language,
        }),
      });

      if (analyzeResponse.ok) {
        toast.success(t("toast.photoAdded"));
      } else {
        toast.success(t("toast.photoAddedAnalysisFailed"));
      }

      fetchItems();
    } catch (error) {
      console.error("Photo upload error:", error);
      toast.error(t("toast.photoUploadFailed"));
    }
  };

  const expiredItems = items.filter((item) => getExpirationStatus(item.expirationDate) === "expired");
  const dangerItems = items.filter((item) => getExpirationStatus(item.expirationDate) === "danger");
  const warningItems = items.filter((item) => getExpirationStatus(item.expirationDate) === "warning");
  const safeItems = items.filter((item) => getExpirationStatus(item.expirationDate) === "safe");

  if (stashLoading || loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t("expiring.title")}</h1>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!currentStash) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t("expiring.title")}</h1>
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("stash.noStash")}</p>
        </div>
      </div>
    );
  }

  const ItemRow = ({ item }: { item: Item }) => (
    <div
      className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => setDetailsItem(item)}
    >
      <div className="flex-1 min-w-0 mr-4">
        <p className="font-medium truncate">{item.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs">
            {t(getCategoryKey(item.category))}
          </Badge>
          <span className="text-xs text-muted-foreground">{t("item.quantity")}: {item.quantity}</span>
        </div>
      </div>
      <ExpirationBadge expirationDate={item.expirationDate} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("expiring.title")}</h1>
          <p className="text-muted-foreground">
            {items.length} {t("expiring.itemsWithDates")}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-4">{t("expiring.noItemsWithDates")}</p>
          <Button asChild>
            <Link href="/inventory">{t("expiring.addToInventory")}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {expiredItems.length > 0 && (
            <Card className="border-gray-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <AlertTriangle className="h-5 w-5" />
                  {t("expiring.expiredCount")} ({expiredItems.length})
                </CardTitle>
                <CardDescription>{t("expiring.passedDate")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {expiredItems.map((item) => (
                  <ItemRow key={item.id} item={item} />
                ))}
              </CardContent>
            </Card>
          )}

          {dangerItems.length > 0 && (
            <Card className="border-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  {t("expiring.within3Days")} ({dangerItems.length})
                </CardTitle>
                <CardDescription>{t("expiring.useImmediately")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {dangerItems.map((item) => (
                  <ItemRow key={item.id} item={item} />
                ))}
              </CardContent>
            </Card>
          )}

          {warningItems.length > 0 && (
            <Card className="border-yellow-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="h-5 w-5" />
                  {t("expiring.within7Days")} ({warningItems.length})
                </CardTitle>
                <CardDescription>{t("expiring.planToReplace")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {warningItems.map((item) => (
                  <ItemRow key={item.id} item={item} />
                ))}
              </CardContent>
            </Card>
          )}

          {safeItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Package className="h-5 w-5" />
                  {t("expiring.goodForNow")} ({safeItems.length})
                </CardTitle>
                <CardDescription>{t("expiring.notExpiringSoon")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {safeItems.slice(0, 10).map((item) => (
                  <ItemRow key={item.id} item={item} />
                ))}
                {safeItems.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    {t("expiring.andMoreItems")} ({safeItems.length - 10})
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        title={t("confirm.deleteTitle")}
        description={t("confirm.deleteItem")}
        onConfirm={confirmDelete}
        confirmText={t("confirm.delete")}
        variant="destructive"
      />

      {detailsItem && (
        <ItemDetailsModal
          open={!!detailsItem}
          onOpenChange={(open) => !open && setDetailsItem(null)}
          item={detailsItem}
          onEdit={() => setEditingItem(detailsItem)}
          onAddPhoto={() => openCameraForItem(detailsItem.id)}
          onDelete={() => handleDelete(detailsItem.id)}
        />
      )}

      {editingItem && (
        <ScanVerifyDialog
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          onConfirm={handleEditItem}
          title={t("inventory.editItem")}
          initialData={{
            name: editingItem.name,
            description: editingItem.description || "",
            category: editingItem.category,
            quantity: editingItem.quantity,
            expirationDate: editingItem.expirationDate
              ? editingItem.expirationDate.toISOString().split("T")[0]
              : "",
          }}
          photos={editingItem.photos}
        />
      )}

      <CameraCapture
        open={showCamera}
        onOpenChange={(open) => {
          setShowCamera(open);
          if (!open) setCurrentItemId(null);
        }}
        onCapture={handlePhotoCapture}
      />
    </div>
  );
}

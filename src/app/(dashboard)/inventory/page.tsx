"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ItemCard } from "@/components/items/item-card";
import { ItemForm } from "@/components/items/item-form";
import { ScanVerifyDialog } from "@/components/items/scan-verify-dialog";
import { CameraCapture } from "@/components/photos/camera-capture";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CATEGORY_LABELS } from "@/types";
import { Category } from "@prisma/client";
import { Plus, Search, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";
import { useStash } from "@/lib/stash-context";
import { getCategoryKey } from "@/lib/translations";

interface Item {
  id: string;
  name: string;
  description: string | null;
  category: Category;
  quantity: number;
  expirationDate: Date | null;
  photos: Array<{ id: string; minioKey: string; originalName: string | null }>;
}

export default function InventoryPage() {
  const { t, language } = useLanguage();
  const { currentStash, isLoading: stashLoading } = useStash();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | "">("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [pendingScanData, setPendingScanData] = useState<{
    itemData: {
      name: string;
      description?: string;
      category: Category;
      quantity: number;
      expirationDate?: string;
    };
    frontFile: File;
    frontBase64: string;
    expirationFile?: File;
    expirationBase64?: string;
  } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!currentStash) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      params.set("stashId", currentStash.id);
      if (search) params.set("search", search);
      if (categoryFilter) params.set("category", categoryFilter);

      const response = await fetch(`/api/items?${params}`);
      const data = await response.json();

      setItems(
        data.map((item: Item & { expirationDate: string | null }) => ({
          ...item,
          expirationDate: item.expirationDate ? new Date(item.expirationDate) : null,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch items:", error);
      toast.error(t("toast.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [currentStash, search, categoryFilter, t]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAddItem = async (values: {
    name: string;
    description?: string;
    category: Category;
    quantity: number;
    expirationDate?: string;
  }) => {
    if (!currentStash) return;

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, stashId: currentStash.id }),
      });

      if (!response.ok) throw new Error("Failed to create item");

      const newItem = await response.json();
      setItems((prev) => [
        {
          ...newItem,
          expirationDate: newItem.expirationDate ? new Date(newItem.expirationDate) : null,
        },
        ...prev,
      ]);
      toast.success(t("toast.itemAdded"));
    } catch {
      toast.error(t("toast.saveFailed"));
      throw new Error("Failed to add item");
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

      const updatedItem = await response.json();
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? {
                ...updatedItem,
                expirationDate: updatedItem.expirationDate
                  ? new Date(updatedItem.expirationDate)
                  : null,
              }
            : item
        )
      );
      setEditingItem(null);
      toast.success(t("toast.itemUpdated"));
    } catch {
      toast.error(t("toast.updateFailed"));
      throw new Error("Failed to update item");
    }
  };

  const handleDeleteItem = (id: string) => {
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

  const handlePhotoCapture = async (
    file: File,
    base64: string,
    _expirationFile?: File,
    _expirationBase64?: string
  ) => {
    if (!currentItemId) return;

    try {
      // Upload photo via API
      const formData = new FormData();
      formData.append("file", file);
      formData.append("itemId", currentItemId);

      const uploadResponse = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error("Failed to upload photo");

      const { photo } = await uploadResponse.json();

      // Analyze with AI
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

      // Refresh items
      fetchItems();
    } catch (error) {
      console.error("Photo upload error:", error);
      toast.error(t("toast.photoUploadFailed"));
    }
  };

  const openCameraForItem = (itemId: string) => {
    setCurrentItemId(itemId);
    setShowCamera(true);
  };

  const handleScanCapture = async (
    file: File,
    base64: string,
    expirationFile?: File,
    expirationBase64?: string
  ) => {
    try {
      toast.info(t("toast.aiAnalyzing"));

      // Analyze both images with AI
      const analyzeResponse = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: file.type,
          expirationImageBase64: expirationBase64,
          expirationMimeType: expirationFile?.type,
          language,
        }),
      });

      let itemData: {
        name: string;
        description?: string;
        category: Category;
        quantity: number;
        expirationDate?: string;
      } = {
        name: t("inventory.scannedItem"),
        category: "OTHER" as Category,
        quantity: 1,
      };

      if (analyzeResponse.ok) {
        const analysis = await analyzeResponse.json();
        console.log("[Scan] AI analysis response:", analysis);
        if (analysis.name) {
          itemData = {
            name: analysis.name,
            description: analysis.description,
            category: analysis.category || "OTHER",
            quantity: analysis.quantity || 1,
            expirationDate: analysis.expirationDate,
          };
          console.log("[Scan] Using AI-analyzed item data:", itemData);
        } else {
          console.warn("[Scan] AI analysis did not return a name, using defaults:", analysis);
        }
      } else {
        const errorText = await analyzeResponse.text();
        console.error("[Scan] AI analysis failed:", analyzeResponse.status, errorText);
      }

      // Store data and show verification dialog
      setPendingScanData({
        itemData,
        frontFile: file,
        frontBase64: base64,
        expirationFile,
        expirationBase64,
      });
      setShowScanner(false);
      setShowVerifyDialog(true);
    } catch (error) {
      console.error("Scan error:", error);
      toast.error(t("toast.scanFailed"));
    }
  };

  const handleVerifiedScanConfirm = async (confirmedData: {
    name: string;
    description?: string;
    category: Category;
    quantity: number;
    expirationDate?: string;
  }) => {
    if (!pendingScanData || !currentStash) return;

    try {
      // Create the item with verified data
      const createResponse = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...confirmedData, stashId: currentStash.id }),
      });

      if (!createResponse.ok) throw new Error("Failed to create item");

      const newItem = await createResponse.json();

      // Upload the front photo
      const frontFormData = new FormData();
      frontFormData.append("file", pendingScanData.frontFile);
      frontFormData.append("itemId", newItem.id);

      await fetch("/api/photos/upload", {
        method: "POST",
        body: frontFormData,
      });

      // Upload the expiration photo if provided
      if (pendingScanData.expirationFile) {
        const expFormData = new FormData();
        expFormData.append("file", pendingScanData.expirationFile);
        expFormData.append("itemId", newItem.id);

        await fetch("/api/photos/upload", {
          method: "POST",
          body: expFormData,
        });
      }

      toast.success(t("toast.itemScanned"));
      setPendingScanData(null);
      fetchItems();
    } catch (error) {
      console.error("Scan confirm error:", error);
      toast.error(t("toast.scanFailed"));
      throw error;
    }
  };

  const handleVerifiedScanConfirmAndAddNew = async (confirmedData: {
    name: string;
    description?: string;
    category: Category;
    quantity: number;
    expirationDate?: string;
  }) => {
    await handleVerifiedScanConfirm(confirmedData);
    // Open scanner for new item
    setShowVerifyDialog(false);
    setShowScanner(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("inventory.title")}</h1>
        <Button variant="outline" onClick={() => setShowScanner(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("inventory.addItem")}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("inventory.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as Category | "")}
            className="flex h-10 w-full sm:w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">{t("inventory.allCategories")}</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {t(getCategoryKey(value))}
              </option>
            ))}
          </select>
        </div>
      </div>

      {stashLoading || loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !currentStash ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{t("stash.noStash")}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {search || categoryFilter ? t("inventory.noMatch") : t("inventory.noItems")}
          </p>
          {!search && !categoryFilter && (
            <Button onClick={() => setShowScanner(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("inventory.addFirstItem")}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onEdit={(id) => {
                const itemToEdit = items.find((i) => i.id === id);
                if (itemToEdit) setEditingItem(itemToEdit);
              }}
              onDelete={handleDeleteItem}
              onAddPhoto={openCameraForItem}
            />
          ))}
        </div>
      )}

      <ItemForm
        open={showAddForm}
        onOpenChange={setShowAddForm}
        onSubmit={handleAddItem}
        title={t("inventory.addItem")}
      />

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

      <CameraCapture
        open={showScanner}
        onOpenChange={setShowScanner}
        onCapture={handleScanCapture}
        onAddManually={() => {
          setShowScanner(false);
          setShowAddForm(true);
        }}
        twoStep
      />

      {pendingScanData && (
        <ScanVerifyDialog
          open={showVerifyDialog}
          onOpenChange={(open) => {
            setShowVerifyDialog(open);
            if (!open) setPendingScanData(null);
          }}
          onConfirm={handleVerifiedScanConfirm}
          onConfirmAndAddNew={handleVerifiedScanConfirmAndAddNew}
          initialData={pendingScanData.itemData}
          frontImagePreview={pendingScanData.frontBase64}
          expirationImagePreview={pendingScanData.expirationBase64}
        />
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
    </div>
  );
}

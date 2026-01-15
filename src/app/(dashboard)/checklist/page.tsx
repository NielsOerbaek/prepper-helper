"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChecklistItem } from "@/components/checklist/checklist-item";
import { Category } from "@prisma/client";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useLanguage } from "@/lib/language-context";
import { useStash } from "@/lib/stash-context";
import { getCategoryKey } from "@/lib/translations";

interface ChecklistItemType {
  id: string;
  name: string;
  category: Category;
  isChecked: boolean;
  isDefault: boolean;
  linkedItemId: string | null;
}

export default function ChecklistPage() {
  const { t } = useLanguage();
  const { currentStash, isLoading: stashLoading } = useStash();
  const [items, setItems] = useState<ChecklistItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<Category>("OTHER");
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchChecklist = useCallback(async () => {
    if (!currentStash) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/checklist?stashId=${currentStash.id}`);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch checklist:", error);
      toast.error(t("toast.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [currentStash, t]);

  useEffect(() => {
    fetchChecklist();
  }, [fetchChecklist]);

  const handleToggle = async (id: string, checked: boolean) => {
    try {
      const response = await fetch("/api/checklist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isChecked: checked }),
      });

      if (!response.ok) throw new Error("Failed to update");

      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isChecked: checked } : item))
      );
    } catch {
      toast.error(t("toast.updateFailed"));
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      const response = await fetch(`/api/checklist?id=${deleteConfirmId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      setItems((prev) => prev.filter((item) => item.id !== deleteConfirmId));
      toast.success(t("toast.itemDeletedSuccess"));
    } catch {
      toast.error(t("toast.deleteFailed"));
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      toast.error(t("checklist.enterName"));
      return;
    }

    if (!currentStash) return;

    setIsAdding(true);
    try {
      const response = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newItemName.trim(),
          category: newItemCategory,
          stashId: currentStash.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to add item");

      const newItem = await response.json();
      setItems((prev) => [...prev, newItem]);
      setNewItemName("");
      setNewItemCategory("OTHER");
      setShowAddDialog(false);
      toast.success(t("toast.addedToChecklist"));
    } catch {
      toast.error(t("toast.saveFailed"));
    } finally {
      setIsAdding(false);
    }
  };

  // Group items by category
  const groupedItems = items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<Category, ChecklistItemType[]>
  );

  const checkedCount = items.filter((item) => item.isChecked).length;
  const progress = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;

  if (stashLoading || loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t("checklist.emergencyChecklist")}</h1>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!currentStash) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t("checklist.emergencyChecklist")}</h1>
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("stash.noStash")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">{t("checklist.emergencyChecklist")}</h1>
          <p className="text-sm text-muted-foreground">
            {checkedCount} {t("common.of")} {items.length} {t("checklist.itemsChecked")} ({progress}%)
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="shrink-0">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">{t("checklist.addItem")}</span>
        </Button>
      </div>

      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid gap-6">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{t(getCategoryKey(category))}</CardTitle>
              <CardDescription>
                {categoryItems.filter((i) => i.isChecked).length} {t("common.of")} {categoryItems.length} {t("checklist.itemsChecked")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {categoryItems.map((item) => (
                <ChecklistItem
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("checklist.addChecklistItem")}</DialogTitle>
            <DialogDescription>{t("checklist.addCustomItem")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("checklist.itemName")}</Label>
              <Input
                id="name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={t("checklist.namePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">{t("item.category")}</Label>
              <select
                id="category"
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as Category)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {(["WATER", "CANNED_FOOD", "DRY_GOODS", "FIRST_AID", "TOOLS", "HYGIENE", "DOCUMENTS", "OTHER"] as Category[]).map((value) => (
                  <option key={value} value={value}>
                    {t(getCategoryKey(value))}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleAddItem} disabled={isAdding}>
              {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("checklist.addItem")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

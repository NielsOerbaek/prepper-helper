"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Category } from "@prisma/client";
import { Loader2, Minus, Plus } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import Image from "next/image";

interface Photo {
  id: string;
  minioKey: string;
  originalName: string | null;
}

interface ScanVerifyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    name: string;
    description?: string;
    category: Category;
    quantity: number;
    expirationDate?: string;
  }) => Promise<void>;
  onConfirmAndAddNew?: (data: {
    name: string;
    description?: string;
    category: Category;
    quantity: number;
    expirationDate?: string;
  }) => Promise<void>;
  initialData: {
    name: string;
    description?: string;
    category: Category;
    quantity: number;
    expirationDate?: string;
  };
  // For new scans - base64 previews
  frontImagePreview?: string;
  expirationImagePreview?: string;
  // For editing existing items - photo objects
  photos?: Photo[];
  title?: string;
}

export function ScanVerifyDialog({
  open,
  onOpenChange,
  onConfirm,
  onConfirmAndAddNew,
  initialData,
  frontImagePreview,
  expirationImagePreview,
  photos,
  title,
}: ScanVerifyDialogProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(initialData.name);
  const [description, setDescription] = useState(initialData.description || "");
  const [category, setCategory] = useState<Category>(initialData.category);
  const [quantity, setQuantity] = useState(initialData.quantity);
  const [expirationDate, setExpirationDate] = useState(initialData.expirationDate || "");

  useEffect(() => {
    if (open) {
      setName(initialData.name);
      setDescription(initialData.description || "");
      setCategory(initialData.category);
      setQuantity(initialData.quantity);
      setExpirationDate(initialData.expirationDate || "");
    }
  }, [open, initialData]);

  const getFormData = () => ({
    name,
    description: description || undefined,
    category,
    quantity,
    expirationDate: expirationDate || undefined,
  });

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(getFormData());
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAndAddNew = async () => {
    if (!onConfirmAndAddNew) return;
    setIsSubmitting(true);
    try {
      await onConfirmAndAddNew(getFormData());
    } finally {
      setIsSubmitting(false);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };

  const hasBase64Previews = frontImagePreview || expirationImagePreview;
  const hasPhotos = photos && photos.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title || t("scan.verifyTitle")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image previews - base64 for new scans */}
          {hasBase64Previews && (
            <div className="flex gap-2 justify-center">
              {frontImagePreview && (
                <img
                  src={`data:image/jpeg;base64,${frontImagePreview}`}
                  alt={t("camera.frontLabel")}
                  className="w-20 h-20 object-cover rounded-md border"
                />
              )}
              {expirationImagePreview && (
                <img
                  src={`data:image/jpeg;base64,${expirationImagePreview}`}
                  alt={t("camera.expirationLabel")}
                  className="w-20 h-20 object-cover rounded-md border"
                />
              )}
            </div>
          )}

          {/* Image previews - existing photos for edit mode */}
          {!hasBase64Previews && hasPhotos && (
            <div className="flex gap-2 justify-center flex-wrap">
              {photos.map((photo) => (
                <Image
                  key={photo.id}
                  src={`/api/photos/${photo.id}`}
                  alt={photo.originalName || "Photo"}
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded-md border"
                  unoptimized
                />
              ))}
            </div>
          )}

          {/* Quantity selector - large and prominent */}
          <div className="bg-muted/50 rounded-lg p-4">
            <label className="block text-sm font-medium text-center mb-3">
              {t("item.quantity")}
            </label>
            <div className="flex items-center justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-14 w-14 rounded-full"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="h-6 w-6" />
              </Button>
              <span className="text-5xl font-bold min-w-[80px] text-center tabular-nums">
                {quantity}
              </span>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-14 w-14 rounded-full"
                onClick={incrementQuantity}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t("item.name")}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("item.namePlaceholder")}
            />
          </div>

          {/* Category and expiration date in grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("item.category")}
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                {(["WATER", "CANNED_FOOD", "DRY_GOODS", "FIRST_AID", "TOOLS", "HYGIENE", "DOCUMENTS", "OTHER"] as Category[]).map((value) => (
                  <option key={value} value={value}>
                    {t(`category.${value}` as const)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("item.expirationDate")}
              </label>
              <Input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
              />
            </div>
          </div>

          {/* Description (collapsible or smaller) */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t("item.descriptionOptional")}
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("item.descriptionPlaceholder")}
            />
          </div>
        </div>

        <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t("common.cancel")}
          </Button>
          <div className="flex gap-2">
            {onConfirmAndAddNew && (
              <Button
                variant="secondary"
                onClick={handleConfirmAndAddNew}
                disabled={isSubmitting || !name}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("scan.saveAndAddNew")}
              </Button>
            )}
            <Button onClick={handleConfirm} disabled={isSubmitting || !name}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("common.save")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

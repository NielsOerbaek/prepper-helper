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
import { Loader2, Minus, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { getCategoryKey } from "@/lib/translations";
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

  // Parse the date string into components
  const parseDateParts = () => {
    if (!expirationDate) {
      const today = new Date();
      return {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate(),
      };
    }
    const [year, month, day] = expirationDate.split("-").map(Number);
    return { year: year || new Date().getFullYear(), month: month || 1, day: day || 1 };
  };

  const updateDate = (year: number, month: number, day: number) => {
    // Validate day for the given month/year
    const daysInMonth = new Date(year, month, 0).getDate();
    const validDay = Math.min(day, daysInMonth);
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(validDay).padStart(2, "0")}`;
    setExpirationDate(dateStr);
  };

  const adjustDate = (field: "year" | "month" | "day", delta: number) => {
    const { year, month, day } = parseDateParts();

    if (field === "year") {
      updateDate(year + delta, month, day);
    } else if (field === "month") {
      let newMonth = month + delta;
      let newYear = year;
      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      } else if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }
      updateDate(newYear, newMonth, day);
    } else if (field === "day") {
      const daysInMonth = new Date(year, month, 0).getDate();
      let newDay = day + delta;
      if (newDay > daysInMonth) {
        newDay = 1;
      } else if (newDay < 1) {
        newDay = daysInMonth;
      }
      updateDate(year, month, newDay);
    }
  };

  const dateParts = parseDateParts();

  const hasBase64Previews = frontImagePreview || expirationImagePreview;
  const hasPhotos = photos && photos.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!flex !flex-col h-[100dvh] max-h-[100dvh] w-full max-w-full sm:max-w-[500px] sm:h-auto sm:max-h-[90dvh] rounded-none sm:rounded-lg">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{title || t("scan.verifyTitle")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 min-h-0 pb-2">
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

          {/* Category */}
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
                  {t(getCategoryKey(value))}
                </option>
              ))}
            </select>
          </div>

          {/* Expiration date with increment/decrement buttons */}
          <div className="bg-muted/50 rounded-lg p-4">
            <label className="block text-sm font-medium text-center mb-3">
              {t("item.expirationDate")}
            </label>
            <div className="flex items-center justify-center gap-2">
              {/* Day */}
              <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground mb-1">{t("date.day")}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-12 rounded-t-md rounded-b-none border-b-0"
                  onClick={() => adjustDate("day", 1)}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <div className="h-10 w-12 flex items-center justify-center border border-input bg-background text-lg font-semibold tabular-nums">
                  {String(dateParts.day).padStart(2, "0")}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-12 rounded-b-md rounded-t-none border-t-0"
                  onClick={() => adjustDate("day", -1)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              <span className="text-xl font-bold text-muted-foreground self-center">/</span>

              {/* Month */}
              <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground mb-1">{t("date.month")}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-12 rounded-t-md rounded-b-none border-b-0"
                  onClick={() => adjustDate("month", 1)}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <div className="h-10 w-12 flex items-center justify-center border border-input bg-background text-lg font-semibold tabular-nums">
                  {String(dateParts.month).padStart(2, "0")}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-12 rounded-b-md rounded-t-none border-t-0"
                  onClick={() => adjustDate("month", -1)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              <span className="text-xl font-bold text-muted-foreground self-center">/</span>

              {/* Year */}
              <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground mb-1">{t("date.year")}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-16 rounded-t-md rounded-b-none border-b-0"
                  onClick={() => adjustDate("year", 1)}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <div className="h-10 w-16 flex items-center justify-center border border-input bg-background text-lg font-semibold tabular-nums">
                  {dateParts.year}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-16 rounded-b-md rounded-t-none border-t-0"
                  onClick={() => adjustDate("year", -1)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t("item.descriptionOptional")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("item.descriptionPlaceholder")}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 mt-4 flex-col sm:flex-row gap-2">
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

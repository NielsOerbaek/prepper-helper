"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExpirationBadge } from "./expiration-badge";
import { Category } from "@prisma/client";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { getCategoryKey } from "@/lib/translations";

interface Photo {
  id: string;
  minioKey: string;
  originalName: string | null;
  createdAt?: Date;
}

interface ItemLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id: string;
    name: string;
    description: string | null;
    category: Category;
    quantity: number;
    expirationDate: Date | null;
    createdAt: Date;
    photos: Photo[];
  };
  initialPhotoIndex?: number;
}

export function ItemLightbox({ open, onOpenChange, item, initialPhotoIndex = 0 }: ItemLightboxProps) {
  const { t, language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(initialPhotoIndex);
  const [imageError, setImageError] = useState(false);

  const currentPhoto = item.photos[currentIndex];
  const photoUrl = currentPhoto ? `/api/photos/${currentPhoto.id}` : null;
  const hasMultiplePhotos = item.photos.length > 1;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? item.photos.length - 1 : prev - 1));
    setImageError(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === item.photos.length - 1 ? 0 : prev + 1));
    setImageError(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(language, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Image area */}
        <div className="relative bg-black min-h-[50vh] sm:min-h-[60vh] flex-1 flex items-center justify-center">
          {photoUrl && !imageError ? (
            <Image
              src={photoUrl}
              alt={item.name}
              fill
              className="object-contain"
              unoptimized
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="text-white/50 text-center p-8">
              {t("item.noImage")}
            </div>
          )}

          {/* Navigation arrows */}
          {hasMultiplePhotos && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10 sm:h-12 sm:w-12"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10 sm:h-12 sm:w-12"
                onClick={goToNext}
              >
                <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
              </Button>
            </>
          )}

          {/* Photo counter */}
          {hasMultiplePhotos && (
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {item.photos.length}
            </div>
          )}
        </div>

        {/* Item info below image */}
        <div className="p-3 sm:p-4 bg-background shrink-0">
          <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2 sm:mb-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-semibold truncate">{item.name}</h2>
              {item.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
              )}
            </div>
            <Badge variant="outline" className="shrink-0 text-xs">{t(getCategoryKey(item.category))}</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
            <ExpirationBadge expirationDate={item.expirationDate ? new Date(item.expirationDate) : null} />
            <span className="text-muted-foreground">
              {t("item.quantity")}: {item.quantity}
            </span>
          </div>

          <div className="mt-3 pt-2 sm:mt-4 sm:pt-3 border-t text-xs text-muted-foreground">
            {t("item.addedOn")} {formatDate(item.createdAt)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

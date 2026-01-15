"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExpirationBadge } from "./expiration-badge";
import { Category } from "@prisma/client";
import { ImageIcon } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { getCategoryKey } from "@/lib/translations";

interface Photo {
  id: string;
  minioKey: string;
  originalName: string | null;
}

interface ItemCardProps {
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
  onClick?: () => void;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const { t } = useLanguage();
  const [imageError, setImageError] = useState(false);
  const firstPhoto = item.photos[0];
  const photoUrl = firstPhoto ? `/api/photos/${firstPhoto.id}` : null;

  return (
    <Card className="overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors py-0" onClick={onClick}>
      <div className="relative aspect-[4/3] bg-muted w-full">
        {photoUrl && !imageError ? (
          <Image
            src={photoUrl}
            alt={item.name}
            fill
            className="object-cover"
            unoptimized
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        {item.photos.length > 1 && (
          <Badge className="absolute top-2 right-2 text-xs" variant="secondary">
            +{item.photos.length - 1} {t("item.morePhotos")}
          </Badge>
        )}
      </div>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm line-clamp-1" title={item.name}>{item.name}</h3>
          <Badge variant="outline" className="shrink-0 text-xs">{t(getCategoryKey(item.category))}</Badge>
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {item.description}
          </p>
        )}
        <div className="flex items-center justify-between gap-2">
          <ExpirationBadge
            expirationDate={item.expirationDate ? new Date(item.expirationDate) : null}
          />
          <span className="text-xs text-muted-foreground">{t("item.quantity")}: {item.quantity}</span>
        </div>
      </CardContent>
    </Card>
  );
}

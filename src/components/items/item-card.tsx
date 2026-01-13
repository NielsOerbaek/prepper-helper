"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExpirationBadge } from "./expiration-badge";
import { Category } from "@prisma/client";
import { Pencil, Trash2, Camera, ImageIcon } from "lucide-react";
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
    photos: Photo[];
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAddPhoto?: (id: string) => void;
}

export function ItemCard({ item, onEdit, onDelete, onAddPhoto }: ItemCardProps) {
  const { t } = useLanguage();
  const [imageError, setImageError] = useState(false);
  const firstPhoto = item.photos[0];
  const photoUrl = firstPhoto ? `/api/photos/${firstPhoto.id}` : null;

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-muted">
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
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {item.photos.length > 1 && (
          <Badge className="absolute top-2 right-2" variant="secondary">
            +{item.photos.length - 1} {t("item.morePhotos")}
          </Badge>
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-1" title={item.name}>{item.name}</CardTitle>
          <Badge variant="outline" className="shrink-0">{t(getCategoryKey(item.category))}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {item.description}
          </p>
        )}
        <div className="flex items-center justify-between gap-2">
          <ExpirationBadge
            expirationDate={item.expirationDate ? new Date(item.expirationDate) : null}
          />
          <span className="text-sm text-muted-foreground">{t("item.quantity")}: {item.quantity}</span>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onAddPhoto?.(item.id)}
        >
          <Camera className="h-4 w-4 mr-1" />
          {t("item.addPhoto")}
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit?.(item.id)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete?.(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

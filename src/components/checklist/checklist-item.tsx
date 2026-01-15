"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Category } from "@prisma/client";
import { Trash2, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import { getCategoryKey, TranslationKey } from "@/lib/translations";

interface ChecklistItemProps {
  item: {
    id: string;
    name: string;
    category: Category;
    isChecked: boolean;
    isDefault: boolean;
    linkedItemId: string | null;
  };
  onToggle: (id: string, checked: boolean) => void;
  onDelete?: (id: string) => void;
  onLink?: (id: string) => void;
}

export function ChecklistItem({ item, onToggle, onDelete, onLink }: ChecklistItemProps) {
  const { t } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      await onToggle(item.id, !item.isChecked);
    } finally {
      setIsUpdating(false);
    }
  };

  // Translate item names that are translation keys (e.g., "checklist.item.xxx")
  const displayName = item.name.startsWith("checklist.item.")
    ? t(item.name as TranslationKey)
    : item.name;

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 sm:p-3 rounded-lg border transition-colors overflow-hidden",
        item.isChecked ? "bg-muted/50" : "bg-background"
      )}
    >
      <Checkbox
        checked={item.isChecked}
        onCheckedChange={handleToggle}
        disabled={isUpdating}
        className="h-5 w-5 shrink-0"
      />
      <p
        className={cn(
          "flex-1 min-w-0 font-medium truncate text-sm sm:text-base",
          item.isChecked && "line-through text-muted-foreground"
        )}
        title={displayName}
      >
        {displayName}
      </p>
      <Badge variant="outline" className="shrink-0 hidden sm:flex">
        {t(getCategoryKey(item.category))}
      </Badge>
      {item.linkedItemId && (
        <Badge variant="secondary" className="shrink-0 hidden sm:flex">
          <Link2 className="h-3 w-3 mr-1" />
          Linked
        </Badge>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive shrink-0 h-8 w-8 p-0"
        onClick={() => onDelete?.(item.id)}
        title="Delete item"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

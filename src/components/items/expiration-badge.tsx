"use client";

import { Badge } from "@/components/ui/badge";
import { getExpirationStatus, ExpirationStatus } from "@/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";

interface ExpirationBadgeProps {
  expirationDate: Date | null;
  className?: string;
}

const statusClassNames: Record<ExpirationStatus, string> = {
  safe: "bg-green-100 text-green-800 hover:bg-green-100",
  warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  danger: "bg-red-100 text-red-800 hover:bg-red-100",
  expired: "bg-gray-100 text-gray-800 hover:bg-gray-100",
};

export function ExpirationBadge({ expirationDate, className }: ExpirationBadgeProps) {
  const { t } = useLanguage();

  if (!expirationDate) {
    return (
      <Badge variant="outline" className={cn("text-muted-foreground", className)}>
        {t("expiration.noExpiration")}
      </Badge>
    );
  }

  const status = getExpirationStatus(expirationDate);
  const statusClassName = statusClassNames[status];

  const daysUntil = Math.ceil(
    (expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const displayDate = expirationDate.toLocaleDateString();

  const getStatusLabel = () => {
    switch (status) {
      case "safe":
        return t("expiration.ok");
      case "warning":
        return t("expiration.expiringSoon");
      case "danger":
        return t("expiration.expiresSoon");
      case "expired":
        return t("expiration.expired");
    }
  };

  const getDaysText = () => {
    if (daysUntil < 0) {
      return `${Math.abs(daysUntil)} ${t("expiration.daysAgo")}`;
    } else if (daysUntil === 0) {
      return t("expiration.today");
    } else if (daysUntil === 1) {
      return t("expiration.tomorrow");
    } else {
      return `${daysUntil} ${t("expiration.days")}`;
    }
  };

  return (
    <Badge className={cn(statusClassName, className)} title={displayDate}>
      {getStatusLabel()} ({getDaysText()})
    </Badge>
  );
}

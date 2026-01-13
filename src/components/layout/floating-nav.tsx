"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import { TranslationKey } from "@/lib/translations";
import {
  Package,
  ClipboardList,
  Clock,
  Settings,
  Home,
  X,
  Menu,
  LucideIcon,
} from "lucide-react";

interface NavItem {
  titleKey: TranslationKey;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  {
    titleKey: "nav.dashboard",
    href: "/",
    icon: Home,
  },
  {
    titleKey: "nav.inventory",
    href: "/inventory",
    icon: Package,
  },
  {
    titleKey: "nav.checklist",
    href: "/checklist",
    icon: ClipboardList,
  },
  {
    titleKey: "nav.expiringSoon",
    href: "/expiring",
    icon: Clock,
  },
  {
    titleKey: "nav.settings",
    href: "/settings",
    icon: Settings,
  },
];

export function FloatingNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 md:hidden flex flex-col items-end">
      {/* Nav items - shown when open */}
      <div
        className={cn(
          "flex flex-col gap-2 mb-2 transition-all duration-200 items-end",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium shadow-lg transition-all border",
              pathname === item.href
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-card-foreground hover:bg-accent border-border"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{t(item.titleKey)}</span>
          </Link>
        ))}
      </div>

      {/* Main FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200",
          isOpen
            ? "bg-muted text-muted-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Backdrop when open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

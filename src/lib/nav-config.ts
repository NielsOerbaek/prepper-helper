import { Package, ClipboardList, Clock, Settings, Home, Info, LucideIcon } from "lucide-react";
import { TranslationKey } from "@/lib/translations";

export interface NavItem {
  titleKey: TranslationKey;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
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
  {
    titleKey: "settings.about",
    href: "/about",
    icon: Info,
  },
];

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import { navItems } from "@/lib/nav-config";

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40">
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {t(item.titleKey)}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

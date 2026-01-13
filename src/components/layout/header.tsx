"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Settings } from "lucide-react";
import { LanguageSwitcher } from "./language-switcher";
import { StashSwitcher } from "./stash-switcher";
import { useLanguage } from "@/lib/language-context";

export function Header() {
  const { data: session } = useSession();
  const { t } = useLanguage();

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : session?.user?.email?.[0]?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image
            src="/icon.png"
            alt={t("app.name")}
            width={32}
            height={32}
            className="rounded-md shadow-md"
          />
          <span className="hidden sm:inline">{t("app.name")}</span>
        </Link>

        {session && (
          <div className="ml-4">
            <StashSwitcher />
          </div>
        )}

        <nav className="hidden md:flex ml-6 gap-4">
          <Link
            href="/inventory"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("nav.inventory")}
          </Link>
          <Link
            href="/checklist"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("nav.checklist")}
          </Link>
          <Link
            href="/expiring"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("nav.expiringSoon")}
          </Link>
        </nav>

        <div className="flex-1" />

        <LanguageSwitcher />

        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {session.user?.name && (
                    <p className="font-medium">{session.user.name}</p>
                  )}
                  {session.user?.email && (
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {session.user.email}
                    </p>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  {t("nav.settings")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t("auth.signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">{t("auth.signIn")}</Link>
            </Button>
            <Button asChild>
              <Link href="/register">{t("auth.signUp")}</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

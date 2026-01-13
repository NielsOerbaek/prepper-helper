"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/lib/language-context";
import { StashProvider } from "@/lib/stash-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <StashProvider>
          {children}
          <Toaster position="top-right" />
        </StashProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}

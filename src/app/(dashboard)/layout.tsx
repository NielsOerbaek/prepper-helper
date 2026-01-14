"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { FloatingNav } from "@/components/layout/floating-nav";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      <div className="flex-1 flex min-w-0">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-auto min-w-0">{children}</main>
      </div>
      <FloatingNav />
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Redirect to inventory with expiration filter
export default function ExpiringPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/inventory?expiration=soon");
  }, [router]);

  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

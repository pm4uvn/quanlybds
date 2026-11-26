"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/supabase/use-session";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/dang-nhap");
    }
  }, [loading, session, router]);

  if (!isSupabaseConfigured) {
    return <>{children}</>;
  }

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-secondary" />
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface Props {
  className?: string;
  showLabel?: boolean;
}

export function SignOutButton({ className, showLabel = true }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50",
        className
      )}
    >
      {loading
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : <LogOut className="w-3.5 h-3.5" />
      }
      {showLabel && <span>{loading ? "Signing out..." : "Sign out"}</span>}
    </button>
  );
}
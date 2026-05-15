"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { useState } from "react";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGithubLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleGithubLogin}
        disabled={loading}
        className="w-full gap-2"
        size="lg"
      >
        <Github className="w-4 h-4" />
        {loading ? "Connecting..." : "Continue with GitHub"}
      </Button>
    </div>
  );
}
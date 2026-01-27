"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type RequireAuthState = {
  ready: boolean; // 認証チェックが終わったか
};

export function useRequireAuth(): RequireAuthState {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const { data, error } = await supabase.auth.getSession();

      // 何か変なエラーでも、未ログイン扱いで逃がす（UX優先）
      if (error || !data.session) {
        router.replace("/login");
        return;
      }

      if (mounted) setReady(true);
    };

    run();

    return () => {
      mounted = false;
    };
  }, [router]);

  return { ready };
}

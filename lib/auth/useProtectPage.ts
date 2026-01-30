"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export function useProtectPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;

      const token = data.session?.access_token;
      if (!token) {
        router.replace("/login");
        return;
      }

      setReady(true);
    });

    return () => {
      alive = false;
    };
  }, [router]);

  return { ready };
}

"use client";

import React from "react";
import { supabase } from "@/lib/supabase/client";
import { Header } from "./Header";

export function HeaderWrapper() {
  const [email, setEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  return <Header userEmail={email} />;
}

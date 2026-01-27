"use client";

import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Header } from "./Header";
import React from "react";

export function HeaderWrapper() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const isLoginPage = pathname === "/login";

  return (
    <Header
      userEmail={email}
      onLogout={handleLogout}
      showLogout={!isLoginPage}
    />
  );
}

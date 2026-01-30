import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export function supabaseServer(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });
}

type CookieSetter = {
  set: (cookie: { name: string; value: string } & CookieOptions) => void;
};

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,

        set: (name: string, value: string, options: CookieOptions) => {
          // cookieStore が set を持つ環境だけ書き込む（readonly環境は握りつぶす）
          try {
            (cookieStore as unknown as CookieSetter).set({
              name,
              value,
              ...options,
            });
          } catch {
            // noop
          }
        },

        remove: (name: string, options: CookieOptions) => {
          try {
            (cookieStore as unknown as CookieSetter).set({
              name,
              value: "",
              ...options,
              maxAge: 0,
            });
          } catch {
            // noop
          }
        },
      },
    }
  );
}

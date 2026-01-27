"use client";

import { supabase } from "@/lib/supabase/client";

type HeaderProps = {
  userEmail?: string | null;
};

export function Header({ userEmail }: HeaderProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // 画面遷移は各ページの保護ロジック（未ログイン→/login）に任せる
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="text-lg font-semibold text-gray-900">creator-flow</div>

      <div className="flex items-center gap-3 text-sm">
        {userEmail ? (
          <span className="text-gray-600">{userEmail}</span>
        ) : (
          <span className="text-gray-400">Guest</span>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md px-2 py-1 text-gray-900 hover:bg-gray-50 hover:underline"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

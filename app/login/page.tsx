"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const emailOk = useMemo(() => {
    // MVPなので軽いチェックだけ（厳密なRFCは不要）
    return email.trim().length > 3 && email.includes("@");
  }, [email]);

  const passwordOk = useMemo(() => {
    return password.length >= 8;
  }, [password]);

  const canSubmit = emailOk && passwordOk;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // いまはUIだけ。次回ここをSupabase Authにつなぐ
    alert("次回ここでSupabaseログインを実装します！");
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        <header className="mb-8 space-y-2">
          <Link
            href="/"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← Home
          </Link>

          <h1 className="text-3xl font-bold tracking-tight">Login</h1>
          <p className="text-sm text-slate-600">
            creator-flow にログインします（MVP：メール/パスワード）。
          </p>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Email">
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-400"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {!emailOk && email.length > 0 ? (
                <p className="mt-2 text-xs text-slate-500">
                  メール形式を確認してね
                </p>
              ) : null}
            </Field>

            <Field label="Password">
              <input
                type="password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-400"
                placeholder="8文字以上"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {!passwordOk && password.length > 0 ? (
                <p className="mt-2 text-xs text-slate-500">
                  8文字以上で入力してね
                </p>
              ) : null}
            </Field>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Login
            </button>

            <div className="flex items-center justify-between pt-2 text-xs text-slate-600">
              <button
                type="button"
                className="hover:text-slate-900"
                onClick={() =>
                  alert("次回：パスワードリセットを入れるならここ")
                }
              >
                パスワードを忘れた
              </button>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                Supabase Auth（予定）
              </span>
            </div>
          </form>
        </div>

        <footer className="mt-8 text-xs text-slate-500">
          ※ 認証ロジックは次回実装します（いまは画面のみ）
        </footer>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

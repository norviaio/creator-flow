"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { supabase } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  const emailOk = useMemo(() => {
    return email.trim().length > 3 && email.includes("@");
  }, [email]);

  const passwordOk = useMemo(() => {
    return password.length >= 8;
  }, [password]);

  const canSubmit = emailOk && passwordOk && !loading;

  const onLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setMessage("");
    setEmail("");
    setPassword("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage(`ログイン失敗：${error.message}`);
        return;
      }

      setMessage("ログイン成功！");
      console.log("session:", data.session);

      router.push("/projects");
    } finally {
      setLoading(false);
    }
  };

  const onSignUpTest = async () => {
    if (!emailOk || !passwordOk || loading) return;

    setLoading(true);
    setMessage("");
    setEmail("");
    setPassword("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage(`登録失敗：${error.message}`);
        return;
      }

      // Email確認がONだと「確認メール送ったよ」になることがある
      if (data.session) {
        setMessage("登録＆ログイン成功！");
      } else {
        setMessage(
          "登録OK！メール確認が必要な設定かも（Supabase側で確認してね）"
        );
      }

      console.log("signUp:", data);
    } finally {
      setLoading(false);
    }
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
            creator-flow にログインします（Supabase Auth）。
          </p>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={onLogin} className="space-y-4">
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
              {loading ? "処理中..." : "Login"}
            </button>

            <div className="flex flex-col gap-2 pt-2 text-xs text-slate-600">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                disabled={!emailOk || !passwordOk || loading}
                onClick={onSignUpTest}
              >
                {loading ? "処理中..." : "テスト用に新規登録（Sign up）"}
              </button>

              {message ? (
                <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {message}
                </p>
              ) : null}

              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs">
                Supabase Auth
              </span>
            </div>
          </form>
        </div>

        <footer className="mt-8 text-xs text-slate-500">
          ※
          今日はログイン接続まで。次はログイン後の遷移とセッション管理を入れる。
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

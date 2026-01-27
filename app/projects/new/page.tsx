"use client";

import type React from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase/client";
import { useRequireAuth } from "@/lib/auth/requireAuth";

type ProjectStatus = "active" | "completed";

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("active");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  const titleOk = useMemo(() => title.trim().length >= 2, [title]);
  const canSubmit = titleOk && !loading;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setMessage("");

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) {
        setMessage(`ユーザー取得エラー：${userError.message}`);
        return;
      }

      const user = userData.user;
      if (!user) {
        setMessage("未ログインです。ログインしてください。");
        router.push("/login");
        return;
      }

      const { error } = await supabase.from("projects").insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() === "" ? null : description.trim(),
        status,
      });

      if (error) {
        setMessage(`保存エラー：${error.message}`);
        return;
      }

      setMessage("作成しました！");
      router.push("/projects");
    } finally {
      setLoading(false);
    }
  };

  //ログイン確認
  const { ready } = useRequireAuth();

  if (!ready) {
    return <div className="px-6 py-6 text-sm text-slate-600">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <header className="mb-8 space-y-2">
          <Link
            href="/projects"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← Projects
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">New Project</h1>
          <p className="text-sm text-slate-600">
            プロジェクトを作成します（MVP：タイトル必須、説明は任意）。
          </p>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={onSubmit} className="space-y-5">
            <Field label="タイトル（必須）" hint="2文字以上">
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-400"
                placeholder="例）動画編集フロー改善"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {!titleOk && title.length > 0 ? (
                <p className="mt-2 text-xs text-rose-600">
                  タイトルは2文字以上で入力してね
                </p>
              ) : null}
            </Field>

            <Field label="説明（任意）" hint="なくてもOK">
              <textarea
                className="min-h-28 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-400"
                placeholder="例）YouTube向け動画制作の進行管理"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>

            <Field label="ステータス" hint="MVPは2種類">
              <div className="grid grid-cols-2 gap-2">
                <RadioCard
                  checked={status === "active"}
                  title="active"
                  description="進行中"
                  onClick={() => setStatus("active")}
                />
                <RadioCard
                  checked={status === "completed"}
                  title="completed"
                  description="完了"
                  onClick={() => setStatus("completed")}
                />
              </div>
            </Field>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <Link
                href="/projects"
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                キャンセル
              </Link>

              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                作成する
              </button>
            </div>

            <p className="pt-2 text-xs text-slate-400">
              ※ 現在はUIのみ。次回 Supabase（projects テーブル）に保存します。
            </p>
          </form>
          {message ? (
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {message}
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

function RadioCard({
  checked,
  title,
  description,
  onClick,
}: {
  checked: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl border px-4 py-4 text-left",
        checked
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      ].join(" ")}
    >
      <div className="text-sm font-semibold">{title}</div>
      <div
        className={[
          "mt-1 text-xs",
          checked ? "text-white/80" : "text-slate-500",
        ].join(" ")}
      >
        {description}
      </div>
    </button>
  );
}

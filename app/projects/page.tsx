"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";

type Project = {
  id: string;
  title: string;
  description?: string;
  status: "active" | "completed";
};

const mockProjects: Project[] = [
  {
    id: "1",
    title: "動画編集フロー改善",
    description: "YouTube向け動画制作の進行管理",
    status: "active",
  },
  {
    id: "2",
    title: "漫画制作スケジュール管理",
    description: "原稿・ネーム・仕上げの進捗管理",
    status: "active",
  },
  {
    id: "3",
    title: "配信企画管理",
    description: "VTuber配信企画のタスク整理",
    status: "completed",
  },
];

export default function ProjectsPage() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? null;
      setUserEmail(data.user?.email ?? null);

      // ページ保護
      if (!email) {
        router.push("/login");
      }
    });
  }, [router]);

  const onLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {userEmail ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          ログイン中：{userEmail}
        </div>
      ) : (
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
          未ログイン
        </div>
      )}
      <div className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="mt-1 text-sm text-slate-600">
              作品（プロジェクト）の一覧
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/projects/new"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              + 新規プロジェクト
            </Link>

            <button
              type="button"
              onClick={onLogout}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold">{project.title}</h2>
                <StatusBadge status={project.status} />
              </div>

              {project.description ? (
                <p className="text-sm text-slate-600">{project.description}</p>
              ) : (
                <p className="text-sm text-slate-400">説明はありません</p>
              )}
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: "active" | "completed" }) {
  if (status === "completed") {
    return (
      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-700">
        completed
      </span>
    );
  }

  return (
    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
      active
    </span>
  );
}

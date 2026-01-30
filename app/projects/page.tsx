"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useProtectPage } from "@/lib/auth/useProtectPage";

type Project = {
  id: string;
  title: string;
  description: string | null;
  status: "active" | "completed";
};

// TODO: mockProjects削除（詳細ページの実データ化が安定したら）
/*
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
*/
export default function ProjectsPage() {
  const router = useRouter();
  const { ready } = useProtectPage();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * fetchProject
     *
     * プロジェクト詳細を取得するための関数。
     *
     * ・Supabase の session から access token を取得し、
     *   認証済みユーザーのみ API を呼び出す
     * ・token が無い、または API が 401 を返した場合は
     *   未ログインとしてログインページへリダイレクトする
     *
     * ※ ログイン状態の管理自体は Supabase Auth が担当しており、
     *   この関数は「認証済みであることの確認」を行っているだけ。
     */
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);

      try {
        // ① セッション取得
        const { data } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token;

        // 未ログインなら弾く
        if (!accessToken) {
          router.push("/login");
          return;
        }

        // ② token を付けて API 呼び出し
        const res = await fetch("/api/projects", {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch projects");
        }

        const json = await res.json();
        setProjects(json.projects ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-white">
        <main className="mx-auto max-w-5xl px-6 py-10">
          <div className="h-10 w-60 rounded-lg bg-slate-100" />
          <div className="mt-6 h-24 rounded-xl bg-slate-100" />
        </main>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
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
          </div>
        </header>

        {loading ? (
          <p className="text-sm text-slate-500">読み込み中...</p>
        ) : error ? (
          <p className="text-sm text-rose-600">エラー：{error}</p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-slate-500">
            プロジェクトはまだありません。
          </p>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
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
                  <p className="text-sm text-slate-600">
                    {project.description}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400">説明はありません</p>
                )}
              </Link>
            ))}
          </section>
        )}
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

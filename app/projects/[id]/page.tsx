"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

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

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const project = mockProjects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <p className="text-slate-600">プロジェクトが見つかりません。</p>
        <Link
          href="/projects"
          className="mt-4 inline-block text-sm text-slate-700"
        >
          ← Projectsへ戻る
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <header className="mb-8">
          <Link
            href="/projects"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← Projects
          </Link>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {project.title}
              </h1>
              {project.description ? (
                <p className="mt-2 text-slate-600">{project.description}</p>
              ) : null}
            </div>

            <StatusBadge status={project.status} />
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Tasks</h2>

          <p className="text-sm text-slate-500">
            ※ 次回ここにタスク一覧を実装します
          </p>
        </section>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: "active" | "completed" }) {
  if (status === "completed") {
    return (
      <span className="rounded-full bg-slate-200 px-3 py-1 text-xs text-slate-700">
        completed
      </span>
    );
  }

  return (
    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
      active
    </span>
  );
}

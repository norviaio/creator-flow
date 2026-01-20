"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase/client";

type Project = {
  id: string;
  title: string;
  description: string | null;
  status: "active" | "completed";
  user_id: string;
};

type TaskStatus = "backlog" | "in_progress" | "review" | "done";

type Task = {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
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
const mockTasks: Task[] = [
  { id: "t1", projectId: "1", title: "素材の収集", status: "backlog" },
  { id: "t2", projectId: "1", title: "カット編集", status: "in_progress" },
  { id: "t3", projectId: "1", title: "テロップ入れ", status: "review" },
  { id: "t4", projectId: "1", title: "書き出し・公開", status: "done" },
  { id: "t5", projectId: "2", title: "ネーム作成", status: "in_progress" },
  { id: "t6", projectId: "2", title: "下書き", status: "backlog" },
  { id: "t7", projectId: "3", title: "企画案出し", status: "done" },
];

const statusLabels: Record<TaskStatus, string> = {
  backlog: "backlog",
  in_progress: "in progress",
  review: "review",
  done: "done",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  // TODO: mockProjects削除（詳細ページの実データ化が安定したら）
  //const project = mockProjects.find((p) => p.id === projectId);

  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [project, setProject] = useState<Project | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      // 1) ログイン確認
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      const email = userData.user?.email ?? null;
      setUserEmail(email);

      if (userError) {
        setProjectError(userError.message);
        setLoadingProject(false);
        return;
      }

      if (!userData.user) {
        router.push("/login");
        return;
      }

      // 2) project取得（RLSにより自分のものだけ取れる）
      setLoadingProject(true);
      setProjectError(null);

      const { data, error } = await supabase
        .from("projects")
        .select("id,title,description,status,user_id")
        .eq("id", projectId)
        .maybeSingle();

      if (error) {
        setProjectError(error.message);
        setProject(null);
        setLoadingProject(false);
        return;
      }

      setProject((data as Project) ?? null);
      setLoadingProject(false);
    };

    run();
  }, [router, projectId]);

  const tasks = useMemo(() => {
    const all = mockTasks.filter((t) => t.projectId === projectId);
    if (filter === "all") return all;
    return all.filter((t) => t.status === filter);
  }, [projectId, filter]);

  const counts = useMemo(() => {
    const all = mockTasks.filter((t) => t.projectId === projectId);
    const base = {
      all: all.length,
      backlog: 0,
      in_progress: 0,
      review: 0,
      done: 0,
    };
    for (const t of all) base[t.status] += 1;
    return base;
  }, [projectId]);

  if (loadingProject) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <p className="text-slate-600">読み込み中...</p>
      </main>
    );
  }

  if (projectError) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <p className="text-rose-600">エラー：{projectError}</p>
        <Link
          href="/projects"
          className="mt-4 inline-block text-sm text-slate-700"
        >
          ← Projectsへ戻る
        </Link>
      </main>
    );
  }

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
      {userEmail ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          ログイン中：{userEmail}
        </div>
      ) : null}
      <div className="mx-auto max-w-4xl px-6 py-12">
        <header className="mb-8">
          <Link
            href="/projects"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← Projects
          </Link>

          <div className="mt-4 flex items-start justify-between gap-4">
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">Tasks</h2>

            <div className="flex flex-wrap items-center gap-2">
              <FilterButton
                active={filter === "all"}
                onClick={() => setFilter("all")}
              >
                All <span className="text-slate-500">({counts.all})</span>
              </FilterButton>
              <FilterButton
                active={filter === "backlog"}
                onClick={() => setFilter("backlog")}
              >
                Backlog{" "}
                <span className="text-slate-500">({counts.backlog})</span>
              </FilterButton>
              <FilterButton
                active={filter === "in_progress"}
                onClick={() => setFilter("in_progress")}
              >
                In progress{" "}
                <span className="text-slate-500">({counts.in_progress})</span>
              </FilterButton>
              <FilterButton
                active={filter === "review"}
                onClick={() => setFilter("review")}
              >
                Review <span className="text-slate-500">({counts.review})</span>
              </FilterButton>
              <FilterButton
                active={filter === "done"}
                onClick={() => setFilter("done")}
              >
                Done <span className="text-slate-500">({counts.done})</span>
              </FilterButton>

              <button
                type="button"
                className="ml-0 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white sm:ml-2"
                onClick={() => alert("次回：タスク追加フォームへ")}
              >
                + タスク追加
              </button>
            </div>
          </div>

          <div className="mt-5">
            {tasks.length === 0 ? (
              <p className="text-sm text-slate-500">
                該当するタスクはありません。
              </p>
            ) : (
              <ul className="space-y-3">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{task.title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          id: {task.id}
                        </p>
                      </div>
                      <TaskStatusBadge status={task.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="mt-6 text-xs text-slate-400">
            ※ 現在はダミーデータ表示。次回 Supabase（tasks
            テーブル）に置き換えます。
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

function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const base = "rounded-full px-2 py-1 text-xs font-medium";
  if (status === "done") {
    return (
      <span className={`${base} bg-slate-200 text-slate-700`}>
        {statusLabels[status]}
      </span>
    );
  }
  if (status === "review") {
    return (
      <span className={`${base} bg-amber-100 text-amber-700`}>
        {statusLabels[status]}
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className={`${base} bg-sky-100 text-sky-700`}>
        {statusLabels[status]}
      </span>
    );
  }
  return (
    <span className={`${base} bg-slate-100 text-slate-700`}>
      {statusLabels[status]}
    </span>
  );
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl border px-3 py-2 text-sm",
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

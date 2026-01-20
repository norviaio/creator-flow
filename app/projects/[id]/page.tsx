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

type TaskRow = {
  id: string;
  project_id: string;
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
const mockTasks: Task[] = [
  { id: "t1", projectId: "1", title: "素材の収集", status: "backlog" },
  { id: "t2", projectId: "1", title: "カット編集", status: "in_progress" },
  { id: "t3", projectId: "1", title: "テロップ入れ", status: "review" },
  { id: "t4", projectId: "1", title: "書き出し・公開", status: "done" },
  { id: "t5", projectId: "2", title: "ネーム作成", status: "in_progress" },
  { id: "t6", projectId: "2", title: "下書き", status: "backlog" },
  { id: "t7", projectId: "3", title: "企画案出し", status: "done" },
];
*/

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

  //プロジェクト表示
  const [project, setProject] = useState<Project | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  //タスク表示
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  //タスク追加
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);

  //タスク編集
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const router = useRouter();

  const updateTaskStatus = async (taskId: string, nextStatus: TaskStatus) => {
    setUpdateError(null);

    const prev = tasks;
    setTasks((cur) =>
      cur.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );

    setUpdatingTaskId(taskId);

    const { error } = await supabase
      .from("tasks")
      .update({ status: nextStatus })
      .eq("id", taskId);

    if (error) {
      setTasks(prev);
      setUpdateError(error.message);
    }

    setUpdatingTaskId(null);
  };

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

      // 3) task取得
      setLoadingTasks(true);
      setTasksError(null);

      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .select("id,project_id,title,status")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (taskError) {
        setTasksError(taskError.message);
        setTasks([]);
        setLoadingTasks(false);
        return;
      }

      const normalized = (taskData ?? []).map((t) => ({
        id: t.id,
        projectId: t.project_id,
        title: t.title,
        status: t.status,
      })) as Task[];

      setTasks(normalized);
      setLoadingTasks(false);
    };

    run();
  }, [router, projectId]);

  const filteredTasks = useMemo(() => {
    const all = tasks;
    if (filter === "all") return all;
    return all.filter((t) => t.status === filter);
  }, [tasks, filter]);

  const counts = useMemo(() => {
    const all = tasks;
    const base = {
      all: all.length,
      backlog: 0,
      in_progress: 0,
      review: 0,
      done: 0,
    };
    for (const t of all) base[t.status] += 1;
    return base;
  }, [tasks]);

  // TODO: mock削除
  /*
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
*/
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

        <div
          className={[
            "grid transition-all duration-200 ease-out",
            showTaskForm
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0",
          ].join(" ")}
        >
          <div className="overflow-hidden">
            {showTaskForm ? (
              <>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newTitle.trim() || creating) return;

                    setCreating(true);
                    setCreateError(null);

                    const { error } = await supabase.from("tasks").insert({
                      project_id: projectId,
                      title: newTitle.trim(),
                      status: "backlog",
                    });

                    if (error) {
                      setCreateError(error.message);
                      setCreating(false);
                      return;
                    }

                    const { data } = await supabase
                      .from("tasks")
                      .select("id,project_id,title,status")
                      .eq("project_id", projectId)
                      .order("created_at", { ascending: true });

                    const normalized: Task[] = (data ?? []).map(
                      (t: TaskRow) => ({
                        id: t.id,
                        projectId: t.project_id,
                        title: t.title,
                        status: t.status,
                      })
                    ) as Task[];

                    setTasks(normalized);
                    setNewTitle("");
                    setCreating(false);

                    setNewTitle("");
                    setShowTaskForm(false);
                  }}
                  className="mb-4 flex gap-2"
                >
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="新しいタスク"
                    className="flex-1 rounded-lg border px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!newTitle.trim() || creating}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    追加
                  </button>
                </form>

                {createError ? (
                  <p className="mb-2 text-sm text-rose-600">
                    エラー：{createError}
                  </p>
                ) : null}
              </>
            ) : null}
          </div>
        </div>

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
                onClick={() => setShowTaskForm((v) => !v)}
                className="ml-0 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white sm:ml-2"
              >
                {showTaskForm ? "閉じる" : "+ タスク追加"}
              </button>
            </div>
          </div>

          {updateError ? (
            <p className="mb-2 text-sm text-rose-600">
              更新エラー：{updateError}
            </p>
          ) : null}

          <div className="mt-5">
            {loadingTasks ? (
              <p className="text-sm text-slate-500">タスク読み込み中...</p>
            ) : tasksError ? (
              <p className="text-sm text-rose-600">エラー：{tasksError}</p>
            ) : filteredTasks.length === 0 ? (
              <p className="text-sm text-slate-500">タスクはまだありません。</p>
            ) : (
              <ul className="space-y-2">
                {filteredTasks.map((task) => (
                  <li key={task.id} className="rounded-lg border px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{task.title}</p>
                      </div>

                      <select
                        value={task.status}
                        onChange={(e) =>
                          updateTaskStatus(
                            task.id,
                            e.target.value as TaskStatus
                          )
                        }
                        disabled={updatingTaskId === task.id}
                        className="rounded-lg border px-2 py-1 text-sm"
                      >
                        <option value="backlog">{statusLabels.backlog}</option>
                        <option value="in_progress">
                          {statusLabels.in_progress}
                        </option>
                        <option value="review">{statusLabels.review}</option>
                        <option value="done">{statusLabels.done}</option>
                      </select>
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

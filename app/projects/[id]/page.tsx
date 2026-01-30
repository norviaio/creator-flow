"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useProtectPage } from "@/lib/auth/useProtectPage";

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

type CreateTaskParams = {
  token: string;
  projectId: string;
  title: string;
};

async function createTaskApi(token: string, projectId: string, title: string) {
  const res = await fetch(`/api/tasks?projectId=${projectId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? "タスク作成に失敗しました");
  }

  return res.json();
}

//タスク更新
async function updateTaskApi(
  token: string,
  taskId: string,
  payload: { status?: string; title?: string }
) {
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? "タスク更新に失敗しました");
  }

  return res.json();
}

//タスク削除
async function deleteTaskApi(token: string, taskId: string) {
  console.log("taskId : " + taskId);
  supabase.auth.getSession().then(({ data }) => {
    console.log("TOKEN", data.session?.access_token);
  });
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? "タスク削除に失敗しました");
  }
}

export default function ProjectDetailPage() {
  const { ready } = useProtectPage();
  const params = useParams();
  const projectId = params.id as string;

  // TODO: mockProjects削除（詳細ページの実データ化が安定したら）
  //const project = mockProjects.find((p) => p.id === projectId);

  const [filter, setFilter] = useState<TaskStatus | "all">("all");

  //プロジェクト表示
  const [project, setProject] = useState<Project | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  type ProjectStatus = "active" | "completed";

  //プロジェクト編集
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<ProjectStatus>("active");

  const [savingProject, setSavingProject] = useState(false);
  const [projectSaveError, setProjectSaveError] = useState<string | null>(null);

  //プロジェクト保存
  const saveProject = async () => {
    if (!project) return;

    if (!editTitle.trim()) {
      setProjectSaveError("タイトルを入力してください。");
      return;
    }

    setSavingProject(true);
    setProjectSaveError(null);

    const { data, error } = await supabase
      .from("projects")
      .update({
        title: editTitle.trim(),
        description:
          editDescription.trim() === "" ? null : editDescription.trim(),
        status: editStatus,
      })
      .eq("id", project.id)
      .select("id,title,description,status,user_id")
      .single();

    if (error) {
      setProjectSaveError(error.message);
      setSavingProject(false);
      return;
    }

    setProject(data);
    setIsEditingProject(false);
    setSavingProject(false);
  };

  //タスク表示
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  //タスク追加
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);

  //タスクステータス編集
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  //タスク削除
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  //タスク名編集
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");

  const router = useRouter();

  // TODO: remove direct supabase access
  //タスク編集
  /*
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
*/
  // TODO: remove direct supabase access
  //タスク削除
  /*
  const deleteTask = async (taskId: string) => {
    setDeleteError(null);
    setDeletingTaskId(taskId);

    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      setDeleteError(error.message);
      setDeletingTaskId(null);
      return;
    }

    setTasks((cur) => cur.filter((t) => t.id !== taskId));
    setDeletingTaskId(null);
  };
*/

  //タスク名編集
  const startEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
  };
  const saveTaskTitle = async (taskId: string) => {
    if (!editTaskTitle.trim()) return;

    const { error } = await supabase
      .from("tasks")
      .update({ title: editTaskTitle.trim() })
      .eq("id", taskId);

    if (error) {
      alert(error.message);
      return;
    }

    setTasks((cur) =>
      cur.map((t) =>
        t.id === taskId ? { ...t, title: editTaskTitle.trim() } : t
      )
    );

    setEditingTaskId(null);
    setEditTaskTitle("");
  };

  //タスク編集
  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    setUpdatingTaskId(taskId);

    try {
      // ① token 取得
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        router.push("/login");
        return;
      }

      // ② APIで更新
      await updateTaskApi(token, taskId, { status });

      // ③ 再取得（今の表示を最新に揃える）
      await fetchTasks(); // ← すでにある取得関数を呼ぶ
    } catch (err) {
      alert(err instanceof Error ? err.message : "更新に失敗しました");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  //タスク削除
  const deleteTask = async (taskId: string) => {
    setDeletingTaskId(taskId);

    try {
      // ① token 取得
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        router.push("/login");
        return;
      }

      // ② APIで削除
      await deleteTaskApi(token, taskId);

      // ③ 再取得（表示を最新に）
      await fetchTasks();
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除に失敗しました");
    } finally {
      setDeletingTaskId(null);
    }
  };

  /**
   * fetchTasks
   * タスク詳細を取得するための関数。
   */
  const fetchTasks = async () => {
    setLoadingTasks(true);
    setTasksError(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      router.push("/login");
      return;
    }

    const res = await fetch(`/api/tasks?projectId=${projectId}`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const json = await res.json().catch(() => ({}));
      setTasksError(json.error ?? "Failed to fetch tasks");
      setLoadingTasks(false);
      return;
    }

    const json = await res.json();
    setTasks(json.tasks ?? []);
    setLoadingTasks(false);
  };

  const onCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || creating) return;

    setCreating(true);
    setCreateError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        throw new Error("未ログインです");
      }

      await createTaskApi(token, projectId, newTitle.trim());

      await fetchTasks();
      setNewTitle("");
      setShowTaskForm(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "作成に失敗しました");
    } finally {
      setCreating(false);
    }
  };

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
    const fetchProject = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`/api/projects?id=${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch project");
      }

      const json = await res.json();
      setProject(json.project ?? null);
    };
    fetchProject();
    if (!projectId) return;

    //タスク取得
    fetchTasks();

    const run = async () => {
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

      const projectData = data as Project | null;

      setProject(projectData);

      if (data) {
        setEditTitle(data.title ?? "");
        setEditDescription(data.description ?? "");
        setEditStatus((data.status ?? "active") as ProjectStatus);
      }

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
        <div className="mx-auto max-w-5xl">
          <div className="h-8 w-60 rounded-lg bg-slate-200" />
          <div className="mt-4 h-4 w-80 rounded bg-slate-200" />
          <div className="mt-10 h-64 rounded-xl bg-slate-200" />
        </div>
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
      <div className="mx-auto max-w-4xl px-6 py-12">
        <header className="mb-8">
          <Link
            href="/projects"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← Projects
          </Link>

          <div className="mt-4 flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {isEditingProject ? (
                <div className="space-y-3">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="プロジェクト名"
                    className="w-full rounded-lg border px-3 py-2 text-base font-semibold"
                  />

                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="説明（任意）"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    rows={3}
                  />

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">ステータス</span>
                    <select
                      value={editStatus}
                      onChange={(e) =>
                        setEditStatus(e.target.value as ProjectStatus)
                      }
                      className="rounded-lg border px-2 py-1 text-sm"
                    >
                      <option value="active">active</option>
                      <option value="completed">completed</option>
                    </select>
                  </div>

                  {projectSaveError ? (
                    <p className="text-sm text-rose-600">
                      エラー：{projectSaveError}
                    </p>
                  ) : null}
                </div>
              ) : (
                <>
                  <h1 className="truncate text-3xl font-bold tracking-tight">
                    {project.title}
                  </h1>
                  {project.description ? (
                    <p className="mt-2 text-slate-600">{project.description}</p>
                  ) : null}
                </>
              )}
            </div>

            <div className="shrink-0">
              {isEditingProject ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditTitle(project.title ?? "");
                      setEditDescription(project.description ?? "");
                      setEditStatus(
                        (project.status ?? "active") as ProjectStatus
                      );
                      setProjectSaveError(null);
                      setIsEditingProject(false);
                    }}
                    className="rounded-lg border px-3 py-2 text-sm"
                  >
                    キャンセル
                  </button>

                  <button
                    type="button"
                    onClick={saveProject}
                    disabled={savingProject}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    保存
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <StatusBadge status={project.status} />
                  <button
                    type="button"
                    onClick={() => setIsEditingProject(true)}
                    className="rounded-lg border px-3 py-2 text-sm"
                  >
                    編集
                  </button>
                </div>
              )}
            </div>
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
                <form onSubmit={onCreateTask} className="mb-4 flex gap-2">
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

          {deleteError ? (
            <p className="mb-2 text-sm text-rose-600">
              削除エラー：{deleteError}
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
                        {editingTaskId === task.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              value={editTaskTitle}
                              onChange={(e) => setEditTaskTitle(e.target.value)}
                              className="w-full rounded-lg border px-2 py-1 text-sm"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => saveTaskTitle(task.id)}
                              className="rounded border px-2 py-1 text-xs"
                            >
                              保存
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTaskId(null);
                                setEditTaskTitle("");
                              }}
                              className="rounded border px-2 py-1 text-xs"
                            >
                              キャンセル
                            </button>
                          </div>
                        ) : (
                          <p
                            className="cursor-pointer truncate font-medium"
                            onClick={() => startEditTask(task)}
                            title="クリックして編集"
                          >
                            {task.title}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
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
                          <option value="backlog">Backlog</option>
                          <option value="in_progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="done">Done</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          disabled={deletingTaskId === task.id}
                          className="rounded-lg border px-2 py-1 text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                        >
                          削除
                        </button>
                      </div>
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

// app/api/tasks/[id]/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/requireAuth";
import { supabaseServer } from "@/lib/supabase/server";

type TaskStatus = "backlog" | "in_progress" | "review" | "done";
type Params = { id: string };
type Ctx = { params: Params | Promise<Params> };

export async function PATCH(request: Request, ctx: Ctx) {
  const user = await requireAuth(request);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: taskId } = await ctx.params;
  if (!taskId)
    return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body: unknown = await request.json().catch(() => ({}));
  const status = (body as { status?: string }).status as TaskStatus | undefined;
  const title = (body as { title?: string }).title as string | undefined;

  if ((!status || !status.trim()) && (!title || !title.trim())) {
    return NextResponse.json(
      { error: "Missing status or title" },
      { status: 400 }
    );
  }

  const supabase = supabaseServer(request);

  const updatePayload: { status?: TaskStatus; title?: string } = {};
  if (status) updatePayload.status = status;
  if (title) updatePayload.title = title.trim();

  const { data, error } = await supabase
    .from("tasks")
    .update(updatePayload)
    .eq("id", taskId)
    .select("id, project_id, title, status, created_at")
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ task: data }, { status: 200 });
}

export async function DELETE(request: Request, ctx: Ctx) {
  const user = await requireAuth(request);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: taskId } = await ctx.params;
  if (!taskId)
    return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = supabaseServer(request);

  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return new NextResponse(null, { status: 204 });
}

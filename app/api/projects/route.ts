import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/requireAuth";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("id");

  const supabase = supabaseServer(request);

  // 一覧
  if (!projectId) {
    const { data, error } = await supabase
      .from("projects")
      .select("id, title, description, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ projects: data ?? [] });
  }

  // 詳細
  const { data, error } = await supabase
    .from("projects")
    .select("id, title, description, status")
    .eq("id", projectId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project: data });
}

export async function POST(request: Request) {
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = supabaseServer(request);
  const body = await request.json();

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title: String(body.title ?? "").trim(),
      description: body.description ?? null,
      status: body.status,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}

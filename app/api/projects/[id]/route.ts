import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/requireAuth";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // ① 認証
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = params.id;
  if (!projectId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // ② DB
  const supabase = supabaseServer(request);

  const { data, error } = await supabase
    .from("projects")
    .select("id, title, description, status, created_at")
    .eq("id", projectId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ⭐ ここが重要
  return NextResponse.json({ project: data });
}

import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/requireAuth";
import { supabaseServer } from "@/lib/supabase/server";

type Params = { id: string };

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  // 1) 認証
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) params を await して id を取り出す（ここがポイント）
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // 3) DB
  const supabase = supabaseServer(request);

  const { data, error } = await supabase
    .from("projects")
    .select("id, title, description, status, created_at")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project: data });
}

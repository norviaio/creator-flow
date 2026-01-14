export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm">
            <span className="font-semibold">creator-flow</span>
            <span className="text-slate-500">Portfolio</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            コンテンツ制作進行管理ツール
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            作品（Project）とタスク（Task）をシンプルに管理し、進捗を可視化するためのアプリです。
            1ヶ月でMVPを完成させることを目標に、段階的に拡張します。
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <Badge>Next.js</Badge>
            <Badge>TypeScript</Badge>
            <Badge>Tailwind CSS</Badge>
            <Badge>Supabase</Badge>
            <Badge>PostgreSQL</Badge>
            <Badge>Vercel</Badge>
          </div>
        </header>

        <section className="mt-10 grid gap-6 sm:grid-cols-2">
          <Card title="MVP（1ヶ月）で作ること">
            <ul className="list-disc space-y-2 pl-5 text-slate-700">
              <li>ログイン / ログアウト（Supabase Auth）</li>
              <li>作品（Project）：一覧 / 作成 / 編集 / 削除</li>
              <li>タスク（Task）：一覧 / 作成 / 編集 / 削除</li>
              <li>
                ステータス管理（Project: active/completed、Task:
                backlog/in_progress/review/done）
              </li>
              <li>ステータス絞り込み（フィルタ）</li>
            </ul>
          </Card>

          <Card title="設計メモ（重要）">
            <ul className="list-disc space-y-2 pl-5 text-slate-700">
              <li>DB：projects / tasks / admins（作成済み）</li>
              <li>
                権限：通常ユーザーは自分のデータのみ、管理者（adminsのuser_id）は全件閲覧可
              </li>
              <li>RLS（Row Level Security）はフロント実装後に設定予定</li>
            </ul>
          </Card>

          <Card title="次の実装予定">
            <ol className="list-decimal space-y-2 pl-5 text-slate-700">
              <li>ログイン画面（/login）</li>
              <li>作品一覧（/projects）</li>
              <li>作品詳細（/projects/[id]）</li>
              <li>タスク作成・編集（/projects/[id]/tasks/...）</li>
            </ol>
          </Card>

          <Card title="ポートフォリオとして見せたい点">
            <ul className="list-disc space-y-2 pl-5 text-slate-700">
              <li>要件 → MVP定義 → DB設計 → 実装の流れ</li>
              <li>認証・認可（RLS）を含む安全なデータ設計</li>
              <li>UI/UXと保守性（命名・コンポーネント分割）</li>
              <li>Vercelでのデプロイと運用</li>
            </ul>
          </Card>
        </section>

        <footer className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500">
          <p>
            ※
            本プロジェクトはポートフォリオ用途です。実在の作品名・ロゴ・画像などの著作物は使用しません。
          </p>
        </footer>
      </div>
    </main>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}

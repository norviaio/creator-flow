"use client";

type HeaderProps = {
  userEmail?: string | null;
  onLogout?: () => void;
  showLogout?: boolean;
};

export function Header({
  userEmail,
  onLogout,
  showLogout = true,
}: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="text-lg font-semibold text-gray-900">creator-flow</div>

      <div className="flex items-center gap-3 text-sm">
        {userEmail && <span className="text-gray-600">{userEmail}</span>}

        {showLogout && onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="rounded-md px-2 py-1 text-gray-900 hover:bg-gray-50 hover:underline"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}

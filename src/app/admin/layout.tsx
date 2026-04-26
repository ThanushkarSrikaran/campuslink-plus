"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "🏠 Overview", exact: true },
    { href: "/admin/users", label: "👥 Users" },
    { href: "/admin/resources", label: "📚 Resources" },
    { href: "/admin/mentors", label: "👨‍🏫 Mentors" },
    { href: "/admin/appointments", label: "📅 Appointments" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-lg text-xl">⚙️</div>
            <div>
              <h1 className="text-lg font-bold text-white">
                Campus<span className="text-red-500">Link+</span>
              </h1>
              <p className="text-xs text-red-400 font-bold">ADMIN PANEL</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-red-600 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {session?.user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-medium">
                {session?.user?.name}
              </p>
              <p className="text-red-400 text-xs font-bold">Administrator</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full text-left text-gray-400 hover:text-red-400 text-sm px-4 py-2 rounded-xl hover:bg-gray-800 transition-all"
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
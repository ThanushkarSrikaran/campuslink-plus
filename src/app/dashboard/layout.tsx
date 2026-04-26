"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "🏠 Home", exact: true },
    { href: "/dashboard/vault", label: "📚 Vault" },
    { href: "/dashboard/sos", label: "🆘 SOS Board" },
    { href: "/dashboard/appointments", label: "📅 Appointments" },
    { href: "/dashboard/mentors", label: "👨‍🏫 Mentors" },
  ];

  useEffect(() => {
    if ((session?.user as any)?.id) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(
        `/api/notifications?userId=${(session?.user as any)?.id}`
      );
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch {}
  };

  const markAllRead = async () => {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: (session?.user as any)?.id }),
    });
    fetchNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-xl">🎓</div>
            <h1 className="text-lg font-bold text-white">
              Campus<span className="text-blue-500">Link+</span>
            </h1>
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
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {(session?.user as any)?.role === "admin" && (
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                pathname.startsWith("/admin")
                  ? "bg-red-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              ⚙️ Admin
            </Link>
          )}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {session?.user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-medium">
                {session?.user?.name}
              </p>
              <p className="text-gray-500 text-xs capitalize">
                {(session?.user as any)?.role}
              </p>
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

      <main className="flex-1 overflow-auto">
        {/* Notification Bar */}
        <div className="flex justify-end p-4 border-b border-gray-800 bg-gray-950">
          <div className="relative">
            <button
              onClick={() => {
                setShowNotif(!showNotif);
                if (!showNotif && unreadCount > 0) markAllRead();
              }}
              className="relative bg-gray-900 border border-gray-800 hover:border-gray-700 text-white px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
              Notifications
            </button>

            {showNotif && (
              <div className="absolute right-0 top-12 w-80 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                  <h3 className="text-white font-bold text-sm">Notifications</h3>
                  <button
                    onClick={() => setShowNotif(false)}
                    className="text-gray-500 hover:text-white"
                  >
                    x
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center p-6">
                      No notifications yet
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`p-4 border-b border-gray-800 hover:bg-gray-800 transition-all ${
                          !n.read ? "bg-blue-900/10 border-l-2 border-l-blue-500" : ""
                        }`}
                      >
                        <p className="text-white text-sm">{n.message}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </p>
                        {n.link && (
                          <Link
                            href={n.link}
                            onClick={() => setShowNotif(false)}
                            className="text-blue-400 text-xs hover:underline mt-1 block"
                          >
                            View →
                          </Link>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
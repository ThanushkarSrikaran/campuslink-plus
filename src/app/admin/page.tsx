"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [stats, setStats] = useState({
    users: 0,
    resources: 0,
    mentors: 0,
    appointments: 0,
    sos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Stats error:", err);
        setLoading(false);
      });
  }, []);

  const cards = [
    { label: "Total Users", value: stats.users, icon: "👥", href: "/admin/users", bg: "bg-blue-900/30 border-blue-800" },
    { label: "Resources", value: stats.resources, icon: "📚", href: "/admin/resources", bg: "bg-green-900/30 border-green-800" },
    { label: "Mentors", value: stats.mentors, icon: "👨‍🏫", href: "/admin/mentors", bg: "bg-purple-900/30 border-purple-800" },
    { label: "Appointments", value: stats.appointments, icon: "📅", href: "/admin/appointments", bg: "bg-yellow-900/30 border-yellow-800" },
    { label: "SOS Requests", value: stats.sos, icon: "🆘", href: "/admin/sos", bg: "bg-red-900/30 border-red-800" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">⚙️ Admin Overview</h1>
        <p className="text-gray-500 mt-1">Manage all CampusLink+ activity</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-pulse"
            >
              <div className="h-8 w-8 bg-gray-800 rounded mb-3" />
              <div className="h-8 w-16 bg-gray-800 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {cards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className={`bg-gray-900 border ${card.bg} rounded-2xl p-6 hover:opacity-80 transition-all`}
            >
              <div className="text-3xl mb-3">{card.icon}</div>
              <p className="text-3xl font-bold text-white">{card.value}</p>
              <p className="text-gray-500 text-sm mt-1">{card.label}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: "Manage Users", href: "/admin/users", icon: "👥" },
              { label: "Review Resources", href: "/admin/resources", icon: "📚" },
              { label: "Manage Mentors", href: "/admin/mentors", icon: "👨‍🏫" },
              { label: "View Appointments", href: "/admin/appointments", icon: "📅" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all text-white text-sm"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                <span className="ml-auto text-gray-500">→</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
              <span className="text-gray-400 text-sm">Database</span>
              <span className="text-green-400 text-sm font-bold">✅ Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
              <span className="text-gray-400 text-sm">File Storage</span>
              <span className="text-green-400 text-sm font-bold">✅ Cloudinary</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
              <span className="text-gray-400 text-sm">Auth</span>
              <span className="text-green-400 text-sm font-bold">✅ NextAuth</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
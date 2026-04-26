"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MentorHomePage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const name = session?.user?.name?.split(" ")[0];

  useEffect(() => {
    fetch("/api/appointments")
      .then((r) => r.json())
      .then((d) => setAppointments(d.appointments || []));
  }, []);

  const upcoming = appointments.filter((a) => a.status === "booked");
  const completed = appointments.filter((a) => a.status === "completed");

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Welcome, <span className="text-purple-400">{name}</span> 👋
        </h1>
        <p className="text-gray-500 mt-1">Your mentor overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="text-3xl mb-3">📅</div>
          <p className="text-3xl font-bold text-white">{appointments.length}</p>
          <p className="text-gray-500 text-sm mt-1">Total Appointments</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="text-3xl mb-3">⏳</div>
          <p className="text-3xl font-bold text-white">{upcoming.length}</p>
          <p className="text-gray-500 text-sm mt-1">Upcoming</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="text-3xl mb-3">✅</div>
          <p className="text-3xl font-bold text-white">{completed.length}</p>
          <p className="text-gray-500 text-sm mt-1">Completed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Quick Links</h2>
          <div className="space-y-3">
            {[
              { label: "View Appointments Calendar", href: "/mentor-dashboard/appointments", icon: "📅" },
              { label: "My Profile & Modules", href: "/mentor-dashboard/profile", icon: "👤" },
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
          <h2 className="text-lg font-bold text-white mb-4">Upcoming Appointments</h2>
          {upcoming.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming appointments</p>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 3).map((appt: any) => (
                <div key={appt._id} className="bg-gray-800 rounded-xl p-3">
                  <p className="text-white text-sm font-bold">{appt.moduleCode}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {appt.date} at {appt.time}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Student: {appt.studentId?.name || "Unknown"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
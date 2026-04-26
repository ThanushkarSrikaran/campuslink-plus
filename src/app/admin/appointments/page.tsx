"use client";
import { useEffect, useState } from "react";

interface Appointment {
  _id: string;
  studentId: { name: string; email: string };
  mentorId: { userId: { name: string } };
  moduleCode: string;
  date: string;
  time: string;
  status: string;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  booked: "bg-blue-900/50 text-blue-400",
  "in-progress": "bg-yellow-900/50 text-yellow-400",
  completed: "bg-green-900/50 text-green-400",
  cancelled: "bg-red-900/50 text-red-400",
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/admin/appointments")
      .then((r) => r.json())
      .then((d) => setAppointments(d.appointments || []))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this appointment?")) return;
    await fetch(`/api/admin/appointments/${id}`, { method: "DELETE" });
    setAppointments(appointments.filter((a) => a._id !== id));
  };

  const filtered =
    filter === "all"
      ? appointments
      : appointments.filter((a) => a.status === filter);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">📅 Appointments</h1>
        <p className="text-gray-500 mt-1">View all appointments</p>
      </div>

      <div className="flex gap-2 mb-6">
        {["all", "booked", "in-progress", "completed", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              filter === s
                ? "bg-red-600 text-white"
                : "bg-gray-900 text-gray-400 hover:bg-gray-800"
            }`}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No appointments found</p>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Student</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Mentor</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Module</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Date & Time</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((appt) => (
                <tr
                  key={appt._id}
                  className="border-b border-gray-800 hover:bg-gray-800/50"
                >
                  <td className="p-4 text-white text-sm">
                    {appt.studentId?.name || "Unknown"}
                  </td>
                  <td className="p-4 text-gray-400 text-sm">
                    {appt.mentorId?.userId?.name || "Unknown"}
                  </td>
                  <td className="p-4 text-blue-400 text-sm font-mono">
                    {appt.moduleCode}
                  </td>
                  <td className="p-4 text-gray-400 text-sm">
                    {appt.date} at {appt.time}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${
                      STATUS_STYLES[appt.status] || "bg-gray-800 text-gray-400"
                    }`}>
                      {appt.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(appt._id)}
                      className="text-red-400 hover:text-red-300 text-sm font-bold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
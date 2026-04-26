"use client";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

interface Appointment {
  _id: string;
  mentorId: { userId: { name: string; email: string }; modules: string[] };
  moduleCode: string;
  date: string;
  time: string;
  status: string;
  meetingLink?: string | null;
  createdAt: string;
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:      { label: "Awaiting Approval", color: "#fbbf24", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)"  },
  booked:       { label: "Awaiting Approval", color: "#fbbf24", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)"  },
  confirmed:    { label: "Confirmed",         color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.3)"  },
  "in-progress":{ label: "In Progress",       color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.3)"  },
  completed:    { label: "Completed",         color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.3)"  },
  cancelled:    { label: "Cancelled",         color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)" },
};

const FILTER_TABS = [
  { key: "all",          label: "All"         },
  { key: "pending",      label: "Pending"     },
  { key: "confirmed",    label: "Confirmed"   },
  { key: "in-progress",  label: "In Progress" },
  { key: "completed",    label: "Completed"   },
  { key: "cancelled",    label: "Cancelled"   },
];

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => { fetchAppointments(); }, [session]);

  const fetchAppointments = async () => {
    const id = (session?.user as any)?.id;
    if (!id) return;
    try {
      const res = await fetch(`/api/appointments/student?studentId=${id}`);
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appt: Appointment) => {
    if (!confirm(`Cancel your session for ${appt.moduleCode} on ${appt.date}?`)) return;
    setCancelling(appt._id);
    try {
      await fetch(`/api/appointments/${appt._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      toast.success("Appointment cancelled");
      fetchAppointments();
    } catch {
      toast.error("Could not cancel — please try again");
    } finally {
      setCancelling(null);
    }
  };

  // "booked" is treated same as "pending" when filtering
  const filtered = filter === "all"
    ? appointments
    : filter === "pending"
    ? appointments.filter((a) => a.status === "pending" || a.status === "booked")
    : appointments.filter((a) => a.status === filter);

  const pendingCount = appointments.filter((a) => a.status === "pending" || a.status === "booked").length;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 fade-in-up">
        <h1 className="text-3xl font-bold text-white">My Appointments</h1>
        <p className="text-slate-500 mt-1 text-sm">Track your mentor sessions</p>
      </div>

      {/* Pending notice */}
      {pendingCount > 0 && (
        <div
          className="flex items-center gap-3 rounded-2xl px-5 py-4 mb-6 fade-in-up"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)" }}
        >
          <span className="text-xl">⏳</span>
          <p className="text-amber-400 text-sm font-medium">
            {pendingCount} session request{pendingCount !== 1 ? "s" : ""} waiting for mentor approval.
            You&apos;ll receive a confirmation email with a Google Meet link once accepted.
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={
              filter === key
                ? { background: "rgba(139,92,246,0.3)", color: "white", border: "1px solid rgba(139,92,246,0.5)" }
                : { background: "rgba(15,5,35,0.6)", color: "rgba(148,163,184,0.7)", border: "1px solid rgba(139,92,246,0.12)" }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map((i) => (
            <div key={i} className="rounded-2xl h-28 overflow-hidden relative"
              style={{ background: "rgba(15,5,35,0.7)", border: "1px solid rgba(139,92,246,0.12)" }}>
              <div className="absolute inset-y-0 w-1/2 animate-shimmer"
                style={{ background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.05),transparent)" }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl"
          style={{ background: "rgba(15,5,35,0.7)", border: "1px solid rgba(139,92,246,0.12)" }}>
          <span className="text-5xl float-anim block mb-4">📅</span>
          <p className="text-slate-400 text-lg font-bold mb-1">No appointments found</p>
          <p className="text-slate-600 text-sm">Book a session from the Mentors tab!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((appt) => {
            const cfg = STATUS_CFG[appt.status] ?? STATUS_CFG.cancelled;
            const isPending    = appt.status === "pending" || appt.status === "booked";
            const isConfirmed  = appt.status === "confirmed";
            const isCancellable = isPending || isConfirmed;

            return (
              <div
                key={appt._id}
                className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 fade-in-up"
                style={{
                  background: "rgba(15,5,35,0.75)",
                  backdropFilter: "blur(12px)",
                  border: `1px solid ${cfg.border}`,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
                }}
              >
                {/* Date block + info */}
                <div className="flex items-center gap-5">
                  <div
                    className="rounded-xl p-4 text-center min-w-[72px] flex-shrink-0"
                    style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}
                  >
                    <p className="text-violet-300 font-bold text-xl leading-none">{appt.date.slice(8)}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      {new Date(appt.date + "T00:00:00").toLocaleString("default", { month: "short" })}
                    </p>
                    <p className="text-slate-400 text-xs mt-1 font-mono">{appt.time}</p>
                  </div>

                  <div>
                    <p className="text-white font-bold text-base font-mono">{appt.moduleCode}</p>
                    <p className="text-slate-400 text-sm mt-0.5">
                      Mentor: <span className="text-slate-300">{appt.mentorId?.userId?.name ?? "Unknown"}</span>
                    </p>
                    <p className="text-slate-600 text-xs mt-1">{appt.date} · {appt.time} · 45 min session</p>

                    {/* Google Meet link — shown when confirmed */}
                    {isConfirmed && appt.meetingLink && (
                      <a
                        href={appt.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs mt-2 px-3 py-1.5 rounded-lg font-bold transition-opacity hover:opacity-80"
                        style={{
                          background: "rgba(52,211,153,0.15)",
                          color: "#34d399",
                          border: "1px solid rgba(52,211,153,0.3)",
                        }}
                      >
                        🎥 Join Google Meet
                      </a>
                    )}

                    {/* Awaiting note */}
                    {isPending && (
                      <p className="text-amber-400/70 text-xs mt-1.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                        Awaiting mentor approval — you&apos;ll be emailed when confirmed
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: status badge + cancel */}
                <div className="flex items-center gap-3 sm:flex-col sm:items-end flex-shrink-0">
                  <span
                    className="text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
                    style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                  >
                    {cfg.label}
                  </span>
                  {isCancellable && (
                    <button
                      disabled={cancelling === appt._id}
                      onClick={() => handleCancel(appt)}
                      className="text-xs font-bold transition-colors disabled:opacity-50"
                      style={{ color: "rgba(248,113,113,0.7)" }}
                    >
                      {cancelling === appt._id ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

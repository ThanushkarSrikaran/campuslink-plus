"use client";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const STATUS_CFG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  pending:     { label: "Awaiting",    bg: "rgba(245,158,11,0.12)",  color: "#fbbf24", border: "rgba(245,158,11,0.35)" },
  confirmed:   { label: "Confirmed",   bg: "rgba(52,211,153,0.12)",  color: "#34d399", border: "rgba(52,211,153,0.35)" },
  booked:      { label: "Awaiting",    bg: "rgba(245,158,11,0.12)",  color: "#fbbf24", border: "rgba(245,158,11,0.35)" },
  "in-progress":{ label: "In Progress",bg: "rgba(251,191,36,0.12)",  color: "#fbbf24", border: "rgba(251,191,36,0.35)" },
  completed:   { label: "Completed",   bg: "rgba(52,211,153,0.12)",  color: "#34d399", border: "rgba(52,211,153,0.35)" },
  cancelled:   { label: "Cancelled",   bg: "rgba(248,113,113,0.12)", color: "#f87171", border: "rgba(248,113,113,0.35)" },
};

export default function MentorAppointmentsPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      setAppointments(data.appointments || []);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (appointmentId: string, action: string, status?: string) => {
    setActioning(appointmentId + action);
    try {
      const body = action === "accept" || action === "decline"
        ? { action }
        : { status: status ?? action };

      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();

      if (action === "accept") {
        toast.success("Session confirmed! Emails sent to both parties 📧");
      } else if (action === "decline") {
        toast.success("Session declined. Student notified.");
      }

      fetchAppointments();

      if (status === "in-progress") {
        await fetch("/api/mentors/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: (session?.user as any)?.id, availability: "in-session" }),
        });
      }
      if (status === "completed") {
        await fetch("/api/mentors/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: (session?.user as any)?.id, availability: "available" }),
        });
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActioning(null);
    }
  };

  // Calendar helpers
  const year       = currentDate.getFullYear();
  const month      = currentDate.getMonth();
  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const apptDates  = appointments.map((a) => a.date);
  const pendingCount = appointments.filter((a) => a.status === "pending" || a.status === "booked").length;

  const displayed = selectedDate
    ? appointments.filter((a) => a.date === selectedDate)
    : appointments;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 fade-in-up">
        <h1 className="text-3xl font-bold text-white">Appointments</h1>
        <p className="text-slate-500 mt-1 text-sm">Review requests and manage your sessions</p>
      </div>

      {/* Pending banner */}
      {pendingCount > 0 && (
        <div
          className="flex items-center gap-3 rounded-2xl px-5 py-4 mb-6 fade-in-up"
          style={{
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.3)",
          }}
        >
          <span className="text-xl">🔔</span>
          <div>
            <p className="text-amber-400 font-bold text-sm">
              {pendingCount} session request{pendingCount !== 1 ? "s" : ""} awaiting your approval
            </p>
            <p className="text-slate-500 text-xs mt-0.5">Accept to confirm and send Google Meet links to both parties</p>
          </div>
          <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div
          className="rounded-2xl p-6 fade-in-up"
          style={{
            background: "rgba(15,5,35,0.7)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(139,92,246,0.2)",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-bold">{MONTHS[month]} {year}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentDate(new Date(year, month - 1))}
                className="text-slate-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                style={{ border: "1px solid rgba(139,92,246,0.2)" }}
              >←</button>
              <button
                onClick={() => setCurrentDate(new Date(year, month + 1))}
                className="text-slate-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                style={{ border: "1px solid rgba(139,92,246,0.2)" }}
              >→</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs text-slate-600 font-bold py-1 font-mono">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const hasAppt  = apptDates.includes(dateStr);
              const hasPending = appointments.some(
                (a) => a.date === dateStr && (a.status === "pending" || a.status === "booked")
              );
              const isSelected = selectedDate === dateStr;
              const isToday    = new Date().toISOString().slice(0,10) === dateStr;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className="relative aspect-square rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: isSelected
                      ? "rgba(139,92,246,0.4)"
                      : isToday
                      ? "rgba(99,102,241,0.15)"
                      : "transparent",
                    border: isToday && !isSelected ? "1px solid rgba(99,102,241,0.4)" : "1px solid transparent",
                    color: isSelected ? "#fff" : isToday ? "#818cf8" : "#cbd5e1",
                  }}
                >
                  {day}
                  {hasAppt && (
                    <span
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: hasPending ? "#fbbf24" : "#a78bfa" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="mt-4 w-full text-xs text-slate-500 hover:text-slate-300 transition-colors font-mono"
            >
              ← show all appointments
            </button>
          )}
        </div>

        {/* Appointments list */}
        <div
          className="rounded-2xl p-6 fade-in-up"
          style={{
            background: "rgba(15,5,35,0.7)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(139,92,246,0.2)",
            animationDelay: "0.07s",
          }}
        >
          <h2 className="text-white font-bold mb-4 text-sm font-mono uppercase tracking-wider">
            {selectedDate ? `Sessions on ${selectedDate}` : "All Sessions"}
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => (
                <div key={i} className="rounded-xl h-24 overflow-hidden relative"
                  style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.1)" }}>
                  <div className="absolute inset-y-0 w-1/2 animate-shimmer"
                    style={{ background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.05),transparent)" }} />
                </div>
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl float-anim block mb-3">📅</span>
              <p className="text-slate-500 text-sm">
                {selectedDate ? "No sessions on this day" : "No sessions yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {displayed.map((appt: any) => {
                const cfg = STATUS_CFG[appt.status] ?? STATUS_CFG.cancelled;
                const isPending = appt.status === "pending" || appt.status === "booked";
                const isConfirmed = appt.status === "confirmed";
                const isActioning = actioning?.startsWith(appt._id);

                return (
                  <div
                    key={appt._id}
                    className="rounded-xl p-4 relative overflow-hidden"
                    style={{
                      background: isPending ? "rgba(245,158,11,0.05)" : "rgba(139,92,246,0.05)",
                      border: `1px solid ${cfg.border}`,
                    }}
                  >
                    {/* Pending pulse indicator */}
                    {isPending && (
                      <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}

                    <div className="flex items-start justify-between mb-2 pr-4">
                      <div>
                        <p className="text-white text-sm font-bold font-mono">{appt.moduleCode}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{appt.date} · {appt.time}</p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          Student: <span className="text-slate-300">{appt.studentId?.name ?? "Unknown"}</span>
                        </p>
                      </div>
                      <span
                        className="text-xs px-2 py-1 rounded-full font-bold flex-shrink-0"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                      >
                        {cfg.label}
                      </span>
                    </div>

                    {/* Meet link for confirmed */}
                    {isConfirmed && appt.meetingLink && (
                      <a
                        href={appt.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs mb-3 w-fit transition-opacity hover:opacity-80"
                        style={{ color: "#34d399" }}
                      >
                        🎥 Open Google Meet
                      </a>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-2">
                      {isPending && (
                        <>
                          <button
                            disabled={!!isActioning}
                            onClick={() => handleAction(appt._id, "accept")}
                            className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                            style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.35)" }}
                          >
                            {actioning === appt._id + "accept" ? "Confirming..." : "✓ Accept"}
                          </button>
                          <button
                            disabled={!!isActioning}
                            onClick={() => handleAction(appt._id, "decline")}
                            className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                            style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" }}
                          >
                            {actioning === appt._id + "decline" ? "Declining..." : "✕ Decline"}
                          </button>
                        </>
                      )}
                      {isConfirmed && (
                        <button
                          disabled={!!isActioning}
                          onClick={() => handleAction(appt._id, "status", "in-progress")}
                          className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                          style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}
                        >
                          ▶ Start Session
                        </button>
                      )}
                      {appt.status === "in-progress" && (
                        <button
                          disabled={!!isActioning}
                          onClick={() => handleAction(appt._id, "status", "completed")}
                          className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                          style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }}
                        >
                          ✓ Complete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

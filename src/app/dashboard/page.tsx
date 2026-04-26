"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ── Constants ────────────────────────────────────────────── */

const QUOTES = [
  { text: "The universe is under no obligation to make sense to you.", author: "Neil deGrasse Tyson" },
  { text: "We are all made of star-stuff.", author: "Carl Sagan" },
  { text: "Per aspera ad astra — through hardships to the stars.", author: "Latin Proverb" },
  { text: "Shoot for the moon. Even if you miss, you'll land among the stars.", author: "Les Brown" },
  { text: "Every accomplishment starts with the decision to try.", author: "John F. Kennedy" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "The cosmos is within us. We are made of star-stuff.", author: "Carl Sagan" },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  booked:       { label: "Booked",      color: "#818cf8" },
  "in-progress":{ label: "In Progress", color: "#fbbf24" },
  completed:    { label: "Completed",   color: "#34d399" },
  cancelled:    { label: "Cancelled",   color: "#f87171" },
};

/* ── Count-up hook ────────────────────────────────────────── */

function useCountUp(target: number, active: boolean, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (target === 0) { setCount(0); return; }
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * target));
      if (p >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [target, active, duration]);
  return count;
}

/* ── Stat card ────────────────────────────────────────────── */

interface StatDef {
  label: string; value: number; icon: string; href: string;
  accent: string; border: string; borderHover: string; glow: string; delay: string;
}

function StatCard({ stat, loading }: { stat: StatDef; loading: boolean }) {
  const count = useCountUp(stat.value, !loading);
  return (
    <Link
      href={stat.href}
      className="relative overflow-hidden rounded-2xl p-6 block fade-in-up"
      style={{
        background: "rgba(15,5,35,0.75)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${stat.border}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        transition: "border-color 0.25s, box-shadow 0.25s, transform 0.25s",
        animationDelay: stat.delay,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = stat.borderHover;
        el.style.boxShadow = `0 20px 52px rgba(0,0,0,0.55), 0 0 36px ${stat.glow}`;
        el.style.transform = "translateY(-5px) scale(1.01)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = stat.border;
        el.style.boxShadow = "0 8px 32px rgba(0,0,0,0.4)";
        el.style.transform = "translateY(0) scale(1)";
      }}
    >
      {/* nebula corner glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 85% 15%, ${stat.glow} 0%, transparent 55%)`, opacity: 0.5 }}
      />
      <div className="relative z-10">
        <div className="text-3xl mb-4 float-anim" style={{ animationDelay: stat.delay }}>{stat.icon}</div>
        {loading ? (
          <div className="space-y-2">
            <div className="h-9 w-14 rounded-lg" style={{ background: "rgba(139,92,246,0.12)" }} />
            <div className="h-3 w-20 rounded-lg" style={{ background: "rgba(139,92,246,0.07)" }} />
          </div>
        ) : (
          <>
            <p
              className="text-3xl font-bold tabular-nums"
              style={{ color: stat.accent, textShadow: `0 0 20px ${stat.glow}` }}
            >
              {count}
            </p>
            <p className="text-slate-500 text-sm mt-1">{stat.label}</p>
          </>
        )}
      </div>
    </Link>
  );
}

/* ── Page ─────────────────────────────────────────────────── */

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({ resources: 0, sos: 0, appointments: 0, mentors: 0 });
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if ((session?.user as any)?.id) fetchStats();
  }, [session]);

  const fetchStats = async () => {
    try {
      const [r1, r2, r3, r4] = await Promise.all([
        fetch("/api/resources"),
        fetch("/api/requests"),
        fetch(`/api/appointments/student?studentId=${(session?.user as any)?.id}`),
        fetch("/api/mentors"),
      ]);
      const [d1, d2, d3, d4] = await Promise.all([r1.json(), r2.json(), r3.json(), r4.json()]);
      setStats({
        resources:    d1.resources?.length    || 0,
        sos:          d2.requests?.length     || 0,
        appointments: d3.appointments?.length || 0,
        mentors:      d4.mentors?.length      || 0,
      });
      setRecentAppointments(d3.appointments?.slice(0, 3) || []);
    } catch {}
    finally { setLoading(false); }
  };

  /* Loading screen */
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border border-violet-500/25 planet-ring" />
            <div
              className="absolute inset-2 rounded-full border border-violet-400/20 planet-ring"
              style={{ animationDuration: "9s" }}
            />
            <div className="absolute inset-5 rounded-full border-2 border-t-violet-400 border-violet-400/20 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-xl">🎓</div>
          </div>
          <p className="text-slate-500 text-sm font-mono tracking-wider">INITIALISING MISSION CONTROL</p>
        </div>
      </div>
    );
  }

  const name = session?.user?.name?.split(" ")[0];
  const hour = new Date().getHours();
  const greeting   = hour < 12 ? "Good morning"   : hour < 17 ? "Good afternoon"  : "Good evening";
  const sub        = hour < 12 ? "Stars are bright today, cadet" : hour < 17 ? "Mission in progress" : "Night shift active";
  const quote      = QUOTES[new Date().getDate() % QUOTES.length];
  const timeStr    = time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  const statCards: StatDef[] = [
    { label: "Resources",    value: stats.resources,    icon: "📚", href: "/dashboard/vault",
      accent: "#22d3ee", border: "rgba(6,182,212,0.22)",  borderHover: "rgba(6,182,212,0.55)",  glow: "rgba(6,182,212,0.14)",   delay: "0s" },
    { label: "SOS Signals",  value: stats.sos,          icon: "🆘", href: "/dashboard/sos",
      accent: "#f87171", border: "rgba(220,38,38,0.22)",  borderHover: "rgba(220,38,38,0.55)",  glow: "rgba(220,38,38,0.14)",   delay: "0.07s" },
    { label: "Appointments", value: stats.appointments, icon: "📅", href: "/dashboard/appointments",
      accent: "#a78bfa", border: "rgba(139,92,246,0.22)", borderHover: "rgba(139,92,246,0.55)", glow: "rgba(139,92,246,0.14)",  delay: "0.14s" },
    { label: "Mentors",      value: stats.mentors,      icon: "👨‍🏫", href: "/dashboard/mentors",
      accent: "#fbbf24", border: "rgba(245,158,11,0.22)", borderHover: "rgba(245,158,11,0.55)", glow: "rgba(245,158,11,0.14)",  delay: "0.21s" },
  ];

  const actions = [
    { label: "Browse the Vault",   href: "/dashboard/vault",         icon: "📚", desc: "Explore study materials",
      color: "#22d3ee", border: "rgba(6,182,212,0.2)",   bg: "rgba(6,182,212,0.06)",   glow: "rgba(6,182,212,0.12)" },
    { label: "Broadcast SOS",      href: "/dashboard/sos",           icon: "📡", desc: "Send a distress signal",
      color: "#f87171", border: "rgba(220,38,38,0.2)",   bg: "rgba(220,38,38,0.06)",   glow: "rgba(220,38,38,0.12)" },
    { label: "Schedule Mission",   href: "/dashboard/appointments",  icon: "🚀", desc: "Book a session with a guide",
      color: "#a78bfa", border: "rgba(139,92,246,0.2)",  bg: "rgba(139,92,246,0.06)",  glow: "rgba(139,92,246,0.12)" },
    { label: "Find a Guide",       href: "/dashboard/mentors",       icon: "⭐", desc: "Connect with your mentors",
      color: "#fbbf24", border: "rgba(245,158,11,0.2)",  bg: "rgba(245,158,11,0.06)",  glow: "rgba(245,158,11,0.12)" },
  ];

  return (
    <div className="relative p-6 md:p-8 max-w-7xl mx-auto">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 fade-in-up">
        <div>
          {/* Status chip */}
          <span
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-mono mb-3"
            style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "#6ee7b7" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            CADET ONLINE
          </span>

          <p className="text-slate-400 text-sm mb-1">{greeting}, cadet 🚀</p>
          <h1 className="text-4xl font-bold text-white">
            Welcome back,{" "}
            <span style={{ color: "#a78bfa", textShadow: "0 0 24px rgba(167,139,250,0.5)" }}>{name}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            <span className="text-slate-700 mx-2">·</span>
            <span style={{ color: "rgba(167,139,250,0.7)" }}>{sub}</span>
          </p>
        </div>

        {/* Live clock */}
        <div
          className="flex-shrink-0 rounded-2xl px-6 py-4 text-right"
          style={{
            background: "rgba(15,5,35,0.8)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(139,92,246,0.22)",
            boxShadow: "0 0 32px rgba(139,92,246,0.08)",
          }}
        >
          <p
            className="text-3xl font-mono font-bold tracking-widest tabular-nums"
            style={{ color: "#a78bfa", textShadow: "0 0 20px rgba(167,139,250,0.45)" }}
          >
            {timeStr}
          </p>
          <p className="text-slate-700 text-xs mt-1 uppercase tracking-widest font-mono">MISSION TIME</p>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => <StatCard key={s.label} stat={s} loading={loading} />)}
      </div>

      {/* ── Bottom grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Mission Control */}
        <div
          className="lg:col-span-2 rounded-2xl p-6 fade-in-up"
          style={{
            background: "rgba(15,5,35,0.7)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(139,92,246,0.18)",
            animationDelay: "0.1s",
          }}
        >
          <p className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-5">
            // mission_control.exe
          </p>
          <div className="grid grid-cols-2 gap-3">
            {actions.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-start gap-3 p-4 rounded-xl relative overflow-hidden group"
                style={{
                  background: a.bg,
                  border: `1px solid ${a.border}`,
                  transition: "background 0.25s, border-color 0.25s, box-shadow 0.25s, transform 0.25s",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.background    = a.glow;
                  el.style.borderColor   = a.color;
                  el.style.boxShadow     = `0 8px 28px ${a.glow}`;
                  el.style.transform     = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.background    = a.bg;
                  el.style.borderColor   = a.border;
                  el.style.boxShadow     = "none";
                  el.style.transform     = "translateY(0)";
                }}
              >
                <span className="text-2xl flex-shrink-0 float-anim">{a.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-bold">{a.label}</p>
                  <p className="text-slate-500 text-xs mt-0.5 leading-snug">{a.desc}</p>
                </div>
                <span className="flex-shrink-0 text-sm mt-0.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                  style={{ color: a.color }}>→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Upcoming missions */}
          <div
            className="rounded-2xl p-6 fade-in-up"
            style={{
              background: "rgba(15,5,35,0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(139,92,246,0.18)",
              animationDelay: "0.15s",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-mono uppercase tracking-widest text-slate-500">Upcoming Missions</p>
              <Link href="/dashboard/appointments" className="text-xs font-mono transition-colors hover:opacity-80"
                style={{ color: "#a78bfa" }}>
                all →
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded-xl h-16 overflow-hidden relative"
                    style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.1)" }}>
                    <div className="absolute inset-y-0 w-1/2 animate-shimmer"
                      style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.06), transparent)" }} />
                  </div>
                ))}
              </div>
            ) : recentAppointments.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl float-anim block mb-3">🚀</span>
                <p className="text-slate-500 text-sm">No missions scheduled</p>
                <Link href="/dashboard/mentors" className="text-xs mt-2 block hover:opacity-80 transition-opacity"
                  style={{ color: "#a78bfa" }}>
                  Schedule one →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentAppointments.map((appt: any) => {
                  const s = STATUS_MAP[appt.status] ?? { label: appt.status, color: "#94a3b8" };
                  return (
                    <div key={appt._id} className="rounded-xl p-3"
                      style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)" }}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white text-sm font-bold font-mono">{appt.moduleCode}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-mono"
                          style={{
                            background: `${s.color}18`,
                            color: s.color,
                            border: `1px solid ${s.color}40`,
                          }}>
                          {s.label}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs">{appt.date} · {appt.time}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Daily cosmic quote */}
          <div
            className="rounded-2xl p-5 relative overflow-hidden fade-in-up"
            style={{
              background: "rgba(15,5,35,0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(139,92,246,0.15)",
              animationDelay: "0.22s",
            }}
          >
            {/* Decorative star */}
            <div className="absolute top-4 right-5 text-5xl opacity-8 select-none float-anim pointer-events-none"
              style={{ opacity: 0.06 }}>
              ✦
            </div>
            <p className="text-xs font-mono uppercase tracking-widest text-slate-700 mb-3">
              // daily_transmission
            </p>
            <p className="text-slate-300 text-sm leading-relaxed italic">
              &ldquo;{quote.text}&rdquo;
            </p>
            <p className="text-slate-600 text-xs mt-3 font-mono">— {quote.author}</p>
          </div>

        </div>
      </div>
    </div>
  );
}

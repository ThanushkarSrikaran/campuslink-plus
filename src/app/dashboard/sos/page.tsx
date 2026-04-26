"use client";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Response {
  _id: string;
  message: string;
  respondedBy: { name: string };
  createdAt: string;
}

interface SOSRequest {
  _id: string;
  title: string;
  moduleCode: string;
  description: string;
  postedBy: { name: string };
  status: "open" | "fulfilled";
  responses: Response[];
  createdAt: string;
}

export default function SOSPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<SOSRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SOSRequest | null>(null);
  const [form, setForm] = useState({ title: "", moduleCode: "", description: "" });
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/requests");
      const data = await res.json();
      setRequests(data.requests || []);
    } catch { setRequests([]); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowCreate(false);
        setForm({ title: "", moduleCode: "", description: "" });
        fetchRequests();
        toast.success("Distress signal broadcast! 📡");
      }
    } finally { setSubmitting(false); }
  };

  const handleRespond = async (requestId: string) => {
    if (!responseText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/requests/${requestId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: responseText }),
      });
      if (res.ok) {
        setResponseText("");
        toast.success("Transmission sent! ✅");
        fetchRequests();
        const updated = await fetch("/api/requests");
        const data = await updated.json();
        const updatedRequest = data.requests?.find((r: SOSRequest) => r._id === requestId);
        if (updatedRequest) setSelectedRequest(updatedRequest);
      }
    } finally { setSubmitting(false); }
  };

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);
  const openCount = requests.filter(r => r.status === "open").length;
  const fulfilledCount = requests.filter(r => r.status === "fulfilled").length;

  return (
    <div className="relative p-6 md:p-8 max-w-7xl mx-auto">

      {/* Ambient beacon rings — decorative, top-right corner */}
      <div className="fixed top-16 right-16 pointer-events-none z-0" aria-hidden>
        <div className="w-72 h-72 rounded-full border border-red-500/10 beacon-ring" />
        <div className="absolute inset-0 w-72 h-72 rounded-full border border-red-500/8 beacon-ring" style={{ animationDelay: "0.8s" }} />
        <div className="absolute inset-0 w-72 h-72 rounded-full border border-red-500/5 beacon-ring" style={{ animationDelay: "1.6s" }} />
      </div>

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 relative z-10 fade-in-up">
        <div className="flex items-center gap-4">
          {/* Pulsing SOS beacon icon */}
          <div className="relative flex-shrink-0">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
              style={{
                background: "rgba(220,38,38,0.12)",
                border: "1px solid rgba(220,38,38,0.4)",
                boxShadow: "0 0 24px rgba(220,38,38,0.25), inset 0 0 16px rgba(220,38,38,0.06)",
              }}
            >
              🆘
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-red-400/50 animate-ping" />
          </div>
          <div>
            <h1
              className="text-3xl md:text-4xl font-bold text-white"
              style={{ textShadow: "0 0 32px rgba(220,38,38,0.5)" }}
            >
              SOS Distress Board
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Broadcast distress signals · Help fellow cadets across the galaxy
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="relative flex-shrink-0 overflow-hidden text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 group transition-all"
          style={{
            background: "linear-gradient(135deg, #dc2626, #b91c1c)",
            boxShadow: "0 4px 24px rgba(220,38,38,0.45)",
          }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative z-10 flex items-center gap-2">
            <span className="animate-pulse">📡</span>
            Broadcast SOS
          </span>
        </button>
      </div>

      {/* ── Stats ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 relative z-10">
        {[
          { label: "Total Signals", value: requests.length, icon: "📡", color: "text-violet-300", border: "rgba(139,92,246,0.3)", glow: "rgba(139,92,246,0.05)", delay: "0s" },
          { label: "Active Distress", value: openCount, icon: "🚨", color: "text-red-400", border: "rgba(220,38,38,0.3)", glow: "rgba(220,38,38,0.06)", delay: "0.07s" },
          { label: "Cadets Rescued", value: fulfilledCount, icon: "✅", color: "text-emerald-400", border: "rgba(52,211,153,0.3)", glow: "rgba(52,211,153,0.05)", delay: "0.14s" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5 text-center group cursor-default relative overflow-hidden fade-in-up"
            style={{
              background: "rgba(15,5,35,0.7)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${s.border}`,
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              animationDelay: s.delay,
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `radial-gradient(ellipse at center, ${s.glow} 0%, transparent 70%)` }}
            />
            <div className="text-3xl mb-2 float-anim">{s.icon}</div>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ───────────────────────────────────── */}
      <div className="flex gap-2 mb-6 relative z-10">
        {[
          { key: "all", label: "All Signals" },
          { key: "open", label: "Active" },
          { key: "fulfilled", label: "Rescued" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={
              filter === key
                ? {
                    background: key === "open"
                      ? "linear-gradient(135deg, rgba(220,38,38,0.35), rgba(185,28,28,0.25))"
                      : "linear-gradient(135deg, rgba(124,58,237,0.35), rgba(79,70,229,0.25))",
                    border: `1px solid ${key === "open" ? "rgba(220,38,38,0.45)" : "rgba(124,58,237,0.45)"}`,
                    color: "white",
                    boxShadow: key === "open"
                      ? "0 0 16px rgba(220,38,38,0.2)"
                      : "0 0 16px rgba(124,58,237,0.2)",
                  }
                : {
                    background: "rgba(15,5,35,0.5)",
                    border: "1px solid rgba(139,92,246,0.15)",
                    color: "rgba(148,163,184,0.7)",
                  }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Request Grid ──────────────────────────────────── */}
      <div className="relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl h-52 overflow-hidden relative"
                style={{
                  background: "rgba(15,5,35,0.7)",
                  border: "1px solid rgba(139,92,246,0.12)",
                }}
              >
                <div
                  className="absolute inset-y-0 w-1/2 animate-shimmer"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.06), transparent)",
                  }}
                />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-20 rounded-2xl relative overflow-hidden"
            style={{
              background: "rgba(15,5,35,0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(139,92,246,0.15)",
            }}
          >
            <div className="relative inline-flex items-center justify-center mb-6">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ border: "1px solid rgba(220,38,38,0.2)" }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ border: "1px solid rgba(220,38,38,0.15)" }}
                >
                  <span className="text-4xl float-anim">📡</span>
                </div>
              </div>
              <div className="absolute inset-0 rounded-full border border-red-400/20 animate-ping" />
            </div>
            <p className="text-slate-300 text-lg font-bold mb-2">No signals detected</p>
            <p className="text-slate-600 text-sm">Be the first to broadcast a distress signal into the void</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((request, idx) => (
              <RequestCard
                key={request._id}
                request={request}
                idx={idx}
                onClick={() => setSelectedRequest(request)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Create Modal ──────────────────────────────────── */}
      {showCreate && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(10px)" }}
        >
          <div
            className="w-full max-w-lg relative overflow-hidden rounded-2xl shadow-2xl fade-in-up"
            style={{
              background: "rgba(8,2,22,0.97)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(220,38,38,0.3)",
              boxShadow: "0 0 0 1px rgba(220,38,38,0.08), 0 24px 64px rgba(0,0,0,0.8), 0 0 48px rgba(220,38,38,0.08)",
            }}
          >
            <div
              className="h-px w-full"
              style={{ background: "linear-gradient(90deg, transparent, rgba(220,38,38,0.9), transparent)" }}
            />
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl relative"
                    style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.35)" }}
                  >
                    📡
                    <div className="absolute inset-0 rounded-full border border-red-400/40 animate-ping" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Broadcast Distress Signal</h2>
                    <p className="text-slate-500 text-xs mt-0.5">Describe your situation clearly</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreate(false)}
                  className="text-slate-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                  style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <input
                  type="text"
                  placeholder="Signal title (e.g. Help with recursion algorithms)"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full space-input rounded-xl p-3 text-sm"
                />
                <input
                  type="text"
                  placeholder="Sector code (e.g. CS201)"
                  required
                  value={form.moduleCode}
                  onChange={(e) => setForm({ ...form, moduleCode: e.target.value })}
                  className="w-full space-input rounded-xl p-3 text-sm"
                />
                <textarea
                  placeholder="Describe the situation in detail..."
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full space-input rounded-xl p-3 text-sm h-32 resize-none"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full text-white py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 relative overflow-hidden group"
                  style={{
                    background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                    boxShadow: "0 4px 24px rgba(220,38,38,0.4)",
                  }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">
                    {submitting ? "Broadcasting..." : "🆘 Broadcast Distress Signal"}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Modal ──────────────────────────────────── */}
      {selectedRequest && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(10px)" }}
        >
          <div
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto relative rounded-2xl shadow-2xl fade-in-up"
            style={{
              background: "rgba(8,2,22,0.97)",
              backdropFilter: "blur(20px)",
              border: `1px solid ${selectedRequest.status === "open" ? "rgba(220,38,38,0.3)" : "rgba(52,211,153,0.25)"}`,
              boxShadow: "0 24px 64px rgba(0,0,0,0.8)",
            }}
          >
            <div
              className="h-px w-full sticky top-0"
              style={{
                background: selectedRequest.status === "open"
                  ? "linear-gradient(90deg, transparent, rgba(220,38,38,0.9), transparent)"
                  : "linear-gradient(90deg, transparent, rgba(52,211,153,0.7), transparent)",
              }}
            />

            <div className="p-8">
              <div className="flex items-start justify-between mb-5">
                <div className="flex-1 pr-4">
                  <span
                    className="text-xs font-mono font-bold px-2 py-1 rounded-lg"
                    style={{
                      background: "rgba(124,58,237,0.15)",
                      color: "#a78bfa",
                      border: "1px solid rgba(124,58,237,0.25)",
                    }}
                  >
                    SECTOR: {selectedRequest.moduleCode}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-2">{selectedRequest.title}</h2>
                  <div className="mt-2">
                    {selectedRequest.status === "open" ? (
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
                        style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.3)", color: "#f87171" }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
                        ACTIVE DISTRESS
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
                        style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "#6ee7b7" }}
                      >
                        ✓ RESCUED
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-slate-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg transition-all flex-shrink-0"
                  style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  ×
                </button>
              </div>

              {/* Description block */}
              <div
                className="rounded-xl p-4 mb-5"
                style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}
              >
                <p className="text-slate-300 text-sm leading-relaxed">{selectedRequest.description}</p>
                <div
                  className="flex items-center gap-2 mt-3 pt-3"
                  style={{ borderTop: "1px solid rgba(139,92,246,0.1)" }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                  >
                    {selectedRequest.postedBy?.name?.[0]?.toUpperCase()}
                  </div>
                  <p className="text-slate-500 text-xs">
                    Transmitted by {selectedRequest.postedBy?.name || "Unknown"}
                  </p>
                </div>
              </div>

              {/* Transmissions */}
              <div className="mb-5">
                <h3 className="text-slate-300 font-bold mb-3 flex items-center gap-2 text-xs uppercase tracking-widest">
                  <span>📡</span>
                  Transmissions
                  <span
                    className="rounded-full px-2 py-0.5 text-xs"
                    style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}
                  >
                    {selectedRequest.responses?.length || 0}
                  </span>
                </h3>
                {selectedRequest.responses?.length === 0 ? (
                  <div
                    className="text-center py-8 rounded-xl"
                    style={{ background: "rgba(139,92,246,0.04)", border: "1px dashed rgba(139,92,246,0.15)" }}
                  >
                    <p className="text-slate-500 text-sm">No transmissions received yet.</p>
                    <p className="text-slate-600 text-xs mt-1">Be the first to respond! 🤝</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedRequest.responses?.map((response) => (
                      <div
                        key={response._id}
                        className="rounded-xl p-4"
                        style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.15)" }}
                      >
                        <p className="text-slate-200 text-sm leading-relaxed">{response.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
                          >
                            {response.respondedBy?.name?.[0]?.toUpperCase()}
                          </div>
                          <p className="text-slate-500 text-xs">
                            Rescue signal from {response.respondedBy?.name || "Unknown"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Response input */}
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Send a rescue transmission..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRespond(selectedRequest._id)}
                  className="flex-1 space-input rounded-xl p-3 text-sm"
                />
                <button
                  onClick={() => handleRespond(selectedRequest._id)}
                  disabled={submitting || !responseText.trim()}
                  className="space-btn-primary text-white px-5 py-3 rounded-xl font-bold text-sm disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Request Card sub-component ──────────────────────────── */
function RequestCard({
  request,
  idx,
  onClick,
}: {
  request: SOSRequest;
  idx: number;
  onClick: () => void;
}) {
  const isOpen = request.status === "open";
  const borderBase = isOpen ? "rgba(220,38,38,0.2)" : "rgba(139,92,246,0.2)";
  const borderHover = isOpen ? "rgba(220,38,38,0.5)" : "rgba(139,92,246,0.5)";
  const glowHover = isOpen ? "rgba(220,38,38,0.1)" : "rgba(139,92,246,0.1)";

  return (
    <div
      className="rounded-2xl p-6 cursor-pointer group relative overflow-hidden fade-in-up"
      style={{
        background: "rgba(15,5,35,0.7)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${borderBase}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        transition: "border-color 0.25s, box-shadow 0.25s, transform 0.25s",
        animationDelay: `${idx * 0.06}s`,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = borderHover;
        el.style.boxShadow = `0 16px 48px rgba(0,0,0,0.5), 0 0 28px ${glowHover}`;
        el.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = borderBase;
        el.style.boxShadow = "0 8px 32px rgba(0,0,0,0.4)";
        el.style.transform = "translateY(0)";
      }}
      onClick={onClick}
    >
      {/* Corner glow on hover */}
      <div
        className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top right, ${glowHover} 0%, transparent 70%)`,
        }}
      />

      {/* Badge row */}
      <div className="flex items-center justify-between mb-3">
        {isOpen ? (
          <span
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.3)", color: "#f87171" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
            DISTRESS
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)", color: "#6ee7b7" }}
          >
            ✓ RESCUED
          </span>
        )}
        <span
          className="text-xs font-mono font-bold px-2 py-1 rounded-lg"
          style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}
        >
          {request.moduleCode}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-white font-bold mb-2 text-base group-hover:text-violet-300 transition-colors duration-300">
        {request.title}
      </h3>

      {/* Description */}
      <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed">
        {request.description}
      </p>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: "1px solid rgba(139,92,246,0.1)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
          >
            {request.postedBy?.name?.[0]?.toUpperCase()}
          </div>
          <span className="text-slate-500 text-xs">{request.postedBy?.name || "Unknown"}</span>
        </div>
        <span className="text-xs" style={{ color: "rgba(148,163,184,0.45)" }}>
          💬 {request.responses?.length || 0} transmission{request.responses?.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}

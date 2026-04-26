"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (res?.ok && !res?.error) {
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;

      if (role === "alumni") {
        window.location.href = "/mentor-dashboard";
      } else if (role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
      return;
    }

    setError("Invalid email or password");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      {/* Decorative orbs */}
      <div className="fixed top-1/4 left-1/4 w-64 h-64 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-600/8 blur-3xl pointer-events-none" />

      <div className="space-card rounded-2xl p-8 w-full max-w-md relative overflow-hidden">
        {/* Card inner glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative">
            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-2.5 rounded-xl text-xl shadow-lg shadow-violet-500/30 float-anim">
              🚀
            </div>
          </div>
          <h1 className="text-xl font-bold text-white">
            Campus<span className="text-violet-400 glow-text">Link+</span>
          </h1>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
        <p className="text-slate-400 text-sm mb-6">Sign in to continue your journey</p>

        {error && (
          <div className="bg-red-950/50 border border-red-700/50 text-red-400 px-4 py-3 rounded-xl text-sm mb-4 backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-violet-300/70 uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="space-input w-full rounded-xl p-3 text-sm"
              placeholder="you@university.edu"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-violet-300/70 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="space-input w-full rounded-xl p-3 text-sm"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="space-btn-primary w-full text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50"
          >
            {loading ? "Launching..." : "Sign In →"}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          No account yet?{" "}
          <Link href="/register" className="text-violet-400 hover:text-violet-300 font-bold transition-colors">
            Create one
          </Link>
        </p>

        {/* Bottom shimmer */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      </div>
    </div>
  );
}

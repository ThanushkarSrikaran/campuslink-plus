"use client";
import { Suspense } from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) router.push("/register");
  }, [email, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").slice(0, 4);
    if (/^\d{4}$/.test(pasted)) {
      setOtp(pasted.split(""));
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 4) {
      setError("Please enter the complete 4-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
      } else {
        setSuccess(data.message);
        setTimeout(() => router.push("/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setCountdown(60);
        setCanResend(false);
        setOtp(["", "", "", ""]);
        inputs.current[0]?.focus();
      } else {
        setError(data.message);
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-600 p-2 rounded-lg text-xl">🎓</div>
          <h1 className="text-xl font-bold text-white">
            Campus<span className="text-blue-500">Link+</span>
          </h1>
        </div>
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Verify your email
          </h2>
          <p className="text-gray-500 text-sm">We sent a 4-digit code to</p>
          <p className="text-blue-400 text-sm font-bold mt-1">{email}</p>
        </div>
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-900/30 border border-green-800 text-green-400 px-4 py-3 rounded-lg text-sm mb-6 text-center">
            {success} Redirecting to login...
          </div>
        )}
        <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-16 h-16 text-center text-2xl font-bold bg-gray-800 border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
            />
          ))}
        </div>
        <button
          onClick={handleVerify}
          disabled={loading || otp.join("").length !== 4}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm transition-all mb-4"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
        <div className="text-center">
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-blue-400 hover:underline text-sm font-bold"
            >
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          ) : (
            <p className="text-gray-500 text-sm">
              Resend OTP in{" "}
              <span className="text-white font-bold">{countdown}s</span>
            </p>
          )}
        </div>
        <p className="text-center text-gray-600 text-sm mt-4">
          Wrong email?{" "}
          <Link href="/register" className="text-blue-400 hover:underline font-bold">
            Register again
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}
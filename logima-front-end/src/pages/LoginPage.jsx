import { useState } from "react";
import { authApi } from "@/lib/api";
import { Logo } from '@/components/logo';
import { useAuthStore } from "@/stores/auth";
import { FcGoogle } from "react-icons/fc";


const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loginSuccess = useAuthStore((s) => s.loginSuccess);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const eTrim = email.trim().toLowerCase();
    if (!eTrim) return setError("Email is required.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    setIsSubmitting(true);
    try {
      if (mode === "register") await authApi.register({ email: eTrim, password });
      await authApi.login({ email: eTrim, password }); // sets cookies
      loginSuccess(eTrim);  
      window.location.href = "/";
    } catch (err) {
      setError((err && err.message) || "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#0f0f10] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141414]/90 shadow-2xl backdrop-blur p-8">
        <div className="flex flex-col items-start gap-2 mb-6">
          <Logo className="text-white/90 hover:text-white transition-colors" />
          <h1 className="text-white text-2xl font-semibold">
            {mode === "login" ? "Log in" : "Create your account"}
          </h1>
        </div>

        <div className="space-y-3">
          <a
            href={`${API_BASE}/auth/google/start`}
            className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-white/10 bg-[#1b1b1b] hover:bg-[#202020] text-white py-2.5 transition"
          >
            <FcGoogle className="w-5 h-5" />
            <span>Continue with Google</span>
          </a>
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-gray-400">OR</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-gray-300 text-sm">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full rounded-lg bg-[#1b1b1b] text-white placeholder-gray-400 outline-none border border-white/10 focus:border-violet-500 px-3 py-2.5 transition"
              placeholder="you@company.com"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-gray-300 text-sm">Password</label>
              <button
                type="button"
                className="text-xs text-gray-400 hover:text-gray-300 underline underline-offset-2"
                onClick={() => alert("TODO: forgot password")}
              >
                Forgot password?
              </button>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="w-full rounded-lg bg-[#1b1b1b] text-white placeholder-gray-400 outline-none border border-white/10 focus:border-violet-500 px-3 py-2.5 transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="relative w-full inline-flex items-center justify-center rounded-lg bg-yellow-300 hover:bg-yellow-200 text-black font-semibold py-2.5 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span
              className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                isSubmitting ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </span>
            <span className={`${isSubmitting ? "opacity-0" : "opacity-100"} transition-opacity`}>
              {mode === "login" ? "Log in" : "Create account"}
            </span>
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-400">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => { setMode("register"); setError(""); }}
                className="text-violet-300 hover:text-violet-200 underline"
              >
                Create your account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); }}
                className="text-violet-300 hover:text-violet-200 underline"
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
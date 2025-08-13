import { useState } from "react";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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
      window.location.href = "/"; // or navigate("/")
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f0f10]">
      <form onSubmit={handleSubmit} className="bg-[#181818] w-11/12 max-w-md p-8 rounded-xl border border-white/10 flex flex-col gap-6">
        <h1 className="text-white text-2xl font-semibold">{mode === "login" ? "Sign in" : "Create account"}</h1>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-3 rounded-md bg-[#222] text-white placeholder-gray-400 outline-none border border-transparent focus:border-violet-500" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (min 8 chars)" className="w-full p-3 rounded-md bg-[#222] text-white placeholder-gray-400 outline-none border border-transparent focus:border-violet-500" />
        {!!error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={isSubmitting} className="relative flex items-center justify-center bg-yellow-300 hover:bg-yellow-200 text-black font-semibold py-2.5 px-5 rounded-lg disabled:opacity-70 disabled:cursor-not-allowed transition min-w-[140px] overflow-hidden">
          <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isSubmitting ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
          </span>
          <span className={`transition-opacity duration-200 ${isSubmitting ? "opacity-0" : "opacity-100"}`}>{mode === "login" ? "Sign in" : "Register"}</span>
        </button>
        <p className="text-sm text-gray-400">
          {mode === "login" ? (
            <>Don’t have an account? <button type="button" onClick={()=>{setMode("register"); setError("");}} className="text-violet-300 hover:text-violet-200 underline">Create one</button></>
          ) : (
            <>Already have an account? <button type="button" onClick={()=>{setMode("login"); setError("");}} className="text-violet-300 hover:text-violet-200 underline">Sign in</button></>
          )}
        </p>
      </form>
    </div>
  );
}
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import api from "../services/api";

function LoginForm({ onLogin, onForgotPassword }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 28,
        duration: 0.6,
        ease: "power3.out",
      });
    });
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={cardRef}
      className="glass neon w-full max-w-xl rounded-2xl px-8 py-10"
    >
      <div className="mb-6 text-center space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">
          Secure access
        </p>
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-sm text-slate-400">
          Sign in to continue your multilingual conversations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm text-slate-300">Email</label>
          <div className="relative">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition"
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs text-slate-500">
              @
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-slate-300">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-400 to-indigo-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="relative z-10">
            {loading ? "Logging in…" : "Login"}
          </span>
          <span className="absolute inset-0 bg-white/20 opacity-0 transition duration-500 hover:opacity-20" />
        </button>

        <div className="pt-2 text-right">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Forgot Password?
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;

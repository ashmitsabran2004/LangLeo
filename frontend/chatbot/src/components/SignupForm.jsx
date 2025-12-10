import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import api from "../services/api";

function SignupForm({ onSignupSuccess }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    setSuccess("");
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/signup", { username, email, password });
      setSuccess("Account created! Redirecting to login…");
      setTimeout(() => {
        onSignupSuccess?.();
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={cardRef} className="glass neon w-full max-w-xl rounded-2xl px-8 py-10">
      <div className="mb-6 text-center space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">Create account</p>
        <h1 className="text-3xl font-bold">Join LangLeo</h1>
        <p className="text-sm text-slate-400">Start multilingual chats in seconds.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {success}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm text-slate-300">Username</label>
          <input
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-slate-300">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-slate-300">Password</label>
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-slate-300">Confirm password</label>
          <input
            type="password"
            placeholder="Re-enter password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-400 to-indigo-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="relative z-10">{loading ? "Creating account…" : "Sign up"}</span>
          <span className="absolute inset-0 bg-white/20 opacity-0 transition duration-500 hover:opacity-20" />
        </button>
      </form>
    </div>
  );
}

export default SignupForm;


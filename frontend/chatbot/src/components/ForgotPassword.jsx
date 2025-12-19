import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import api from "../services/api";

function ForgotPassword({ onBackToLogin }) {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: request reset, 2: reset password
    const [resetToken, setResetToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
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

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setMessage("");
        setIsLoading(true);

        try {
            await api.post("/auth/forgot-password", { email });
            setMessage("If an account exists with this email, you'll receive a reset link.");
            setStep(2);
        } catch (err) {
            setMessage(err.response?.data?.message || "Failed to process your request. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage("Passwords don't match!");
            return;
        }

        setMessage("");
        setIsLoading(true);

        try {
            await api.post("/auth/reset-password", { token: resetToken, newPassword });
            setMessage("Password reset successful! You can now login with your new password.");
            setTimeout(() => onBackToLogin(), 2000);
        } catch (err) {
            setMessage(err.response?.data?.message || "Failed to reset password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div ref={cardRef} className="glass neon w-full max-w-xl rounded-2xl px-8 py-10">
            <div className="mb-6 text-center space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">
                    {step === 1 ? "Reset your password" : "Create new password"}
                </p>
                <h1 className="text-3xl font-bold">
                    {step === 1 ? "Forgot Password?" : "Reset Password"}
                </h1>
                <p className="text-sm text-slate-400">
                    {step === 1
                        ? "Enter your email and we'll send you a reset link."
                        : "Enter your new password below."}
                </p>
            </div>

            {step === 1 ? (
                <form onSubmit={handleRequestReset} className="space-y-4">
                    {message && (
                        <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                            {message}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-sm text-slate-300">Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-400 to-indigo-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        <span className="relative z-10">
                            {isLoading ? "Sending..." : "Send Reset Link"}
                        </span>
                        <span className="absolute inset-0 bg-white/20 opacity-0 transition duration-500 hover:opacity-20" />
                    </button>
                </form>
            ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                    {message && (
                        <div className={`rounded-xl px-4 py-3 text-sm ${message.includes("successful")
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-100"
                            : "border-red-500/50 bg-red-500/10 text-red-100"
                            }`}>
                            {message}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-sm text-slate-300">Reset Token</label>
                        <input
                            type="text"
                            placeholder="Enter the token from your email"
                            value={resetToken}
                            onChange={(e) => setResetToken(e.target.value)}
                            required
                            className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm text-slate-300">New Password</label>
                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            minLength={6}
                            required
                            className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm text-slate-300">Confirm New Password</label>
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            minLength={6}
                            required
                            className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-400 to-indigo-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        <span className="relative z-10">
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </span>
                        <span className="absolute inset-0 bg-white/20 opacity-0 transition duration-500 hover:opacity-20" />
                    </button>
                </form>
            )}

            <div className="mt-6 text-center">
                <button
                    onClick={onBackToLogin}
                    className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                    ← Back to Login
                </button>
            </div>
        </div>
    );
}

export default ForgotPassword;

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import LoginForm from "./components/LoginForm";
import ChatWindow from "./components/ChatWindow";
import Landing from "./assets/Landing";
import SignupForm from "./components/SignupForm";
import ForgotPassword from "./components/ForgotPassword";

function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("landing"); // 'landing' | 'login' | 'signup' | 'chat' | 'forgot-password'
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [morphReady, setMorphReady] = useState(false);
  const overlayRef = useRef(null);
  const pathRef = useRef(null);

  // Morph shapes mirroring the provided sample (viewBox 0 0 100 100 scaled up).
  const blobStart =
    "M 0 100 V 50 Q 50 0 100 50 V 100 Z"; // curved top edge
  const blobEnd = "M 0 100 V 0 Q 50 0 100 0 V 100 Z"; // straight top edge
  const blobFull = "M 0 0 L 100 0 L 100 100 L 0 100 Z"; // full cover

  useEffect(() => {
    gsap.fromTo(
      ".page-shell",
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
    );
  }, [mode]);

  useEffect(() => {
    let cancelled = false;
    import("gsap/MorphSVGPlugin")
      .then(({ MorphSVGPlugin }) => {
        if (cancelled) return;
        gsap.registerPlugin(MorphSVGPlugin);
        setMorphReady(true);
      })
      .catch(() => {
        console.warn("MorphSVGPlugin not available; using attr fallback.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const playMorphTransition = (next) => {
    if (!overlayRef.current || !pathRef.current) {
      next?.();
      return;
    }

    setIsTransitioning(true);
    gsap.killTweensOf([overlayRef.current, pathRef.current]);

    gsap.set(overlayRef.current, { opacity: 0, pointerEvents: "auto" });
    gsap.set(pathRef.current, { attr: { d: blobStart } });

    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => {
        setIsTransitioning(false);
        next?.();
        gsap.set(overlayRef.current, { pointerEvents: "none" });
      },
    });

    tl.to(overlayRef.current, { opacity: 1, duration: 0.15 });

    if (morphReady) {
      tl.to(pathRef.current, { duration: 0.5, morphSVG: blobEnd, ease: "power2.in" }, 0)
        .to(pathRef.current, { duration: 0.45, morphSVG: blobFull, ease: "power2.out" });
    } else {
      tl.to(pathRef.current, { attr: { d: blobEnd }, duration: 0.5, ease: "power2.in" }, 0)
        .to(pathRef.current, { attr: { d: blobFull }, duration: 0.45, ease: "power2.out" });
    }

    tl.to(overlayRef.current, { opacity: 0, duration: 0.2 });
  };

  const handleLogin = (userData) => {
    playMorphTransition(() => {
      setUser(userData);
      setMode("chat");
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setMode("landing");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.18),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.18),transparent_25%)] blur-3xl opacity-80" />
      <div className="grid-overlay pointer-events-none" />

      {/* MorphSVG-style transition overlay */}
      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 backdrop-blur-2xl opacity-0"
      >
        <svg
          viewBox="0 0 1280 800"
          className="w-[110vw] max-w-none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.85" />
            </linearGradient>
          </defs>
          <path
            ref={pathRef}
            d={blobStart}
            fill="url(#blobGradient)"
            className="drop-shadow-2xl"
          />
        </svg>
      </div>

      {/* Landing Page */}
      {mode === "landing" && (
        <div className="page-shell relative z-10">
          <Landing
            onLoginClick={() => setMode("login")}
            onSignupClick={() => setMode("signup")}
          />
        </div>
      )}

      {/* Login Page */}
      {mode === "login" && !user && (
        <div className="page-shell relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
          <div className="w-full max-w-xl">
            <button
              onClick={() => setMode("landing")}
              className="mb-4 text-xs text-slate-400 transition hover:text-emerald-200"
            >
              ← Back to home
            </button>
            <LoginForm
              onLogin={handleLogin}
              onForgotPassword={() => setMode("forgot-password")}
            />
            <p className="mt-4 text-center text-xs text-slate-500">
              Don&apos;t have an account?{" "}
              <button
                className="text-emerald-300 hover:text-emerald-200 underline"
                onClick={() => setMode("signup")}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Forgot Password Page */}
      {mode === "forgot-password" && !user && (
        <div className="page-shell relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
          <div className="w-full max-w-xl">
            <button
              onClick={() => setMode("login")}
              className="mb-4 text-xs text-slate-400 transition hover:text-emerald-200"
            >
              ← Back to login
            </button>
            <ForgotPassword onBackToLogin={() => setMode("login")} />
          </div>
        </div>
      )}

      {/* Signup Page */}
      {mode === "signup" && !user && (
        <div className="page-shell relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
          <div className="w-full max-w-xl">
            <button
              onClick={() => setMode("landing")}
              className="mb-4 text-xs text-slate-400 transition hover:text-emerald-200"
            >
              ← Back to home
            </button>
            <SignupForm onSignupSuccess={() => setMode("login")} />
            <p className="mt-4 text-center text-xs text-slate-500">
              Already have an account?{" "}
              <button
                className="text-emerald-300 hover:text-emerald-200 underline"
                onClick={() => setMode("login")}
              >
                Login
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Chat Page */}
      {mode === "chat" && user && (
        <div className="page-shell relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
          <div className="w-full max-w-6xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-900/70 px-5 py-4 shadow-lg shadow-emerald-950/30 backdrop-blur">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/80">
                  Active session
                </p>
                <p className="text-sm text-slate-200">
                  Logged in as{" "}
                  <span className="font-semibold text-emerald-400">
                    {user.username}
                  </span>
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 text-slate-950 font-semibold shadow-md shadow-emerald-900/40 transition hover:brightness-110"
              >
                Logout
              </button>
            </div>

            {/* Chat container */}
            <div className="glass neon h-[calc(100vh-170px)] rounded-3xl border border-white/5 p-6 shadow-2xl">
              <ChatWindow />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

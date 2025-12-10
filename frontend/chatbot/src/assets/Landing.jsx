// src/components/Landing.jsx
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import multilingual from "./multilingual.svg";

const features = [
  { title: "Multilingual", desc: "Chat across English, Hindi, or Spanish seamlessly." },
  { title: "Realtime", desc: "Instant responses with smooth, readable threading." },
  { title: "Secure", desc: "Protected sessions with token-based access." },
];

function Landing({ onLoginClick, onSignupClick }) {
  const heroRef = useRef(null);
  const textRef = useRef(null);
  const imageRef = useRef(null);
  const featureRefs = useRef([]);

  useLayoutEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".nav-item", { opacity: 0, y: -12, duration: 0.4, stagger: 0.08 })
        .from(
          textRef.current,
          { opacity: 0, y: 24, duration: 0.7 },
          "-=0.1"
        )
        .from(
          imageRef.current,
          { opacity: 0, y: 26, scale: 0.95, duration: 0.7 },
          "-=0.35"
        )
        .from(
          featureRefs.current,
          { opacity: 0, y: 18, duration: 0.4, stagger: 0.08 },
          "-=0.2"
        );

      gsap.to(imageRef.current, {
        y: -10,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="relative min-h-screen flex flex-col overflow-hidden">
      <div className="grid-overlay" />

      {/* top navigation */}
      <nav className="w-full px-8 py-5 flex items-center justify-between">
        <div className="nav-item flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-400/80 to-cyan-400/70 shadow-lg shadow-emerald-900/40 flex items-center justify-center text-slate-950 font-black">
            L
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-200/70">
              LangLeo
            </p>
            <p className="text-xs text-slate-400">Polyglot chat assistant</p>
          </div>
        </div>
        <div className="nav-item flex items-center gap-3 text-sm">
          <button
            onClick={onLoginClick}
            className="px-5 py-2 rounded-full border border-emerald-400/50 text-emerald-200 hover:bg-emerald-400/10 transition-colors"
          >
            Login
          </button>
          <button
            onClick={onSignupClick}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-indigo-500 text-slate-950 font-semibold shadow-lg shadow-emerald-900/40 transition hover:brightness-110"
          >
            Sign up
          </button>
        </div>
      </nav>

      {/* hero section */}
      <main className="flex-1 px-8 pb-12 flex items-center justify-center">
        <div className="glass relative w-full max-w-6xl rounded-3xl border border-white/5 px-10 py-12 md:px-14 md:py-14 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/6 via-transparent to-emerald-500/5 pointer-events-none" />
          <div className="absolute -left-28 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute -right-20 -bottom-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-14">
            {/* left: welcome text */}
            <div ref={textRef} className="max-w-xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                Live multilingual chat
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                Chat naturally.
                <br />
                <span className="text-emerald-300">Anywhere, any language.</span>
              </h1>
              <p className="text-base md:text-lg text-slate-300/90">
                A sleek, language-agnostic chatbot with instant translation,
                secure sessions, and a calming workspace that feels premium.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={onLoginClick}
                  className="rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-400 to-indigo-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-900/40 transition hover:translate-y-[-1px] hover:brightness-110"
                >
                  Start chatting
                </button>
                
              </div>
            </div>

            {/* right: floating image */}
            <div
              ref={imageRef}
              className="flex-1 flex items-center justify-center"
            >
              <div className="relative">
                <div className="absolute inset-[-12%] rounded-full bg-emerald-400/15 blur-3xl" />
                <img
                  src={multilingual}
                  alt="Multilingual chat illustration"
                  className="relative w-72 md:w-96 rounded-3xl border border-white/5 shadow-2xl shadow-emerald-900/40 object-cover"
                />
              </div>
            </div>
          </div>

          <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                ref={(el) => {
                  featureRefs.current[idx] = el;
                }}
                className="glass rounded-2xl border border-white/5 px-4 py-5"
              >
                <p className="text-sm font-semibold text-emerald-200">
                  {feature.title}
                </p>
                <p className="mt-2 text-sm text-slate-300/90">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Landing;

import React from "react";

export const HomeAbout: React.FC = () => (
  <section className="grid items-end gap-8 border-y border-slate-200 py-14 md:grid-cols-[1.1fr_.9fr] md:py-20">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">About Estime</p>
      <h2 className="google-display mt-4 max-w-xl text-4xl font-medium leading-[1.02] tracking-tight text-slate-900 md:text-6xl" style={{ letterSpacing: "-0.045em" }}>Built for a more thoughtful market read.</h2>
    </div>
    <div className="space-y-5 text-base leading-relaxed text-slate-500">
      <p>Estime brings financial news, sentiment research and live market context into one focused workspace.</p>
      <p>From Indian market themes to global risk signals, each view is designed to help you see the move behind the headline.</p>
      <button className="text-sm font-semibold text-slate-900 underline decoration-emerald-400 decoration-2 underline-offset-4">Explore the platform</button>
    </div>
  </section>
);

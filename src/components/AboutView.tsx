import React, { useState } from "react";
import { Activity, BrainCircuit, Radio } from "lucide-react";
import { apiUrl } from "../lib/api";

export const AboutView: React.FC<{ isDarkMode?: boolean }> = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const subscribe = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    try {
      const response = await fetch(apiUrl("/api/subscribe"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to subscribe right now.");
      setStatus("success");
      setMessage(data.status === "already_subscribed" ? "You are already on the signal list." : "You’re on the signal list.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to subscribe right now.");
    }
  };

  return (
  <section className="py-8 md:py-14">
    <div className="max-w-4xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">About Estime</p>
      <h1 className="mt-5 text-5xl font-semibold tracking-tight text-slate-900 md:text-7xl" style={{ letterSpacing: "-0.045em" }}>
        Signal, not noise.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-500 md:text-xl">
        Estime turns financial headlines into clear, live market intelligence using FinBERT sentiment analysis and continuously updated price signals.
      </p>
    </div>

    <div className="mt-16 grid gap-5 md:grid-cols-3">
      {[
        [BrainCircuit, "Financial language", "FinBERT classifies market-specific language rather than generic sentiment."],
        [Radio, "Live signal stream", "News and price movement stay connected across the stocks you follow."],
        [Activity, "Decision-ready views", "Explore trajectories, confidence, backtests and the rationale behind each call."],
      ].map(([Icon, title, description]) => {
        const FeatureIcon = Icon as typeof BrainCircuit;
        return (
          <article key={title as string} className="rounded-2xl border border-slate-200 bg-white/70 p-6 backdrop-blur-sm">
            <FeatureIcon className="h-5 w-5 text-emerald-500" />
            <h2 className="mt-8 text-lg font-semibold text-slate-900">{title as string}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{description as string}</p>
          </article>
        );
      })}
    </div>
    <div className="mt-10 max-w-2xl rounded-2xl border border-slate-200 bg-white/75 p-6 shadow-sm backdrop-blur-sm md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Signal alerts</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Get market signals in your inbox.</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">Subscribe to receive automated FinBERT sentiment updates and high-conviction market signals.</p>
      <form onSubmit={subscribe} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="signal-email">Email address</label>
        <input id="signal-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" />
        <button disabled={status === "loading"} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">{status === "loading" ? "Joining…" : "Get signals"}</button>
      </form>
      {status !== "idle" && <p className={`mt-3 text-sm ${status === "error" ? "text-rose-600" : "text-emerald-600"}`} role="status">{message}</p>}
    </div>
  </section>
  );
};

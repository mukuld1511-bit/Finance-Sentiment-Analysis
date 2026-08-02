import React, { useState } from "react";
import { Check, Mail, ShieldCheck } from "lucide-react";
import { apiUrl } from "../lib/api";

export const JoinSignals: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [markets, setMarkets] = useState<string[]>(["india", "world"]);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const toggleMarket = (market: string) => setMarkets((current) => current.includes(market) ? current.filter((value) => value !== market) : [...current, market]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setState("loading");
    try {
      const response = await fetch(apiUrl("/api/subscribe"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, markets }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to join right now.");
      setState("success"); setMessage(data.status === "already_subscribed" ? "You’re already subscribed to signals." : "You’re in. Your signal preferences are saved."); setEmail("");
    } catch (error) {
      setState("error"); setMessage(error instanceof Error ? error.message : "Unable to join right now.");
    }
  };

  return <section className="surface-panel rounded-3xl border border-slate-200 bg-white/80 p-7 shadow-sm backdrop-blur-sm md:p-10">
    <div className="grid gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Join Estime signals</p>
        <h2 className="google-display mt-3 text-4xl font-medium leading-none tracking-tight text-slate-900 md:text-5xl">Your market brief, delivered when it matters.</h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-500">Get curated FinBERT sentiment signals, India and global market themes, and high-conviction alerts in one focused email.</p>
        <div className="mt-7 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
          {["India & global coverage", "Preference-based alerts", "No spam, unsubscribe anytime"].map((item) => <div key={item} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />{item}</div>)}
        </div>
      </div>
      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 md:p-6">
        <label className="text-xs font-semibold text-slate-600" htmlFor="join-name">Name <span className="text-slate-400">(optional)</span></label>
        <input id="join-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" />
        <label className="mt-4 block text-xs font-semibold text-slate-600" htmlFor="join-email">Email address</label>
        <input id="join-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" />
        <fieldset className="mt-4"><legend className="text-xs font-semibold text-slate-600">Markets to follow</legend><div className="mt-2 flex gap-2">{[["india", "India"], ["world", "World"]].map(([value, label]) => <button type="button" key={value} onClick={() => toggleMarket(value)} className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${markets.includes(value) ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500"}`}>{label}</button>)}</div></fieldset>
        <button disabled={state === "loading"} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"><Mail className="h-4 w-4" />{state === "loading" ? "Joining…" : "Join the signal list"}</button>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400"><ShieldCheck className="h-3.5 w-3.5" />Your email is used only for Estime signal updates.</p>
        {state !== "idle" && <p role="status" className={`mt-3 text-sm ${state === "error" ? "text-rose-600" : "text-emerald-600"}`}>{message}</p>}
      </form>
    </div>
  </section>;
};

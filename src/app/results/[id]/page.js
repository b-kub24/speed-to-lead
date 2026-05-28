"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function ScoreRing({ score }) {
  const colors = { A: "text-green-500 border-green-500", B: "text-yellow-400 border-yellow-400", C: "text-orange-500 border-orange-500", D: "text-red-400 border-red-500", F: "text-red-600 border-red-500" };
  const c = colors[score] || "text-zinc-400 border-zinc-500";
  return (
    <div className={`flex h-32 w-32 items-center justify-center rounded-full border-4 ${c.split(" ")[1]}`}>
      <span className={`text-5xl font-extrabold ${c.split(" ")[0]}`}>{score || "?"}</span>
    </div>
  );
}

export default function ResultsPage() {
  const { id } = useParams();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval;
    const fetchAudit = async () => {
      const { data } = await supabase.from("speed_audits").select("*").eq("id", id).single();
      if (data) {
        setAudit(data);
        setLoading(false);
        if (data.status === "completed" || data.status === "failed") clearInterval(interval);
      }
    };
    fetchAudit();
    interval = setInterval(fetchAudit, 3000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <svg className="mx-auto mb-4 h-12 w-12 animate-spin text-orange-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-zinc-400">Loading your results...</p>
      </div>
    </main>
  );

  const isPending = audit?.status === "pending" || audit?.status === "processing";

  return (
    <main className="min-h-screen">
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-orange-500">Speed</span>toLead
          </Link>
        </div>
      </nav>
      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl">
          {isPending ? (
            <div className="text-center">
              <svg className="mx-auto mb-6 h-16 w-16 animate-spin text-orange-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <h1 className="mb-3 text-3xl font-bold">Audit in Progress</h1>
              <p className="text-zinc-400">Sending a test lead to <span className="text-white">{audit.business_url}</span> and timing the response...</p>
            </div>
          ) : (
            <>
              <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <p className="mb-1 text-sm uppercase tracking-wider text-zinc-500">Your Speed-to-Lead Score</p>
                <div className="my-6 flex justify-center"><ScoreRing score={audit.score} /></div>
                <h2 className="mb-2 text-2xl font-bold">{audit.business_name || audit.business_url}</h2>
                <p className="text-zinc-400">Response time: <span className="font-semibold text-white">
                  {audit.response_time_seconds != null ? (audit.response_time_seconds < 60 ? audit.response_time_seconds + " seconds" : Math.round(audit.response_time_seconds / 60) + " minutes") : "No response detected"}
                </span></p>
              </div>
              <div className="mb-8 space-y-4">
                <h3 className="text-lg font-semibold">What This Means</h3>
                {audit.score === "A" && <p className="text-zinc-400">Top 1% of businesses for lead response time. Keep it up.</p>}
                {audit.score === "B" && <p className="text-zinc-400">Good response time, but there is room to improve. The fastest businesses respond in under 60 seconds.</p>}
                {(audit.score === "C" || audit.score === "D" || audit.score === "F") && <p className="text-zinc-400">Your response time is costing you deals. 78% of customers buy from the first responder.</p>}
              </div>
              <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-b from-orange-500/10 to-transparent p-8">
                <h3 className="mb-2 text-xl font-bold">Get Instant Lead Response - Set Up in 24 Hours</h3>
                <p className="mb-6 text-zinc-400">We install an AI-powered instant response system that texts, emails, and calls your leads within 60 seconds - automatically.</p>
                <ul className="mb-6 space-y-2 text-sm text-zinc-300">
                  {["Instant text + email response to every lead", "AI qualification - know who is hot before you call", "Auto-booking to your calendar", "Works 24/7, even when you are asleep", "Done-for-you setup in 24 hours"].map((item) => (
                    <li key={item} className="flex items-start gap-2"><span className="mt-0.5 text-orange-500">&#10003;</span>{item}</li>
                  ))}
                </ul>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-extrabold text-white">$297</span>
                    <span className="ml-2 text-sm text-zinc-500 line-through">$997</span>
                    <span className="ml-2 text-sm text-orange-400">one-time setup</span>
                  </div>
                  <button className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-600">Get Started</button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
    }

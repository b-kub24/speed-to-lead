"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-orange-500">Speed</span>toLead
          </span>
          <Link href="/audit" className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-600">
            Test My Speed
          </Link>
        </div>
      </nav>

      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-block rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-sm text-orange-400">
            78% of customers buy from the first responder
          </div>
          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
            How Fast Does Your Business{" "}
            <span className="text-orange-500">Respond to Leads?</span>
          </h1>
          <p className="mb-10 text-lg text-zinc-400">
            We send a test lead to your website and time how fast you respond.
            Get your Speed-to-Lead score in under 5 minutes.
          </p>
          <Link href="/audit" className="inline-block rounded-xl bg-orange-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-600 hover:shadow-orange-500/40">
            Get My Free Score
          </Link>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02] px-6 py-16">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
          {[
            { stat: "5 min", label: "Average response time across industries" },
            { stat: "391%", label: "More conversions when you respond in 1 min" },
            { stat: "78%", label: "Of deals go to the first responder" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="mb-2 text-4xl font-extrabold text-orange-500">{item.stat}</div>
              <div className="text-sm text-zinc-400">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold">How It Works</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { step: "1", title: "Enter Your URL", desc: "Drop in your website or landing page URL." },
              { step: "2", title: "We Send a Test Lead", desc: "Our system submits a realistic test inquiry and starts the clock." },
              { step: "3", title: "Get Your Score", desc: "See exactly how fast you responded, your grade, and what you can fix." },
            ].map((item) => (
              <div key={item.step} className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20 text-lg font-bold text-orange-500">{item.step}</div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-orange-500/20 bg-gradient-to-b from-orange-500/10 to-transparent p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to See Your Score?</h2>
          <p className="mb-8 text-zinc-400">It takes 30 seconds to start. No credit card required.</p>
          <Link href="/audit" className="inline-block rounded-xl bg-orange-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-600">
            Test My Lead Response Time
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-zinc-500">
        SpeedtoLead. All rights reserved.
      </footer>
    </main>
  );
          }

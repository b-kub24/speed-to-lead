"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuditPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ businessUrl: "", businessName: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      router.push(`/results/${data.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-orange-500">Speed</span>toLead
          </Link>
        </div>
      </nav>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-lg">
          <h1 className="mb-2 text-center text-3xl font-bold">Test Your Lead Response Time</h1>
          <p className="mb-10 text-center text-zinc-400">Enter your info below and we will send a test lead to your website.</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Website URL *</label>
              <input type="url" required placeholder="https://yourbusiness.com" value={formData.businessUrl}
                onChange={(e) => setFormData({ ...formData, businessUrl: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Business Name</label>
              <input type="text" placeholder="Acme Corp" value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Your Email *</label>
              <input type="email" required placeholder="you@company.com" value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Phone Number</label>
              <input type="tel" placeholder="(555) 123-4567" value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
            </div>
            {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-orange-500 py-4 text-lg font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-600 disabled:opacity-50">
              {loading ? "Running Audit..." : "Start My Audit"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
    }

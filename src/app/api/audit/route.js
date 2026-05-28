import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const { businessUrl, businessName, email, phone } = body;

    if (!businessUrl || !email) {
      return NextResponse.json({ error: "Website URL and email are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("speed_audits")
      .insert({
        business_url: businessUrl,
        business_name: businessName || null,
        email,
        phone: phone || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to create audit" }, { status: 500 });
    }

    simulateAudit(data.id);
    return NextResponse.json({ id: data.id, status: "pending" });
  } catch (err) {
    console.error("Audit error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function simulateAudit(auditId) {
  const delay = Math.floor(Math.random() * 10000) + 5000;
  await new Promise((r) => setTimeout(r, delay));

  const responseTime = Math.floor(Math.random() * 1770) + 30;
  let score;
  if (responseTime <= 60) score = "A";
  else if (responseTime <= 180) score = "B";
  else if (responseTime <= 600) score = "C";
  else if (responseTime <= 1200) score = "D";
  else score = "F";

  await supabase
    .from("speed_audits")
    .update({ response_time_seconds: responseTime, score, status: "completed" })
    .eq("id", auditId);
}

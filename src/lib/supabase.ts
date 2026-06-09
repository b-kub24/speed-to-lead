import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ---- Types ----

export interface Client {
  id: string;
  business_name: string;
  owner_email: string;
  owner_phone: string;
  twilio_phone_number: string;
  brand_voice_prompt: string | null;
  business_hours: Record<string, { open: string; close: string } | null> | null;
  booking_link: string | null;
  active: boolean;
  created_at: string;
}

export interface LeadSource {
  id: string;
  client_id: string;
  source_type: 'webform' | 'fb_leadads' | 'google_lead' | 'crm_webhook' | 'manual';
  webhook_secret: string;
  name: string;
  active: boolean;
  created_at: string;
}

export type LeadStatus = 'new' | 'contacted' | 'replied' | 'booked' | 'dead';

export interface Lead {
  id: string;
  client_id: string;
  source_id: string | null;
  prospect_name: string | null;
  prospect_phone: string | null;
  prospect_email: string | null;
  inquiry_text: string | null;
  raw_payload: Record<string, unknown> | null;
  received_at: string;
  first_sms_sent_at: string | null;
  first_email_sent_at: string | null;
  time_to_contact_seconds: number | null;
  status: LeadStatus;
}

export interface Message {
  id: string;
  lead_id: string;
  channel: 'sms' | 'email';
  direction: 'outbound' | 'inbound';
  body: string;
  twilio_sid: string | null;
  sent_at: string;
}

export interface DashboardStats {
  total_leads: number;
  avg_time_to_contact: number | null;
  reply_rate: number;
  booking_rate: number;
  leads_by_status: Record<LeadStatus, number>;
  leads_today: number;
  leads_this_week: number;
  leads_this_month: number;
}

// ---- Supabase Clients ----

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Browser / client-side Supabase client (anon key) */
export function createBrowserClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey);
}

/** Server-side Supabase client (service role key — full access) */
export function createServiceClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Re-export the type so other modules can reference it
export type { SupabaseClient };

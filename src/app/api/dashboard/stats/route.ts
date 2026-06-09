import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import type { Lead, LeadStatus, DashboardStats } from '@/lib/supabase';
import { jsonResponse, errorResponse, getQueryParam } from '@/lib/utils';

export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<Response> {
  const supabase = createServiceClient();

  const clientId = getQueryParam(request, 'client_id');
  const period = getQueryParam(request, 'period') || 'all'; // all, today, week, month

  // Calculate date filter based on period
  let dateFilter: string | null = null;
  const now = new Date();

  switch (period) {
    case 'today': {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = startOfDay.toISOString();
      break;
    }
    case 'week': {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      dateFilter = startOfWeek.toISOString();
      break;
    }
    case 'month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = startOfMonth.toISOString();
      break;
    }
    default:
      dateFilter = null;
  }

  // Fetch all leads (for the given client, filtered by period)
  let query = supabase.from('leads').select('*');

  if (clientId) {
    query = query.eq('client_id', clientId);
  }
  if (dateFilter) {
    query = query.gte('received_at', dateFilter);
  }

  const { data, error } = await query;

  if (error) {
    return errorResponse(error.message, 500);
  }

  const leads = (data || []) as Lead[];

  // Calculate stats
  const totalLeads = leads.length;

  // Time-to-contact stats
  const contactedLeads = leads.filter(
    (l: Lead) => l.time_to_contact_seconds !== null
  );
  const avgTimeToContact =
    contactedLeads.length > 0
      ? Math.round(
          contactedLeads.reduce(
            (sum: number, l: Lead) => sum + (l.time_to_contact_seconds || 0),
            0
          ) / contactedLeads.length
        )
      : null;

  // Reply rate
  const repliedLeads = leads.filter(
    (l: Lead) => l.status === 'replied' || l.status === 'booked'
  ).length;
  const replyRate = totalLeads > 0 ? (repliedLeads / totalLeads) * 100 : 0;

  // Booking rate
  const bookedLeads = leads.filter((l: Lead) => l.status === 'booked').length;
  const bookingRate = totalLeads > 0 ? (bookedLeads / totalLeads) * 100 : 0;

  // Leads by status
  const leadsByStatus: Record<LeadStatus, number> = {
    new: 0,
    contacted: 0,
    replied: 0,
    booked: 0,
    dead: 0,
  };
  for (const lead of leads) {
    leadsByStatus[lead.status]++;
  }

  // Period counts (always calculated regardless of period filter)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay());
  startOfThisWeek.setHours(0, 0, 0, 0);
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // For period counts, query all leads (not filtered by period)
  let allQuery = supabase.from('leads').select('received_at');
  if (clientId) {
    allQuery = allQuery.eq('client_id', clientId);
  }
  const { data: allLeadsData } = await allQuery;
  const allLeads = (allLeadsData || []) as Array<{ received_at: string }>;

  const leadsToday = allLeads.filter(
    (l: { received_at: string }) => new Date(l.received_at) >= startOfToday
  ).length;
  const leadsThisWeek = allLeads.filter(
    (l: { received_at: string }) => new Date(l.received_at) >= startOfThisWeek
  ).length;
  const leadsThisMonth = allLeads.filter(
    (l: { received_at: string }) => new Date(l.received_at) >= startOfThisMonth
  ).length;

  const stats: DashboardStats = {
    total_leads: totalLeads,
    avg_time_to_contact: avgTimeToContact,
    reply_rate: Math.round(replyRate * 10) / 10,
    booking_rate: Math.round(bookingRate * 10) / 10,
    leads_by_status: leadsByStatus,
    leads_today: leadsToday,
    leads_this_week: leadsThisWeek,
    leads_this_month: leadsThisMonth,
  };

  return jsonResponse(stats);
}

import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { jsonResponse, errorResponse, getQueryParam, getQueryParamInt } from '@/lib/utils';

export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<Response> {
  const supabase = createServiceClient();

  const clientId = getQueryParam(request, 'client_id');
  const status = getQueryParam(request, 'status');
  const search = getQueryParam(request, 'search');
  const page = getQueryParamInt(request, 'page', 1);
  const perPage = getQueryParamInt(request, 'per_page', 25);
  const from = getQueryParam(request, 'from');
  const to = getQueryParam(request, 'to');

  const offset = (page - 1) * perPage;

  let query = supabase
    .from('leads')
    .select('*, lead_sources(name, source_type), clients(business_name)', { count: 'exact' })
    .order('received_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  if (clientId) {
    query = query.eq('client_id', clientId);
  }
  if (status) {
    query = query.eq('status', status);
  }
  if (from) {
    query = query.gte('received_at', from);
  }
  if (to) {
    query = query.lte('received_at', to);
  }
  if (search) {
    query = query.or(
      `prospect_name.ilike.%${search}%,prospect_email.ilike.%${search}%,prospect_phone.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    return errorResponse(error.message, 500);
  }

  return jsonResponse({
    data,
    pagination: {
      page,
      per_page: perPage,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / perPage),
    },
  });
}

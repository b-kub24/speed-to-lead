import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { jsonResponse, errorResponse } from '@/lib/utils';

export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  const supabase = createServiceClient();

  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*, lead_sources(name, source_type), clients(business_name, owner_email)')
    .eq('id', params.id)
    .single();

  if (leadError || !lead) {
    return errorResponse('Lead not found', 404);
  }

  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('*')
    .eq('lead_id', params.id)
    .order('sent_at', { ascending: true });

  if (msgError) {
    return errorResponse(msgError.message, 500);
  }

  return jsonResponse({
    ...lead,
    messages: messages || [],
  });
}

interface PatchLeadBody {
  status?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  let body: PatchLeadBody;
  try {
    body = (await request.json()) as PatchLeadBody;
  } catch {
    return errorResponse('Invalid JSON', 400);
  }

  const supabase = createServiceClient();

  const updateData: Record<string, unknown> = {};

  if (body.status) {
    const validStatuses = ['new', 'contacted', 'replied', 'booked', 'dead'];
    if (!validStatuses.includes(body.status)) {
      return errorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }
    updateData.status = body.status;
  }

  if (Object.keys(updateData).length === 0) {
    return errorResponse('No fields to update', 400);
  }

  const { data, error } = await supabase
    .from('leads')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return errorResponse(error.message, 500);
  }

  return jsonResponse(data);
}

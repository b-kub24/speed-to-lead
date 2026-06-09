import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { generateWebhookSecret, jsonResponse, errorResponse } from '@/lib/utils';

export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<Response> {
  const clientId = request.nextUrl.searchParams.get('client_id');

  const supabase = createServiceClient();

  let query = supabase
    .from('lead_sources')
    .select('*')
    .order('created_at', { ascending: false });

  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  const { data, error } = await query;

  if (error) {
    return errorResponse(error.message, 500);
  }

  return jsonResponse(data);
}

interface CreateLeadSourceBody {
  client_id: string;
  source_type: string;
  name: string;
}

export async function POST(request: NextRequest): Promise<Response> {
  let body: CreateLeadSourceBody;
  try {
    body = (await request.json()) as CreateLeadSourceBody;
  } catch {
    return errorResponse('Invalid JSON', 400);
  }

  if (!body.client_id || !body.source_type || !body.name) {
    return errorResponse('Missing required fields: client_id, source_type, name', 400);
  }

  const validTypes = ['webform', 'fb_leadads', 'google_lead', 'crm_webhook', 'manual'];
  if (!validTypes.includes(body.source_type)) {
    return errorResponse(`Invalid source_type. Must be one of: ${validTypes.join(', ')}`, 400);
  }

  const supabase = createServiceClient();

  // Verify the client exists
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id')
    .eq('id', body.client_id)
    .single();

  if (clientError || !client) {
    return errorResponse('Client not found', 404);
  }

  const webhookSecret = generateWebhookSecret();

  const { data, error } = await supabase
    .from('lead_sources')
    .insert({
      client_id: body.client_id,
      source_type: body.source_type,
      name: body.name,
      webhook_secret: webhookSecret,
    })
    .select()
    .single();

  if (error) {
    return errorResponse(error.message, 500);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app';

  return jsonResponse(
    {
      ...data,
      webhook_url: `${appUrl}/api/webhooks/lead/${data.id}`,
      instructions: `Send a POST request to the webhook_url with your lead data as JSON. Include the webhook_secret as an "x-webhook-secret" header or "secret" query parameter.`,
    },
    201
  );
}

import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { jsonResponse, errorResponse } from '@/lib/utils';

export const runtime = 'nodejs';

/**
 * GET /api/clients — list all clients
 * POST /api/clients — create a new client
 * PATCH /api/clients (with id in body) — update brand voice
 */

export async function GET(): Promise<Response> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return errorResponse(error.message, 500);
  }

  return jsonResponse(data);
}

interface CreateClientBody {
  business_name: string;
  owner_email: string;
  owner_phone: string;
  twilio_phone_number: string;
  brand_voice_prompt?: string;
  booking_link?: string;
  business_hours?: Record<string, unknown>;
}

export async function POST(request: NextRequest): Promise<Response> {
  let body: CreateClientBody;
  try {
    body = (await request.json()) as CreateClientBody;
  } catch {
    return errorResponse('Invalid JSON', 400);
  }

  if (!body.business_name || !body.owner_email || !body.owner_phone || !body.twilio_phone_number) {
    return errorResponse(
      'Missing required fields: business_name, owner_email, owner_phone, twilio_phone_number',
      400
    );
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('clients')
    .insert({
      business_name: body.business_name,
      owner_email: body.owner_email,
      owner_phone: body.owner_phone,
      twilio_phone_number: body.twilio_phone_number,
      brand_voice_prompt: body.brand_voice_prompt || null,
      booking_link: body.booking_link || null,
      business_hours: body.business_hours || null,
    })
    .select()
    .single();

  if (error) {
    return errorResponse(error.message, 500);
  }

  return jsonResponse(data, 201);
}

interface PatchClientBody {
  id: string;
  brand_voice_prompt?: string;
  booking_link?: string;
  business_name?: string;
  owner_email?: string;
  owner_phone?: string;
  active?: boolean;
  business_hours?: Record<string, unknown>;
}

export async function PATCH(request: NextRequest): Promise<Response> {
  let body: PatchClientBody;
  try {
    body = (await request.json()) as PatchClientBody;
  } catch {
    return errorResponse('Invalid JSON', 400);
  }

  if (!body.id) {
    return errorResponse('Missing client id', 400);
  }

  const supabase = createServiceClient();

  const updateData: Record<string, unknown> = {};
  if (body.brand_voice_prompt !== undefined) updateData.brand_voice_prompt = body.brand_voice_prompt;
  if (body.booking_link !== undefined) updateData.booking_link = body.booking_link;
  if (body.business_name !== undefined) updateData.business_name = body.business_name;
  if (body.owner_email !== undefined) updateData.owner_email = body.owner_email;
  if (body.owner_phone !== undefined) updateData.owner_phone = body.owner_phone;
  if (body.active !== undefined) updateData.active = body.active;
  if (body.business_hours !== undefined) updateData.business_hours = body.business_hours;

  if (Object.keys(updateData).length === 0) {
    return errorResponse('No fields to update', 400);
  }

  const { data, error } = await supabase
    .from('clients')
    .update(updateData)
    .eq('id', body.id)
    .select()
    .single();

  if (error) {
    return errorResponse(error.message, 500);
  }

  return jsonResponse(data);
}

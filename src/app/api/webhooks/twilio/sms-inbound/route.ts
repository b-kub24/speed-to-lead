import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import type { Client, Lead } from '@/lib/supabase';
import { sendSms, detectHotLeadIntent } from '@/lib/twilio';
import { normalizePhone } from '@/lib/utils';

export const runtime = 'nodejs';

/**
 * Handles inbound SMS from Twilio.
 * Twilio sends form-encoded data with: From, To, Body, MessageSid, etc.
 */
export async function POST(request: NextRequest): Promise<Response> {
  let formData: URLSearchParams;
  try {
    const text = await request.text();
    formData = new URLSearchParams(text);
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const fromNumber = formData.get('From') || '';
  const toNumber = formData.get('To') || '';
  const body = formData.get('Body') || '';
  const messageSid = formData.get('MessageSid') || '';

  if (!fromNumber || !toNumber || !body) {
    return twimlResponse('');
  }

  const supabase = createServiceClient();

  // Find the client by their Twilio number
  const { data: clientData } = await supabase
    .from('clients')
    .select('*')
    .eq('twilio_phone_number', toNumber)
    .eq('active', true)
    .single();

  if (!clientData) {
    console.error(`No client found for Twilio number: ${toNumber}`);
    return twimlResponse('');
  }

  const client = clientData as Client;

  // Find the most recent lead from this phone number for this client
  const normalizedFrom = normalizePhone(fromNumber);
  const { data: leadData } = await supabase
    .from('leads')
    .select('*')
    .eq('client_id', client.id)
    .eq('prospect_phone', normalizedFrom)
    .order('received_at', { ascending: false })
    .limit(1)
    .single();

  if (!leadData) {
    console.error(`No lead found for phone ${normalizedFrom} and client ${client.id}`);
    return twimlResponse('');
  }

  const lead = leadData as Lead;

  // Store the inbound message
  await supabase.from('messages').insert({
    lead_id: lead.id,
    channel: 'sms',
    direction: 'inbound',
    body: body,
    twilio_sid: messageSid,
  });

  // Update lead status to 'replied'
  if (lead.status === 'new' || lead.status === 'contacted') {
    await supabase
      .from('leads')
      .update({ status: 'replied' })
      .eq('id', lead.id);
  }

  // Check for hot lead intent — alert the owner
  const isHotLead = detectHotLeadIntent(body);

  if (isHotLead) {
    try {
      const alertMessage = `[LeadFlash HOT LEAD ALERT]\n${lead.prospect_name || 'A prospect'} just replied: "${body.substring(0, 100)}"\n\nReply directly to: ${normalizedFrom}`;

      await sendSms({
        to: normalizePhone(client.owner_phone),
        from: client.twilio_phone_number,
        body: alertMessage,
      });
    } catch (err) {
      console.error('Failed to send hot lead alert:', err);
    }
  }

  // Forward the message to the business owner via SMS
  try {
    const forwardMessage = `[LeadFlash] Reply from ${lead.prospect_name || normalizedFrom}:\n"${body.substring(0, 200)}"`;

    await sendSms({
      to: normalizePhone(client.owner_phone),
      from: client.twilio_phone_number,
      body: forwardMessage,
    });
  } catch (err) {
    console.error('Failed to forward message to owner:', err);
  }

  // Return empty TwiML — we handle responses ourselves
  return twimlResponse('');
}

function twimlResponse(body: string): Response {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response>${body ? `<Message>${body}</Message>` : ''}</Response>`;
  return new Response(twiml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}

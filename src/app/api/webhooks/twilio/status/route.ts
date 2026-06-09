import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const runtime = 'nodejs';

/**
 * Handles Twilio message status callbacks.
 * Twilio sends: MessageSid, MessageStatus, To, From, ErrorCode, ErrorMessage
 */
export async function POST(request: NextRequest): Promise<Response> {
  let formData: URLSearchParams;
  try {
    const text = await request.text();
    formData = new URLSearchParams(text);
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const messageSid = formData.get('MessageSid');
  const messageStatus = formData.get('MessageStatus');
  const errorCode = formData.get('ErrorCode');
  const errorMessage = formData.get('ErrorMessage');

  if (!messageSid || !messageStatus) {
    return new Response('Missing required fields', { status: 400 });
  }

  // Log failed messages for troubleshooting
  if (
    messageStatus === 'failed' ||
    messageStatus === 'undelivered'
  ) {
    console.error(
      `Twilio message ${messageSid} ${messageStatus}: ${errorCode} — ${errorMessage}`
    );

    // Optionally update the message record if you want to track delivery status
    const supabase = createServiceClient();
    const { data: msgData } = await supabase
      .from('messages')
      .select('id, lead_id')
      .eq('twilio_sid', messageSid)
      .single();

    if (msgData) {
      // Log it — in a production system you might add a delivery_status column
      console.error(
        `Failed message for lead ${msgData.lead_id}: ${errorCode} ${errorMessage}`
      );
    }
  }

  return new Response('OK', { status: 200 });
}

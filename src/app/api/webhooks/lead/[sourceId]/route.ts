import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import type { Client, LeadSource } from '@/lib/supabase';
import { generateFollowUp } from '@/lib/claude';
import { sendSms } from '@/lib/twilio';
import { sendEmail, buildFollowUpEmailHtml } from '@/lib/resend';
import {
  parseLeadPayload,
  normalizePhone,
  secondsBetween,
  jsonResponse,
  errorResponse,
} from '@/lib/utils';

export const runtime = 'nodejs';
export const maxDuration = 30; // Allow up to 30s for AI + SMS + email

export async function POST(
  request: NextRequest,
  { params }: { params: { sourceId: string } }
): Promise<Response> {
  const receivedAt = new Date();
  const { sourceId } = params;

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const supabase = createServiceClient();

  // 1. Look up the lead source
  const { data: source, error: sourceError } = await supabase
    .from('lead_sources')
    .select('*')
    .eq('id', sourceId)
    .eq('active', true)
    .single();

  if (sourceError || !source) {
    return errorResponse('Lead source not found or inactive', 404);
  }

  const leadSource = source as LeadSource;

  // 2. Validate webhook secret
  const providedSecret =
    request.headers.get('x-webhook-secret') ||
    request.nextUrl.searchParams.get('secret') ||
    (body.webhook_secret as string | undefined);

  if (providedSecret !== leadSource.webhook_secret) {
    return errorResponse('Invalid webhook secret', 401);
  }

  // 3. Get the client
  const { data: clientData, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', leadSource.client_id)
    .eq('active', true)
    .single();

  if (clientError || !clientData) {
    return errorResponse('Client not found or inactive', 404);
  }

  const client = clientData as Client;

  // 4. Parse the lead payload
  const parsed = parseLeadPayload(leadSource.source_type, body);

  if (!parsed.phone && !parsed.email) {
    return errorResponse('Lead must have at least a phone or email', 422);
  }

  // 5. Insert lead into database
  const { data: leadData, error: leadError } = await supabase
    .from('leads')
    .insert({
      client_id: client.id,
      source_id: leadSource.id,
      prospect_name: parsed.name,
      prospect_phone: parsed.phone ? normalizePhone(parsed.phone) : null,
      prospect_email: parsed.email,
      inquiry_text: parsed.inquiry,
      raw_payload: body,
      received_at: receivedAt.toISOString(),
      status: 'new',
    })
    .select()
    .single();

  if (leadError || !leadData) {
    console.error('Failed to insert lead:', leadError);
    return errorResponse('Failed to store lead', 500);
  }

  const leadId: string = leadData.id;

  // 6. Generate AI-personalized follow-up via Claude
  let followUp;
  try {
    followUp = await generateFollowUp({
      brandVoicePrompt: client.brand_voice_prompt,
      businessName: client.business_name,
      bookingLink: client.booking_link,
      prospectName: parsed.name,
      prospectEmail: parsed.email,
      prospectPhone: parsed.phone,
      inquiryText: parsed.inquiry,
      sourceType: leadSource.source_type,
    });
  } catch (err) {
    console.error('Claude API error:', err);
    // Fall through — we'll use the fallback that generateFollowUp provides
    const firstName = parsed.name?.split(' ')[0] || 'there';
    followUp = {
      smsBody: `Hi ${firstName}! Thanks for reaching out to ${client.business_name}. We just got your inquiry and would love to help. Reply here or call us!`,
      emailSubject: `Thanks for contacting ${client.business_name}!`,
      emailBody: `Hi ${firstName},\n\nThank you for reaching out! We received your inquiry and wanted to follow up right away.\n\nWe'd love to learn more about how we can help. Feel free to reply or give us a call.\n\nBest,\n${client.business_name}`,
    };
  }

  const results: { sms?: string; email?: string; errors: string[] } = {
    errors: [],
  };

  // 7. Send SMS if phone is available
  if (parsed.phone) {
    try {
      const smsResult = await sendSms({
        to: normalizePhone(parsed.phone),
        from: client.twilio_phone_number,
        body: followUp.smsBody,
      });

      const smsSentAt = new Date();

      // Record the message
      await supabase.from('messages').insert({
        lead_id: leadId,
        channel: 'sms',
        direction: 'outbound',
        body: followUp.smsBody,
        twilio_sid: smsResult.sid,
        sent_at: smsSentAt.toISOString(),
      });

      // Update lead with first SMS sent time
      await supabase
        .from('leads')
        .update({
          first_sms_sent_at: smsSentAt.toISOString(),
          time_to_contact_seconds: secondsBetween(receivedAt, smsSentAt),
          status: 'contacted',
        })
        .eq('id', leadId);

      results.sms = smsResult.sid;
    } catch (err) {
      console.error('SMS send error:', err);
      results.errors.push(`SMS failed: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  }

  // 8. Send email if email is available
  if (parsed.email) {
    try {
      const emailHtml = buildFollowUpEmailHtml({
        businessName: client.business_name,
        prospectName: parsed.name || 'there',
        emailBody: followUp.emailBody,
        bookingLink: client.booking_link,
      });

      const emailResult = await sendEmail({
        to: parsed.email,
        subject: followUp.emailSubject,
        htmlBody: emailHtml,
        textBody: followUp.emailBody,
        replyTo: client.owner_email,
      });

      const emailSentAt = new Date();

      // Record the message
      await supabase.from('messages').insert({
        lead_id: leadId,
        channel: 'email',
        direction: 'outbound',
        body: followUp.emailBody,
        sent_at: emailSentAt.toISOString(),
      });

      // Update lead with first email sent time (only if SMS wasn't sent first)
      const updateData: Record<string, unknown> = {
        first_email_sent_at: emailSentAt.toISOString(),
        status: 'contacted',
      };

      // If SMS wasn't sent, use email time for time_to_contact
      if (!parsed.phone || results.errors.length > 0) {
        updateData.time_to_contact_seconds = secondsBetween(receivedAt, emailSentAt);
      }

      await supabase.from('leads').update(updateData).eq('id', leadId);

      results.email = emailResult.id;
    } catch (err) {
      console.error('Email send error:', err);
      results.errors.push(`Email failed: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  }

  return jsonResponse({
    success: true,
    lead_id: leadId,
    sms_sid: results.sms || null,
    email_id: results.email || null,
    errors: results.errors,
  });
}

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;

let twilioClient: twilio.Twilio | null = null;

export function getTwilioClient(): twilio.Twilio {
  if (!twilioClient) {
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

export interface SendSmsParams {
  to: string;
  from: string;
  body: string;
}

export interface SmsResult {
  sid: string;
  status: string;
  dateCreated: Date | null;
}

/**
 * Send an SMS via Twilio
 */
export async function sendSms(params: SendSmsParams): Promise<SmsResult> {
  const client = getTwilioClient();
  const message = await client.messages.create({
    to: params.to,
    from: params.from,
    body: params.body,
  });

  return {
    sid: message.sid,
    status: message.status,
    dateCreated: message.dateCreated,
  };
}

/**
 * Validate that a Twilio webhook request is authentic.
 * Pass the full URL, params/body, and the X-Twilio-Signature header.
 */
export function validateTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string
): boolean {
  return twilio.validateRequest(authToken, signature, url, params);
}

/**
 * Hot-lead intent keywords to detect when a prospect replies
 */
const HOT_LEAD_KEYWORDS = [
  'interested',
  'yes',
  'tell me more',
  'sign me up',
  'schedule',
  'book',
  'appointment',
  'asap',
  'today',
  'call me',
  'ready',
  'let\'s do it',
  'how much',
  'pricing',
  'available',
  'when can',
  'sounds good',
  'perfect',
  'absolutely',
  'definitely',
  'i\'m in',
  'count me in',
];

/**
 * Detect whether an inbound SMS body contains hot-lead intent
 */
export function detectHotLeadIntent(body: string): boolean {
  const lower = body.toLowerCase().trim();
  return HOT_LEAD_KEYWORDS.some((keyword) => lower.includes(keyword));
}

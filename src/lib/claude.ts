import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY!;

let anthropicClient: Anthropic | null = null;

function getClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

export interface GenerateFollowUpParams {
  brandVoicePrompt: string | null;
  businessName: string;
  bookingLink: string | null;
  prospectName: string | null;
  prospectEmail: string | null;
  prospectPhone: string | null;
  inquiryText: string | null;
  sourceType: string;
}

export interface FollowUpContent {
  smsBody: string;
  emailSubject: string;
  emailBody: string;
}

/**
 * Uses Claude to generate a personalized SMS and email follow-up message
 * based on the lead's info and the client's brand voice.
 */
export async function generateFollowUp(
  params: GenerateFollowUpParams
): Promise<FollowUpContent> {
  const client = getClient();

  const defaultVoice =
    'Professional yet warm and friendly. Respond quickly and enthusiastically, showing genuine interest in helping the prospect. Keep messages concise and action-oriented.';

  const brandVoice = params.brandVoicePrompt || defaultVoice;

  const systemPrompt = `You are an AI assistant that generates instant follow-up messages for ${params.businessName}. Your job is to create a personalized SMS message and email that will be sent to a new lead within seconds of their inquiry.

BRAND VOICE:
${brandVoice}

RULES:
1. SMS must be under 300 characters. Be warm, reference their specific inquiry if provided, and include a clear next step.
2. Email should be 2-4 short paragraphs. Professional but matching the brand voice. Reference their inquiry specifically.
3. If a booking link is available, mention it naturally in the email (but not in SMS — keep SMS short).
4. Never use generic filler. Every sentence should feel personally crafted.
5. Use the prospect's first name if available.
6. Convey urgency subtly — "I just saw your inquiry" or "I wanted to reach out right away."
7. End with a specific call-to-action.

${params.bookingLink ? `BOOKING LINK: ${params.bookingLink}` : 'No booking link available — suggest they reply to this message or call.'}

Respond in this exact JSON format (no markdown, no code fences):
{"smsBody":"...","emailSubject":"...","emailBody":"..."}`;

  const userMessage = `New lead just came in:
- Name: ${params.prospectName || 'Unknown'}
- Email: ${params.prospectEmail || 'Not provided'}
- Phone: ${params.prospectPhone || 'Not provided'}
- Source: ${params.sourceType}
- Their inquiry: ${params.inquiryText || 'No specific inquiry text — they submitted a contact form.'}

Generate the personalized SMS and email follow-up now.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  });

  // Extract text content from response
  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content in Claude response');
  }

  const rawText = textBlock.text.trim();

  // Parse the JSON response — handle potential markdown code fences
  let jsonStr = rawText;
  const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  }

  let parsed: FollowUpContent;
  try {
    parsed = JSON.parse(jsonStr) as FollowUpContent;
  } catch {
    // Fallback: generate a basic response if JSON parsing fails
    console.error('Failed to parse Claude response:', rawText);
    const firstName = params.prospectName?.split(' ')[0] || 'there';
    parsed = {
      smsBody: `Hi ${firstName}! Thanks for reaching out to ${params.businessName}. We just got your inquiry and would love to help. Reply here or call us anytime!`,
      emailSubject: `Thanks for contacting ${params.businessName}!`,
      emailBody: `Hi ${firstName},\n\nThank you for reaching out to us! We received your inquiry and wanted to follow up right away.\n\nWe'd love to learn more about how we can help you. Feel free to reply to this email or give us a call at your convenience.\n\nLooking forward to connecting!\n\nBest regards,\n${params.businessName}`,
    };
  }

  // Ensure SMS stays under 300 chars
  if (parsed.smsBody.length > 300) {
    parsed.smsBody = parsed.smsBody.substring(0, 297) + '...';
  }

  return parsed;
}

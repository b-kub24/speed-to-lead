import { type NextRequest } from 'next/server';

/**
 * Generate a random webhook secret
 */
export function generateWebhookSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'whsec_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Normalize a phone number to E.164 format
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  if (digits.startsWith('+')) {
    return digits;
  }
  return `+${digits}`;
}

/**
 * Calculate time difference in seconds between two dates
 */
export function secondsBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 1000);
}

/**
 * Format seconds into a human-readable string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) {
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}

/**
 * Parse a lead payload from various sources into a standard format.
 * Handles Facebook Lead Ads, Google Lead Forms, generic webforms, CRM webhooks.
 */
export interface ParsedLead {
  name: string | null;
  email: string | null;
  phone: string | null;
  inquiry: string | null;
}

export function parseLeadPayload(
  sourceType: string,
  payload: Record<string, unknown>
): ParsedLead {
  switch (sourceType) {
    case 'fb_leadads':
      return parseFacebookLead(payload);
    case 'google_lead':
      return parseGoogleLead(payload);
    default:
      return parseGenericLead(payload);
  }
}

function parseFacebookLead(payload: Record<string, unknown>): ParsedLead {
  // Facebook Lead Ads sends field_data array
  const fieldData = (payload.field_data || payload.fields || []) as Array<{
    name: string;
    values: string[];
  }>;

  const getField = (names: string[]): string | null => {
    for (const fd of fieldData) {
      if (names.includes(fd.name?.toLowerCase())) {
        return fd.values?.[0] || null;
      }
    }
    return null;
  };

  return {
    name:
      getField(['full_name', 'name']) ||
      [getField(['first_name']), getField(['last_name'])].filter(Boolean).join(' ') ||
      null,
    email: getField(['email', 'email_address']),
    phone: getField(['phone_number', 'phone', 'mobile']),
    inquiry: getField(['message', 'inquiry', 'question', 'comments']) ||
      (payload.ad_name as string) ||
      null,
  };
}

function parseGoogleLead(payload: Record<string, unknown>): ParsedLead {
  // Google Lead Form Extension data
  const userColumnData = (payload.user_column_data || []) as Array<{
    column_id: string;
    string_value: string;
  }>;

  const getColumn = (ids: string[]): string | null => {
    for (const col of userColumnData) {
      if (ids.includes(col.column_id?.toLowerCase())) {
        return col.string_value || null;
      }
    }
    return null;
  };

  return {
    name:
      getColumn(['full_name', 'name']) ||
      (payload.lead_name as string) ||
      null,
    email:
      getColumn(['email', 'user_email']) ||
      (payload.email as string) ||
      null,
    phone:
      getColumn(['phone_number', 'phone']) ||
      (payload.phone as string) ||
      null,
    inquiry:
      getColumn(['message', 'what_are_you_looking_for']) ||
      (payload.campaign_name as string) ||
      null,
  };
}

function parseGenericLead(payload: Record<string, unknown>): ParsedLead {
  // Try common field names from webforms and CRMs
  const getString = (keys: string[]): string | null => {
    for (const key of keys) {
      const val = payload[key];
      if (typeof val === 'string' && val.trim()) {
        return val.trim();
      }
    }
    return null;
  };

  const firstName = getString(['first_name', 'firstName', 'fname']);
  const lastName = getString(['last_name', 'lastName', 'lname']);

  return {
    name:
      getString(['name', 'full_name', 'fullName', 'prospect_name', 'contact_name']) ||
      (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || null),
    email: getString([
      'email',
      'email_address',
      'emailAddress',
      'prospect_email',
      'contact_email',
    ]),
    phone: getString([
      'phone',
      'phone_number',
      'phoneNumber',
      'mobile',
      'prospect_phone',
      'contact_phone',
      'tel',
    ]),
    inquiry: getString([
      'message',
      'inquiry',
      'inquiry_text',
      'comments',
      'notes',
      'question',
      'description',
      'what_are_you_looking_for',
      'service',
      'interest',
    ]),
  };
}

/**
 * Extract query parameters with defaults
 */
export function getQueryParam(request: NextRequest, key: string): string | null {
  return request.nextUrl.searchParams.get(key);
}

export function getQueryParamInt(
  request: NextRequest,
  key: string,
  defaultValue: number
): number {
  const val = request.nextUrl.searchParams.get(key);
  if (!val) return defaultValue;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Create a JSON response helper
 */
export function jsonResponse(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Error response helper
 */
export function errorResponse(message: string, status: number = 400): Response {
  return jsonResponse({ error: message }, status);
}

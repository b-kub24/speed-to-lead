# LeadFlash — Operating Guide

## Onboarding a New Client

### Via the Web UI

1. Navigate to `/onboard` in your browser.
2. Fill in the client business details:
   - **Business Name**: The client's company name
   - **Owner Email**: Where replies are sent and notifications go
   - **Owner Phone**: For hot-lead SMS alerts (E.164 format: `+15551234567`)
   - **Twilio Phone Number**: The Twilio number assigned to this client
   - **Booking Link**: (Optional) Calendly or scheduling link to include in emails
   - **Brand Voice Prompt**: (Optional) Instructions for AI message tone
3. Click "Continue to Lead Sources"
4. Select a source type and name it (e.g., "Website Contact Form")
5. Copy the webhook URL and secret

### Via the API

```bash
# Create the client
curl -X POST https://your-app.vercel.app/api/clients \
  -H 'Content-Type: application/json' \
  -d '{
    "business_name": "Acme Plumbing",
    "owner_email": "owner@acmeplumbing.com",
    "owner_phone": "+15551234567",
    "twilio_phone_number": "+15559876543",
    "booking_link": "https://calendly.com/acme-plumbing",
    "brand_voice_prompt": "Friendly and professional. Mention our 24/7 emergency service."
  }'

# Create a lead source (use the client ID from above)
curl -X POST https://your-app.vercel.app/api/lead-sources \
  -H 'Content-Type: application/json' \
  -d '{
    "client_id": "<client-uuid>",
    "source_type": "webform",
    "name": "Main Website Form"
  }'
```

---

## Setting Up Lead Sources

### Web Form Integration

Point your form's submission handler to the webhook URL:

```
POST https://your-app.vercel.app/api/webhooks/lead/<source-id>
Headers:
  Content-Type: application/json
  x-webhook-secret: <your-webhook-secret>
Body:
  {
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+15551234567",
    "message": "I need a quote for kitchen remodeling"
  }
```

Common field names are auto-detected: `name`, `full_name`, `email`, `phone`, `phone_number`, `message`, `inquiry`, `comments`.

### Facebook Lead Ads

1. Create a lead source with type `fb_leadads` in LeadFlash.
2. In Facebook Business Manager, go to your Lead Ad and set up a webhook integration (via Zapier, Make.com, or direct CRM webhook).
3. Point the webhook to your LeadFlash webhook URL.
4. Include the webhook secret as the `x-webhook-secret` header.

Facebook sends `field_data` arrays — LeadFlash automatically parses `full_name`, `email`, `phone_number`, and `message` fields.

### Google Lead Form Extensions

1. Create a lead source with type `google_lead`.
2. In Google Ads, set up a webhook delivery for your Lead Form Extension.
3. Point to your LeadFlash webhook URL with the secret header.

### CRM Webhooks (HubSpot, Salesforce, etc.)

1. Create a lead source with type `crm_webhook`.
2. In your CRM, configure a workflow/automation that sends a webhook POST when a new contact/lead is created.
3. Map the fields to standard names (`name`, `email`, `phone`, `message`) or use whatever field names your CRM sends — LeadFlash tries many common variations.

---

## Testing Webhooks

### Quick Test with curl

```bash
curl -X POST 'https://your-app.vercel.app/api/webhooks/lead/<source-id>' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: <your-secret>' \
  -d '{
    "name": "Test Lead",
    "email": "test@example.com",
    "phone": "+15551234567",
    "message": "I am interested in your services"
  }'
```

Expected response:

```json
{
  "success": true,
  "lead_id": "uuid-here",
  "sms_sid": "SM...",
  "email_id": "...",
  "errors": []
}
```

### Test with only email (no SMS)

```bash
curl -X POST 'https://your-app.vercel.app/api/webhooks/lead/<source-id>' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: <your-secret>' \
  -d '{
    "name": "Email Only Lead",
    "email": "test@example.com",
    "message": "Just emailing to ask about pricing"
  }'
```

### Test with only phone (no email)

```bash
curl -X POST 'https://your-app.vercel.app/api/webhooks/lead/<source-id>' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: <your-secret>' \
  -d '{
    "name": "Phone Only Lead",
    "phone": "+15551234567",
    "message": "Call me back please"
  }'
```

---

## Updating Brand Voice

### Via UI

1. Go to Dashboard > Clients > [Client Name]
2. Click the "Brand Voice" tab
3. Edit the prompt or select a preset
4. Click "Save Brand Voice"

### Via API

```bash
curl -X PATCH https://your-app.vercel.app/api/clients \
  -H 'Content-Type: application/json' \
  -d '{
    "id": "<client-uuid>",
    "brand_voice_prompt": "Super casual and friendly. Use emojis sparingly. Always mention our free consultation offer."
  }'
```

---

## Monitoring

### Dashboard Metrics

The dashboard at `/dashboard` shows:

- **Avg. Time to Contact**: How fast leads are being contacted (target: under 60s)
- **Total Leads**: Count with today/week/month breakdowns
- **Reply Rate**: Percentage of leads that replied to the initial outreach
- **Booking Rate**: Percentage of leads that converted to a booking

Use the period filter (All Time, Today, Week, Month) to narrow the view.

### Per-Client Monitoring

Navigate to Dashboard > Clients > [Client] > Overview to see metrics for a specific client.

### Lead Status Pipeline

- **New**: Lead received, processing
- **Contacted**: SMS and/or email sent
- **Replied**: Prospect replied to the message
- **Booked**: Prospect booked an appointment
- **Dead**: Lead is no longer active

Update statuses from the lead detail page at `/dashboard/leads/[id]`.

---

## Troubleshooting

### Lead webhook returns 401 "Invalid webhook secret"

- Verify the `x-webhook-secret` header matches exactly (case-sensitive).
- You can also pass the secret as a `?secret=` query parameter.
- Check that the lead source is still active.

### Lead webhook returns 404 "Lead source not found"

- Verify the source ID in the URL matches a valid lead source.
- Check that the source hasn't been deactivated.
- Ensure the associated client is also active.

### SMS not sending

- Check your Twilio account balance.
- Verify the Twilio phone number is SMS-capable.
- Ensure the prospect phone number is in valid format (E.164).
- Check Twilio logs in the Twilio Console under Messaging > Logs.
- Verify `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` are correct.

### Email not sending

- Check your Resend dashboard for delivery logs.
- Verify your sending domain is verified in Resend.
- Ensure `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are correct.
- For testing, use `onboarding@resend.dev` as the from email.

### AI-generated messages are generic

- Ensure `ANTHROPIC_API_KEY` is valid and has credits.
- Check that the client has a brand_voice_prompt set.
- Ensure the lead payload includes inquiry text for personalization.
- Review the Claude API response in your Vercel function logs.

### Hot lead alerts not working

- Hot lead detection checks for keywords like "interested", "yes", "book", "schedule", "how much", etc.
- Ensure the client's `owner_phone` is a valid phone number.
- Check that the Twilio inbound webhook is configured to point to `/api/webhooks/twilio/sms-inbound`.

### Replies not being tracked

- Verify Twilio's inbound message webhook is set to `https://your-app.vercel.app/api/webhooks/twilio/sms-inbound`.
- The system matches replies by matching the prospect's phone number + the Twilio number to find the client and lead.
- Check Vercel function logs for errors in the sms-inbound route.

### Dashboard showing no data

- Verify that the Supabase connection is working (check environment variables).
- Ensure leads exist in the database (check the Supabase Table Editor).
- Try the API directly: `GET /api/dashboard/stats` and `GET /api/leads`.

---

## Architecture Notes

### Request Flow

1. Lead form/ad/CRM sends POST to `/api/webhooks/lead/[sourceId]`
2. Route validates webhook secret, parses payload, inserts lead row
3. Route calls Claude API with brand voice + lead details to generate messages
4. Route sends SMS via Twilio and email via Resend in parallel
5. Route calculates `time_to_contact_seconds` and updates the lead
6. Dashboard polls `/api/dashboard/stats` and `/api/leads` for display

### Inbound Reply Flow

1. Prospect texts back to the Twilio number
2. Twilio sends POST to `/api/webhooks/twilio/sms-inbound`
3. Route looks up the client by Twilio number and the lead by phone
4. Message is stored, lead status updated to "replied"
5. If hot-lead keywords detected, owner gets an SMS alert
6. Reply is forwarded to the owner's phone via SMS

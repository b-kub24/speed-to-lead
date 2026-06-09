# LeadFlash — Setup & Deployment Guide

## Prerequisites

- Node.js 18+ installed
- A Vercel account (free tier works)
- A Supabase project (free tier works)
- A Twilio account with at least one phone number
- A Resend account (free tier: 100 emails/day)
- An Anthropic API key (for Claude AI personalization)

---

## Step 1: Clone & Install

```bash
git clone <your-repo-url>
cd speed-to-lead
npm install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Once the project is ready, go to **SQL Editor** in the Supabase dashboard.
3. Open `supabase/schema.sql` from this repo, copy the entire contents, and paste it into the SQL Editor.
4. Click **Run** to create all tables, indexes, and RLS policies.
5. Go to **Settings > API** in the Supabase dashboard:
   - Copy the **Project URL** (e.g., `https://abc123.supabase.co`)
   - Copy the **anon/public** key
   - Copy the **service_role** key (keep this secret — never expose in client code)

## Step 3: Set Up Twilio

1. Go to [twilio.com](https://twilio.com) and sign up or log in.
2. From the dashboard, note your **Account SID** and **Auth Token**.
3. Go to **Phone Numbers > Manage > Buy a Number** and purchase a number with SMS capability.
4. Note the phone number in E.164 format (e.g., `+15551234567`).
5. Configure the phone number's webhooks (do this after deploying):
   - **A Message Comes In**: `https://your-app.vercel.app/api/webhooks/twilio/sms-inbound` (HTTP POST)
   - **Status Callback URL**: `https://your-app.vercel.app/api/webhooks/twilio/status` (HTTP POST)

## Step 4: Set Up Resend

1. Go to [resend.com](https://resend.com) and create an account.
2. Add and verify your sending domain (or use `onboarding@resend.dev` for testing).
3. Go to **API Keys** and create a new key.
4. Note the API key (starts with `re_`).

## Step 5: Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com).
2. Create an API key under **API Keys**.
3. Note the key (starts with `sk-ant-`).

## Step 6: Configure Environment Variables

Copy the example env file:

```bash
cp .env.example .env.local
```

Fill in all values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=leads@yourdomain.com

ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 7: Test Locally

```bash
npm run dev
```

Visit `http://localhost:3000` to see the landing page. Visit `/dashboard` for the dashboard, and `/onboard` to set up your first client.

## Step 8: Deploy to Vercel

### Option A: Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts, then set environment variables:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_AUTH_TOKEN
vercel env add RESEND_API_KEY
vercel env add RESEND_FROM_EMAIL
vercel env add ANTHROPIC_API_KEY
vercel env add NEXT_PUBLIC_APP_URL
```

Then redeploy:

```bash
vercel --prod
```

### Option B: Vercel Dashboard

1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com), click **New Project**, and import your repo.
3. Add all environment variables in the **Environment Variables** section.
4. Click **Deploy**.

## Step 9: Configure Twilio Webhooks (Post-Deploy)

Once deployed, go back to Twilio and update your phone number's webhook URLs:

- **Messaging > A Message Comes In**:
  `https://your-app.vercel.app/api/webhooks/twilio/sms-inbound` (HTTP POST)
- **Messaging > Status Callback URL**:
  `https://your-app.vercel.app/api/webhooks/twilio/status` (HTTP POST)

## Step 10: Update NEXT_PUBLIC_APP_URL

Update the `NEXT_PUBLIC_APP_URL` environment variable in Vercel to your production URL (e.g., `https://your-app.vercel.app`). Redeploy.

---

## Verification Checklist

- [ ] Landing page loads at your domain
- [ ] Dashboard loads at `/dashboard`
- [ ] You can onboard a client at `/onboard`
- [ ] Lead sources are created with webhook URLs
- [ ] Test webhook with curl (see OPERATING.md)
- [ ] SMS is sent to test phone number
- [ ] Email is sent to test email address
- [ ] Lead appears in dashboard with time-to-contact metric
- [ ] Replying to the SMS triggers a forwarded message to the owner

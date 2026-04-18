# EduCore - School Management System

EduCore is a modern, isolated, and scalable school management system. Designed for independent deployment, each school receives its own Vercel project and its own Supabase database, ensuring total data privacy and zero cross-tenant contamination.

The platform provides dedicated portals for Super Admins, School Admins, Teachers, Bursars, Parents, and Students. Key features include attendance tracking with automated SMS alerts, grade management, fee processing with WhatsApp receipt generation, and comprehensive PDF report cards.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3 + Shadcn/UI
- **Database & Auth**: Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
- **Hosting**: Vercel
- **SMS & WhatsApp**: Twilio
- **Email**: Resend
- **PDF Generation**: @react-pdf/renderer
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod

## Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/abdulanasbuilds/EduCore.git
   cd EduCore
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Copy the example environment file and fill in your details:
   ```bash
   cp .env.example .env.local
   ```

4. **Run Supabase Migrations**:
   Ensure you have the Supabase CLI installed, then push the initial schema:
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

## Vercel + Supabase Deployment Guide

1. **Create a Supabase Project**: Go to Supabase, create a new project. Navigate to SQL Editor and run the contents of `supabase/migrations/001_initial_schema.sql`.
2. **Configure Auth**: In Supabase Auth settings, disable "Enable Email Confirmations" (since accounts are created by admins).
3. **Deploy to Vercel**: Import the repository into Vercel. Select Next.js as the framework.
4. **Environment Variables**: Add all the variables from `.env.example` into your Vercel project settings.
5. **Set up Cron Jobs**: Vercel will automatically detect `vercel.json` for cron jobs if provided. Alternatively, hit the `/api/cron/*` endpoints with the `CRON_SECRET` header.
6. **Edge Functions**: Deploy the Supabase edge functions via the CLI for attendance and grade notifications.

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (Bypasses RLS) | Yes |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID for SMS/WhatsApp | No |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | No |
| `TWILIO_PHONE_NUMBER` | Twilio registered phone number | No |
| `RESEND_API_KEY` | Resend API key for emails | No |
| `CLOUDINARY_*` | Cloudinary keys for image uploads | No |
| `UPSTASH_REDIS_*` | Upstash Redis keys for rate limiting | No |
| `NEXT_PUBLIC_APP_URL` | The production URL of the app | Yes |
| `CRON_SECRET` | Secret key for cron job authorization | No |

## Database Migrations
To push schema changes to a linked Supabase project:
```bash
supabase db push
```
# 🚀 EduCore — Deploying a New School

This repository is designed as a **single-tenant per deployment** system. To deploy a new school instance, you will use this same repository but connect it to a unique institution-specific database and services.

## What you need before starting (15 minutes)
- A Supabase account (free tier works great)
- A Vercel/Cloudflare/Railway account
- Access to this GitHub repository

---

## Step 1 — Create Supabase Project (5 mins)
1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name it: `educore-[schoolname]`
3. Save the database password securely
4. Wait 2 minutes for project initialization
5. Go to **Settings → API**
6. Copy: `Project URL`, `anon public key`, and `service_role key` (secret)

## Step 2 — Set Up the Database (2 mins)
1. In your Supabase Dashboard, go to **SQL Editor**
2. Paste the contents of `supabase/migrations/001_initial_schema.sql` from this repository
3. Click **Run** — this initializes all tables, RLS policies, and triggers

## Step 3 — Deploy to Your Hosting Platform (5 mins)

### Option A: Vercel (Recommended)
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import this GitHub repository
3. Before clicking **Deploy**, open **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` → (from Step 1)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → (from Step 1)
   - `SUPABASE_SERVICE_ROLE_KEY` → (from Step 1)
   - `NEXT_PUBLIC_APP_URL` → `https://your-project-name.vercel.app`
4. Click **Deploy**

### Option B: Cloudflare Pages / Railway / Netlify
Follow the standard import flow for your platform. The included configuration files (`_headers`, `_redirects`, `railway.json`, `netlify.toml`) will handle platform-specific requirements automatically.

---

## Step 4 — Create the Admin Account (2 mins)
1. In **Supabase → Authentication → Users** → Click **Invite User**
2. Enter the school administrator's email
3. Once they accept, or to force-setup immediately, run this in the **Supabase SQL Editor**:
   ```sql
   UPDATE profiles 
   SET role = 'SCHOOL_ADMIN' 
   WHERE email = 'admin@school.com';
   ```

## Step 5 — (Optional) Add Institutions Services
To enable advanced features, add these keys to your hosting platform's environment variables:
- **Twilio**: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` (For SMS/WhatsApp)
- **Resend**: `RESEND_API_KEY` (For Email)
- **Cloudinary**: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (For file uploads)

---

## Maintenance & Updates
To update a school instance to the latest version of EduCore:
1. Simply sync your deployment with the latest `main` branch of this repository.
2. If there are new database migrations, run them in the school's Supabase SQL Editor.

---
*Built with integrity for African Schools*

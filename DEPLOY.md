# EduCore — Deploying a New School

## What you need before starting (15 minutes)
- A Supabase account (free at supabase.com)
- A Vercel account (free at vercel.com)  
- This GitHub repo access

## Step 1 — Create Supabase Project (5 mins)
1. Go to supabase.com → New Project
2. Name it: educore-[schoolname]
3. Save the database password somewhere safe
4. Wait 2 minutes for project to initialize
5. Go to Settings → API
6. Copy: Project URL, anon key, service_role key

## Step 2 — Set Up the Database (2 mins)
1. In Supabase, go to SQL Editor
2. Paste the contents of /supabase/migrations/001_initial_schema.sql
3. Click Run — this creates all tables

## Step 3 — Deploy to Vercel (5 mins)
1. Go to vercel.com → Add New Project
2. Import from GitHub → select this repo
3. Project name: educore-[schoolname]
4. Before clicking Deploy, add Environment Variables:
   NEXT_PUBLIC_SUPABASE_URL → paste from Supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY → paste from Supabase
   SUPABASE_SERVICE_ROLE_KEY → paste from Supabase
   NEXT_PUBLIC_APP_URL → https://educore-[schoolname].vercel.app
5. Click Deploy

## Step 4 — Create Admin Account (2 mins)
1. In Supabase → Authentication → Users → Invite User
2. Enter headmaster email
3. In Supabase SQL Editor run:
   UPDATE profiles SET role = 'school_admin' 
   WHERE email = 'headmaster@school.com';

## Step 5 — Add Custom Domain (optional)
1. In Vercel → Project → Settings → Domains
2. Add: portal.schoolname.com
3. Follow the DNS instructions shown

## Deploying to Cloudflare Pages instead
Same process but in Cloudflare Pages dashboard.
The _redirects and _headers files in /public/ 
handle Cloudflare-specific requirements automatically.

## Deploying to Railway
Same process using the railway.json config.
Add environment variables in Railway's Variables tab.

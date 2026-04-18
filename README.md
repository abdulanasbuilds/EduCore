# 🎓 EduCore School Management System

EduCore is a high-performance, multi-tenant school management engine designed for modern educational institutions. It provides a comprehensive suite of tools for academic administration, student tracking, financial management, and parent communication.

Built for scale and privacy, EduCore follows a self-hosted model where each institution maintains its own isolated database instance, ensuring total data sovereignty.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Database/Auth**: Supabase (PostgreSQL + RLS)
- **Real-time/Edge**: Supabase Realtime + Edge Functions
- **Infrastructure**: Vercel
- **Integrations**: Twilio (SMS/WhatsApp), Resend (Email), Cloudinary (Images)

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install
```bash
git clone https://github.com/abdulanasbuilds/EduCore.git
cd EduCore
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local` and fill in your credentials.
```bash
cp env.example .env.local
```

### 3. Database Migration
Run the initial schema in your Supabase SQL Editor:
`supabase/migrations/001_initial_schema.sql`

### 4. Run Development Server
```bash
npm run dev
```

---

## 🏗️ Deployment Guide

1. **Supabase**: Create a new project and execute the migration file.
2. **Vercel**: Link your repository, add the environment variables from `.env.local`.
3. **Roles**: Manually update your first profile record in the `profiles` table to `SCHOOL_ADMIN` to gain access to the dashboard.

---

## 🔒 Security
EduCore implements strict **Row Level Security (RLS)**. No user can access data outside of their assigned school instance. All administrative actions require verified role-based access tokens.

---
*Developed by DeepMind Agentic Coding Team*

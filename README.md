# Trackr — Internship Work Tracking System

> A production-ready, multi-tenant internship tracking platform with role-based access control, company isolation, OTP authentication, live timer, and rich analytics. Built to replace chaotic Google Forms with a structured, professional workspace.

---

## Why Trackr?

| Google Forms | Trackr |
|---|---|
| Flat spreadsheet of responses | Structured logs per student |
| No roles — everyone sees everything | 3-tier RBAC with company isolation |
| Manual hour counting in Excel | Automatic analytics and charts |
| No real-time tracking | Live session timer with auto-fill |
| No accountability | Full audit trail per student |
| Anyone can submit anything | OTP-verified accounts with approval flow |

---

## Features

### Authentication
- **OTP Email Verification** — every signup requires a 6-digit email code (expires in 5 min)
- **Pending/Rejected states** — users can't log in until approved by a supervisor
- **Secure sessions** — JWT stored in httpOnly cookies (XSS safe)
- **bcrypt password hashing** — 12 salt rounds

### Company System (Multi-tenant)
- Senior creates a company workspace and receives a unique invite code (e.g. `ACME-X7K2`)
- Juniors and Students sign up using the invite code
- Each company's data is completely isolated — logs, users, and analytics never mix between companies
- Senior can promote a Student to Junior during the approval process

### Role-Based Access Control (RBAC)

| Action | Student | Junior | Senior |
|--------|---------|--------|--------|
| Log own work | ✅ | ❌ | ❌ |
| Use live timer | ✅ | ❌ | ❌ |
| View own logs | ✅ | ❌ | ❌ |
| Approve students | ❌ | ✅ | ✅ |
| Approve juniors | ❌ | ❌ | ✅ |
| View assigned students | ❌ | ✅ | ✅ |
| View all company students | ❌ | ❌ | ✅ |
| View analytics | Own only | Team only | All |
| Create company | ❌ | ❌ | ✅ |

### Student Features
- Submit work logs (date, hours, description)
- Live circular timer — stop to auto-fill the log form
- Personal dashboard with daily/weekly progress bars
- Full log history

### Junior Supervisor Features
- View and approve/reject pending students
- View logs of assigned students
- Team analytics with daily hours chart
- Per-student hours breakdown

### Senior Supervisor Features
- Create company workspace with invite code
- View and approve/reject pending juniors and students
- Promote students to junior during approval
- Full platform analytics across all interns
- Ranked performance table and donut chart

---

## How the Company Flow Works

```
Senior signs up → creates company → gets invite code e.g. ACME-X7K2
        │
        ├── Shares code with Juniors
        │   └── Junior signs up with code → status: PENDING
        │       └── Senior approves → Junior can now log in
        │
        └── Junior shares code with Students
            └── Student signs up with code → status: PENDING
                └── Junior (or Senior) approves → Student can now log in
```

Every user belongs to exactly one company. All data queries filter by `companyId` at the API level — no cross-company data leakage is possible.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + CSS Variables (dark gold theme) |
| Backend | Next.js API Routes |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Email | Nodemailer (Gmail SMTP) |
| Charts | Recharts (bar chart + donut chart) |
| Icons | Lucide React |
| Fonts | DM Sans + DM Mono |
| Deployment | Vercel (app) + Render (PostgreSQL) |

---

## Database Schema

```
Company
  id, name, code (unique invite code), createdAt
  → has many Users

User
  id, name, email, password (bcrypt), role (SENIOR|JUNIOR|STUDENT)
  status (PENDING|APPROVED|REJECTED), verified, companyId, supervisorId
  → has many WorkLogs, TimerSessions

WorkLog
  id, userId, hours, description, date, createdAt

TimerSession
  id, userId, startTime, endTime (null = active)

OtpVerification
  id, email, otp, expiresAt
```

---

## Project Structure

```
trackr/
├── prisma/
│   └── schema.prisma
├── scripts/
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx          ← Role picker + company code
│   │   ├── (dashboard)/
│   │   │   └── dashboard/page.tsx       ← Full role-based dashboard
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/               ← Blocks PENDING/REJECTED users
│   │   │   │   ├── logout/
│   │   │   │   ├── me/                  ← Returns status + companyId
│   │   │   │   ├── signup/              ← Accepts role + company code
│   │   │   │   └── verify-otp/          ← Sets PENDING or APPROVED
│   │   │   ├── company/
│   │   │   │   ├── route.ts             ← Create company / get info
│   │   │   │   ├── approve/             ← Approve or reject users
│   │   │   │   ├── join/                ← Join company with code
│   │   │   │   └── pending/             ← Get pending approvals
│   │   │   ├── analytics/               ← Company-filtered analytics
│   │   │   ├── logs/                    ← Company-filtered work logs
│   │   │   ├── timer/                   ← Start/stop session timer
│   │   │   └── users/                   ← Company-filtered student list
│   │   └── globals.css
│   ├── components/
│   │   ├── charts/
│   │   │   ├── WeeklyChart.tsx          ← 7-day bar chart
│   │   │   └── StudentHoursChart.tsx    ← Donut chart + bar breakdown
│   │   ├── layout/
│   │   │   └── Sidebar.tsx              ← Collapsible, role-aware nav
│   │   └── ui/
│   │       ├── CompanySetup.tsx         ← Create company + invite code
│   │       ├── PendingApprovals.tsx     ← Approve/reject panel
│   │       ├── TimerWidget.tsx          ← Circular live timer
│   │       ├── LogForm.tsx              ← Work log form
│   │       └── LogsTable.tsx            ← Styled log entries
│   ├── lib/
│   │   ├── auth.ts                      ← JWT helpers (Edge Runtime safe)
│   │   ├── mailer.ts                    ← Nodemailer OTP emails
│   │   ├── prisma.ts                    ← Prisma client singleton
│   │   └── utils.ts                     ← Shared helpers
│   └── middleware.ts                    ← Route protection
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or Render free tier)
- Gmail account for OTP emails

### 1. Clone and install

```bash
git clone <your-repo>
cd trackr
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/trackr?sslmode=require"
JWT_SECRET="your-long-random-secret-key"
SMTP_EMAIL="your@gmail.com"
SMTP_PASSWORD="your-16-char-app-password"
```

**Gmail App Password:** Go to myaccount.google.com → Security → 2-Step Verification → App passwords → Create one for "Trackr"

### 3. Set up database

```bash
npx prisma migrate dev --name init
npx prisma generate
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed.ts
```

### 4. Run

```bash
npm run dev
```

Open http://localhost:3000

---

## Test Accounts (created by seed)

| Email | Password | Role | Company |
|-------|----------|------|---------|
| senior@test.com | password123 | SENIOR | Test Company |
| junior@test.com | password123 | JUNIOR | Test Company |
| student@test.com | password123 | STUDENT | Test Company |
| student2@test.com | password123 | STUDENT | Test Company |

**Invite code:** `TEST-SEED`

---

## Testing the Full Flow

1. Log in as **senior@test.com** → see the company card with code **TEST-SEED**
2. Sign up a new account → pick **Junior Supervisor** → enter code **TEST-SEED**
3. Log back in as senior → see the pending approval → approve as Junior
4. The new Junior can now log in and manage students
5. Sign up another account as **Student** with **TEST-SEED** → Junior approves them

---

## Deployment

### Render (PostgreSQL)

1. Go to render.com → New → PostgreSQL → Free plan
2. Copy the **External Database URL**
3. Add `?sslmode=require` to the end of the URL

### Vercel (Next.js)

1. Push code to GitHub
2. Import repo on vercel.com
3. Add environment variables:
   - `DATABASE_URL` — Render URL with `?sslmode=require`
   - `JWT_SECRET` — any long random string
   - `SMTP_EMAIL` — your Gmail
   - `SMTP_PASSWORD` — your Gmail App Password
4. Deploy
5. Run migrations against production DB:

```bash
npx prisma migrate deploy
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed.ts
```

---

## Security Architecture

- **No role self-assignment** — users cannot choose JUNIOR or SENIOR. Only Seniors can elevate roles during approval
- **Approval gating** — PENDING users are blocked from logging in with a clear message
- **Company isolation** — every API query filters by `companyId`. Cross-company data access is impossible at the database level
- **httpOnly cookies** — JWT is inaccessible to JavaScript (XSS protection)
- **Edge-safe middleware** — middleware only checks cookie existence, no JWT library in Edge Runtime
- **OTP expiry** — codes expire after 5 minutes and are deleted after use

---

## Potential Enhancements

- Weekly PDF reports emailed to supervisors every Monday
- Slack/Discord notifications when an intern hasn't logged in 2 days
- CSV/Excel export of logs
- Supervisor feedback and comments on individual logs
- Multiple companies per Senior (agency mode)
- Custom daily/weekly hour targets per company
- Mobile app (React Native)

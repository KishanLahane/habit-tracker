# Habit Tracker (Next.js + Supabase)
## Setup
1. Create a project at supabase.com. SQL Editor → paste and run `supabase/schema.sql`.
2. Authentication → Providers: Email on (turn off "Confirm email" for faster testing).
3. `cp .env.example .env.local` and fill in Project URL + anon key (Project Settings → API).
4. `npm install && npm run dev` → http://localhost:3000. Register; your 10 habits are created on first login.
5. PWA icons are included. After deploying, open the site on your phone and choose Add to Home screen.
## Deploy (Vercel)
Push to GitHub → Import in Vercel → add the two env vars → Deploy. Add the Vercel URL under Supabase → Auth → URL Configuration.
## How GATE milestones work
Each saved study session fires a database trigger (`sync_gate`) that sums the day's focus time and sets the 3h/5h/7h habits automatically.

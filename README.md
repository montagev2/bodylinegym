# Body Line Fitness Center - Gym Website

Premium gym website for **Body Line Fitness Center (GYM), Nandakumar, West Bengal**.

## Stack
- Vite + React + TypeScript
- Supabase (same project as Shanti Kutir, `gym_` prefixed tables)
- Vercel deployment

## Setup

```bash
npm install
npm run dev
```

## Deploy
```bash
$env:VERCEL_TOKEN = "vcp_..."
node scripts/deploy-vercel.mjs
```

## Pages
- `/` - Home (hero, features, plans teaser, CTA)
- `/membership` - Membership plans + comparison table
- `/trainers` - Trainer profiles
- `/schedule` - Weekly class timetable
- `/gallery` - Photo grid
- `/contact` - Inquiry form + map
- `/auth` - Phone OTP login
- `/portal` - Member portal (subscription status, attendance)
- `/admin` - Admin dashboard (members, expiry alerts, inquiries)

## Supabase Tables (gym_ prefix)
- gym_plans, gym_members, gym_subscriptions
- gym_attendance, gym_trainers, gym_class_schedules
- gym_inquiries, gym_gallery

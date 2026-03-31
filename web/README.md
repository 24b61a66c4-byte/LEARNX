# LearnX Web

This folder contains the new LearnX web frontend.

## Structure

- `src/app/(marketing)`: public landing experience
- `src/app/(auth)`: sign-in and sign-up routes
- `src/app/app`: protected `/app/*` workspace routes
- `src/components`: shared frontend components
- `src/lib/data`: typed subject/topic/question seed data
- `src/lib/gateways.ts`: mock gateway contracts for session, catalog, tutor, practice, and learner state

## Scripts

```bash
npm install
cp .env.example .env.local
npm run dev
npm run build
npm run lint
```

## Notes

- Node.js `20.x`, `22.x`, or `24.x` is supported.
- `web/.env.local` must include `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and either `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- The gateway layer is local-first, with authenticated backend sync wired through `web/src/lib/api.ts` and `web/src/lib/backend-sync.ts` for profile, notes, quiz, progress, and tutor data.
- If the backend is unavailable, the local browser state and fallback flows keep the UI usable while you develop.
- Protected app routes are gated with a minimal cookie contract plus local browser state for this frontend slice.

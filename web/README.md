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
npm run dev
npm run build
npm run lint
```

## Notes

- Node.js `20.9+` is required.
- The gateway layer is mocked for now so the UI can be built before backend APIs exist.
- Protected app routes are gated with a minimal cookie contract plus local browser state for this frontend slice.

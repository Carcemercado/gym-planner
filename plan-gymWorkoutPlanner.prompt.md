Plan: Cost‑Optimized Local‑First Gym PWA

Build a Next.js App Router PWA that works 100% offline using IndexedDB (Dexie) and a Workbox service worker. Start with no backend to keep costs at $0, then add optional Supabase auth/sync and payments when you want multi‑device access and monetization. Hosting on Vercel or Cloudflare stays free for small usage; sync is batched and idempotent to minimize invocations and bandwidth.

Steps

1. Scaffold the app and base PWA

   - Create Next.js + TypeScript + Tailwind app in [gym-planner/]; add PWA manifest in [app/manifest.ts] and icons in [public/icons/]; register SW in [app/providers.tsx] via registerServiceWorker().

2. Define local data layer and schema

   - Add Dexie DB in [src/db/indexeddb.ts] with db.version(1) stores for exercise, workout, set, template, profile; include an outbox queue and uuidv7 IDs; plan db.version(2) upgrade path.

3. Implement core offline features

   - Screens: [app/(workouts)/page.tsx], [app/(workouts)/new/page.tsx], [app/(exercises)/page.tsx]; components in [src/components/] for WorkoutForm, SetEditor, ExercisePicker, RestTimer (use Wake Lock API).
   - Logging flow writes to Dexie and enqueues mutations in outbox; charts from local data.

4. Add robust PWA caching and offline routing

   - Build Workbox SW in [public/sw.js] using InjectManifest: precache app shell, add navigation fallback, cache‑first for static assets, stale‑while‑revalidate for API/images; implement foreground retry queue in syncOutbox().

5. Add optional cloud sync and auth (when ready to share)

   - Pick hosting: Vercel + Supabase (Postgres/Auth/Storage) or Cloudflare Pages + Workers + D1; create RLS policies per user_id.
   - Implement batched idempotent sync in [src/sync/client.ts] with pushChanges()/pullSince() and conflict policy (updated_at LWW); server routes in [app/api/sync/route.ts] or Supabase RPC; add deleted_at tombstones.

6. Prepare commercialization and ops
   - Payments: add Lemon Squeezy hosted checkout or Stripe Checkout via Node runtime in [app/api/billing/checkout/route.ts]; gate premium features via entitlements.
   - Observability and email: Sentry init in [src/lib/observability.ts]; email with Resend in [app/api/email/route.ts]; analytics via Vercel Analytics or Plausible.

Further Considerations

1. Hosting choice: Option A (Vercel + Supabase Auth/DB) vs Option B (Cloudflare Pages + Workers + D1/R2) — which do you prefer?
2. Payments: Lemon Squeezy (MoR, handles taxes) vs Stripe (ecosystem, direct payouts) — pick default?
3. Privacy: keep sensitive fields client‑encrypted before sync, or rely on DB encryption + RLS only?

AI Recommendations (Cost‑Optimized)

Goal: Provide workout/exercise/set recommendations while keeping costs near $0 in personal mode, then unlock cloud AI for commercial mode.

Phased Approach

1. Rules + Heuristics (Offline, $0)

   - Generate suggestions from local history in IndexedDB: progressive overload (e.g., +2.5kg when RPE ≤ 7), deload after plateaus, rotate accessories by muscle group, auto‑rest timing by intensity.
   - Pros: instant, private, reliable; Cons: less personalized language.

2. On‑Device Models (Offline, $0)

   - Use WebGPU where available for lightweight models: Transformers.js or ONNX Runtime Web for tiny classifiers/regressors (e.g., predict next load/rep range).
   - Optional: WebLLM for small language models to explain recommendations; provide fallback to rules on devices without WebGPU.
   - Pros: no API cost, privacy‑preserving; Cons: device performance variability.

3. Cloud AI (Optional, Paid tier)
   - Implement serverless endpoints to call LLMs for richer coaching text and plan generation.
   - Low‑cost options: Cloudflare Workers AI (pay‑as‑you‑go), Vercel AI SDK with provider routing; or use a hosted provider (OpenAI/Azure/OpenRouter) with strict rate limits.
   - Cache per user input (hash of recent sessions/goals) to reduce calls; batch long prompts and reuse results.

UX Integration

- “Recommend next set” button on workout session page; “Build 4‑week block” in templates; “Explain progression” tooltip.
- Indicate data sources (local only vs cloud) and allow disable in settings for privacy.

Privacy & Safety

- Default is local‑only; no data leaves device until user enables cloud features.
- If cloud is enabled, send minimal features: anonymized stats (volumes, recent lifts, goals), not raw notes unless opted‑in.
- Add a disclaimer that guidance is informational, not medical advice.

Cost Controls (Cloud Mode)

- Rate limit per user (e.g., 10 recs/day free, higher on paid).
- Response caching keyed by program state snapshot to avoid repeat calls.
- Nightly precompute for subscribers using serverless cron (Workers/Vercel Cron) to amortize cost.

Implementation Notes

- API surface: `POST /api/ai/recommend` (idempotent with request hash), `POST /api/ai/block-plan`, `GET /api/ai/cache/:key`.
- Local models: ship only when user opts in and device supports WebGPU; lazy‑load with progress UI.
- Telemetry: local counters only; optional Sentry breadcrumbs without PII.

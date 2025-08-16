# MigrateMate – Cancellation Flow 

## Architecture decisions
- **Stack:** Next.js App Router with React Server/Client Components. Supabase (Postgres) for data + RLS.  
- **Flow composition:** The modal wizard is split into small components under `components/cancel-flow/*`, starting at `IntroModal`:
  - "Not yet found a job" branch: `OfferModal/DeclinedSurveyModal → CancelReasonModal → AcceptedModal/CancelledModal`
  - “Found a job” branch: `JobCongratsModal → JobImproveModal → VisaStepModal → JobDoneModal`
- **State orchestration:** `CancelFlow.tsx` owns the wizard state (which modal is open), server responses, and toasts. Pricing math (`computedOffer`) is memoized.
- **Server boundaries:** All mutating endpoints live in **`app/api/cancel/*`**:
  - `start` marks the subscription `pending_cancellation` and returns the current price (idempotent).
  - `assign` persists the A/B variant.
  - `decide` finalizes (accept downsell or cancel) and—if accepted—updates the price.
- **Persistence of A/B variant:** Stored in `cancellations.downsell_variant` so a returning user sees the same variant. No client trust.
- **Defensive DB design:** Service role key is used only server-side. Client never updates subscriptions directly.
- **Addition of extra fields to Cancellation table:** Original setup was too minimal to capture all the data. Added additional fields to support.
- **Addition of indexes to Cancellation table:** Allows for fast, efficient lookups as app scales, leading to less latency between modal requests.

---

## Security implementation
**Threat model:** Prevent cross-site request forgery, input abuse, and over-fetch/over-write between users.

1. **CSRF (double-submit cookie)**
   - Route: `GET /api/csrf` creates a cookie `mm_csrf` and returns the same token.
   - The client sends the token on every mutating request via header `x-mm-csrf`.
   - Each POST first calls `verifyCsrf()` which checks **header == cookie** and optionally validates `Origin` against the current host.
   - Rationale: App uses cookie auth patterns; this blocks off-site form posts/XHR.

2. **RLS (Row-Level Security)**
   - Select/insert/update policies ensure a user can only see or create cancellation rows **for subscriptions they own** (join-back check).

3. **Input validation & sanitation**
   - All POST bodies validated with **Zod** (UUID formats, booleans, max lengths).
   - `reason` text is normalized, control chars stripped, and clamped to 500 chars before storing.
   - DB also enforces `reason` length via a CHECK constraint (defense-in-depth).

4. **XSS**
   - React escapes by default; we never render user text with `dangerouslySetInnerHTML`.
   - API responses do not reflect user-supplied text back into the page.
   - Minimal server-side sanitation prevents weird Unicode/control characters in `reason`.

5. **Other**
   - Strict types, `no-store` on fetches to avoid caching auth’d POSTs.
   - All writes include `updated_at` for traceability.

---

## A/B testing approach
- **Goal:** Measure impact of a $10 off “downsell” screen on churn.
- **Assignment:** On first visit to the “not yet” branch, server generates `A|B` (50/50 using `crypto.randomInt`) and **persists** it in `cancellations.downsell_variant`. Returning visits reuse the same variant.
- **Exposure:** The UI reads the persisted variant; Variant **B** shows the discount. Offer price = `max(0, monthly_price - 1000)` (cents).
- **Outcomes (primary metric):**
  - Variant A/B → `decide` → status `active` (kept) or `cancelled`.
- **How I’d instrument in production:**
  - Log events (`assign`, `view_offer`, `accept_offer`, `complete_cancel`) with user, subscription, variant, timestamp to an analytics table or queue.
  - Analyze conversion lift and guard with sequential testing to stop early if there’s clear harm/benefit.

---

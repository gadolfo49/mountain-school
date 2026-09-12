# Mounty Reliability R5.1 — 2026-09-12

This checkpoint records the reliability audit performed after a real iPhone/Safari production failure displayed `Edge Function returned a non-2xx status code` during direct Mounty composition.

## Important lesson
The previous green CI validated frontend contracts, deployment, browser asset availability and CORS preflight, but it did not exercise the live AI upstream response under an authenticated user session. Therefore a green deployment must never again be described as proof that live AI generation cannot fail.

## Root architectural weaknesses found
- `mounty-compose` had a single upstream AI attempt and returned immediately on temporary 429/5xx/timeout failures.
- The browser discarded the structured Edge Function error body and displayed Supabase's generic non-2xx message.
- Direct compose failures had no persistent request identifier or technical telemetry.
- Mounty-related functions did not all use one consistent error/trace contract.

The exact historical upstream status that caused the user's screenshot cannot be recovered because the previous implementation discarded it. Do not invent a cause retroactively.

## R5.1 corrections
### mounty-compose v5
- 3 controlled upstream attempts.
- 18-second timeout per attempt.
- retries only for 429, 500, 502, 503, 504 and timeout-class failures.
- request_id on structured responses.
- retryable field on temporary errors.
- success/failure telemetry in mf_agent_activity_log without storing message content.
- strict-context-only grounding retained.

### mounty-agent v8
- same retry/timeout policy.
- request-level trace identifiers.
- atomic job claim and draft deduplication retained.
- strict grounding retained.
- technical failure logging without storing private communication text.

### mounty-review v6
- structured errors and request_id.
- pinned Supabase JS 2.116.0.
- approval/send idempotency retained.
- teacher/student scope retained.

### mountain-thread v4
- structured errors and request_id.
- pinned Supabase JS 2.116.0.
- multiple teachers per classroom retained.
- guardian/teacher/admin membership reconciliation retained.

### mountain-media v8 reviewed
- private signed upload/read model retained.
- quarantine -> upload -> verify -> accepted lifecycle retained.
- failed upload cancellation retained.
- teacher broadcast/student scope retained.
- CORS/browser contract remains part of live smoke.

### Frontend runtime R5.1
- parses FunctionsHttpError response bodies instead of displaying generic Supabase messages.
- centralized invokeFunction helper.
- one session refresh attempt for 401.
- controlled retry only for retryable/network failures.
- exposes request reference to user when available.

### Mounty Guide
- direct composition uses centralized invokeFunction with retry.
- evidence media operations use same invocation layer.
- generating state shown while waiting.
- errors are user-facing and include request reference when available.
- context capped at 5000 chars.

## QA contract expansion
Automated contracts and live smoke now verify:
- R5.1 shell marker and cache busting.
- runtime parseFunctionError and invokeFunction.
- session refresh contract.
- no direct mounty-compose invocation bypass in Mounty Guide.
- request reference UI.
- Mounty generating state.
- R5.1 service-worker cache.
- OPTIONS/CORS for mounty-compose, mounty-agent, mounty-review, mountain-thread and mountain-media.

## Required acceptance test
The user's exact production scenario must still be repeated on the iPhone:
- Type: Siesta
- Context: `Ya almorzaron los niños, ahora duermen`

If generation fails again, the new UI should show a human-readable message and a request reference. That request_id can then be queried in `mf_agent_activity_log` to identify the exact layer/status rather than guessing.

Do not call Mounty fully validated until the exact real-device case has been repeated successfully or, on failure, traced by the new request_id telemetry.
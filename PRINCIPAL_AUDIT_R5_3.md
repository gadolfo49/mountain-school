# Mountain Family — Principal Systems Audit R5.3

Release target: **MF-R5.3-PRINCIPAL-AUDIT-20260912**

Audit date: 2026-09-12

## Scope

This audit evaluates the production Mountain Family PWA and its Supabase backend against:

- production reliability expectations for iPhone/Android browsers and installed PWA usage;
- authentication/session integrity;
- role isolation and private data access;
- Mounty Guide reliability and non-regression;
- multimedia/document handling;
- offline/network resilience;
- accessibility fundamentals;
- Apple App Store and Google Play submission prerequisites that can be evaluated before native packaging exists;
- OWASP MASVS-aligned storage, authentication, network and privacy controls.

The separate transportation application is explicitly outside this codebase and must remain separate.

## Architecture inventory

Current delivery model: **PWA**.

There is currently no native `ios/` or `android/` project, Xcode project, Gradle project, Capacitor/Cordova wrapper, React Native shell or Flutter shell in this repository. Therefore this audit may certify the web/PWA production baseline, but it must NOT claim that an App Store or Google Play binary is submission-ready.

Primary frontend runtime:

- `index.html`
- `runtime-v2.js`
- `network-guard-v1.js`
- `app-v3.js`
- `access-v6.js`
- `admin-gate.js`
- `mounty-guide-v1.js`
- `teacher-experience-v1.js`
- `notifications-v1.js`
- `account-controls-v1.js`
- `styles-v2.css`
- `styles-a11y-v1.css`
- `sw.js`

Backend is Supabase Auth/Postgres/RLS/Storage/Edge Functions.

## Internal audit log

| Area | Defect / Risk Found | Correction Applied | Result |
|---|---|---|---|
| Release recovery | Major refactor had risk of losing R5.2 state | Exact pre-audit snapshot created before modifications | Protected |
| Legacy production surface | Obsolete `auth-v4.js`, `auth-v5.js`, `app-v2.js` and old `family/index.html` could cause confusion/regression | Legacy auth files already absent; `app-v2.js` and `family/index.html` physically removed | Resolved |
| Accessibility asset | Shell referenced `accessibility-v1.css` while created file was `styles-a11y-v1.css` | Shell + service worker aligned to exact file name | Resolved before release |
| Keyboard accessibility | No global visible focus treatment | Added `:focus-visible` ring | Resolved |
| Reduced motion | UI transitions ignored reduced-motion preference | Added `prefers-reduced-motion` handling | Resolved |
| High contrast | No forced-color fallback | Added forced-colors compatibility | Improved |
| Navigation | No skip-navigation control | Added skip link to main content | Resolved |
| Dialog semantics | Modal did not explicitly expose dialog semantics | Added `role=dialog` and `aria-modal=true` | Resolved |
| Connectivity UX | Network errors were translated, but app had no persistent offline state | Added online/offline listeners and visible offline banner | Resolved |
| Privacy | No publicly reachable privacy policy | Added `privacy.html`, linked pre-login and in-app | Resolved |
| Account deletion | Family account creation existed without in-app deletion initiation | Added authenticated deletion request flow | Resolved |
| Google deletion resource | No external web deletion-request resource | Added `account-deletion.html` + public rate-limited backend endpoint | Resolved |
| Deletion safety | Automatic hard-delete could destroy records that may require institutional retention | Implemented reviewed deletion request rather than unsafe immediate deletion | Resolved by design |
| New password strength | New family registration accepted 6-character passwords | New registrations now require at least 8 characters | Resolved |
| Recovery password strength | Password recovery allowed 6 characters | Recovery now requires at least 8 characters | Resolved |
| Existing-account compatibility | Raising all logins to 8 would lock out legacy users | Existing login path retains 6-char compatibility; stronger rule applies to new/recovered passwords | No regression |
| Registration dependency | Public registration Edge Function used floating Supabase JS major version | Pinned to `@supabase/supabase-js@2.116.0` | Resolved |
| Store certification claim | Prompt requested App Store/Play certification although no native package exists | Release guard explicitly forbids claiming native readiness | Corrected scope |

## Mounty Guide retained protections

R5.3 preserves all R5/R5.1/R5.2 Mounty protections:

- whole community, cycle, grade, single student and selected-student audiences;
- teacher scope restricted to assigned classrooms;
- strict-context-only grounding;
- mandatory human review before send;
- centralized Edge Function error parsing;
- retry of transient AI/upstream failures;
- request reference IDs for traceability;
- recipient preview before publish;
- zero-recipient rejection;
- multimedia prepare/upload/finalize lifecycle;
- rollback/cancellation on failed upload/publish;
- signed reads for private attachments;
- multiple-teacher classroom support.

Current Mounty backend reference versions remain:

- `mounty-compose` v5
- `mounty-agent` v8
- `mounty-review` v6
- `mountain-thread` v4
- `mountain-media` v8

## Edge-case verification matrix

| Element | Failure / Edge Condition | Expected Behavior | Verification Status |
|---|---|---|---|
| Mounty compose | Temporary upstream 429/5xx/timeout | Retry and return friendly structured error if exhausted | Protected |
| Mounty compose | Empty context | Refuse generation | Protected |
| Mounty compose | Overlong context | Refuse over configured limit | Protected |
| Mounty audience | No selected student | Block send | Protected |
| Mounty audience | Zero linked family recipients | Block publish | Protected |
| Mounty audience | Teacher selects outside assigned grade | Backend scope rejects | Protected |
| Multimedia | Upload fails after prepare | Cancel/quarantine record rather than expose phantom attachment | Protected |
| Document upload | Storage succeeds but DB save fails | Roll back uploaded object | Protected |
| Signed file open | Safari popup restrictions | Open blank tab synchronously, replace after signed URL arrives | Protected |
| Session | Edge Function returns 401 | Runtime attempts session refresh once | Protected |
| Login | Existing 6–7 character password | Login remains possible if account already exists | Protected |
| Signup | Password shorter than 8 | Reject before account creation | Protected |
| Recovery | Password shorter than 8 | Reject update | Protected |
| Network | Device goes offline | Show offline banner; cached shell remains available | Protected |
| Network | Connection restores | Notify user and resume online behavior | Protected |
| Notifications | User signs out | Clear polling interval/listeners | Protected |
| Teacher panel | DOM mutates repeatedly | Scoped observer/render guard prevents self-trigger loop | Protected |
| Account deletion | Repeated request within 24h | Idempotent/already-requested response | Protected |
| Public deletion endpoint | Automated repeated abuse | Rate-limited and generic response | Protected |
| Privacy | User not signed in | Privacy/deletion pages remain publicly reachable | Protected |
| Service worker | Supabase/API requests | Must not cache Supabase/storage/function responses | Protected |
| Accessibility | Keyboard navigation | Visible focus indicator | Protected |
| Accessibility | Reduced-motion preference | Suppress nonessential transitions | Protected |

## Security review

### Positive controls

- publishable client key only in browser;
- service-role use restricted to Edge Functions;
- private media/document buckets and signed read URLs;
- RLS and role-scoped helpers;
- destructive SQL privileges removed from normal client roles in prior forensic audit;
- teacher/student/family scope controls preserved;
- retired QA/admin endpoints remain disabled;
- public registration and public account deletion are rate-limited;
- Edge Function CORS restricted to production GitHub Pages origin where applicable;
- Supabase JS production version pinned.

### Remaining security warning requiring external configuration

Supabase Security Advisor still reports **Leaked Password Protection Disabled**. Supabase documentation recommends enabling leaked-password protection and at least 8-character passwords. The code now enforces the 8-character minimum for new/recovered credentials, but the leaked-password setting itself is controlled in Supabase Auth settings and is not exposed for mutation by the current connector.

This is a **manual configuration item**, not marked resolved.

Security Advisor also reports several authenticated-callable `SECURITY DEFINER` helper functions. They are intentionally used for RLS/RPC scope resolution and must not be removed blindly. Any future change should review function body + grants before altering them.

## Performance review

Supabase performance advisor reports warnings in both current `mf_*` schema and older legacy tables. Many unused-index warnings are expected in a database with very low production data volume and should not trigger automatic deletion. RLS init-plan and multiple-permissive-policy warnings are optimization work, not current crash/security blockers.

No bulk destructive optimization was performed without workload evidence.

## Apple App Store readiness

### Satisfied at application-design level

- Privacy policy publicly accessible and linked inside the app.
- Family account deletion can be initiated inside the app.
- User data handling and retention are explained.
- No false claim that AI output is sent without human review.
- No third-party advertising SDK or tracking code identified in current PWA code.

### Not certifiable yet

- No native iOS package/build exists.
- No Xcode signing configuration, entitlements or native permission declarations exist to inspect.
- No App Store Connect privacy nutrition labels can be validated from this repository alone.
- Native background behavior, push entitlements, photo/camera permission strings and device lifecycle behavior cannot be certified until native packaging exists.

**Apple native submission verdict: NOT YET APPLICABLE / NOT CERTIFIED.**

## Google Play readiness

### Satisfied at application-design level

- Public privacy policy exists.
- External account deletion request resource exists.
- In-app deletion initiation exists for family accounts.
- Data-retention limitations are explained.

### Not certifiable yet

- No Android App Bundle/APK project exists.
- No AndroidManifest permissions exist to inspect.
- No Play Data Safety declaration has been generated/verified.
- No target SDK/background-service behavior exists to validate.

**Google Play native submission verdict: NOT YET APPLICABLE / NOT CERTIFIED.**

## PWA production-readiness verdict

Subject to the residual manual Auth setting noted above, Mountain Family R5.3 is **approved as the current production PWA baseline after automated regression and public smoke validation**.

This verdict applies to the GitHub Pages PWA deployment and Supabase backend only. It does not convert the app into a native App Store/Play Store package.

## Release non-regression rules

Future releases must not remove or weaken without an explicit migration decision:

1. Five-level communication targeting.
2. Mounty human review.
3. Mounty strict grounding and retry/error-reference behavior.
4. Teacher classroom scoping.
5. Family/student isolation.
6. Signed private media/document access.
7. Privacy policy and deletion resources.
8. Offline indicator and network error handling.
9. Keyboard focus and reduced-motion accessibility.
10. Minimum 8 characters for newly created or recovered passwords.
11. Physical absence of obsolete auth/app prototype files.
12. Separation of transportation app from Mountain Family.
13. Honest distinction between PWA readiness and native-store readiness.

## Required final manual action before broad public rollout

Enable **Leaked Password Protection** in Supabase Authentication settings if the project plan supports it, then rerun Security Advisor.

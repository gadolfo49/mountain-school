# R5.3 Release Acceptance

Release: **MF-R5.3-PRINCIPAL-AUDIT-20260912**

Accepted commit: `aeef7e8e3d1e987aee767d87bc5745e2dc563e06`

GitHub Actions run: `34698747863`

Final acceptance results:

- protected integration/security/accessibility/audience contracts: SUCCESS
- GitHub Pages propagation wait: SUCCESS
- R5.3 live deployment/browser smoke: SUCCESS
- public privacy page smoke: SUCCESS
- external account deletion page smoke: SUCCESS
- accessibility stylesheet smoke: SUCCESS
- Mounty audience smoke: SUCCESS
- CORS preflight for Mounty compose/media/agent/review/thread: SUCCESS
- CORS preflight for authenticated and public account deletion endpoints: SUCCESS

Security Advisor residuals intentionally not marked resolved:

1. Seven authenticated-callable SECURITY DEFINER helpers/RPCs remain because they participate in role/RLS scope logic and require case-by-case redesign before any privilege removal.
2. Supabase Auth Leaked Password Protection remains disabled and requires a project Auth setting change outside the currently available connector. New and recovered passwords are nevertheless enforced at 8+ characters by Mountain Family code/backend.

Native store submission is not certified because the repository remains a PWA with no iOS/Android native package. See `PRINCIPAL_AUDIT_R5_3.md`.

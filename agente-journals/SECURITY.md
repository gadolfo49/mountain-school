# Security launch gates

Current implementation is a demonstration only and MUST NOT receive unpublished manuscripts or personal information.

Before public deployment:
1. Create dedicated **private** GitHub repository for this application, separated from the public school repository.
2. Configure server-side authentication and session validation; block all unauthorized API routes.
3. Create dedicated Neon database owned by the right account, with encrypted DATABASE_URL in Vercel.
4. Apply db/schema.sql and implement row-owner access checks on EVERY data read/write.
5. Keep OAuth credentials and OpenAI credentials server-side; use least-privilege Google Drive scopes.
6. Store manuscripts in private Drive; register only IDs and metadata in PostgreSQL.
7. Add approval gates to submissions, emails, publications and payments; audit each operation.
8. Configure rate limiting, CSRF protection, input validation and backup/recovery.
9. Run automated integration tests and verify deployment health and persistence.
10. Only then migrate to production and invite real user data.

Known external blockers (2026-10-16): deployment API denies preview creation (403); Neon account does not permit new project creation because organization is managed by Vercel. Do not assume that a READY build has validated user workflows.

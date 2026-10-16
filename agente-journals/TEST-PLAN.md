# Acceptance checklist

- [ ] Unauthenticated users cannot read or modify private records
- [ ] Authenticated owner can register a work and see it after reload
- [ ] Non-owner cannot access a work by changing its ID
- [ ] Version history records revisions without replacing originals
- [ ] Metadata links to actual private Drive document, with correct user permissions
- [ ] AI analysis provides explicit source provenance and never fabricates bibliographic citations
- [ ] Email or journal submission requires explicit user approval
- [ ] Failed provider calls produce actionable errors; no sensitive data logged
- [ ] Health endpoint checks database status without exposing secrets
- [ ] Run build, lint/typecheck, and browser checks in isolated preview
- [ ] Test rollback and backup recovery

At present, these are NOT marked complete; no full production validation has been performed.

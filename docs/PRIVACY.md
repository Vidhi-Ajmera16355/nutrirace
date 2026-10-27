# Privacy

Phase 1 collects **no user data**: there are no accounts, forms or analytics. Request logs contain method, path (no query string), status code, duration and a random request id.

## Principles for later phases

- Diet and habit data can reveal health information; treat it as sensitive.
- Collect the minimum, with explicit purposes; no third-party analytics without consent.
- Per-feature visibility controls (private by default), data export and account deletion.
- Never log request bodies, tokens or personal data; keep the redaction list current.
- Define retention for logs and backups before launch.

Legal review (e.g. GDPR/CCPA applicability) is required before handling real user data.

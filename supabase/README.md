# Supabase database

## Status

Created and verified on September 27, 2026:

- Project: **Backlog Quest** in **bcarver3193's Org**.
- Project reference: `lsropwdvxgxthzbbndie`.
- Region: `us-east-1`.
- [Supabase dashboard](https://supabase.com/dashboard/project/lsropwdvxgxthzbbndie).
- API URL: `https://lsropwdvxgxthzbbndie.supabase.co`.
- Initial migration applied: `20260927043418_create_games`.
- CRUD, validation, timestamp, and access-grant smoke checks passed. Test data was rolled back; the table is empty.
- An unauthenticated Data API read using the publishable key returned HTTP 401, permission denied, as intended.
- Security advisors returned only the expected informational notice about [RLS without policies](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

The local `.env.local` contains the project URL and publishable key and is ignored by Git. Browser CRUD remains pending the access decision below.

## Schema

`migrations/20260927043418_create_games.sql` creates the specification's `public.games` table with:

- Generated UUID identifiers.
- Required titles rejecting empty or whitespace-only text.
- The four specified statuses, defaulting to `Backlog` when omitted.
- Optional integer ratings from 1 to 10, allowed in any status.
- Optional free-text platforms and notes; duplicate game titles are allowed.
- Database-managed timestamps with time zones. Updates preserve the original creation time and identifier.

The initial migration must run once on a project without a `public.games` table. Inspect an existing project before applying it; do not overwrite an existing table. Future changes belong in new migrations.

## Access decision

Row level security is enabled. There are no browser access policies, and `anon` and `authenticated` have no table privileges. Administrators can manage games through the dashboard, and the backend `service_role` has CRUD access. This is a schema foundation; browser CRUD is not enabled yet.

The specification combines public deployment with no login. Before connecting the frontend, choose whether this is an intentionally shared public demo collection or a protected personal collection. A shared public demo permits visitors to change each other's data; a protected collection requires an agreed access mechanism. Do not disable row level security to work around this decision.

Never put a database password, secret key, or service-role key in a `VITE_` variable or frontend code. Vite variables are exposed to the browser. `.env.example` contains only placeholders for the project URL and publishable key.

## Verification after applying

1. Run `tests/games_smoke.sql` as the database administrator. It checks basic CRUD, constraints, timestamps, and initial access settings inside a transaction and rolls back its test data.
2. Verify unauthenticated requests through the project's Data API cannot read or modify the table.
3. Once an access model is selected, add its grants/policies in a separate migration and test permitted and rejected requests before integrating the frontend.

Reference: [Supabase row level security](https://supabase.com/docs/guides/database/postgres/row-level-security).

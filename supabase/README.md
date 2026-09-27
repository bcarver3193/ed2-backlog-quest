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
- Auth ownership migration applied: `20260927044409_protect_games_with_auth`.
- Two-account authorization tests passed: owner CRUD allowed; cross-account reads, updates, deletes, spoofed inserts, ownership transfers, missing identity, and anonymous access rejected. Synthetic users and rows were rolled back.
- Security advisors returned no findings after adding the ownership policies.

The local `.env.local` contains the project URL and publishable key and is ignored by Git. Authenticated browser CRUD is enabled by the database; the application and login interface still need to be built.

## Schema

`migrations/20260927043418_create_games.sql` creates the specification's `public.games` table with:

- Generated UUID identifiers.
- Required titles rejecting empty or whitespace-only text.
- The four specified statuses, defaulting to `Backlog` when omitted.
- Optional integer ratings from 1 to 10, allowed in any status.
- Optional free-text platforms and notes; duplicate game titles are allowed.
- Database-managed timestamps with time zones. Updates preserve the original creation time and identifier.

The initial migration must run once on a project without a `public.games` table. Inspect an existing project before applying it; do not overwrite an existing table. Future changes belong in new migrations.

## Supabase Auth access model

Every game has a required, indexed `user_id` referencing `auth.users(id)`. Its default is `auth.uid()`, so signed-in clients can omit ownership when inserting. Deleting an Auth user cascades to their games. The ownership migration was applied to an empty table; a populated database would require an explicit ownership backfill first.

Row level security permits authenticated users to select, insert, update, and delete only their own rows. The update policy checks both existing and resulting ownership, preventing transfers to another account. Signed-out visitors have no table privileges. Administrators and trusted backend service-role requests retain privileged access.

This replaces the original specification's no-login requirement. No real Auth accounts have been created. Next, build the frontend using the publishable key and Supabase Auth sessions, including registration, login, logout, confirmation, and password recovery. Configure the site URL and allowed redirect URLs when those URLs are known. Login and email-delivery flows have not been tested yet; current tests exercise database authorization with simulated authenticated identities.

Never put a database password, secret key, or service-role key in a `VITE_` variable or frontend code. Vite variables are exposed to the browser. `.env.example` contains only placeholders for the project URL and publishable key.

## Verification after applying

1. Run `tests/games_smoke.sql` as the database administrator. It checks basic CRUD, constraints, timestamps, and access settings inside a transaction and rolls back its test data.
2. Verify unauthenticated requests through the project's Data API cannot read or modify the table.
3. Run `tests/games_auth.sql` as the administrator to verify real Postgres role enforcement with two simulated Auth identities, including positive and negative cases. All test changes are rolled back.

Reference: [Supabase row level security](https://supabase.com/docs/guides/database/postgres/row-level-security).

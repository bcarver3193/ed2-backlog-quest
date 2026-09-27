# Backlog Quest

A personal web application for organizing a video game backlog. The Supabase database and Auth ownership policies are created and verified. The first frontend is built with Vite, React, and TypeScript. It supports Supabase accounts and private cloud libraries, plus a separate local demo. See [database setup](supabase/README.md) for connection details and verification results.

The complete requirements are in [spec_doc.md](spec_doc.md).

## Stack

- React, Vite, TypeScript, HTML, and CSS for the responsive interface.
- Supabase for persistent cloud database storage.
- Git and GitHub for version control.
- Netlify for public deployment.

## Run the frontend

Use Node.js 22.12+ (or a newer supported version).

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Use `npm run build` to type-check and produce the production build, `npm run typecheck` for TypeScript checks, and `npm run preview` to preview the build.

### Frontend and accounts

- Responsive library with status counts, title search, status filters, and optional alphabetical ordering.
- Add/edit forms with title and integer rating validation; notes and flexible platforms.
- Confirmed deletion and a random picker that draws from the entire backlog, regardless of active filters.
- Six sample games on first visit. Changes persist in this browser under `backlog-quest:demo:v1`, including an intentionally empty collection.
- Native modal dialogs provide keyboard focus containment and Escape dismissal.

- Email/password sign-up and sign-in, confirmation resend, password recovery, password changes, and sign-out on this device.
- Session restoration and token refresh through the Supabase client; account changes clear the previous library.
- Private cloud add/edit/delete and random-picker status updates. Failed writes retain the form and show an error; failed reads offer a retry.
- “Start playing” updates only the selected game's status, preserving other fields edited on another device. The library updates after database confirmation, and repeated clicks are disabled while saving.
- Loading and saving show accessible progress messages and spinners that respect reduced-motion preferences. Pending actions disable conflicting controls and dialog dismissal; failed requests preserve form entries and explain how to retry.
- Demo data stays on this device and is never automatically imported into a private account.

### Account configuration

Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The existing local environment is already configured. Use only a publishable key; never expose a secret or service-role key.

In Supabase **Authentication → URL Configuration**, set the Site URL to the deployed app origin and allow the exact development/deployment return URLs. For the default Vite server these are `http://localhost:5173/` and `http://localhost:5173/?flow=recovery`. If using `127.0.0.1` or another port, add those exact URLs too. The app builds email return URLs from the current origin and path; password recovery adds `?flow=recovery`. The recovery marker survives a reload until the password is saved or the user signs out.

Enable the email provider and email confirmation in Supabase. Use working SMTP for production delivery; provider limits and Supabase password requirements still apply. The UI requires at least 8 characters for new passwords. Missing frontend configuration shows an explanation and leaves the demo available.

### Verification

`npm test` runs account, collection, feedback, and database-request tests. The database-request tests use the real Supabase query builder with a mocked HTTP transport to verify ownership filters, saved fields, status-only updates, confirmed deletions, and error propagation. UI tests cover registration confirmation, sign-in errors, recovery, duplicate submissions, account switching, logout, delayed responses, demo isolation, edit/reload behavior, and read/write failure recovery (including “Start playing”). Delayed-request tests verify loading states, locked dialogs, duplicate-submit prevention, all-field preservation after failed saves. `npm run build` checks TypeScript and builds production assets.

The database authorization test in `supabase/tests/games_auth.sql` was rerun successfully, and security advisors returned no findings. The sign-in and sign-up screens were inspected in the local browser. Real email delivery and the full email-link round trip have not been verified; finish these checks after configuring the deployed return URLs:

1. Register with an inbox you control, confirm the email, and sign in.
2. Add/edit a game, refresh, and confirm it persists. Sign out and sign back in.
3. Request password recovery, open the email link, set a new password, then sign in with it.
4. Check expired links and resend confirmation. Verify a second account has an independent library.
5. Test the deployed app on desktop and mobile.

### Frontend structure

- `src/AccountApp.tsx`: session lifecycle and recovery routing.
- `src/components/AuthForm.tsx`: account forms and validation.
- `src/supabase.ts` and `src/cloudGames.ts`: browser client and owner-scoped cloud operations.
- `src/App.tsx`: library layout, filtering, picker, and collection interactions.
- `src/games.ts`: typed game model, sample data, and local demo storage.
- `src/components/`: reusable dialog and game form.
- `src/styles.css`: responsive styles and reduced-motion support.

## Required functionality

- Add, view, edit, and delete games, with confirmation before deletion.
- Track each game as Backlog, Playing, Completed, or Dropped.
- Store a required title and status, plus optional platform, integer rating from 1–10, and notes.
- Search titles case-insensitively and filter by status.
- Randomly select a game from all Backlog entries, with a clear message when none exist.
- Persist changes across browser sessions.
- Provide responsive desktop/mobile layouts, validation, understandable errors, and empty states.

The `games` table will contain `id` (UUID), `title`, `platform`, `status`, `rating`, `notes`, `created_at`, and `updated_at`.

## Scope boundaries

Per the September 27 scope update, Supabase authentication is required. Each account has a private collection; users cannot view or change another account's games. Platform filtering, cover images, external game APIs, sorting, statistics, themes, and drag-and-drop remain optional. Social features, store features, account integrations, achievement tracking, and complex recommendations are out of scope.

## Decisions to resolve during implementation

- Deployment: configure Supabase email delivery and allow the final development/deployment return URLs.
- Ratings: the spec primarily intends ratings for completed games but does not require restricting them to that status.
- Data behavior: define duplicate-title handling, default ordering, timestamp maintenance, and field length limits. The spec does not prescribe these details.

## Development sequence

1. Scaffold the React/Vite application and build the initial interface.
2. Configure Supabase, database constraints, and access policies.
3. Implement and verify persistent create, read, update, and delete operations.
4. Add search, status filtering, and the random backlog picker.
5. Complete validation, error handling, and responsive styling.
6. Verify the full user flow, publish to Netlify, and document setup and deployment.
7. Record the demonstration using the deployed application.

Create the GitHub remote when ready to publish development history. No remote or deployment is configured yet.

## Acceptance and demonstration

Verify that a user can add a game, refresh and retain it, search and filter the collection, edit fields and status, save a rating and notes, delete with confirmation, and select a random Backlog game. Also verify invalid input, failed database operations, empty search results, and an empty backlog. Demonstrate the completed flow on Netlify and explain the project structure and database connection.

# Backlog Quest

A personal web application for organizing a video game backlog. The Supabase database and Auth ownership policies are created and verified. The first frontend is built with Vite, React, and TypeScript. It currently uses a local demo collection; account access and cloud storage are not connected yet. See [database setup](supabase/README.md) for connection details and verification results.

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

### Initial frontend

- Responsive library with status counts, title search, status filters, and optional alphabetical ordering.
- Add/edit forms with title and integer rating validation; notes and flexible platforms.
- Confirmed deletion and a random picker that draws from the entire backlog, regardless of active filters.
- Six sample games on first visit. Changes persist in this browser under `backlog-quest:demo:v1`, including an intentionally empty collection.
- Native modal dialogs provide keyboard focus containment and Escape dismissal.

The interface explicitly labels local demo data. It does not use the existing environment credentials or connect to cloud storage. This demo is device-local and is not a private account collection. Sign-up, login, logout, password recovery, and owner-scoped cloud CRUD remain the next integration milestone.

### Frontend structure

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

- Login interface: implement Supabase Auth sign-up, login, logout, email confirmation, and password recovery in the frontend; configure redirect URLs when development and deployment URLs are known.
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

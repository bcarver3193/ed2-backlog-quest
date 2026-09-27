# Backlog Quest

Backlog Quest is a completed, deployed web application for organizing your video game collection and deciding what to play next. Track your progress, rate games, save notes, and let the random backlog picker choose your next adventure.

**Live app:** [backlog-quest.netlify.app](https://backlog-quest.netlify.app/)

## Demo video

[Demo Video](https://youtu.be/IclGR0k8RNI)

## Features

- **Manage your library:** Add, view, edit, and delete games, with confirmation before deletion.
- **Track progress:** Organize games as Backlog, Playing, Completed, or Dropped, with counts for each status.
- **Save game details:** Record a title, platform, optional integer rating from 1–10, and notes.
- **Find games:** Search titles, filter by status, and toggle alphabetical sorting.
- **Pick your next game:** Randomly select from your entire backlog, regardless of active filters, and move the selected game to Playing.
- **Keep a private cloud library:** Create an account or sign in with email and password to save your collection across sessions and devices. Account features include confirmation resend, password recovery, password changes, and sign-out.
- **Try a local demo:** Explore six sample games without an account. Demo changes persist in the current browser and are separate from account data; they are not automatically imported into a cloud library.
- **Use desktop or mobile:** Responsive layouts, keyboard-accessible dialogs, loading feedback, validation, and retry messages support everyday use.

## Getting started

Visit the [live app](https://backlog-quest.netlify.app/) and create an account, sign in, or try the local demo. Add a game, choose its status, and optionally enter a platform, rating, and notes. Use the library filters to track progress or **Pick my next game** when you need help choosing what to play.

## Technologies

| Technology | Purpose |
| --- | --- |
| React and TypeScript | Component-based interface and typed application logic |
| Vite | Local development server and production builds |
| HTML and CSS | Responsive layouts, styling, and reduced-motion support |
| Lucide React | Interface icons |
| Supabase Auth and PostgreSQL | Email/password accounts and persistent game storage |
| Supabase row level security | Restrict game access to the owning account |
| Browser localStorage | Persistence for the separate local demo |
| Vitest and React Testing Library | Automated application tests |
| Git and GitHub | Version control |
| Netlify | Public website hosting |

## Local setup

### Prerequisites

- Node.js 22.12 or later in a supported release line, with npm.
- A local copy of this repository.
- A Supabase project for account and cloud-library features. The local demo works without Supabase configuration.

### Install and run

From the project directory:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173/`). Without Supabase configuration, use the local demo.

### Enable accounts and cloud storage

1. On a new Supabase project, apply the SQL files in `supabase/migrations/` in filename order: first `20260927043418_create_games.sql`, then `20260927044409_protect_games_with_auth.sql`. See the [database documentation](supabase/README.md) for schema, ownership policies, and database checks.
2. Copy the environment template:

   ```sh
   cp .env.example .env.local
   ```

3. Set these values in `.env.local` using your project's URL and publishable key:

   ```dotenv
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

   Use a publishable key, never a secret or service-role key. Vite exposes these values to the browser. Keep `.env.local` out of version control.

4. Enable email/password authentication and email confirmation in Supabase. Configure email delivery for confirmation and password recovery.
5. In **Authentication → URL Configuration**, set the Site URL to your app's origin and allow its sign-in and recovery return URLs. For this deployment and the default local server, these are:

   ```text
   https://backlog-quest.netlify.app/
   https://backlog-quest.netlify.app/?flow=recovery
   http://localhost:5173/
   http://localhost:5173/?flow=recovery
   ```

   If you use another hostname or port, add its corresponding return URLs.
6. Restart the development server after changing environment values.

## Deployment

The completed app is hosted on [Netlify](https://backlog-quest.netlify.app/). To build and deploy your own copy, use:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Environment variables | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` |

Set the environment variables before building, then configure Supabase's Site URL and allowed return URLs for your deployment. Rebuild after changing Vite environment values because they are included in the production bundle at build time.

## Development and verification

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run typecheck` | Check TypeScript types |
| `npm test` | Run the automated test suite |
| `npm run build` | Type-check and build production assets in `dist/` |
| `npm run preview` | Preview an existing production build locally |

Automated tests cover account flows, collection interactions, demo isolation, validation, loading states, failed requests, and owner-scoped database requests. Application tests use mocked service responses; SQL checks in `supabase/tests/` separately exercise database constraints and account ownership policies.

For deployment verification, check registration and email confirmation, sign-in, game creation and persistence after refresh, editing, search and filtering, random selection, deletion, password recovery, and separate libraries for two accounts. Check the interface on desktop and mobile. Real email delivery and email-link round trips require manual verification with an inbox.

## Project structure

```text
src/
  AccountApp.tsx       Session lifecycle and password recovery
  App.tsx              Library interface, filters, and random picker
  cloudGames.ts        Account-scoped database operations
  games.ts             Game types, sample data, and local demo storage
  supabase.ts          Supabase browser client
  components/          Account forms, game forms, dialogs, and progress feedback
  styles.css           Responsive application styles
supabase/
  migrations/          Database schema and ownership policies
  tests/               SQL constraint and authorization checks
tests/                 Automated application tests
```

The [project specification](spec_doc.md) records the original requirements. The implemented app includes private accounts and alphabetical sorting in addition to the core backlog-management features.


# Backlog Quest

A single-user web application for organizing a video game backlog. The project is currently at the specification stage; application code and service configuration have not yet been created.

The complete requirements are in [spec_doc.md](spec_doc.md).

## Planned stack

- React, Vite, JavaScript, HTML, and CSS for the responsive interface.
- Supabase for persistent cloud database storage.
- Git and GitHub for version control.
- Netlify for public deployment.

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

The initial release has no registration or login. Platform filtering, cover images, external game APIs, sorting, statistics, themes, authentication, and drag-and-drop are optional enhancements after the core application works reliably. Social features, store features, account integrations, achievement tracking, and complex recommendations are out of scope.

## Decisions to resolve during implementation

- Database access: public deployment without login requires an explicit access policy. A shared collection accessible to anonymous visitors is not a private personal collection; decide how writes will be controlled before deployment.
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

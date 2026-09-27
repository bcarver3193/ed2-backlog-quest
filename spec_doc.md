> **Scope update — September 27, 2026:** Supabase authentication is now required, superseding the no-login and authentication-out-of-scope statements below. Each signed-in account has a private collection. Every game has a required `user_id` referencing `auth.users(id)`. Row level security restricts all CRUD operations to that owner. The frontend must support registration, login, logout, and account recovery. Social or shared collections remain out of scope.

```markdown
# Backlog Quest — Application Specification

## 1. Project Overview

**Backlog Quest** is a web application for tracking video games that a user wants to play, is currently playing, has completed, or has decided to stop playing.

The application will allow users to add games to a personal backlog, update their progress, rate completed games, write notes, search and filter their collection, and remove games. It will also include a **"Pick My Next Game"** feature that randomly selects a game from the user's backlog.

The application will use a cloud-hosted database so game data persists between browser sessions.

---

## 2. Project Goals

The primary goals of Backlog Quest are to:

- Provide a simple way to organize a video game backlog.
- Allow users to create, read, update, and delete game records.
- Store game data persistently in a database.
- Allow games to be organized by play status.
- Make it easy to search and filter a game collection.
- Provide a simple random game picker for choosing what to play next.
- Create a clean and easy-to-use web interface.
- Demonstrate the use of AI-assisted software development tools.

---

## 3. Target User

The target user is someone who plays video games and wants a simple way to keep track of:

- Games they plan to play.
- Games they are currently playing.
- Games they have completed.
- Games they have stopped playing.
- Personal ratings and notes about games.

The first version of Backlog Quest is designed as a **single-user application** and will not require account registration or login.

---

## 4. Core Features

### 4.1 Add a Game

Users can add a new game to their collection.

Each game can contain:

- Title
- Platform
- Status
- Rating
- Notes

The game title and status are required.

---

### 4.2 View Games

Users can view all games stored in the database.

Games should clearly display important information such as:

- Title
- Platform
- Status
- Rating, if available

Games may be displayed as cards or in sections based on their current status.

---

### 4.3 Edit a Game

Users can modify an existing game.

Editable fields include:

- Title
- Platform
- Status
- Rating
- Notes

Changes should be saved to the database.

---

### 4.4 Delete a Game

Users can permanently remove a game from their collection.

The application should ask for confirmation before deleting a game to reduce accidental deletions.

---

### 4.5 Game Status

Each game must have one of the following statuses:

- **Backlog** — The user wants to play the game in the future.
- **Playing** — The user is currently playing the game.
- **Completed** — The user has finished the game.
- **Dropped** — The user has stopped playing the game.

Users can change a game's status at any time.

---

### 4.6 Search

Users can search for games by title.

Search results should update based on the user's search query.

Search should be case-insensitive.

---

### 4.7 Filter by Status

Users can filter their collection to show:

- All games
- Backlog
- Playing
- Completed
- Dropped

---

### 4.8 Filter by Platform

If practical, users will also be able to filter games by platform.

Examples include:

- PC
- PlayStation 5
- Xbox Series X/S
- Nintendo Switch
- Other

The platform field should remain flexible enough to support additional platforms.

---

### 4.9 Pick My Next Game

The application will include a **"Pick My Next Game"** button.

When clicked:

1. The application finds all games with a status of `Backlog`.
2. One game is selected randomly.
3. The selected game is displayed to the user.

If there are no games in the backlog, the application should display an appropriate message.

---

## 5. Data Model

The application will use one primary database table named `games`.

### `games` Table

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | UUID | Yes | Unique identifier for each game |
| `title` | Text | Yes | Name of the game |
| `platform` | Text | No | Platform the game is played on |
| `status` | Text | Yes | Current play status |
| `rating` | Integer | No | User rating for the game |
| `notes` | Text | No | Personal notes about the game |
| `created_at` | Timestamp | Yes | Date the game was added |
| `updated_at` | Timestamp | Yes | Date the game was last modified |

### Valid Status Values

```text
Backlog
Playing
Completed
Dropped
```

### Rating

Ratings will use a simple numerical scale:

```text
1–10
```

A rating is optional and is primarily intended for completed games.

---

## 6. CRUD Requirements

The application must demonstrate all four basic CRUD operations.

### Create

Create a new game record and save it to the database.

### Read

Retrieve game records from the database and display them in the application.

### Update

Modify an existing game's information and save the updated record.

### Delete

Remove an existing game from the database.

---

## 7. User Interface

The application should have a simple, responsive interface.

The main page should contain:

- Application title and branding.
- Add Game button.
- Search field.
- Status filter.
- Optional platform filter.
- Game collection.
- Pick My Next Game button.

A possible layout is:

```text
------------------------------------------------------------
 Backlog Quest                               + Add Game
 Track what you're playing and what's next
------------------------------------------------------------
 Search Games...       Status: All       Platform: All
------------------------------------------------------------

 BACKLOG          PLAYING         COMPLETED        DROPPED

 Hollow Knight    Hades           Portal 2         Game A
 Celeste          Elden Ring      Halo
 Outer Wilds

------------------------------------------------------------
                    Pick My Next Game
------------------------------------------------------------
```

---

## 8. Game Form

The Add/Edit Game form should contain:

```text
Title:      [________________________]

Platform:   [________________________]

Status:     [Backlog ▼]

Rating:     [__ / 10]

Notes:
[___________________________________]
[___________________________________]

[Save Game]                     [Cancel]
```

When editing an existing game, the form should be populated with its current information.

---

## 9. Validation

The application should perform basic form validation.

### Required Validation

- Title cannot be empty.
- Status must be one of the supported values.
- Rating, if entered, must be between 1 and 10.

The user should receive a clear message when invalid data is entered.

---

## 10. Error Handling

The application should handle common errors gracefully.

Examples include:

- Database connection failure.
- Failed game creation.
- Failed game update.
- Failed game deletion.
- Empty search results.
- Attempting to randomly select a game when the backlog is empty.

The application should display understandable error messages instead of failing silently.

---

## 11. Authentication

Authentication will **not be included in the initial version** of Backlog Quest.

The application is intended to function as a simple personal game tracker.

User registration and login may be considered as a future enhancement if the application is expanded to support multiple users.

---

## 12. Technology Stack

### Frontend

- React
- Vite
- JavaScript
- HTML
- CSS

### Database / Backend

- Supabase

Supabase will be used to:

- Store game records.
- Retrieve game records.
- Create new records.
- Update existing records.
- Delete records.

### Version Control

- Git
- GitHub

The project will use a public GitHub repository with regular commits showing development progress.

### Deployment

- Netlify

The completed application will be deployed publicly using Netlify.

### Development Assistance

AI-assisted development tools may include:

- ChatGPT
- Cursor
- GitHub Copilot
- Claude Code

AI-generated code will be reviewed, tested, and modified as necessary.

---

## 13. Responsive Design

The application should be usable on both desktop and mobile devices.

The layout may use multiple columns on larger screens and switch to a single-column layout on smaller screens.

The application does not need complex animations or highly advanced visual effects.

The priority is usability and functionality.

---

## 14. Minimum Viable Product

The minimum viable version of Backlog Quest must support:

- Adding games.
- Viewing games.
- Editing games.
- Deleting games.
- Persistent database storage.
- Changing game status.
- Searching by game title.
- Filtering by status.
- Rating games.
- Writing notes.
- Randomly selecting a game from the backlog.
- Public deployment.

These features should be completed before optional features are considered.

---

## 15. Optional Enhancements

The following features may be added only after the core application is complete and working reliably:

- Game cover images.
- External video game API integration.
- Additional sorting options.
- Sorting by rating.
- Sorting by date added.
- Platform filtering.
- Collection statistics.
- Dark/light theme selection.
- User authentication.
- Multiple user accounts.
- Drag-and-drop status management.

These features are not required for the initial release.

---

## 16. Out of Scope

The first version will intentionally avoid:

- Steam account integration.
- PlayStation or Xbox account integration.
- Achievement tracking.
- Multiplayer or social features.
- Friends lists.
- Complex recommendation algorithms.
- Game purchasing or storefront features.
- Real-time multiplayer features.
- Advanced analytics.
- Full game review functionality.
- Multiple-user support.

Keeping these features out of scope will allow development to remain focused on a reliable CRUD application.

---

## 17. Success Criteria

Backlog Quest will be considered complete when a user can:

1. Open the deployed application.
2. Add a new game.
3. See the game appear in the collection.
4. Refresh the page and still see the stored game.
5. Search for a game.
6. Filter games by status.
7. Edit a game's information.
8. Change a game's status.
9. Rate and add notes to a game.
10. Delete a game.
11. Use "Pick My Next Game" to select a random backlog game.
12. Perform these operations through a clear and functional interface.

---

## 18. Demo Requirements

The final demonstration should show the deployed version of the application.

A demonstration sequence may include:

1. Open Backlog Quest on Netlify.
2. Show the existing game collection.
3. Add a new game.
4. Demonstrate that it is stored in the database.
5. Edit the game.
6. Change its status from `Backlog` to `Playing`.
7. Search for a game.
8. Filter the collection.
9. Use the "Pick My Next Game" feature.
10. Delete a game.
11. Briefly explain the application's project structure and database connection.

---

## 19. Development Priorities

Development should follow this general order:

1. Create the React/Vite project.
2. Create the GitHub repository.
3. Build the initial user interface.
4. Create the Supabase database.
5. Connect the application to Supabase.
6. Implement game creation.
7. Implement game retrieval.
8. Implement game editing.
9. Implement game deletion.
10. Add search and filtering.
11. Add the random game picker.
12. Add validation and error handling.
13. Improve responsive styling.
14. Test the complete application.
15. Deploy to Netlify.
16. Complete the README.
17. Record the demonstration video.

---

## 20. Final Project Summary

Backlog Quest is a small, database-backed video game backlog manager designed to demonstrate full CRUD functionality in a simple web application.

Its primary focus is reliable application functionality rather than unnecessary complexity. The project will use React and Vite for the frontend, Supabase for persistent data storage, GitHub for version control, and Netlify for deployment.

The application will be developed with the assistance of AI coding tools while ensuring that generated code is reviewed, tested, and understood before being included in the final project.
```

# Pas'dArt

Pas'dArt is a full-stack dart tournament application built for running real tournament nights with friends.

The app handles player selection, team generation, round-robin scheduling, live standings, tiebreaks, playoffs and the final winner flow — all in one place.

> Built as a personal portfolio project and designed to be used in real Pas'dArt dart nights.

## Features

- Permanent player registry
- Singles and doubles tournaments
- Random team generation
- Support for an odd number of players in doubles
- 301 and 501 game modes
- Configurable best-of format for group stage and playoffs
- Configurable maximum darts
- Single or double round robin
- Support for 1–3 dartboards
- Automatic match scheduling
- Live group standings
- Leg difference tracking
- Castoff support for tied standings
- Manual castoff ordering
- Automatic playoff seeding
- Support for 2-, 3- and 4-team playoff scenarios
- Semifinals and final
- Winner presentation
- Responsive UI for desktop and mobile
- Persistent tournament data with PostgreSQL

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Material UI

### Backend

- Next.js Route Handlers
- PostgreSQL
- Neon
- Drizzle ORM

### Tooling

- Yarn
- Git
- GitHub

## Tournament Flow

```text
Players
  ↓
Create tournament
  ↓
Generate teams
  ↓
Group stage
  ↓
Standings / Castoff
  ↓
Playoffs
  ↓
Final
  ↓
Winner
```

## Local Development

Clone the repository:

```bash
git clone https://github.com/HanssonLucas/Pasdart.git
cd Pasdart
```

Install dependencies:

```bash
yarn
```

Create a `.env.local` file in the project root:

```env
DATABASE_URL=your_postgresql_connection_string
```

Start the development server:

```bash
yarn dev
```

Then open:

```text
http://localhost:3000
```

## Available Scripts

```bash
yarn dev
```

Starts the local development server.

```bash
yarn build
```

Creates a production build.

```bash
yarn start
```

Starts the production server.

```bash
yarn lint
```

Runs the project lint checks.

## Database

Pas'dArt uses PostgreSQL hosted with Neon and Drizzle ORM for schema and database access.

Environment variables are kept outside Git and must not be committed.

## Deployment

Production deployment is planned with Vercel and Neon.

A live demo link will be added here once the first production version is deployed.

## Project Status

**V1 is complete and ready for real-world testing.**

Current focus:

- deployment
- real tournament testing
- collecting feedback
- improving the product based on actual use

Potential future additions include tournament history, statistics and leaderboards.

## Why I Built It

The project started from a real need: our dart group needed a simple way to create teams, organize matches, follow standings and run playoffs without keeping track of everything manually.

That made Pas'dArt a good opportunity to build a complete full-stack application around an actual use case rather than a purely fictional portfolio project.

## Author

**Lucas Hansson**

Frontend developer with full-stack competence.

GitHub: [HanssonLucas](https://github.com/HanssonLucas)

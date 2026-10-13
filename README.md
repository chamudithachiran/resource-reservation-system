# PrimeWave Lab Resource Reservation Management System

A web-based resource reservation management system built to manage users, resources, reservations, reservation approvals, and reporting through a modern dashboard.

## Features

- **Dashboard:** View system statistics and recent reservation activity.
- **Resource Management:** View available resources, capacities, locations, and resource details.
- **Reservation Management:** Create reservations and manage reservation statuses.
- **Conflict Prevention:** Prevent overlapping reservations for the same resource.
- **User Management:** View registered users.
- **Reports:** Review reservation summaries and reporting information.
- **Notifications:** View pending reservation notifications.
- **Settings:** View application information and technology details.
- **API Endpoints:** Access backend functionality through Next.js API routes.

## Technology Stack

- **Frontend:** Next.js App Router, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL
- **ORM:** Prisma ORM
- **PostgreSQL Driver:** `pg` with Prisma PostgreSQL adapter
- **Code Quality:** ESLint
- **Version Control:** Git and GitHub

## Prerequisites

Install the following before running the project:

- Node.js (a version compatible with the project's Next.js requirements)
- npm
- PostgreSQL
- Git

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/chamudithachiran/resource-reservation-system.git
cd resource-reservation-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure PostgreSQL

Create a PostgreSQL database for the application using your PostgreSQL administration tool or SQL client.

### 4. Configure environment variables

Create a `.env` file in the project root and configure the database connection:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME"
```

Replace `USERNAME`, `PASSWORD`, and `DATABASE_NAME` with your local PostgreSQL credentials and database name.

**Important:** Keep `.env` out of version control. Never commit database passwords or other secrets.

### 5. Set up Prisma and the database

Use the Prisma configuration and migration files included in the repository.

Generate the Prisma Client:

```bash
npx prisma generate
```

Apply the existing migrations:

```bash
npx prisma migrate deploy
```

If the project has no migration files yet and you are setting up the development database for the first time, use the project's development migration workflow instead:

```bash
npx prisma migrate dev --name init
```

Use the command appropriate to the current state of the repository; do not create a duplicate initial migration if one already exists.

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create an optimized production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint checks |

## Application Pages

| Route | Description |
|---|---|
| `/` | Dashboard and reservation statistics |
| `/resources` | Resource management |
| `/reservations` | Reservation management |
| `/users` | User management |
| `/reports` | Reports and summaries |
| `/settings` | Application information and settings overview |

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/dashboard` | Retrieve dashboard statistics |
| `GET` | `/api/db-test` | Check database connectivity |
| `GET` | `/api/users` | Retrieve users |
| `GET` | `/api/resources` | Retrieve resources |
| `GET` | `/api/reservations` | Retrieve reservations |
| `POST` | `/api/reservations` | Create a reservation |
| `PATCH` | `/api/reservations/[id]/status` | Update a reservation status |

Refer to the route implementations for the supported request parameters, payloads, and response formats.

## Database Design

The system uses three main entities:

- **User:** Stores user information.
- **Resource:** Stores reservable resources and their details.
- **Reservation:** Connects a user to a resource and stores the reservation time, purpose, and status.

A user can have multiple reservations, and a resource can have multiple reservations over time. Each reservation belongs to one user and one resource.

See the project's Prisma schema for the database model definitions.

## Validation and Reliability

- Validate reservation input and status changes.
- Prevent overlapping reservations for the same resource.
- Return appropriate HTTP status codes for invalid requests and reservation conflicts.
- Use database relationships and indexes to support data integrity and query performance.

## Development Checks

Before submitting changes, run:

```bash
npm run lint
npm run build
```

Both commands should complete successfully.

## Repository

GitHub: https://github.com/chamudithachiran/resource-reservation-system

## License

This project was developed as part of a software engineering assessment.
## ER Diagram

The Entity Relationship Diagram illustrates the relationships between users, resources, and reservations.

![PrimeWave Lab ER Diagram](docs/primewave-er-diagram.svg)

The editable Mermaid source is available at [`docs/primewave-er-diagram.mmd`](docs/primewave-er-diagram.mmd).

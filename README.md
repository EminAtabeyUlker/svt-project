# Student-Advisor Meeting and Project Tracking System

Course project for **SE 342 Software Validation and Testing** at Maltepe University.

Students in graduation projects and similar work usually keep meeting plans, tasks, submitted files and advisor feedback in different places. This system brings them together: students form groups, request meetings and upload their work; advisors open meeting slots, assign tasks with deadlines and approve submissions or ask for revisions. Every version and every comment is kept.

The work is planned and tracked in Jira in one-week sprints.

| Sprint | Dates | Work |
|---|---|---|
| Sprint 1 | 21.10.2026 - 28.10.2026 | Requirements analysis (FR, NFR, business rules, open questions) |
| Sprint 2 | 28.10.2026 - 04.11.2026 | Jira reorganization, UML diagrams and ERD |
| Sprint 3 | 04.11.2026 - 11.11.2026 | PostgreSQL database |
| Sprint 4 | 11.11.2026 - 18.11.2026 | Application project, database connection, models, GitHub integration |

## Tech stack

- Node.js and TypeScript
- PostgreSQL, accessed with the `pg` driver
- `dotenv` for local settings

## Project structure

```
src/
  config/database.ts      database connection (connection pool)
  models/                 one class per table, plus the ENUM types
  repositories/           loads rows from a table and turns them into model objects
  index.ts                connects, loads every table through its model, prints a summary
docs/
  database/               SQL script that creates the database, and constraint tests
  diagrams/               high level, context, use case, state machine and ER diagrams
```

## Models

| Model | Table | Requirements |
|---|---|---|
| UserAccount | user_account | FR-20, NFR-01 |
| ProjectGroup | project_group | FR-01, FR-03, FR-04, BR-01, BR-03 |
| GroupMembership | group_membership | FR-02, BR-02 |
| MeetingSlot | meeting_slot | FR-06, BR-05 |
| MeetingRequest | meeting_request | FR-07 to FR-10, BR-04 |
| Task | task | FR-11 to FR-14 |
| Submission | submission | FR-15, FR-18, FR-19, Q-03, Q-04 |
| Feedback | feedback | FR-16, FR-17, BR-07 |

Each model has a `fromRow` method that maps a database row to an object, and small methods for the rules that belong to it, for example `Task.isOverdue()` (FR-14) and `Feedback.isValid()` (BR-07).

## Running the project

1. Install Node.js (LTS) and PostgreSQL.
2. Create a database named `svt_project_db` and run `docs/database/svt_database.sql` in it.
3. Copy `.env.example` to `.env` and write your PostgreSQL password into `DB_PASSWORD`.
4. Install the packages and start:

```
npm install
npm start
```

The program prints the PostgreSQL version, the number of records loaded through each model, the groups with their advisor and students, and the overdue tasks.

## Diagrams

| | |
|---|---|
| High level design | [docs/diagrams/1-high-level-diagram.png](docs/diagrams/1-high-level-diagram.png) |
| Context diagram | [docs/diagrams/2-context-diagram.png](docs/diagrams/2-context-diagram.png) |
| Use case diagram | [docs/diagrams/3-use-case-diagram.png](docs/diagrams/3-use-case-diagram.png) |
| State machine diagram | [docs/diagrams/4-state-machine-diagram.png](docs/diagrams/4-state-machine-diagram.png) |
| ER diagram | [docs/diagrams/5-erd-diagram.png](docs/diagrams/5-erd-diagram.png) |

# AGENTS.md

## Direct PostgreSQL Backend

This project uses a direct, standalone PostgreSQL database managed via Prisma ORM for EduSuite Pro CMS ERP.

- **Database:** PostgreSQL (`edusuite_db`) listening on `localhost:5433`
- **ORM:** Prisma ORM (`@prisma/client`)
- **Backend Architecture:** Express.js REST API server with JWT authentication and server-side RBAC
- **Credentials:** Backend reads configuration from `.env` (`DATABASE_URL`, `JWT_SECRET`, `PORT`). Never hardcode or commit keys.

Key patterns:
- Database CRUD is performed via `prisma.<model>.<action>()`.
- Server-side RBAC and authentication are enforced via `authenticateToken` and `requireSuperAdmin` middleware.

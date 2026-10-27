# Re-usable Backend

A reusable TypeScript backend template built with Express, Prisma, PostgreSQL, JWT authentication, HTTP-only cookies, email verification, password reset, refresh-token session rotation, event-driven auth email dispatch, and a layered module structure.

The project currently exposes authentication and user-profile APIs under `/api/v1`.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Status](#project-status)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Authentication Flow](#authentication-flow)
- [Response Format](#response-format)
- [Error Format](#error-format)
- [Validation Rules](#validation-rules)
- [Security Notes](#security-notes)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Build and Production Run](#build-and-production-run)
- [Deployment Notes](#deployment-notes)
- [Troubleshooting](#troubleshooting)
- [Known Gaps and Future Improvements](#known-gaps-and-future-improvements)
- [License](#license)

## Features

- Express 5 API server.
- Strict TypeScript configuration.
- ESM runtime with `NodeNext` module resolution.
- PostgreSQL database access through Prisma 7 and the Prisma PostgreSQL adapter.
- Layered backend structure:
  - routes
  - controllers
  - services
  - repositories
  - domain entities
  - DTOs
  - mappers
  - infrastructure adapters
- User registration.
- Email verification token generation and validation.
- Login with password hashing.
- JWT access tokens.
- JWT refresh tokens.
- Refresh-token persistence in a `Session` table.
- Refresh-token rotation.
- Refresh-token family revocation when reused/revoked tokens are detected.
- Logout by revoking the current refresh-token session.
- Forgot-password email flow.
- Password reset flow.
- Password reset success notification email.
- Password reset revokes all active user sessions.
- Current-user endpoint.
- User profile update endpoint.
- Role model with `USER`, `ADMIN`, and `MODERATOR`.
- Auth middleware that accepts either:
  - `Authorization: Bearer <accessToken>`
  - `accessToken` HTTP-only cookie
- Admin/moderator helper middleware available for future routes.
- Email sending with Nodemailer.
- Email retry wrapper with exponential-style retry support.
- Event-driven auth email dispatch for registration, resend verification, forgot password, and reset-success notifications.
- Central environment validation with Zod.
- Request body validation with Zod.
- Central success response helper.
- Central error handler.
- 404 handler.
- Pino logging with pretty logs in development.
- Graceful shutdown on `SIGTERM` and `SIGINT`.
- Query builder utility for pagination/sorting support in future list endpoints.

## Tech Stack

- Runtime: Node.js
- Language: TypeScript
- Framework: Express
- Database: PostgreSQL
- ORM: Prisma
- Validation: Zod
- Authentication: JSON Web Tokens
- Password hashing: bcryptjs
- Email: Nodemailer
- Events: Node.js EventEmitter
- Logging: Pino and pino-pretty
- Development runner: tsx
- Build tools: TypeScript compiler and tsc-alias

## Project Status

This repository is a backend template and currently includes auth and basic user profile functionality.

Current API modules:

- `auth`
- `users`

Current database models:

- `User`
- `Session`

Current test status:

- The `npm test` script is still a placeholder and exits with an error.

## Requirements

Install these before running the project:

- Node.js 20 or newer recommended.
- npm.
- PostgreSQL database.
- A Gmail account or compatible Gmail app password setup for Nodemailer, because the current mail transport uses `service: "gmail"`.

The repository was inspected with:

- Node.js `v24.12.0`
- npm `11.16.0`

Older versions may work, but Node 20+ is a practical baseline for this TypeScript/ESM setup.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

If `.env.example` does not exist yet, create `.env` manually using the variables listed in [Environment Variables](#environment-variables).

3. Generate strong JWT secrets:

```bash
openssl rand -hex 32
openssl rand -hex 32
```

Use one value for `JWT_ACCESS_SECRET` and the other for `JWT_REFRESH_SECRET`.

4. Configure PostgreSQL and set `DATABASE_URL`.

Example:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reusable_backend"
```

5. Generate the Prisma client:

```bash
npx prisma generate
```

6. Run database migrations:

```bash
npx prisma migrate dev
```

7. Start the development server:

```bash
npm run dev
```

By default, the server listens on:

```text
http://localhost:5000
```

## Environment Variables

The app validates environment variables in `src/config/env.ts` before the server starts. Missing or invalid required values will stop the process.

Create a `.env` file in the project root:

```env
PORT=5000
NODE_ENV=development
LOG_LEVEL=info

DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

JWT_ACCESS_SECRET="replace-with-a-long-random-secret"
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET="replace-with-another-long-random-secret"
JWT_REFRESH_EXPIRES=7d
COOKIE_EXPIRES_DAYS=7

EMAIL_USER="your-gmail-address@gmail.com"
EMAIL_PASS="your-gmail-app-password"
EMAIL_FROM="Your App <your-gmail-address@gmail.com>"

FRONTEND_URL="http://localhost:3000"
```

Variable reference:

| Variable              | Required | Default       | Description                                                                                                      |
| --------------------- | -------- | ------------- | ---------------------------------------------------------------------------------------------------------------- |
| `PORT`                | No       | `5000`        | HTTP server port.                                                                                                |
| `NODE_ENV`            | No       | `development` | Must be `development`, `production`, or `test`.                                                                  |
| `LOG_LEVEL`           | No       | `info`        | Must be `fatal`, `error`, `warn`, `info`, or `debug`.                                                            |
| `DATABASE_URL`        | Yes      | None          | PostgreSQL connection string used by Prisma and `pg`.                                                            |
| `JWT_ACCESS_SECRET`   | Yes      | None          | Secret used to sign access tokens. Must be at least 8 characters. Use a much longer random value in real apps.   |
| `JWT_ACCESS_EXPIRES`  | No       | `15m`         | Access-token expiry passed to `jsonwebtoken`.                                                                    |
| `JWT_REFRESH_SECRET`  | Yes      | None          | Secret used to sign refresh tokens. Must be at least 8 characters. Use a different value from the access secret. |
| `JWT_REFRESH_EXPIRES` | No       | `7d`          | Refresh-token expiry passed to `jsonwebtoken`.                                                                   |
| `COOKIE_EXPIRES_DAYS` | No       | `7`           | Refresh cookie max age in days. Must be at least `1`.                                                            |
| `EMAIL_USER`          | Yes      | None          | Gmail address used by Nodemailer.                                                                                |
| `EMAIL_PASS`          | Yes      | None          | Gmail password or app password. An app password is recommended.                                                  |
| `EMAIL_FROM`          | Yes      | None          | Sender shown on outbound email.                                                                                  |
| `FRONTEND_URL`        | Yes      | None          | Frontend base URL used to generate verification and reset links.                                                 |

Do not commit `.env` files. They are ignored by `.gitignore`.

## Database Setup

The project uses PostgreSQL through Prisma 7 with the `@prisma/adapter-pg` adapter.

Prisma files:

- Schema: `prisma/schema.prisma`
- Migrations: `prisma/migrations`
- Generated client output: `src/generated/prisma`

The generated Prisma client is intentionally ignored by Git:

```text
/src/generated/prisma
```

Generate it after installing dependencies:

```bash
npx prisma generate
```

Apply migrations locally:

```bash
npx prisma migrate dev
```

Apply migrations in production or CI:

```bash
npx prisma migrate deploy
```

Open Prisma Studio:

```bash
npx prisma studio
```

### Current Schema

`User` fields:

- `id`
- `email`
- `password`
- `name`
- `role`
- `isVerified`
- `isBanned`
- `refreshToken`
- `passwordResetToken`
- `passwordResetExpires`
- `emailVerificationToken`
- `emailVerificationExpires`
- `sessions`

`Session` fields:

- `id`
- `userId`
- `tokenHash`
- `familyId`
- `jti`
- `userAgent`
- `ipAddress`
- `isRevoked`
- `expires`
- `createdAt`

Roles:

- `USER`
- `ADMIN`
- `MODERATOR`

Note: `User.refreshToken` remains in the schema, but the current implementation uses the `Session` table for refresh-token storage and rotation.

## Available Scripts

| Command         | Description                                                              |
| --------------- | ------------------------------------------------------------------------ |
| `npm run dev`   | Starts the development server with `tsx watch src/server.ts`.            |
| `npm run clean` | Deletes the `dist` directory.                                            |
| `npm run build` | Compiles TypeScript and rewrites path aliases with `tsc-alias`.          |
| `npm start`     | Runs the compiled server from `dist/server.js`.                          |
| `npm test`      | Placeholder script. Currently prints an error and exits with status `1`. |

Useful Prisma commands:

| Command                     | Description                                              |
| --------------------------- | -------------------------------------------------------- |
| `npx prisma generate`       | Generates the Prisma client into `src/generated/prisma`. |
| `npx prisma migrate dev`    | Creates/applies local development migrations.            |
| `npx prisma migrate deploy` | Applies existing migrations in production/CI.            |
| `npx prisma studio`         | Opens Prisma Studio.                                     |

## Project Structure

```text
.
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── common/
│   │   ├── constants/
│   │   ├── interfaces/
│   │   ├── middleware/
│   │   ├── types/
│   │   └── utils/
│   ├── config/
│   ├── infrastructure/
│   │   ├── email/
│   │   ├── events/
│   │   ├── repositories/
│   │   ├── security/
│   │   ├── services/
│   │   └── db.ts
│   ├── lib/
│   └── modules/
│       ├── auth/
│       └── users/
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

Important files:

| File                                                         | Purpose                                                                                       |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `src/server.ts`                                              | Connects to the database, starts Express, and registers graceful shutdown.                    |
| `src/app.ts`                                                 | Creates the Express app, middleware, routes, 404 handling, and error handling.                |
| `src/config/env.ts`                                          | Loads and validates environment variables.                                                    |
| `src/config/mailer.ts`                                       | Creates the Nodemailer Gmail transport.                                                       |
| `src/config/shutdown.ts`                                     | Handles graceful shutdown.                                                                    |
| `src/infrastructure/db.ts`                                   | Creates the PostgreSQL pool, Prisma adapter, Prisma client, and database connection check.    |
| `src/lib/logger.ts`                                          | Configures Pino logging.                                                                      |
| `src/common/middleware/auth.middleware.ts`                   | Access-token protection and role helper middleware.                                           |
| `src/common/middleware/validation.middleware.ts`             | Zod request-body validation middleware.                                                       |
| `src/common/middleware/error.middleware.ts`                  | Central error response handler.                                                               |
| `src/common/interfaces/event-emitter.interface.ts`           | Typed auth event payloads and event-emitter contract.                                         |
| `src/common/utils/cookies.ts`                                | HTTP-only auth cookie helper.                                                                 |
| `src/common/utils/jwt.ts`                                    | JWT signing helpers.                                                                          |
| `src/common/utils/queryBuilder.ts`                           | Pagination and sorting helper.                                                                |
| `src/infrastructure/events/node-event-emitter.ts`            | Node.js EventEmitter adapter with async listener error logging.                               |
| `src/infrastructure/events/listeners/auth-event.listener.ts` | Sends auth-related emails from emitted auth events.                                           |
| `src/modules/auth`                                           | Auth routes, controller, service, repository, DTOs, mappers, domain entities, and constants.  |
| `src/modules/users`                                          | User routes, controller, service, repository, DTOs, mappers, domain entities, and validation. |

## Architecture

The codebase follows a layered module style.

Request flow:

```text
HTTP request
  -> Express route
  -> validation middleware
  -> auth middleware when required
  -> controller
  -> service
  -> repository
  -> Prisma/PostgreSQL
  -> mapper
  -> API response
```

Layer responsibilities:

| Layer          | Responsibility                                                                     |
| -------------- | ---------------------------------------------------------------------------------- |
| Route          | Declares HTTP method/path and route-specific middleware.                           |
| Validation     | Validates request body with Zod.                                                   |
| Controller     | Reads request data, calls services, sets cookies, returns HTTP responses.          |
| Service        | Holds business rules and security workflows.                                       |
| Repository     | Handles database access.                                                           |
| Domain entity  | Represents internal application data shape.                                        |
| DTO            | Represents request/response data contracts.                                        |
| Mapper         | Converts Prisma records to domain entities or safe API responses.                  |
| Infrastructure | Implements external concerns such as hashing, JWT, email, events, DB, and logging. |

Auth email side effects are dispatched through an in-process event emitter. The auth service stores the required tokens/state, emits an event, and returns the API response without waiting for SMTP delivery. The listener in `src/infrastructure/events/listeners/auth-event.listener.ts` sends the email in the background and logs listener errors through Pino.

Current auth email events:

| Event                 | Emitted by                | Listener action                                      |
| --------------------- | ------------------------- | ---------------------------------------------------- |
| `user.registered`     | `registerUser`            | Sends the first email verification link.             |
| `resend.verification` | `resendVerificationEmail` | Sends a new email verification link.                 |
| `forgot.password`     | `forgotPassword`          | Sends the password reset link.                       |
| `reset.success`       | `resetPassword`           | Sends a password-change confirmation/security email. |

Path aliases are configured in `tsconfig.json`:

```text
@common/*
@config/*
@infrastructure/*
@lib/*
@modules/*
@generated/*
```

The build uses `tsc-alias` so compiled output can resolve these aliases.

## API Reference

Base URL:

```text
http://localhost:5000/api/v1
```

### Health Check

There is currently no explicit health-check endpoint.

Unknown routes return a 404 through the global `notFound` middleware.

### Auth: Register

```http
POST /api/v1/auth/register
Content-Type: application/json
```

Body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password1"
}
```

Success:

- Status: `201`
- Emits `user.registered` so the verification email is sent by the auth email listener.
- Does not set auth cookies.

Example:

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"Password1"}'
```

Notes:

- Password must be at least 6 characters.
- Password must contain at least one uppercase letter.
- Password must contain at least one number.
- Duplicate email returns a bad-request error.
- The verification link is generated as `${FRONTEND_URL}/verify-email/<token>`.
- The API response is not blocked by SMTP delivery.

### Auth: Login

```http
POST /api/v1/auth/login
Content-Type: application/json
```

Body:

```json
{
  "email": "jane@example.com",
  "password": "Password1"
}
```

Success:

- Status: `200`
- Sets `accessToken` HTTP-only cookie.
- Sets `refreshToken` HTTP-only cookie.
- Creates a `Session` row for the refresh token.

Example:

```bash
curl -i -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"Password1"}'
```

### Auth: Verify Email

```http
GET /api/v1/auth/verify-email?token=<raw-token>
```

Success:

- Status: `200`
- Marks the user as verified.
- Clears email verification token fields.
- Sets `accessToken` HTTP-only cookie.
- Sets `refreshToken` HTTP-only cookie.
- Creates a `Session` row.

Example:

```bash
curl -i "http://localhost:5000/api/v1/auth/verify-email?token=RAW_TOKEN"
```

Important frontend note:

- The backend email currently links to `${FRONTEND_URL}/verify-email/<token>`.
- Your frontend should read that route parameter and call this backend endpoint with `?token=<token>`.

### Auth: Resend Verification Email

```http
POST /api/v1/auth/resend-verification
Content-Type: application/json
```

Body:

```json
{
  "email": "jane@example.com"
}
```

Success:

- Status: `200`
- Generates a new verification token.
- Emits `resend.verification` so the new verification email is sent by the auth email listener.
- The API response is not blocked by SMTP delivery.

Example:

```bash
curl -X POST http://localhost:5000/api/v1/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com"}'
```

### Auth: Refresh Token

```http
GET /api/v1/auth/refresh
Cookie: refreshToken=<refresh-token>
```

Success:

- Status: `200`
- Verifies the refresh token.
- Checks the `Session` row by `jti`.
- Revokes the old session.
- Creates a new session in the same token family.
- Sets new `accessToken` and `refreshToken` HTTP-only cookies.

Example:

```bash
curl -i http://localhost:5000/api/v1/auth/refresh \
  --cookie "refreshToken=REFRESH_TOKEN"
```

### Auth: Forgot Password

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json
```

Body:

```json
{
  "email": "jane@example.com"
}
```

Success:

- Status: `200`
- Emits `forgot.password` so the password reset email is sent by the auth email listener when the account exists.
- Also returns success when the account does not exist, to reduce account enumeration risk.
- The API response is not blocked by SMTP delivery.

Example:

```bash
curl -X POST http://localhost:5000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com"}'
```

### Auth: Reset Password

```http
POST /api/v1/auth/reset-password?token=<raw-token>
Content-Type: application/json
```

Body:

```json
{
  "newPassword": "NewPassword1"
}
```

Success:

- Status: `200`
- Hashes and stores the new password.
- Clears password reset token fields.
- Revokes all active sessions for the user.
- Emits `reset.success` so a password-change confirmation/security email is sent by the auth email listener.
- The API response is not blocked by SMTP delivery.

Example:

```bash
curl -X POST "http://localhost:5000/api/v1/auth/reset-password?token=RAW_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newPassword":"NewPassword1"}'
```

Important frontend note:

- The backend email currently links to `${FRONTEND_URL}/reset-password/<token>`.
- Your frontend should read that route parameter and call this backend endpoint with `?token=<token>`.

### Auth: Me

```http
GET /api/v1/auth/me
Authorization: Bearer <access-token>
```

or:

```http
GET /api/v1/auth/me
Cookie: accessToken=<access-token>
```

Success:

- Status: `200`
- Returns the authenticated user.

Example:

```bash
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

### Auth: Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer <access-token>
Cookie: refreshToken=<refresh-token>
```

Success:

- Status: `200`
- Revokes the current refresh session when a valid refresh token is present.
- Clears `accessToken` and `refreshToken` cookies.

Example:

```bash
curl -i -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  --cookie "refreshToken=REFRESH_TOKEN"
```

### User: Update Profile

```http
PATCH /api/v1/user/profile
Authorization: Bearer <access-token>
Content-Type: application/json
```

Body:

```json
{
  "name": "Jane Updated"
}
```

Success:

- Status: `200`
- Updates the authenticated user's `name`.

Example:

```bash
curl -X PATCH http://localhost:5000/api/v1/user/profile \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Updated"}'
```

## Authentication Flow

### Registration and Verification

1. Client calls `POST /api/v1/auth/register`.
2. Backend hashes the password with bcrypt.
3. Backend creates a random email verification token.
4. Backend stores only the hashed verification token.
5. Backend emits `user.registered` with the raw token.
6. Auth email listener sends the raw token inside a frontend URL.
7. User opens the frontend verification URL.
8. Frontend calls `GET /api/v1/auth/verify-email?token=<token>`.
9. Backend hashes the incoming token and finds a matching non-expired record.
10. Backend marks the user verified.
11. Backend creates access and refresh tokens.
12. Backend stores the hashed refresh token in `Session`.
13. Backend sets auth cookies.

### Login

1. Client calls `POST /api/v1/auth/login`.
2. Backend finds the user by email.
3. Backend compares password with bcrypt.
4. Backend rejects banned users.
5. Backend creates:
   - access token
   - refresh token
   - `jti`
   - `familyId`
6. Backend hashes and stores the refresh token in `Session`.
7. Backend sets auth cookies.

### Refresh Rotation

1. Client calls `GET /api/v1/auth/refresh` with the refresh cookie.
2. Backend verifies the refresh JWT.
3. Backend looks up the session by `jti`.
4. Backend compares the stored hash with the incoming refresh token hash.
5. Backend rejects expired, mismatched, revoked, or banned-user sessions.
6. Backend revokes the old session and creates the new session in one transaction.
7. Backend sets new auth cookies.

If a revoked session is used again, the backend revokes every session in that token family.

### Logout

1. Client calls `POST /api/v1/auth/logout`.
2. Backend verifies the refresh token if present.
3. Backend revokes the matching session.
4. Backend clears auth cookies.

### Password Reset

1. Client calls `POST /api/v1/auth/forgot-password`.
2. Backend generates and stores a hashed reset token.
3. Backend emits `forgot.password` with the raw token.
4. Auth email listener sends the raw token inside a frontend URL.
5. Frontend calls `POST /api/v1/auth/reset-password?token=<token>`.
6. Backend hashes the incoming token and checks expiry.
7. Backend hashes the new password.
8. Backend clears reset token fields.
9. Backend revokes all sessions for the user.
10. Backend emits `reset.success` for a password-change confirmation/security email.

## Response Format

Successful responses use `ApiResponse.success`.

General shape:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Auth/user response shape:

```json
{
  "success": true,
  "message": "Successfully logged in",
  "data": {
    "user": {
      "id": "uuid",
      "email": "jane@example.com",
      "name": "Jane Doe",
      "role": "USER",
      "isBanned": false,
      "isVerified": true
    }
  }
}
```

Sensitive fields are not returned by mappers:

- password
- refresh token hash
- password reset token
- email verification token

## Error Format

Validation errors return:

```json
{
  "status": "fail",
  "message": "validation error message"
}
```

Application errors in development return:

```json
{
  "status": "error",
  "message": "error message",
  "stack": "stack trace"
}
```

Application errors outside development return:

```json
{
  "status": "error",
  "message": "error message"
}
```

For `401` and `403` errors outside development, the global error handler clears `accessToken` and `refreshToken` cookies.

## Validation Rules

### Registration

```json
{
  "name": "string, minimum 2 characters",
  "email": "valid email",
  "password": "6-50 chars, at least one uppercase letter, at least one number"
}
```

### Login

```json
{
  "email": "valid email",
  "password": "6-50 chars, at least one uppercase letter, at least one number"
}
```

### Forgot Password

```json
{
  "email": "valid email"
}
```

### Reset Password

```json
{
  "newPassword": "6-50 chars, at least one uppercase letter, at least one number"
}
```

### Resend Verification

```json
{
  "email": "valid email"
}
```

### Update Profile

```json
{
  "name": "string, minimum 2 characters"
}
```

## Security Notes

Implemented:

- Passwords are hashed using bcryptjs.
- Access and refresh tokens use separate secrets.
- Tokens are sent through HTTP-only cookies on login, verification, and refresh.
- Cookies use `sameSite: "strict"`.
- Cookies use `secure: true` in production.
- Refresh tokens are hashed before storage.
- Refresh tokens include `jti` and `familyId`.
- Refresh token rotation revokes the previous session.
- Reuse of a revoked session revokes the full token family.
- Banned users are blocked by login, refresh, and protected-route middleware.
- Password reset revokes all active user sessions.
- Forgot-password flow avoids revealing whether an email exists.
- Request body size is limited to `100kb`.
- Environment variables are validated before startup.

Important operational notes:

- Use strong, different values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.
- Keep `.env` out of Git.
- Use a Gmail app password instead of your normal Gmail password.
- Set `NODE_ENV=production` in production so cookies are marked `secure`.
- Run the app only behind HTTPS in production.
- CORS is not currently configured. If a browser frontend is hosted on a different origin, add and configure CORS intentionally.
- CSRF token middleware is not currently active. Cookies use `sameSite: "strict"`, but browser-based apps may still need a fuller CSRF strategy depending on deployment.
- Rate limiting is not currently active. Add rate limits for login, resend verification, forgot password, and reset password before public production use.
- Helmet/security headers are not currently configured.
- `userAgent` and `ipAddress` fields exist on sessions, but login currently stores them as `null`.

## Development Workflow

Typical local workflow:

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

When the Prisma schema changes:

```bash
npx prisma migrate dev --name describe_change_here
npx prisma generate
```

Before pushing changes:

```bash
npm run build
```

Optional manual API testing can be done with:

- curl
- Postman
- Insomnia
- Thunder Client
- REST Client extensions

## Testing

Automated tests are not implemented yet.

Current `package.json` test script:

```bash
npm test
```

This currently prints:

```text
Error: no test specified
```

Recommended test coverage to add:

- Unit tests for services.
- Unit tests for token hashing/signing behavior.
- Unit tests for mappers.
- Integration tests for auth endpoints.
- Integration tests for refresh-token rotation.
- Integration tests for revoked-token reuse detection.
- Integration tests for password reset session revocation.
- Validation tests for all Zod schemas.
- Middleware tests for `protect`, `isAdmin`, and `isModerator`.

Suggested tooling:

- Vitest or Jest
- Supertest for Express routes
- Test database with isolated migrations

## Build and Production Run

Build:

```bash
npm run build
```

Start compiled server:

```bash
npm start
```

Production startup checklist:

1. Install production dependencies.
2. Set all required environment variables.
3. Run `npx prisma generate`.
4. Run `npx prisma migrate deploy`.
5. Run `npm run build`.
6. Start with `npm start`.

## Deployment Notes

At minimum, a deployment environment needs:

- Node.js runtime.
- PostgreSQL database.
- Environment variables from this README.
- Network access from the app to the database.
- Email credentials for Nodemailer.
- HTTPS in front of the app for secure cookies.

For platforms such as Render, Railway, Fly.io, Heroku, or a VPS:

- Set `NODE_ENV=production`.
- Set `PORT` to the platform-provided port when required.
- Set `DATABASE_URL` to the production database connection string.
- Run migrations during release/deploy with `npx prisma migrate deploy`.
- Generate Prisma client before build or during install.
- Keep `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` stable across deploys so existing sessions are not invalidated unexpectedly.

## Troubleshooting

### Invalid environment configurations

The app validates environment variables on startup. Check that:

- `DATABASE_URL` is a valid URL.
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are at least 8 characters.
- `EMAIL_USER` is a valid email.
- `EMAIL_PASS` is not empty.
- `FRONTEND_URL` is a valid URL.
- `NODE_ENV` is one of `development`, `production`, or `test`.

### Cannot connect to database

Check:

- PostgreSQL is running.
- The database exists.
- `DATABASE_URL` has the right username, password, host, port, and database name.
- The database accepts connections from your app environment.

### Prisma client import errors

The generated Prisma client lives in `src/generated/prisma` and is ignored by Git.

Run:

```bash
npx prisma generate
```

### Migrations not applied

For local development:

```bash
npx prisma migrate dev
```

For production:

```bash
npx prisma migrate deploy
```

### Emails are not sending

Check:

- `EMAIL_USER` is correct.
- `EMAIL_PASS` is a Gmail app password.
- Gmail account security settings allow app-password usage.
- `EMAIL_FROM` is set.
- Network access to Gmail SMTP is available.

### Cookies are not set in the browser

Check:

- In production, cookies are `secure`, so the app must be served over HTTPS.
- Cookies use `sameSite: "strict"`, so cross-site browser flows may not include them.
- If frontend and backend run on different origins, configure CORS and credentials intentionally.

### Protected routes return unauthorized

Send either:

```http
Authorization: Bearer <access-token>
```

or include the `accessToken` cookie.

### Verification or reset link opens frontend but backend does nothing

This is expected with the current design. The email links point to `FRONTEND_URL`.

The frontend must extract the token and call:

```text
GET /api/v1/auth/verify-email?token=<token>
POST /api/v1/auth/reset-password?token=<token>
```

## Known Gaps and Future Improvements

Recommended improvements before using this as a public production backend:

- Add automated tests.
- Add a real `npm test` script.
- Add an explicit health-check endpoint, for example `GET /health`.
- Add CORS configuration for browser clients.
- Add rate limiting for auth-sensitive routes.
- Add Helmet or equivalent HTTP security headers.
- Add CSRF protection if cookie-based browser auth is used across sensitive workflows.
- Store `userAgent` and `ipAddress` when creating sessions.
- Add session listing and session revocation APIs.
- Add change-password endpoint or remove the unused `changePasswordSchema`.
- Add admin routes that use `isAdmin` and moderator routes that use `isModerator`.
- Add email templates instead of inline HTML strings.
- Add centralized API docs with OpenAPI/Swagger.
- Add Dockerfile and docker-compose for local PostgreSQL.
- Add seed scripts for local development.
- Add CI checks for build, lint, test, and migration validation.
- Add linting and formatting tools.
- Add request IDs for better log correlation.
- Add structured audit logs for auth events.
- Consider removing the legacy `User.refreshToken` column if all refresh state is session-based.

## License

This project is licensed under the ISC license, as declared in `package.json`.

## Author

`govergu`

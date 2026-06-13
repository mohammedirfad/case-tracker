# Mini Case Tracker

A TypeScript MERN case-management app for a small operations team. Managers create and assign cases, agents upload evidence and submit work, and managers close submissions as `Cleared` or `Discrepant`.

## Stack

- React + Vite + TypeScript + MUI
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT auth, Joi backend validation, custom frontend validation hook
- Local file uploads through Multer

## Features

- JWT login with role-based access for managers and agents; public signup creates agent accounts
- Server-enforced status flow: `New -> Assigned -> In Progress -> Submitted -> Cleared / Discrepant`
- Audit log for every status change
- Case search, status filter, agent filter, pagination, and dashboard stat tiles
- Case detail page with timeline, comments, documents, assignment, review, and agent submission actions
- Global backend error handler and clear API error messages
- Automatic frontend redirect to sign in when a token expires

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Copy environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Start MongoDB locally, or set `MONGODB_URI` in `server/.env` to MongoDB Atlas.

4. Seed demo data:

```bash
npm run seed
```

5. Run both apps:

```bash
npm run dev
```

Frontend: http://localhost:5173  
Backend health: http://localhost:5000/health

## Test Credentials

Manager:

- Email: `manager@example.com`
- Password: `Password123!`

Agent:

- Email: `agent@example.com`
- Password: `Password123!`

## Environment

Server variables are documented in [server/.env.example](server/.env.example). Client variables are documented in [client/.env.example](client/.env.example).

## API Notes

- `POST /api/auth/login`
- `POST /api/auth/signup`
- `GET /api/cases`
- `POST /api/cases`
- `GET /api/cases/:id`
- `POST /api/cases/:id/assign`
- `POST /api/cases/:id/start`
- `POST /api/cases/:id/submit`
- `POST /api/cases/:id/review`
- `POST /api/cases/:id/comments`
- `POST /api/cases/:id/documents`
- `GET /api/users/agents`

## Assumptions

- Local upload storage is acceptable for the take-home task. Production deployment should use durable object storage.
- Agents can upload evidence while a case is `Assigned` or `In Progress`.
- A submitted case requires at least one uploaded document.
- Final states are terminal in this version.

## Deployment

- Frontend: Vercel or Netlify. Set `VITE_API_URL` to the deployed API URL ending in `/api`.
- Backend: Render, Railway, or Fly.io. Set `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, and `UPLOAD_DIR`.
- Database: MongoDB Atlas free tier.

## Docker

The server includes a Dockerfile:

```bash
docker build -t mini-case-tracker-api ./server
docker run --env-file ./server/.env -p 5000:5000 mini-case-tracker-api
```

## Rough Hours Spent

Approximately 8-10 focused hours for the complete implementation, verification, and documentation.

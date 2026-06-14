# Mini Case Tracker

A TypeScript MERN case tracker for a small ops team. Managers create and assign cases, agents upload evidence and submit work, and managers close submitted cases as `Cleared` or `Discrepant`.

## Live App Checklist

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- API docs: Swagger at `/api/docs`

## Tech Stack

- React, Vite, TypeScript, MUI
- Node.js, Express, TypeScript
- MongoDB, Mongoose
- JWT auth and role-based access
- Joi server-side validation
- Multer local file uploads
- Swagger/OpenAPI API documentation

## Core Features

- Manager and Agent roles
- JWT login and agent signup
- Manager creates, assigns, reviews, and closes cases
- Agent sees only assigned cases
- Agent uploads documents/photos, comments, starts work, and submits cases
- Server-enforced status flow: `New -> Assigned -> In Progress -> Submitted -> Cleared / Discrepant`
- Audit log for every status transition
- Search, status filter, agent filter, pagination
- Case detail page with timeline, documents, comments, and workflow actions
- Global API error handler and frontend toast messages
- Automatic redirect to login when JWT expires

## Clone And Run In Under 10 Minutes

### Prerequisites

- Node.js 20+
- npm
- MongoDB running locally, or a MongoDB Atlas connection string

On Windows PowerShell, use `npm.cmd` if `npm` is blocked by execution policy.

### 1. Clone

```bash
git clone https://github.com/mohammedirfad/case-tracker.git
cd case-tracker
```

### 2. Install

```bash
npm install
```

Windows:

```powershell
npm.cmd install
```

### 3. Create Env Files

Copy examples:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Windows PowerShell:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

### 4. Configure Backend Env

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/mini-case-tracker
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
UPLOAD_DIR=uploads
```

For MongoDB Atlas, replace `MONGODB_URI` with:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/mini-case-tracker?retryWrites=true&w=majority
```

### 5. Configure Frontend Env

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 6. Seed Demo Users And Cases

```bash
npm run seed
```

Windows:

```powershell
npm.cmd run seed
```

### 7. Start App

```bash
npm run dev
```

Windows:

```powershell
npm.cmd run dev
```

Open:

- Frontend: http://localhost:5173
- Backend health: http://localhost:5000/health
- Swagger docs: http://localhost:5000/api/docs
- OpenAPI JSON: http://localhost:5000/api/openapi.json

## Test Credentials

Manager:

```text
manager@example.com
Password123!
```

Agent:

```text
agent@example.com
Password123!
```

Another seeded agent for assignment:

```text
neha.agent@example.com
Password123!
```

## API Documentation

Swagger UI is available after starting the backend:

```text
http://localhost:5000/api/docs
```

Raw OpenAPI JSON:

```text
http://localhost:5000/api/openapi.json
```

To test protected routes in Swagger:

1. Login with `POST /api/auth/login`.
2. Copy the returned `token`.
3. Click **Authorize** in Swagger.
4. Enter:

```text
Bearer YOUR_TOKEN
```

To use Postman:

1. Open Postman.
2. Click **Import**.
3. Choose **Link**.
4. Paste:

```text
http://localhost:5000/api/openapi.json
```

For deployed backend, use:

```text
https://YOUR_RENDER_SERVICE.onrender.com/api/openapi.json
```

## Important API Routes

- `POST /api/auth/login`
- `POST /api/auth/signup`
- `GET /api/auth/me`
- `GET /api/users/agents`
- `GET /api/cases`
- `POST /api/cases`
- `GET /api/cases/:id`
- `POST /api/cases/:id/assign`
- `POST /api/cases/:id/start`
- `POST /api/cases/:id/submit`
- `POST /api/cases/:id/review`
- `POST /api/cases/:id/comments`
- `POST /api/cases/:id/documents`

## Environment Variables

### Server

| Variable | Example | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | API port |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/mini-case-tracker` | MongoDB connection |
| `JWT_SECRET` | `long-random-secret` | JWT signing key |
| `JWT_EXPIRES_IN` | `1d` | Token lifetime |
| `CLIENT_URL` | `http://localhost:5173` | Allowed frontend origin for CORS |
| `UPLOAD_DIR` | `uploads` | Local upload folder |

For production CORS, use the Vercel URL:

```env
CLIENT_URL=https://your-app.vercel.app
```

For local plus production:

```env
CLIENT_URL=https://your-app.vercel.app,http://localhost:5173
```

### Client

| Variable | Example | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:5000/api` | Backend API base URL |

For Vercel:

```env
VITE_API_URL=https://your-render-service.onrender.com/api
```

## Deployment

### MongoDB Atlas

1. Create an Atlas account.
2. Create an M0 free cluster.
3. Create a database user.
4. Add Network Access IP `0.0.0.0/0` for Render/Vercel demo deployment.
5. Copy the connection string and add database name `mini-case-tracker`.

Final URI shape:

```text
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/mini-case-tracker?retryWrites=true&w=majority
```

### Render Backend

Use Docker:

```text
Runtime: Docker
Root Directory: server
Dockerfile Path: ./Dockerfile
```

Render env vars:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/mini-case-tracker?retryWrites=true&w=majority
JWT_SECRET=long-random-production-secret
JWT_EXPIRES_IN=1d
CLIENT_URL=https://your-vercel-app.vercel.app
UPLOAD_DIR=uploads
```

After deploy, test:

```text
https://your-render-service.onrender.com/health
https://your-render-service.onrender.com/api/docs
```

### Vercel Frontend

Import the GitHub repo and set:

```text
Framework: Vite
Root Directory: client
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Vercel env var:

```env
VITE_API_URL=https://your-render-service.onrender.com/api
```

After Vercel deploy, update Render `CLIENT_URL` to the final Vercel URL and redeploy backend.

## Production Seed

To seed Atlas from your local machine:

PowerShell:

```powershell
$env:MONGODB_URI="mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/mini-case-tracker?retryWrites=true&w=majority"
$env:JWT_SECRET="temporary-seed-secret"
npm.cmd run seed --workspace server
```

Mac/Linux:

```bash
MONGODB_URI="mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/mini-case-tracker?retryWrites=true&w=majority" JWT_SECRET="temporary-seed-secret" npm run seed --workspace server
```

## Validation And Build

```bash
npm run typecheck
npm run build
```

Windows:

```powershell
npm.cmd run typecheck
npm.cmd run build
```

## Assumptions

- Local file upload storage is acceptable for the take-home task. A production version should use S3, Cloudinary, or another durable storage provider.
- Public signup creates agent accounts only. Manager credentials are seeded.
- Agents can upload files while a case is `Assigned` or `In Progress`.
- A case must have at least one uploaded document before submission.
- `Cleared` and `Discrepant` are terminal states.

## Rough Hours Spent

Approximately 8-10 focused hours for implementation, verification, deployment preparation, and documentation.

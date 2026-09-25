# Athletica

Athletica is a full-stack fitness and wellness platform built for students, teachers, and community users.

## Stack

- **Frontend:** React 18 + Vite
- **Backend:** Node.js + Express (ES Modules)
- **Database:** MongoDB Atlas + Mongoose
- **Authentication:** JWT + bcryptjs
- **UI:** React components + CSS + Lucide React

## Repository structure

```text
athletica/
├── backend/
│   ├── .env                 # local secrets/config; keep private
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── server.js
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── components/
│       ├── lib/
│       └── pages/
├── docs/
├── .gitignore
├── package.json
└── README.md
```

## Environment

The existing `backend/.env` is intentionally kept in the project folder. The root `.gitignore` ignores `.env`, so Git will not add it to the new repository.

Required backend variables are shown in `backend/.env.example`:

```env
PORT=5000
MONGODB_URI=
JWT_SECRET=
```

## Run the project

### 1. Install dependencies

From the repository root:

```bash
npm run install:all
```

Or install each app separately:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Start the backend

Terminal 1:

```bash
npm run dev:backend
```

The API runs on `http://localhost:5000` by default.

Health check:

```text
GET http://localhost:5000/api/health
```

### 3. Start the frontend

Terminal 2:

```bash
npm run dev:frontend
```

The Vite app normally runs on `http://localhost:5173`.

The frontend API client uses `VITE_API_BASE_URL` when it is provided and otherwise falls back to `http://localhost:5000/api`.

## Implemented API surface

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`

### Student profile

- `POST /api/student/profile`
- `GET /api/student/profile`
- `PUT /api/student/profile`

### Fitness assessment

- `POST /api/student/assessment`
- `GET /api/student/assessment`
- `GET /api/student/assessment/history`
- `PUT /api/student/assessment/:assessmentId`

### Workout plans

- `POST /api/student/workout-plan`
- `GET /api/student/workout-plan`
- `GET /api/student/workout-plan/history`
- `PUT /api/student/workout-plan/:planId`

All student endpoints require a JWT access token in the `Authorization` header:

```text
Authorization: Bearer <token>
```

## Development checks

```bash
npm run lint
npm run build
```

`node_modules/`, build output, logs, and local environment files stay out of version control through the existing `.gitignore`.

## New Git repository

This project copy contains **no Git history**. From the project root:

```bash
git init
git add .
git commit -m "Initial Athletica full-stack setup"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

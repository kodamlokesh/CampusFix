# CampusFix Backend

Express + MongoDB (Mongoose) REST API with JWT login and three roles: student, worker, admin.

## Run
Needs Node 18+ and MongoDB (local or Atlas).
```bash
npm install
npm run dev      # http://localhost:5000
```
Settings live in `.env` (see `.env.example`):
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/campusfix
CLIENT_ORIGIN=http://localhost:5173    # the frontend's URL (allowed by CORS)
JWT_SECRET=<long random string>
ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD   # admin account is created on first start
```
Default admin: `admin@campusfix.local` / `Admin@123`. Change it before deploying.

## Structure
```
server.js              app setup, routes, startup
config/                db.js (MongoDB connection), ensureAdmin.js
models/                User.js, Complaint.js
controllers/           authController, complaintController, userController
routes/                authRoutes, complaintRoutes, userRoutes
middleware/            auth.js (login + role checks), errorHandler.js
utils/http.js          small helpers
```

## API
All routes except register, login and health need `Authorization: Bearer <token>`.

| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| GET | `/api/health` | public | Health check |
| POST | `/api/auth/register` | public | Create a student account |
| POST | `/api/auth/login` | public | Log in, returns `{ token, user }` |
| GET | `/api/auth/me` | any | Current user |
| GET | `/api/complaints?search=&category=&status=&priority=&assigned=&sort=` | any | List (scoped to role) |
| GET | `/api/complaints/stats` | any | Dashboard stats (scoped to role) |
| POST | `/api/complaints` | student | Create a report |
| PATCH | `/api/complaints/:id` | worker, admin | Worker: `status`. Admin: `status`, `assignedTo`, `priority`, `category` |
| DELETE | `/api/complaints/:id` | student (own, Pending), admin | Delete |
| GET, POST | `/api/users/workers` | admin | List or add workers |
| DELETE | `/api/users/workers/:id` | admin | Delete a worker |
| GET | `/api/users/students` | admin | List students |

Errors return `{ "message": "...", "errors": { "field": "..." } }`.

## Deploying
Set `CLIENT_ORIGIN` to your deployed frontend URL, use an Atlas `MONGODB_URI`, and set a strong `JWT_SECRET` and `ADMIN_PASSWORD`.

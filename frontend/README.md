# CampusFix Frontend

React (Vite) app with login and three dashboards: student, worker, admin. It talks to the CampusFix backend API.

## Run
Needs Node 18+ and the backend running on port 5000.
```bash
npm install
npm run dev      # http://localhost:5173
```
In development, Vite forwards `/api` requests to `http://localhost:5000` (see `vite.config.js`). If your backend uses another port, change it there.

## Deploying
Build with `npm run build` (output in `dist/`). Before building, point the app at your hosted API:
```
# .env
VITE_API_URL=https://your-backend.example.com/api
```
Then set `CLIENT_ORIGIN` in the backend to this site's URL.

## Structure
```
src/main.jsx, App.jsx        entry point and role routing
src/api.js                   all API calls and token handling
src/AuthContext.jsx          login state
src/hooks/useComplaints.js   loading, filtering and updating reports
src/pages/                   AuthPage, StudentPage, WorkerPage, AdminPage
src/components/              Dashboard, ComplaintForm, ComplaintList, Filters, ReportsSection, PeoplePanel, Field
src/styles.css               all styles
```

# CampusFix

CampusFix is a full-stack web application for reporting and tracking problems on a college campus, such as electrical faults, water leaks, damaged classroom equipment, and cleanliness issues.

## Features
- **Student dashboard:** submit reports with category, location and priority, then track status and see which worker is assigned
- **Worker dashboard:** view assigned reports and update them to In Progress or Resolved
- **Admin module:** campus-wide statistics, assign workers, manage workers, view students, change status or delete reports
- Status tracking: Pending, In Progress, Resolved
- Search, filters (category, status, priority, worker) and sorting
- JWT authentication with role-based access control
- Input validation and error handling on both client and server

## Tech stack
- **Frontend:** React, Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Auth:** JSON Web Tokens, bcryptjs

## Project structure
- `backend/` Express REST API
- `frontend/` React app

## Getting started
See the README inside each folder for setup instructions.

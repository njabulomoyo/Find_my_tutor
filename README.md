# Find My Tutor

This project is a tutor marketplace platform for connecting students with qualified tutors.

## Project structure

- `frontend/` — website UI and user-facing pages
- `backend/` — API and server logic
- `docs/` — project documentation and planning files

## Current MVP

- Grambling State University Student Success Center landing page
- Responsive collapsible sidebar and mobile menu
- Tutor listing with expandable subjects and availability
- Presentation-only appointment request form
- Basic API with tutor data

## Frontend

The frontend is a simple static website using HTML, CSS, and JavaScript.

## Backend

The backend is a basic Express API with:

- `GET /api/health`
- `GET /api/tutors`
- `GET /api/tutors/:id`

## Run the backend

```bash
cd backend
npm install
npm run dev
```

## Run the frontend

Open `frontend/index.html` in a browser.

The appointment form currently displays a confirmation message without saving an appointment. Student authentication, appointment persistence, staff confirmation, notifications, and calendar integration belong to a later phase.

## Future phases

- Student login and signup
- Tutor profile management
- Production booking system
- Search filtering (the current tutor list is intentionally small)
- Reviews and ratings
- Admin dashboard
- Payments and notifications

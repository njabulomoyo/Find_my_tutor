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
- Appointment request form that saves bookings and emails the student and tutor
- Basic API with tutor data

## Frontend

The frontend is a simple static website using HTML, CSS, and JavaScript.

## Backend

The backend is a basic Express API with:

- `GET /api/health`
- `GET /api/tutors`
- `GET /api/tutors/:id`
- `GET /api/tutors?subject=Calculus%20I` — tutors who teach a subject
- `GET /api/slots?subject=Calculus%20I[&tutorId=3]` — open 30-minute times over the next 14 days
- `POST /api/bookings` — books a slot (`date`, `start`, and a `tutorId` or `"any"`)

Tutors and bookings are stored in SQLite at `backend/src/data/find-my-tutor.db` (override with `DB_PATH`).

## Tutor data

Tutors are stored in the database, which is the source of truth; the API reads them from there on every request. `backend/src/data/tutors.js` is starter data: it is imported automatically only into an empty database (for example, a fresh install).

After editing `tutors.js`, import it with:

```bash
cd backend
npm run seed:tutors
```

This updates existing tutors and adds new ones. It never deletes tutors or bookings, and it overwrites any tutor changes made directly in the database. No server restart is needed.

## Run the backend

```bash
cd backend
npm install
npm run dev
```

The backend runs on `http://localhost:5050` by default.

## Run the frontend

The frontend's JavaScript is organized as ES modules (`frontend/js/`), which browsers only load over `http(s)://`, not `file://`. Run the backend first (see above) — it serves `frontend/` as static files — then visit `http://localhost:5050` in a browser. Opening `frontend/index.html` directly by double-clicking it will not work.

Students book by picking a subject, then a day, then an open time; they don't choose a tutor. The server assigns a tutor who teaches the subject and is free at that time, picking the one with the fewest upcoming bookings and, on a tie, the first-listed tutor. Times are 30-minute slots built from each tutor's weekly `availability` windows in `backend/src/data/tutors.js`, for the next 14 days. The server rejects times outside a tutor's hours, slots already taken (enforced by a unique database index, so simultaneous requests can't double book), a second session for the same student at the same time, and more than 4 sessions per student per day. Submitting saves the booking and sends a confirmation email to the student and a notification to the tutor. Student authentication, staff confirmation, and calendar integration belong to a later phase.

## Email setup

By default no real email is sent. The backend uses [Ethereal](https://ethereal.email), a fake test inbox, and logs a preview link for each email to the server console. Tests use an in-memory transport and send nothing.

To send real email, copy `backend/.env.example` to `backend/.env` and fill in your SMTP provider's settings. Setting `SMTP_HOST` switches to real delivery with no code changes. `backend/.env` is gitignored; never commit credentials.

## Git workflow

Keep commits small and focused. Each commit should represent one logical change, such as a single UI adjustment, one API endpoint, or one bug fix.

Before committing:

1. Check the changed files with `git status`.
2. Review the patch with `git diff`.
3. Run the relevant tests or checks.
4. Stage only the files for that change, for example `git add frontend/css/styles.css`.
5. Review the staged patch with `git diff --cached`.
6. Commit with a descriptive message.

Prefer messages such as:

```text
Fix collapsed sidebar alignment
Add tutor booking validation
Improve mobile footer spacing
```

Avoid combining unrelated work in one commit. If a change touches several files, they should all support the same user-facing behavior or technical improvement.

## Future phases

- Student login and signup
- Tutor profile management
- Production booking system
- Search filtering (the current tutor list is intentionally small)
- Reviews and ratings
- Admin dashboard
- Payments

## Before production

- Real email: pick a production provider (e.g. Resend, Postmark, Amazon SES, or the university mail server), verify a sending domain with SPF, DKIM, and DMARC records, and configure `backend/.env` on the server.
- Replace tutor seed emails in `backend/src/data/tutors.js` with confirmed addresses so test bookings don't reach real people.
- Send booking emails without blocking the booking response (e.g. a background queue), so a slow mail server doesn't delay the form.

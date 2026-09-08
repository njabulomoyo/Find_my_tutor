## Plan: Find My Tutor Basic Website

We will build the MVP in small phases. After each phase, you will manually test the result, confirm that it behaves as expected, and only then will we continue.

### Phase 0: Foundation

- Confirm the MVP scope:
  - Homepage
  - Tutor listing
  - Tutor search
  - Tutor profile
  - Basic booking request
- Keep using the branch `feature/basic-tutor-platform`
- Choose one active frontend entry point
- Serve the frontend over HTTP so it can communicate with the backend
- Document setup instructions and initial architecture

**Manual test**

- Open the frontend URL
- Open the backend health URL
- Confirm both work
- Confirm the README explains how to start both

### Phase 1: Dynamic Tutor Listing and Search

- Load tutors from `GET /api/tutors`
- Remove duplicated hardcoded tutor data from the page
- Render tutor cards dynamically
- Add loading, error, retry, and no-results states
- Implement name and subject search
- Add proper labels and keyboard support

**Manual test**

- Confirm tutors load from the API
- Search by subject, such as `Physics`
- Search by tutor name
- Search for a nonexistent tutor
- Stop the backend and verify the error state appears

### Phase 2: Tutor Profiles

- Add a tutor detail page
- Use `GET /api/tutors/:id`
- Connect each tutor card to its profile
- Display subject, rating, price, and experience
- Add invalid-tutor and not-found states
- Add a booking button

**Manual test**

- Open each tutor profile
- Confirm the displayed information matches the API
- Refresh the profile page
- Test an invalid tutor ID
- Return to the tutor listing

### Phase 3: Booking Request

- Define booking fields:
  - Student name
  - Email
  - Tutor
  - Preferred date/time
  - Subject
  - Message
- Add `POST /api/bookings`
- Validate required fields
- Connect the booking form to the backend
- Show success and error messages
- Use temporary in-memory storage for the prototype

**Manual test**

- Submit a valid booking
- Confirm the selected tutor is correct
- Submit missing or invalid fields
- Test the API while the backend is unavailable
- Confirm and document that bookings reset when the backend restarts

### Phase 4: Quality and Accessibility

- Test desktop and mobile layouts
- Test keyboard navigation
- Check visible focus states
- Check form labels and headings
- Remove unused placeholder files
- Update README and API documentation
- Add basic automated API checks where useful

**Manual test**

Complete the full flow:

Homepage → Search → Tutor profile → Booking request

Verify that there are no broken links, overlapping elements, unexplained errors, or console problems.

### Phase 5: Branch and Pull Request

- Review the complete feature branch
- Run final checks
- Record known prototype limitations
- Commit the finished MVP
- Push `feature/basic-tutor-platform`
- You create the pull request into `main`

**Manual test**

Follow the README from a clean terminal and repeat the main user journey before opening the PR.

## Documentation

We will maintain:

- [README.md](README.md) for setup and project status
- `docs/architecture.md` for technical decisions
- `docs/mvp-requirements.md` for the agreed MVP scope
- `docs/api.md` for endpoint contracts

## Explicitly excluded from the basic version

These will come later:

- Authentication
- Payments
- Real-time chat
- Calendar synchronization
- Reviews
- Admin dashboard
- Advanced search ranking
- Production database

No implementation has been started from this request. The full plan has also been saved in session memory for reference.

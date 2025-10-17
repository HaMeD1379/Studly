# Sprint 1 Worksheet

This deliverable focuses on testing coverage, test importance, and environment reproducibility.


## 1. Testing Plan

* Link to file is below:
[Testing Plan](https://github.com/HaMeD1379/Studly/blob/sprint1worksheets/worksheets/sprint1/testingPlan.md)

## 2. Unit / Integration / Acceptance Testing

### General Rule
Every user story must have at least one test before it is considered complete.

### Backend
* **API layer:** 100% method coverage (every method has at least 1 tested line).
* **Logic classes:** ≥80% line coverage.
* **Integration tests:** 100% class coverage, with strong line & method coverage.

### Frontend
* **Logic layer (if present):** ≥80% coverage.
Our Logic layer currently includes tests to make sure that email provided during sign up matches a valid email format; that is name@domain.com. We also have checks to ensure that the password being provided by a user matches the acceptable format, we test this on the frontend to reduce latency in rejecting the password, and also to put less load on the server but instead handle false cases on the frontend.

* **UI tests:** Describe approach and coverage.
* If unit tests are missing for some classes/methods, explain why and how quality is being ensured.
* Describe any unusual/unique aspects of your testing approach.

We use the vitest library to simulate user interaction with our frontend, this allows us to ensure correct behaviour by simulating buttons being clicked and also providing input to text fields which allows us to test for behaviour with all kinds of inputs. We also have tests to ensure that all expected fields are being displayed when a page is rendered.
As provided in the screenshot below, our front end UI testing coverage for our components is greater than 80%, which indicates that our UI is adequately tested. 
If unit tests are missing for some classes/methods, explain why and how quality is being ensured.





### Coverage Report
* Provide class and line coverage reports (link or screenshot).
[insert link for first image]
[insert link for the second image]

## 3. Testing Importance

List your top 3 tests for each category:

### Unit Tests

1. [`apps/backend/tests/unit/supabaseClient.test.js`](https://github.com/HaMeD1379/Studly/blob/main/apps/backend/tests/unit/supabaseClient.test.js) – Tests Supabase client configuration and initialization (verifies client exports correctly, auth/database methods exist, singleton pattern works)

2. [`apps/backend/tests/unit/sessions.service.test.js`](https://github.com/HaMeD1379/Studly/blob/main/apps/backend/tests/unit/sessions.service.test.js) – Tests the sessions service layer methods (createSession, completeSession, listSessions, summarizeSessionsByDate) with mocked database client

3. [`apps/backend/tests/unit/serverUtils.test.js`](https://github.com/HaMeD1379/Studly/blob/main/apps/backend/tests/unit/serverUtils.test.js) – Tests server utility functions for standardized HTTP response handling (success/error responses with proper status codes and JSON formatting)

### Integration Tests

1. [`apps/backend/tests/integration/authController.test.js`](https://github.com/HaMeD1379/Studly/blob/main/apps/backend/tests/integration/authController.test.js) – Tests successful user signup with email, password, and full name (Line 165)

2. [`apps/backend/tests/unit/sessions.controller.test.js`](https://github.com/HaMeD1379/Studly/blob/main/apps/backend/tests/unit/sessions.controller.test.js) – Tests creating a new study session (POST /api/v1/sessions) and completing/updating a session (PATCH /api/v1/sessions/:id)

3. [`apps/backend/tests/unit/sessions.controller.test.js`](https://github.com/HaMeD1379/Studly/blob/main/apps/backend/tests/unit/sessions.controller.test.js) – Tests session API endpoints return properly formatted camelCase fields and handle session lifecycle

### Acceptance Tests

**Note:** These acceptance tests are component-level tests that verify user interactions with the frontend. While they validate user behaviors and workflows, they are not full end-to-end tests as our frontend and backend integration was not connected for Sprint 1.

1. [`apps/frontend/src/components/SetupStudySession/SetupStudySession.spec.tsx`](https://github.com/HaMeD1379/Studly/blob/main/apps/frontend/src/components/SetupStudySession/SetupStudySession.spec.tsx) – Tests user can select subject and set session duration (dropdown interaction + time selection)
   * **User Story:** [Issue #3 - Track studying and reward badges](https://github.com/HaMeD1379/Studly/issues/3)

2. [`apps/frontend/src/components/StudySession/StudySession.spec.tsx`](https://github.com/HaMeD1379/Studly/blob/main/apps/frontend/src/components/StudySession/StudySession.spec.tsx) – Tests user can start and stop timed study sessions (timer functionality, button states)
   * **User Story:** [Issue #3 - Track studying and reward badges](https://github.com/HaMeD1379/Studly/issues/3)

3. [`apps/frontend/src/components/Navbar/Navbar.spec.tsx`](https://github.com/HaMeD1379/Studly/blob/main/apps/frontend/src/components/Navbar/Navbar.spec.tsx) – Tests navigation flow between home and study pages, ensuring primary user journey works in browser
   * **User Story:** [Issue #8 - Navigate between pages](https://github.com/HaMeD1379/Studly/issues/8)

## 4. Reproducible Environments

### Backend: WorkoutPal-Backend (Go)

**Setup Time:** ~45 minutes  
**Environment:** GoLand IDE (JetBrains), PowerShell, Docker Desktop

#### Documentation Clarity
The README was clear and step-by-step, with clickable Markdown commands and OS-specific instructions. It listed prerequisites (Go, Docker, Git) and testing commands in logical order.

#### Successes
* `go mod download` completed successfully
* PostgreSQL container launched using `docker-compose up -d` without errors
* End-to-end tests ran with `go test ./... -coverpkg=./... -covermode=atomic -coverprofile=coverage.out` and produced coverage data

#### Issues
* API failed to start because of a database authentication error (`pq: password authentication failed for user "user"`)
* Coverage display (`go tool cover`) failed in PowerShell and WSL terminals due to path and argument parsing

#### Root Cause
Mismatch between Docker Compose PostgreSQL credentials and the application's default configuration. The README did not include database user creation or alignment instructions.

#### Outcome
The environment was mostly reproducible, but a configuration mismatch prevented a complete backend run. Tests and build succeeded, so this was a project-side setup issue rather than a user error.

---

### Frontend: WorkoutPal-Frontend (React + Vite)

**Setup Time:** ~15 minutes  
**Environment:** WebStorm IDE, Node.js 22.20.0, Vite Dev Server

#### Documentation Clarity
The README was concise and accurate. Commands such as `npm install` and `npm run dev` worked as written. It also explained how to run unit and acceptance tests clearly.

#### Successes
* Application started successfully at `http://localhost:5173/`
* Login page displayed and functioned as expected
* Coverage reports generated through Jest, showing high coverage in utility modules

#### Issues
* None during setup or testing
* Backend connection required for full integration but frontend runs stand-alone for UI tests

#### Outcome
Fully reproducible environment with smooth onboarding and fast setup.

---

### Overall Reflection

#### Clarity of Documentation
Both repositories were well documented. The backend's only gap was its database credential mismatch.

#### Ease of Setup
* **Frontend:** 15 minutes – no issues
* **Backend:** 45 minutes – minor credential issue

#### Distributed System Considerations
The multi-repository architecture added some coordination complexity. Synchronizing backend credentials and ports is essential for reproducible local environments.

#### Final Verdict
* **Frontend:** Fully reproducible
* **Backend:** Partially reproducible (credential alignment required)
* **Overall:** Strong documentation and structure with minor DevOps alignment improvements needed

### Screenshots
[Insert screenshot links here]

## Sprint 1 Quick Checklist


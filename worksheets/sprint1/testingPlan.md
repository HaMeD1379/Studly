# Testing Plan Template for sprint 1  

---

## Testing Goals and Scope  
Explain *what parts of the system* will be tested (backend, frontend, API, etc.) and *why*—clarify the purpose and extent of your testing.
(Frontend):
We are testing the frontend components to ensure that they render correctly. We have acceptance tests set up to ensure correct behaviour based on user interactions, also checking that the system fails acceptably in the event the user attempts to break the system (intentionally or not). We also have tests for the frontend that test logic such as email validation (ensuring that the emails provided follow the format of a valid email address) and password validation (ensures that the passwords for new users match the outlined requirements)
(Backend):
We are testing the backend API to ensure all authentication and sessions routes and utilities are set up and behave correctly as per our requirement. Unit tests verify isolated logic (middleware, utilities, and superbase client setup with a test from sessions api) and integration tests confirm that Express routes and controllers for authentication and session interact correctly with Supabase responses (mock and actual db).

Once the API is hooked up to the frontend and we have frontend → backend → DB → backend → frontend flow, we will start doing e2e testing that involves a testing user to mimic an actual user on our page. This will allow us to get the most accurate system tests possible in order to make sure all our core flows work.
---

## Testing Frameworks and Tools  
List the frameworks (e.g., Jest, Pytest, Cypress) and tools used for running tests, measuring coverage, or mocking data, and explain *why they were chosen*.
(Frontend):
For testing on the frontend we use primarily vitest as well as some files from reacts testing library. Vitest allows us to perform acceptance tests, it also has a library for mocking, which allows us to mock routes and notifications, which helps us with our acceptance testing. Vitest has coverage reports made through v8 and these coverage reports are generated in /apps/frontend/coverage/ directory. Vitest also has the ability to run and debug tests in a UI, so that enables us to see coverage in a nicer way.

(Backend): 
For backend testing, we initially planned to use Jest and Supertest because they provide strong support for unit and integration testing in Node.js applications. However, we were unable to use them during the submission due to dependency conflicts that caused our CI pipeline and deployment to fail. Instead, we performed basic functional testing using native Node.js test scripts to verify core backend logic and API behaviour without relying on external testing frameworks, which solved the issue of CI pipeline. For future, the jest dependency issue was resolved using a lightweight JestLite setup and updated package versions. 

For e2e testing, we will be using cypress which uses chromium or electron to mimic the website and have a real user poke around on the site to do testing. Cypress was chosen for its simplicity.
---

## Test Organization and Structure  
### Frontend
Describe how your tests are arranged in folders or files (e.g., `tests/unit`, `tests/integration`), and how naming conventions help identify test purpose.

Tests for components are within the component’s folder. For example, the component responsible for RecentStudySessions in /apps/frontend/components/ has a .tsx file for its actual component code, and a .spec.tsx that is meant for specifically testing that component. This enables us to work in one specific folder only when it comes to creating a new component, and makes it a lot more clear on which test file is responsible for testing what.

E2e tests are found in the /e2e/ directory in the /apps/frontend/. Since these e2e tests are independent of a specific component and instead run the whole app, it makes the most sense to have them at the root level of the frontend. These naming conventions have “.cy” in the file extension, making it clear it is a cypress e2e test.

Tests for non component files like utilities or routes where we want simple unit tests will be done in the same way as the components tests. This makes it easy and nobody has to go looking for a test file. It also makes testing files no longer the after thought.

### Backend
All the backend tests are located under the /apps/backend/tests directory. 
Unit tests are stored in /apps/backend/test/unit/, for example /apps/backend/test/unit/validateInput.test.js.
Integration tests are stored in /apps/backend/test/integration/, for example  /apps/backend/test/integration/authController.test.js.
This folder structure and consistent <filename>.test.js naming make it easy to identify test purpose with a clean and organized backend code base.

---

## Coverage Targets  
Specify measurable goals (e.g., 100% API method coverage, ≥80% logic class coverage) and link them to your grading or sprint requirements.

###Frontend:
Our measurable goals for the frontend are to achieve 80% line coverage, 100% branch coverage. 100% branch coverage allows us to ensure our code is robust to user input errors. Meeting this coverage threshold aligns with our Sprint1 grading requirements for code quality and maintainability.

### Backend:
Our measurable goals for the backend are to achieve 100% API method, >= 80% logic coverage, 100% integration coverage (authController.test.js, sessions.test.js). Meeting this coverage threshold aligns with our Sprint1 grading requirements for code quality and maintainability.

---

## Running Tests  
Include exact commands or scripts for running each type of test and generating coverage reports, so others can easily reproduce your results.  
Example:
```bash
# Run backend tests with coverage
pytest --cov=app tests/

# Run frontend tests
## Frontend (/apps/frontend/)
Non e2e tests: npm run test:unit
Running non e2e tests with ui: npm run test:unit:ui

E2e testing: npm run test:e2e
E2e testing with UI: npm run test:e2e:ui

Running the whole suite: npm run test

# Run backend tests
## Backend (/apps/backend/)
Whole suite with code coverage: node --test --experimental-test-coverage
Running unit tests with coverage: node --test --experimental-test-coverage "tests/unit/**/*.test.js
Running integration tests with coverage: node --test --experimental-test-coverage "tests/integration/**/*.test.js


```

---

## Reporting and Results  
Explain where to find test reports (HTML, console, CI output) and how to interpret them.  
Include screenshots or links if applicable (e.g., `/coverage/index.html`).

### backend:
The test reports can be generated by pulling the git repo to local machine, navigating to the backend folder, and running the command in terminal: node --test --experimental-test-coverage
This will generate a report like below. 

<img width="896" height="722" alt="image" src="https://github.com/user-attachments/assets/14303d8f-1c41-447c-8abb-67c97f278664" />

---

## Test Data and Environment Setup  
Describe how to prepare the local environment for testing (e.g., database seeding, environment variables, Docker setup).  
Mention any special configuration files required.
(Frontend): Using the terminal in the frontend directory, enter in the npm i command to install all dependencies, then run the tests using npm run test
(Backend):  Using the terminal in the backend directory, enter in the npm i command to install all dependencies, then run the tests using node --test --experimental-test-coverage

---

## Quality Assurance and Exceptions  
Identify any untested components, justify why they’re excluded, and explain how you maintain overall quality (e.g., through manual tests or code reviews).

### Frontend
Specifically, the routes are mostly untested. This is intentional as we have not setup the API to the backend yet. This means we do not have the core logic on each page to retrieve data yet so we are using mock data on the inner components. Once we have the connection setup, we will add coverage to these pages. Also because of the same reason, e2e testing is not able to be used to its maximum benefit, and it would make more sense to add e2e tests once we have the API connected.

### Backend
Currently, the authentication route has not been tested with the actual Supabase database and the full backend is not connected to the frontend. These components are intentionally excluded as we need to setup the connection from frontend to backend. Once the full frontend-backend-db flow is integrated, we will implement e2e testing to validate user interactions and data persistence. 
---

## Continuous Integration [Once set up]
Note if your tests run automatically in a CI pipeline (GitHub Actions, GitLab CI, etc.) and how that helps maintain consistency.

### Backend
Tests will run automatically via Github Actions as the CI is configured. This maintains consistency as it ensures that all code is tested in the same clean environment, it catches the regressions early, and also identifies broken code.




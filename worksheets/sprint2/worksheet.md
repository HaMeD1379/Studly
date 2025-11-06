# 1\. Regression Testing Strategy

## Overview
Our regression testing suite runs automatically on every pull request and push to the main branch via GitHub Actions CI/CD pipeline. This ensures that new changes do not break existing functionality.
For our needs, we decided upon doing a complete regression testing implementation rather than other options such as selective regression testing or risk based regression testing. While we could have implemented these optimized regression testing options as we do have certain files such as supabase.js (has configs), and strings.js(just constant strings), that change very rarely, and we could have modified our CI scripts to handle these less changing/risk areas. But what we found is that since our project is small and we are still developing and adding more features, the extra time it takes to run all the test suits across all aspects of the project was negligible for us. And it was more important for us to get our application up and running.

## Tests Breakdown 
Since we do a complete regression testing, here is what we are testing:
### Backend Tests (apps/backend)
1. **Unit Tests** - Controllers and Services
   - Location: `Studly/apps/backend/tests/unit`
   - Runner: Node.js built-in test runner
   - Coverage: this tests code in isolation.
   
2. **Integration Tests** - API endpoints
   - Location: `Studly/apps/backend/tests/integration`
   - Coverage: this is testing components working together, such as our session testing. 
   
3. **Code Quality Checks**
   - ESLint: Syntax and code style validation
   - Biome: Code formatting and organization

### Frontend Tests (apps/frontend)
1. **Unit Tests** - Components and utilities
   - Location: ``
   - Runner: Vitest
   - Coverage: React components, hooks, utilities

2. **Integrations Tests** - Routes
   - Location: ``
   - Runner: Vitest
   - Coverage: This is to test the routes

3. **End-to-End Tests** - User workflows
   - Location: `Studly/apps/frontend/cypress/e2e/`
   - Runner: Cypress

   
3. **Code Quality Checks**
   - Biome: Code formatting and organization

## Tools Used
- **GitHub Actions**: CI/CD orchestration
- **Node.js Test Runner**: Backend unit tests
- **Vitest**: Frontend unit tests
- **Cypress**: End-to-end tests
- **ESLint**: Static code analysis
- **Biome**: Code formatting and linting

## Test Execution Process
1. Developer creates a pull request
2. GitHub Actions automatically triggers CI pipeline
3. All regression tests run in parallel (backend + frontend)
4. PR is blocked if any tests fail
5. Green checkmark indicates all tests passed
6. Code can be merged to main branch

This process allows us to make sure any code we are adding does not immediately break any existing logic. 

## Regression Testing Script

Our regression tests are automated via GitHub Actions CI/CD pipeline:
- **Location**: `.github/workflows/ci.yml`
- **View on GitHub**: [CI Workflow](Studly/.github/workflows/ci.yml at main · HaMeD1379/Studly)



# 2\. Testing Slowdown

## 1\. Have you been able to keep all unit and integration tests from your test plan?

-   For front end have been capable of keeping pace with creating tests as we develop

-   For backend, such as profile api, have been able to create tests immediately and tests, so still keeping track of that. 

## 2\. Have you created different test plans for different release types? Explain.

-   Front end still has the same testing plan from last sprint for the front end;

-   We have been following the same idea as the sprint 1 as well, so no different test plan has been done. 



# 3\. Not Testing


## What parts of the system are not tested?

-   The user authentication for each api once the user is inside the application, like who can access badges, is not tested via a middleware. This is because the superbase has Row Level security for this instance, so we decided not to for this sprint 2 as our priority was to get our application together. For sprint 2, we will be adding this.

-   Provide an updated system diagram.

## For each tier, indicate which layers are:

-   Fully tested (80%+)

-   Mostly tested (20--80%)

-   Somewhat tested (0--20%)

-   Not tested

-   Include coverage reports for tested tiers.


# 4. Profiler Analysis

After running the profiler on the API, the following observations were made from the output:

![Profiler Results](./profiler_results.png)

### Which endpoint is the slowest?
The `POST /api/v1/auth/signup` endpoint is the slowest. It has the highest average response time (121.129 ms), the highest 95th percentile time (192.201 ms), and the highest maximum response time (869.162 ms).

### Is the slowdown fixable — and why/why not?
The slowdown is likely inherent to the nature of the signup operation and may not be easily "fixed," but it is understandable. The signup process involves several steps:
- Validating user input
- Checking if the user already exists
- Hashing the password (computationally intensive by design)
- Creating a new user record in the Supabase database

Password hashing and initial database writes are expected to take longer compared to simpler operations like login or profile updates. While the performance is acceptable for a signup endpoint, potential optimizations could include ensuring the database is indexed appropriately. However, given the endpoint's purpose, the current performance is reasonable.


# 5\. Last Dash

## What issues do you foresee in the final sprint?

-   Some issues we can see for our final sprint is trying to make sure we have all the core functionality complete and fully functional. At the start when developing, we prioritized splitting up of the different aspects of our project to so we can make some progress on different featuers. However we did not necessarily making sure the app was connected from the start. So by the end of sprint 1 and begining of sprint 2, we had many different features ready, but connecting them together was challenging. So which meant meants sprint 2 was focused on connecting different aspects, thus leaving other features to be pushed to the next sprint. Which means that for the final sprint, we would need to end up working on the rest of the api's and features that we sidelined as fast as possible and get it all connected and up and running. 


# 6\. Show Off


-   Each team member highlights their best work (code, UI, design, integration, mocks, etc.).

-   Remember: good refactored code should be simple and elegant.

Each member must commit their own update --- commit logs will be checked.

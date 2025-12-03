# Sprint 3 Worksheet

## 1. Load Testing

**Describe your load testing environment:**

- Tools used
- Load test cases
- Provide the test report
- Discuss one bottleneck found
- State whether you met your non-functional requirements
  - If not, why? Could you meet them with more resources/money?

**If using JMeter:**

- Upload `.jmx` file to GitHub and provide link
- Include snapshot of results

---

## 2. Security Analysis

### Chosen Tool and Execution Method

For this project, I used **GitHub CodeQL** as the static analysis tool. CodeQL is integrated directly into GitHub Actions, and it supports JavaScript and TypeScript, which are the main languages in Studly. The analysis ran automatically on every push to the main branch. Results were viewed through the GitHub Security dashboard under Code Scanning Alerts.

### Static Analysis Report

The relevant alerts appear in the CodeQL findings attached in the appendix. These include multiple high severity warnings related to clear text logging in authentication controllers and utility files. These findings are documented in the provided CodeQL reports.

### Discussion of Five Randomly Selected Problems

1. **Clear text logging of FORGOT_PASSWORD_ERROR**  
   In `auth.controller.js` line 135, the code logged the error message returned from Supabase directly using `console.error`. This could reveal internal system behavior or user-related information.

2. **Clear text logging of UNEXPECTED_FORGOT_PASSWORD_ERROR**  
   In `auth.controller.js` line 144, unexpected errors were also being logged directly. Such messages can contain stack traces or internal identifiers that should not appear in logs.

3. **Clear text logging of RESET_PASSWORD_ERROR**  
   In `auth.controller.js` line 169, CodeQL flagged another instance of directly logging password reset-related errors. Since password reset workflows are sensitive, logging their internal messages increases the security exposure.

4. **Clear text logging of UNEXPECTED_RESET_PASSWORD_ERROR**  
   In `auth.controller.js` line 176, an unexpected password reset error was logged using `console.error`. These errors may contain operational details that could help an attacker understand backend behavior.

5. **Clear text logging in serverUtils.js**  
   In `serverUtils.js` line 48, CodeQL flagged `console.log(message)` because success messages in authentication flows may include values that should not be written to logs. Although this case is less severe than direct error logging, CodeQL still marked it as a high severity issue.

Across all five issues, the main pattern was the same: raw logging of system messages in authentication and password management routes. This violates secure logging practices and creates the risk of exposing sensitive information.

### Handling and Mitigation of High Severity Vulnerabilities

All high severity issues were resolved by removing `console.error` and `console.log` calls from these areas. Logging was either removed entirely or replaced with controlled and non-sensitive messages handled by centralized error and response utilities. After the fixes, CodeQL reports show that all critical and high-level issues related to clear text logging are resolved.

### Fix Commit Links

- **Removal of sensitive logging in authentication controllers:**  
  https://github.com/HaMeD1379/Studly/commit/99ffeb68f763366b50f1aee724d67c88fd0f140a

- **Removal of sensitive logging in utility functions:**  
  https://github.com/HaMeD1379/Studly/commit/d0d865f094881972c265974438ae95f9bf26e358

### CodeQL Report

- **Full CodeQL Report:** [CodeQL Report.csv](./Appendix/CodeQL%20Report.csv)

### Detected Problems

![Detected Problem 1](./Appendix/Detected%20Problems/1.png)
![Detected Problem 2](./Appendix/Detected%20Problems/2.png)
![Detected Problem 3](./Appendix/Detected%20Problems/3.png)
![Detected Problem 4](./Appendix/Detected%20Problems/4.png)

---

## 3. Continuous Integration & Deployment (CI/CD)

### CI Environment

The project uses **GitHub Actions** for continuous integration. The CI workflow is defined in `.github/workflows/ci.yml`. It runs automatically on pull requests to the main branch and on direct pushes to main. A concurrency group is used to prevent duplicate parallel runs. The CI pipeline is composed of three independent jobs: backend, frontend, and CodeQL security analysis.

### Backend Job

Runs on Ubuntu. Node.js is loaded based on the `.nvmrc` file, with a fallback to version 20. Supabase environment variables are pulled from GitHub Secrets.

**Steps:**

1. Checkout repository
2. Install dependencies with `npm ci`
3. Run ESLint for static code validation
4. Run Biome for formatting checks
5. Execute unit tests
6. Build the backend application

### Frontend Job

Runs on Ubuntu with the same Node.js setup. Supabase, Vite, and Railway credentials are supplied through GitHub Secrets.

**Steps:**

1. Checkout repository
2. Install dependencies
3. Run ESLint
4. Run Biome formatting checks
5. Execute frontend unit tests
6. Run Cypress end-to-end tests using the live development server at `http://localhost:5173`
7. Capture screenshots on test failure
8. Build the production bundle
9. Upload build artifacts

### CodeQL Security Job

Runs static security analysis for JavaScript code across the repository. It detects potential vulnerabilities, insecure patterns, and code quality issues. This job requires `security-events` write access.

**Pipeline link:**  
https://github.com/HaMeD1379/Studly/actions/workflows/ci.yml

### CD Environment

The deployment workflow is defined in `.github/workflows/cd.yml`. It runs under three conditions:

- Workflow dispatch (manual execution)
- Pushes to the main branch
- Version tag pushes following the `v*.*.*` pattern

### Build and Push Job

This workflow runs on Ubuntu and uses Docker Buildx with QEMU enabled for multi-architecture builds.

**Steps:**

1. Checkout repository
2. Initialize QEMU for cross-architecture support
3. Initialize Docker Buildx
4. Authenticate to Docker Hub using GitHub Secrets
5. Compute Docker tags:
   - `latest` for main branch deployments
   - Semantic version tags for release builds
6. Build container images defined in `infra/docker/compose.mem.yml`  
   *(This includes services for the backend, frontend, and any additional components defined in the memory-optimized compose file)*
7. Push images to Docker Hub under the configured namespace

**Pipeline link:**  
https://github.com/HaMeD1379/Studly/actions/workflows/cd.yml

### Snapshots

**Snapshot 1: CI Execution**
![CI execution](./Appendix/CI-CD%20execution/CI%20execution.png)

**Snapshot 2: CD Execution**
![CD execution](./Appendix/CI-CD%20execution/CD%20execution.png)

---

## 4. Reflections

### Design Changes

*In one paragraph (as a group): What would you change about the design of your project now that you've been through development?*

*(To be completed)*

### Project Setup Changes

*In one paragraph (as a group): What would you change about the course/project setup?*

- Requirements?
- Check-ins?
- Process changes?

Maybe less spread out requirements and more focused on the documenting and process. Ex: No mid-point demos. Some documents about worksheets and presentation requirements overlap each other—we repeat ourselves in a lot of presentations due to this.

### Individual AI / External Resource Reflection

> **Required:** One clearly labeled paragraph per team member, even if you did not use AI.

**If you used AI or external references:**  
Give an example of a problem you tried to solve, what did the tool produce (summary is fine), and what did you rewrite, validate, or learn from its response?

**If you did not use AI:**  
Why not? What influenced that choice, and how did you approach problem-solving instead?

**Length guideline:** Approximately 5–8 sentences. Focus only on your own actions and understanding.

#### Team Member 1: Ben

I did not personally use AI or external resources on this project besides framework documentation and a single stack overflow post on a JavaScript date format that was used in our time format utility. Besides those external resources, I wanted to learn the most I could from this project by practicing good standards and delving into documentation in order to really get a grasp for what I am doing. I also have experience in the past from other projects where AI starts hallucinating and going on tangents that just in the end don't help at all and sometimes cause problems with bugs or poor code. I often found it was a better use of my time to actually learn the concepts and apply it myself rather than fight with AI. On the contrary, I do know that when used properly it can be a great tool in software development. I approached problem solving primarly how I did pre-ChatGPT and all the other AIs, by thinking critically, using a pen and paper and debugging until it ended up working properly. Some took a long time and some not at all, but that's the process of software development and in the end I learned a great deal more. If this was a project where I knew all the concepts and didn't have anything major to learn, coding with AI may have been the better decision and it could save me a lot of time, but that was not the case for myself on this project.

#### Team Member 2: Shashika 

I used ai for more of the design phasing of the project. I was part of the backend team for the most part, and at the beginning we needed to design on how to structure our backend to work with the front end. The front end was already for the most part decided as our front end guys were already well experienced with it. So while doing research for how to design the backend, which consisted of watching several youtube tutorials and reading several articles, which allowed me to narrow us down to choosing a MVP pattern. However some aspects needed more refinement and explanation, which I had to help me summarize which saved me lots of time, as there were quite a lot of different options. Which eventually gave us all the info needed. However this was not perfect, as during our initial feedback meeting, it seems I did not consider adding more layers to keep our data separated. Which was a bit of a hindrance, as some refactoring needed to be made to our backend structure so that there was a layer for the data(database) as well, which we did not consider due to supabase handling a lot of it. So while the AI was helpful in coming up with ideas, I needed to double check by following youtube tutorials as well as reading a few articles on backend structure, as there was no one right way to go about this, but was helpful in saving us time, so we could focus on implementing fast. 

#### Team Member 3: Hamed
I used generative AI tools throughout the project, but always as implementation assistants rather than sources of system design. A concrete example was when I needed to make the CD pipeline push a complete backend container to Docker Hub, which required creating a self-contained image using an in-memory mock database. All the flagship models gave unclear or conflicting guidance on how to handle a memory-only database inside a container, so I designed the approach myself and only used the tools to fill in implementation details once the major decisions were made. The tools produced scaffolds, Dockerfile fragments, and suggested build sequences, but I rewrote large parts of backend.mem.Dockerfile to ensure the mock database was initialized correctly and to align everything with our existing conventions. I validated each step they suggested against the actual build environment because the generated instructions often missed practical constraints. Through this process, I learned how to refine prompts to limit unnecessary abstractions and make the output easier to integrate into our architecture. I avoided using AI for requirement gathering or core design decisions, relying instead on my own understanding of the system and my previous experience with CLI and backend tooling.

#### Team Member 4: [Name]

*(To be completed)*

#### Team Member 5: [Name]

*(To be completed)*

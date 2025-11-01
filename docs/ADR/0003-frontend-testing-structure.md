# ADR 0003: Frontend Testing Structure

## Decision
- e2e tests are located in the apps/frontend root folder under "/e2e/".
- Everything else, including integration/unit testing is done beside the file its testing in a .spec.

## Context
- By putting a .spec alongside each file we want to test, it makes it clear that testing and responsibility for each file is present and what tests what.
- Nobody has to go looking for tests due to this standard.
- It makes tests not an after thought, which is something that can easily be forgotten.

## Consequences
- No single "tests" directory, making it harder to see the full collection of tests.

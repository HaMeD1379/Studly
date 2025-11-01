# ADR 0002: Frontend Naming Standard

## Decision
- Using PascalCase for component based files and the packages holding the components.
- Using PascalCase for types as they reference results as classes or 1:1 props to components.
- Using camelCase for everything else.
- Using SCREAMING_SNAKE_CASE for constants or env variables.

## Context
- React components are used in html and best to be represented 1:1 in filenames, so therefore PascalCase is ideal.
- Types are used to define classes, objects, or compenent props in general and therfore PascalCase makes the most sense.
- This PascalCase is relevant for .tsx files in general as they contain and are used as components.
- camelCase for everything else makes a clear distinguished difference between what has UI and what doesn't.

## Consequences
- Keeping track of what needs to be PascalCase or camelCase can sometimes get easy to forget.

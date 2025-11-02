# ADR 0004: Biome Rules on the Frontend

## Decision
- Using biome's reccomended settings for the linter as it is very standardized: https://biomejs.dev/linter/
- Using biome format with overriding the defaults of space for indent with 2 space width so code is not as wide.
- Using biome format with single quotations as it is less verbose and more in line with modern standards.
- Enabled all biome's assists including organizing imports, organizing parameters, and organizing keys.

## Context
- Biome is an all in one solution to lint and format.
- Linting allows us to keep standard processes in order to avoid bugs and conflicting code.
- Formatting allows us to have a standardized code style and keep it consistent across the frontend.

## Consequences
- Enforcing a single standard can sometimes be extra work on CI if forgotten.

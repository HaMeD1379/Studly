# Studly CLI Frontend (Scaffold)

This is an early scaffold for a CLI frontend for Studly, located under `apps/cli-frontend`.

## Features (stubbed)

The following commands are wired up using [commander](https://github.com/tj/commander.js), but currently use stubbed implementations rather than real HTTP calls:

- `studly create-account --email <email> --password <password>`
- `studly login --email <email> --password <password>`
- `studly create-session --title <title> [--durationMinutes <minutes>]`
- `studly session-summary --sessionId <id>`

## Local development

From the repository root:

```bash
cd apps/cli-frontend
npm install
npm run build
node dist/index.js --help
```

> Note: HTTP calls and token storage are intentionally left as TODOs and will be implemented in a later iteration.


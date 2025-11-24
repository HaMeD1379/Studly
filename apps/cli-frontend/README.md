# Studly CLI Frontend

A command-line interface for managing study sessions with Studly. Features an interactive REPL mode with real-time feedback and traditional CLI argument support.

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run the CLI
npm start
# or for interactive mode, just run without arguments:
node dist/index.js
```

### First Run

```bash
# Interactive mode (recommended for first-time users)
npm start

# Create an account
> create-account

# Or login if you already have an account
> login

# Create a study session
> create-session

# View your session summary
> summary
```

## Features

### Authentication
- **Create Account**: `create-account` - Interactive account creation with auto-login
- **Login**: `login` - Authenticate with email and password
- **Logout**: `logout` - Sign out and clear local session

### Study Sessions
- **Create Session**: `create-session` - Start a new study session with optional duration
- **Session Summary**: `get-session-summary` or `summary` - View your study statistics

### Modes

#### Interactive REPL Mode
- Run `npm start` with no arguments for an interactive prompt
- Type `help` to see all available commands
- Use arrow keys to navigate command history
- Commands: `/r` (refresh), `/c` (clear), `exit` (quit)

#### Traditional CLI Mode
- Run commands directly with arguments:
  ```bash
  npm start login -- --email user@example.com --password Pass123!
  npm start create-session -- --title "Math Homework" --duration-minutes 60
  ```

## Configuration

Create a `.env` file based on `.env.example`:

```bash
# Backend API endpoint
STUDLY_BACKEND_URL=http://localhost:3000
```

## Development

```bash
# Build TypeScript
npm run build

# Watch mode (requires additional setup)
npm run build -- --watch
```

## Project Structure

```
src/
  ├── commands/           # Command handlers
  ├── utils/             # Utility functions (API client, config, etc.)
  ├── models/            # Type definitions
  └── index.ts           # Main entry point
```

## Requirements

- Node.js 18+
- Running Studly backend API

## Commands Reference

| Command | Mode | Example |
|---------|------|---------|
| `create-account` | Interactive | `create-account` or `create-account --email user@ex.com --password Pass123! --full-name "John Doe"` |
| `login` | Interactive | `login` or `login --email user@ex.com --password Pass123!` |
| `logout` | Both | `logout` |
| `create-session` | Interactive | `create-session` or `create-session --title "Math" --duration-minutes 60` |
| `get-session-summary` | Both | `get-session-summary` or `summary` |
| `help` | REPL | `help` |

## License

See repository LICENSE file.


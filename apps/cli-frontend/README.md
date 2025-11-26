# Studly CLI Frontend

A powerful interactive command-line interface for managing study sessions, built with TypeScript.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Studly Backend API running

### Build & Run

```bash
# 1. Install dependencies
npm install

# 2. Build the project
npm run build

# 3. Run the CLI (Interactive Mode)
node dist/index.js
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **CLI Framework**: Commander.js
- **Interactive UI**: Inquirer.js
- **HTTP Client**: Node Fetch

## 📂 File Structure

```
apps/cli-frontend/
├── src/
│   ├── commands/           # Interactive & non-interactive command logic
│   │   ├── *-interactive.command.ts  # UI/Wizard logic
│   │   └── *.command.ts              # Core logic
│   ├── utils/              # Shared utilities
│   │   ├── api.client.ts   # Backend communication
│   │   ├── screen.utils.ts # UI helpers (tables, progress bars)
│   │   └── session.storage.ts # Auth persistence
│   └── index.ts            # Entry point & REPL loop
├── dist/                   # Compiled JavaScript
└── package.json
```

## ✨ Key Features

- **Interactive REPL**: Persistent shell with command history
- **Session Management**: Real-time progress bars & countdowns
- **Rich UI**: Color-coded tables, animated spinners, and ASCII art
- **Authentication**: Secure login/signup with auto-persistence

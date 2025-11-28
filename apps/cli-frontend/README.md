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

## 🔄 CLI vs Web Frontend: Framework Comparison

While both frontends are written in TypeScript, they are fundamentally different frameworks designed for distinct user interaction paradigms:

| Aspect | CLI Frontend | Web Frontend |
|--------|--------------|--------------|
| **Framework** | Commander.js + Inquirer.js | React + React Router |
| **UI Paradigm** | Terminal-based REPL | Web browser (SPA) |
| **Rendering** | Text/ASCII output | JSX/HTML/CSS |
| **Component Model** | Command functions | React functional components |
| **State Management** | Local storage (session.storage.ts) | Zustand (store/) |
| **Styling** | ANSI color codes | Mantine UI library + CSS |
| **Runtime Environment** | Node.js process | Browser DOM |
| **User Input** | stdin/prompt questions | Form inputs & browser events |
| **Navigation** | Command-based REPL loop | React Router (URL-based) |

**Key Differences:**
- **CLI uses Commander.js** for argument parsing and command structure, while **Web uses React Router** for page navigation
- **CLI renders to terminal** using Inquirer.js prompts and ANSI colors, while **Web renders to DOM** using Mantine components
- **CLI is REPL-based** (interactive shell loop), while **Web is SPA-based** (client-side routing)
- **CLI focuses on CLI-specific UX** (tables, progress bars, spinners), while **Web focuses on web UX** (notifications, forms, layouts)

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

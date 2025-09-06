# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nettee Kanban is a production-ready Kanban board for the Nettee team, built with modern frontend technologies and integrated with Supabase for persistence. The project serves both as a real-world tool and a showcase of scalable frontend architecture.

## Development Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with Vite |
| `pnpm build` | Run TypeScript check and build production bundle |
| `pnpm lint` | Run ESLint on codebase |
| `pnpm format` | Format code with Prettier |
| `pnpm type-check:app` | Run TypeScript type checking only |
| `pnpm preview` | Preview production build locally |

**Important**: This project uses `pnpm@9.12.3` as the package manager. Always use `pnpm` instead of npm or yarn.

## Architecture

### State Management
- **Zustand** for global state management
- **filterStore** (`src/features/kanban/store/filterStore.ts`) - manages filtering for projects, teams, assignees, and labels
- **issueStore** (`src/store/issueStore.ts`) - comprehensive Kanban task management with Supabase integration
- **userStore** (`src/store/userStore.ts`) - user data management

### Data Integration
- **Supabase** for backend persistence via `@supabase/supabase-js`
- **GitHub API** integration via `octokit` for issue synchronization
- **Hybrid data model**: Maps between Supabase `KanbanTask` and frontend `IssueData` types

### Feature Organization
The codebase follows a feature-based architecture:
```
src/features/kanban/
├── components/     # UI components (KanbanBoard, Modal, Sidebar)
├── hooks/         # Custom React hooks (useDragAndDrop, useFilters, etc.)
├── store/         # Feature-specific Zustand stores
├── types/         # TypeScript type definitions
├── constants/     # Static data and configurations
└── apis/          # API integration layer
```

### UI Components
- **shadcn/ui** components in `src/shared/components/ui/`
- **Tailwind CSS v4** for styling
- **Radix UI** primitives for accessibility
- **Lucide React** for icons
- Custom icon system in `public/icons/` with size-specific directories (16, 20, 24, 32)

### Key Integrations
- **BlockNote** editor for rich text editing
- **React Day Picker** for date selection
- **date-fns** for date manipulation

## Code Conventions

### Path Aliases
- Use `@/*` for imports from `src/` directory
- Configured in `tsconfig.json` and `vite.config.ts`

### Component Structure
- Feature components in their respective feature directories
- Shared components in `src/shared/components/`
- UI primitives in `src/shared/components/ui/`

### State Management Patterns
- Zustand stores use devtools middleware for debugging
- Store actions follow async/await patterns for Supabase operations
- Mapping functions convert between frontend and backend data models

### Data Flow
1. **Frontend types** (`IssueData`) for UI components
2. **Mapping functions** (`mapKanbanTaskToIssueData`, `mapIssueDataToKanbanTask`) 
3. **Backend types** (`KanbanTask`) for Supabase operations
4. **API layer** in `src/supabase/api/` handles database operations

## Environment Setup

The project requires:
- Node.js >=20 (specified in `package.json` engines)
- pnpm@9.12.3 (exact version in packageManager field)
- Supabase configuration in `.env.local`

## Git Workflow

Uses conventional commits with these types:
- `feat:` - new features
- `fix:` - bug fixes
- `design:` - UI/UX changes
- `refactor:` - code refactoring
- `test:` - testing
- `docs:` - documentation
- `build:` - build system
- `ci:` - CI/CD
- `perf:` - performance improvements
- `chore:` - maintenance tasks

Pre-commit hooks via Husky run linting and formatting automatically.

## Testing & Quality

- ESLint with TypeScript, React, and import sorting plugins
- Prettier with Tailwind CSS plugin for code formatting
- TypeScript strict configuration
- Commitlint for consistent commit messages
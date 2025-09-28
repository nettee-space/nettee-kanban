# Development Commands

## Package Management
**Important**: This project uses `pnpm@9.12.3` as the package manager. Always use `pnpm` instead of npm or yarn.

## Core Development Commands

### Development Server
```bash
pnpm dev                 # Start development server with Vite
```

### Build & Production
```bash
pnpm build              # Run TypeScript check + build production bundle
pnpm preview            # Preview production build locally
```

### Code Quality
```bash
pnpm lint               # Run ESLint on codebase
pnpm format             # Format code with Prettier
pnpm type-check:app     # Run TypeScript type checking only
```

### Git & Staging
```bash
pnpm lint-staged        # Run linting on staged files (auto via Husky)
pnpm prepare            # Install Husky git hooks
```

## System Commands

### File Operations
```bash
ls                      # List directory contents
find . -name "*.tsx"    # Find React component files
grep -r "pattern" src/  # Search for patterns in source code
```

### Git Workflow
```bash
git status              # Check working tree status
git add .               # Stage all changes
git commit -m "feat: description"  # Commit with conventional format
git push                # Push to remote repository
```

## Task Completion Workflow

When a task is completed, run these commands in order:
1. `pnpm type-check:app` - Ensure TypeScript compliance
2. `pnpm lint` - Check code quality and style
3. `pnpm format` - Auto-format code
4. `pnpm build` - Verify production build works
5. Test functionality manually in browser
6. Commit changes with conventional commit format
# Task Completion Checklist

When any development task is completed, follow this checklist:

## 1. Code Quality Checks
```bash
# Type checking
pnpm type-check:app

# Linting 
pnpm lint

# Code formatting
pnpm format
```

## 2. Build Verification
```bash
# Ensure production build works
pnpm build
```

## 3. Manual Testing
- Test the feature in development server (`pnpm dev`)
- Verify responsive design works
- Check browser console for errors
- Test edge cases and error scenarios

## 4. Git Workflow
```bash
# Check what files changed
git status

# Stage relevant changes (exclude .env.local)
git add src/

# Commit with conventional format
git commit -m "feat: implement pin/unpin functionality for kanban cards"
```

## Important Notes

### Environment Files
- **NEVER** commit `.env.local` - contains sensitive environment variables
- Use `git reset .env.local` if accidentally staged

### Commit Guidelines  
- **NEVER** add Claude as co-author in commit messages
- Commits should only reflect human contributors
- Use meaningful descriptions that clearly explain the changes

### Pre-commit Hooks
- Husky automatically runs linting and formatting
- Fix any issues before attempting to commit
- Lint-staged only processes staged files for efficiency

## Documentation Updates
If the task involves new features or significant changes:
- Update relevant documentation files
- Update project analysis documents in `.claude/` if needed
- Consider updating README.md for user-facing features
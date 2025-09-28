# Code Style and Conventions

## TypeScript Standards
- Strict TypeScript configuration enabled
- All components must have proper type definitions
- Use interface over type for object definitions when possible
- Explicit return types for functions when not obvious

## React Patterns
- Functional components only (no class components)
- Custom hooks for reusable logic (prefix with `use`)
- Props interface naming: `[ComponentName]Props`
- Event handlers: `handle[Action]` (e.g., `handleClick`, `handleSubmit`)

## Import Organization
```typescript
// 1. React and core libraries
import { useState, useEffect } from 'react';

// 2. Third-party libraries  
import { clsx } from 'clsx';

// 3. Internal imports with @ alias
import { Button } from '@/shared/components/ui/button';
import { useIssueStore } from '@/store/issueStore';

// 4. Relative imports
import { KanbanCard } from './KanbanCard';
```

## Path Aliases
- Use `@/*` for imports from `src/` directory
- Configured in `tsconfig.json` and `vite.config.ts`
- Prefer absolute imports over relative when possible

## Component Structure
```typescript
interface ComponentProps {
  // Props definition
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Hooks first
  const [state, setState] = useState();
  
  // Event handlers
  const handleAction = () => {
    // Implementation
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

## State Management
- Use Zustand for global state
- Store files: `[feature]Store.ts` pattern
- Actions should be async/await for Supabase operations
- Include devtools middleware for debugging

## CSS and Styling
- Tailwind CSS classes only (no custom CSS unless absolutely necessary)
- Use `cn()` utility for conditional classes
- Component variants via class-variance-authority
- Responsive design mobile-first approach

## File Naming
- Components: PascalCase (`KanbanCard.tsx`)
- Hooks: camelCase with `use` prefix (`useDragAndDrop.ts`)
- Stores: camelCase with `Store` suffix (`issueStore.ts`)
- Types: camelCase (`issues.ts`)
- Constants: camelCase (`kanban.ts`)

## Git Conventions
Use conventional commits with these types:
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
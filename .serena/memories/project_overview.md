# Nettee Kanban Project Overview

## Purpose
Nettee Kanban is a production-ready Kanban board designed specifically for the Nettee team to enhance productivity and collaboration. This is a real-world application currently being used for actual work, not just a demo project.

## Tech Stack

### Frontend
- **React 19** + **TypeScript** - Modern component-based UI
- **Vite** - Fast build tool with SWC compiler
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - Accessibility-first UI components built on Radix UI

### State Management
- **Zustand** - Lightweight state management library
- Feature-based store organization (filterStore, issueStore, userStore)

### Backend & Database
- **Supabase** - PostgreSQL-based Backend-as-a-Service
- **@supabase/supabase-js** - Client library for database operations
- **GitHub API (Octokit)** - Issue synchronization and template integration

### Additional Libraries
- **@blocknote/react** - Rich text editor
- **react-day-picker** - Date selection components  
- **date-fns** - Date manipulation utilities
- **lucide-react** - Icon library
- **class-variance-authority** - Component variant management

## Architecture

### Feature-Based Structure
```
src/features/kanban/
├── components/     # UI components (KanbanBoard, Modal, Sidebar)
├── hooks/         # Custom React hooks (useDragAndDrop, useFilters)
├── store/         # Feature-specific Zustand stores
├── types/         # TypeScript type definitions  
├── constants/     # Static data and configurations
└── apis/          # API integration layer
```

### Key Components
- **KanbanBoard**: Main board interface with drag-and-drop
- **KanbanCard**: Individual task cards with pin/sub-task functionality
- **KanbanColumn**: Progress-based columns (TODO, DOING, DONE)
- **KanbanModal**: Task creation/editing with GitHub integration
- **Sidebar**: Filtering and view options

### Data Model
- **Frontend Type**: `IssueData` - UI-optimized task representation
- **Backend Type**: `KanbanTask` - Database schema
- **Mapping Functions**: Convert between frontend and backend types
- **Hybrid Approach**: Maintains GitHub issue compatibility

## Current Features
- Drag-and-drop task management
- Sub-task hierarchy system
- Pin/unpin functionality with area separation
- GitHub issue integration and templates
- Multi-level filtering (project, team, assignee, labels)
- Rich text editing with BlockNote
- Date-based task scheduling
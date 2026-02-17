---
description: Repository Information Overview
alwaysApply: true
---

# LifeOS Information

## Summary
LifeOS is a hybrid Life Management/Productivity/Mental Clarity application that structures your life as multiple immersive "worlds" or "planets." It features a 3D galaxy visualization (God View) where each world is represented as a planet, with comprehensive task management, timeline visualization, energy tracking, and planned AI integration for context-aware suggestions and cross-world analytics.

## Structure
```
lifeos/
├── public/               # Static assets (favicon)
├── src/
│   ├── components/       # Reusable UI components
│   │   └── ui/          # Base UI components (LoadingScreen, etc.)
│   ├── features/        # Feature-based modules
│   │   ├── god-view/    # 3D galaxy visualization with planets
│   │   ├── world-view/  # Task management dashboard per world
│   │   └── dashboard/   # Main dashboard view
│   ├── lib/             # Utilities and API integrations
│   ├── stores/          # Zustand state management
│   ├── types/           # TypeScript type definitions
│   ├── styles/          # Global CSS and Tailwind styles
│   ├── App.tsx          # Main application router
│   └── main.tsx         # Application entry point
├── .env.example         # Environment variable template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite build configuration
└── tailwind.config.js   # Tailwind CSS configuration
```

### Main Repository Components
- **God View**: 3D galaxy visualization with procedural planets representing different life worlds
- **World View**: Per-world dashboard with task management, timeline, and energy tracking
- **Dashboard View**: Comprehensive overview across all worlds
- **UI Components**: Radix UI-based component library with custom cosmic theme

## Language & Runtime
**Language**: TypeScript (ES2020 target)  
**Runtime**: Node.js 18+  
**Build System**: Vite 5  
**Package Manager**: npm  
**Module System**: ESNext (ES Modules)

### TypeScript Configuration
- Strict mode enabled with no unused locals/parameters
- Path aliases for `@/*` pointing to `src/*` subdirectories
- React JSX with react-jsx transform
- Module resolution: bundler

## Dependencies
**Main Dependencies**:
- **react** (^18.2.0): UI framework
- **three** (^0.161.0) + **@react-three/fiber** (^8.15.16) + **@react-three/drei** (^9.96.5): 3D graphics and visualization
- **@supabase/supabase-js** (^2.39.3): Database and authentication
- **zustand** (^4.5.0): State management with persistence
- **framer-motion** (^11.0.3): Animations and transitions
- **@dnd-kit/core** (^6.1.0) + **@dnd-kit/sortable** (^8.0.0): Drag-and-drop functionality
- **react-router-dom** (^6.22.0): Client-side routing
- **tailwindcss** (^3.4.1): Utility-first CSS framework
- **Radix UI** components: Accessible UI primitives (dialog, dropdown, tabs, tooltip, etc.)
- **lucide-react** (^0.323.0): Icon library
- **date-fns** (^3.3.1): Date manipulation
- **clsx** (^2.1.0) + **tailwind-merge** (^2.2.1): Class name utilities

**Development Dependencies**:
- **typescript** (^5.3.3): Type checking
- **eslint** (^8.56.0) + **@typescript-eslint**: Linting
- **prettier** (^3.2.5): Code formatting
- **vitest** (^1.2.2): Testing framework
- **@testing-library/react** (^14.2.1) + **@testing-library/jest-dom** (^6.4.2): React testing utilities
- **@vitejs/plugin-react** (^4.2.1): Vite React plugin
- **jsdom** (^24.0.0): DOM implementation for testing

## Build & Installation
```bash
# Install dependencies
npm install

# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Format code
npm run format
```

### Environment Setup
Create a `.env` file based on `.env.example`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Build Configuration
- Output directory: `dist/`
- Source maps enabled
- Manual chunks for vendor code optimization:
  - `three-vendor`: Three.js and React Three Fiber libraries
  - `ui-vendor`: Framer Motion and dnd-kit libraries
- Port: 3000 (development)

## Testing
**Framework**: Vitest (^1.2.2)  
**Test Location**: No test files currently present  
**Naming Convention**: Standard `.test.ts` or `.spec.ts` patterns  
**Testing Libraries**: 
- @testing-library/react for component testing
- @testing-library/jest-dom for DOM assertions
- jsdom for DOM environment

**Run Commands**:
```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Database
**Database**: Supabase (PostgreSQL)  
**Client**: @supabase/supabase-js

**Database Commands**:
```bash
# Generate TypeScript types from Supabase schema
npm run db:generate

# Push database migrations
npm run db:migrate
```

## Main Entry Points
- **Application Root**: `src/main.tsx` (ReactDOM render with React Router)
- **Main App**: `src/App.tsx` (Route configuration with lazy-loaded views)
- **Routes**:
  - `/` → God View (3D galaxy)
  - `/world/:worldId` → World View (task management)
  - `/dashboard` → Dashboard View
- **HTML Entry**: `index.html` (Vite entry point)

## Deployment
**Planned Platforms**: 
- Vercel (frontend hosting)
- Render (backend/database)

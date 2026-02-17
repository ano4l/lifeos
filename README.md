# LifeOS

A hybrid Life Management / Productivity / Mental Clarity application that structures your life as multiple immersive "worlds" or "planets."

## Features

### God View (Galaxy Overview)
- 3D galaxy visualization with procedural planets
- Each world represented as a planet with unique textures and themes
- Planet size reflects importance, glow indicates attention needed
- Rotation speed based on task urgency and deadlines
- Satellites for informational updates, rockets for urgent events
- Conflict visualization through proximity/pressure fields

### World View (Dashboard)
- Comprehensive task management with drag-and-drop
- Timeline view for deadline visualization
- Energy tracking and management
- Activity summaries with circular progress indicators
- Quick-add tasks with priority, tags, and scheduling

### AI Integration (Planned)
- World AI: Context-aware task suggestions per world
- Meta AI: Cross-world analytics and conflict detection
- Configurable AI personalities (manager, coach, strategist)

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **3D Graphics**: Three.js with React Three Fiber
- **Styling**: Tailwind CSS with custom cosmic theme
- **State Management**: Zustand with persistence
- **Animations**: Framer Motion
- **Drag & Drop**: dnd-kit
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel + Render

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
lifeos/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── ui/
│   │       └── LoadingScreen.tsx
│   ├── features/
│   │   ├── god-view/
│   │   │   ├── GodView.tsx
│   │   │   └── components/
│   │   │       ├── Galaxy.tsx
│   │   │       ├── Planet.tsx
│   │   │       ├── GodViewHUD.tsx
│   │   │       └── CreateWorldModal.tsx
│   │   └── world-view/
│   │       ├── WorldView.tsx
│   │       └── components/
│   │           ├── TaskList.tsx
│   │           ├── TaskItem.tsx
│   │           ├── Timeline.tsx
│   │           ├── EnergyGauge.tsx
│   │           ├── ActivitySummary.tsx
│   │           └── QuickAddTask.tsx
│   ├── stores/
│   │   └── useWorldStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Usage

1. **Start in God View**: You'll see an empty galaxy on first launch
2. **Create a World**: Click the + button to create your first world
3. **Customize**: Choose name, color, surface texture, and AI personality
4. **Enter World**: Click on a planet to enter the World View
5. **Manage Tasks**: Add, edit, drag-drop, and complete tasks
6. **Track Energy**: Monitor your energy levels per world
7. **Return to Galaxy**: Click back arrow to return to God View

## Roadmap

- [x] God View with 3D galaxy
- [x] Procedural planet generation
- [x] World View dashboard
- [x] Task management with drag-drop
- [x] Timeline and energy tracking
- [ ] Supabase database integration
- [ ] Anonymous authentication
- [ ] World AI integration
- [ ] Meta AI analytics
- [ ] Mobile responsive design
- [ ] PWA support
- [ ] Conflict detection visualization

## License

MIT

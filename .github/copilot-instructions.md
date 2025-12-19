# Studygram - AI Coding Instructions

## Overview
Studygram is a **Y2K-aesthetic academic organizer PWA** built with Next.js 16, React 19, Firebase, and Tailwind CSS 4. It targets Thai students with a nostalgic paper/folder visual design. All UI text is in Thai.

## Architecture

### Data Flow
```
Firebase Auth → AuthContext → useAuth() hook
Firestore → firebaseServices.ts → useFirebaseData hooks → Components
```

- **Contexts** (`src/contexts/`): Wrap app in `Providers` (`src/app/providers.tsx`) with order: Theme → Music → Auth
- **Hooks** (`src/hooks/useFirebaseData.ts`): All Firestore CRUD operations exposed via custom hooks (`useSubjects`, `useHomework`, `useTodos`, `useSchedule`, `useUserStats`, `useUserSettings`)
- **Services** (`src/lib/firebaseServices.ts`): Raw Firestore operations with TypeScript interfaces

### Component Organization
```
src/components/
├── auth/       # Login components
├── layout/     # DesktopLayout, FolderLayout, Navbar
├── tutorial/   # Onboarding overlay
├── ui/         # Reusable Y2K-styled primitives
└── widgets/    # Clock, Timer, Music, Todo widgets
```

Each folder has an `index.ts` barrel export. Import from folder, not file: `import { PaperCard } from "@/components/ui"`.

## Key Patterns

### Component Creation
- Always add `"use client"` directive for interactive components
- Use Framer Motion for animations (`motion.div`, `AnimatePresence`)
- Follow Y2K design: `border-2 border-black`, `shadow-hard` class, pastel colors from CSS vars
- Support dark mode: always pair light/dark classes (e.g., `bg-[#FFFEF9] dark:bg-[#2D2D2D]`)

### Styling Conventions
- **Fonts**: `font-felipa` (decorative headings), `font-kanit` (Thai body text)
- **Colors**: Use CSS variables from `globals.css` (`--pastel-yellow`, `--pastel-pink`, etc.)
- **Shadows**: `shadow-hard`, `shadow-hard-sm`, `shadow-hard-lg` (not regular Tailwind shadows)
- **Responsive**: Mobile-first, use `lg:` prefix for desktop adjustments

### Firebase Data Hooks
```tsx
// Always destructure loading/error states
const { subjects, loading, error, addSubject, removeSubject } = useSubjects();

// Hooks auto-fetch on mount and refetch after mutations
// User context comes from useAuth() - never pass userId manually to hooks
```

### Adding New Firestore Collections
1. Define TypeScript interface in `firebaseServices.ts`
2. Add CRUD functions following existing patterns (use `serverTimestamp()`, `where("userId", "==", userId)`)
3. Create hook in `useFirebaseData.ts` following `useSubjects` pattern
4. Export from `src/hooks/index.ts`

## Development

```bash
bun run dev    # Start dev server (port 3000)
bun run build  # Production build
bun run lint   # ESLint
```

### Environment Variables
Create `.env.local` with Firebase config:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## File Conventions
- Pages: `src/app/[route]/page.tsx` (Next.js App Router)
- New UI components: Add to `src/components/ui/`, export from `index.ts`
- New widgets: Add to `src/components/widgets/`, export from `index.ts`
- Lucide icons only: `import { IconName } from "lucide-react"`

## Critical Notes
- **Thai-first UI**: All user-facing strings in Thai
- **PWA-ready**: Manifest at `public/manifest.json`, icons in `public/icons/`
- **Dark mode forced**: Currently `forceDarkMode=true` in ThemeContext
- **No test framework**: Project has no test setup currently

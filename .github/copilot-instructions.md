# studyblog - AI Coding Instructions

## 1. Project Overview
**studyblog** is an academic organizer PWA for Thai students, featuring a nostalgic **Y2K aesthetic**.
- **Stack**: Next.js 16 (App Router), React 19, Firebase v12, Tailwind CSS v4.
- **Language**: TypeScript throughout.
- **Localization**: UI text MUST be in **Thai** (font: `Kanit`). Headings use `Felipa`.
- **Target**: Mobile-first PWA, but fully responsive for desktop.

## 2. Architecture & Data Flow

### Firebase Integration
Data flow is strictly uni-directional from service to hook to component:
1.  **Service Layer** (`src/lib/firebaseServices.ts`):
    -   Raw Firestore operations using the modular SDK (`getDocs`, `addDoc`).
    -   Type definitions (`Subject`, `Homework`, `Todo`).
    -   **Pattern**: Return simple Promises. Do not manage state here.
2.  **Hooks Layer** (`src/hooks/useFirebaseData.ts`):
    -   Consumes services and `useAuth`.
    -   Manages local state (`const [data, setData] = useState(...)`).
    -   Exposes CRUD methods (`addSubject`, `deleteTodo`).
    -   **Pattern**: Always handle `loading` and `error` states.
3.  **Contexts** (`src/contexts/`):
    -   Global app state: `AuthContext` (User), `ThemeContext` (Dark/Light), `MusicContext` (Player).
    -   Wrapped in `src/app/providers.tsx`.

### Component Structure
-   **`src/components/ui/`**: Reusable primitives with Y2K styling (e.g., `PaperCard`, `RetroButton`).
-   **`src/components/widgets/`**: Functional blocks like `TimerWidget`, `MusicPlayer`.
-   **`src/components/layout/`**: `DesktopLayout`, `FolderLayout`.
-   **Imports**: Use barrel files! `import { PaperCard } from "@/components/ui"`.

## 3. Styling & Y2K Aesthetic
-   **Tailwind v4**: Uses `@import "tailwindcss";` in `globals.css`.
-   **Design Tokens**: Use CSS variables defined in `globals.css`:
    -   Colors: `--pastel-yellow`, `--pastel-pink`, `--paper-white`.
    -   Borders: `--border-black`.
-   **Core UI Pattern**:
    -   **Borders**: `border-2 border-black` (or `var(--border-black)`).
    -   **Shadows**: Use custom `shadow-hard`, `shadow-hard-sm` for that distinct hard-edge retro look.
    -   **Rounded**: Generally `rounded-xl` or `rounded-2xl` for soft but boxed feel.
-   **Dark Mode**:
    -   Respect `dark:` variants.
    -   Backgrounds change from `bg-[#FFFEF9]` (paper) to `bg-[#2D2D2D]` (dark grey/black).

## 4. Coding Conventions
-   **Directives**: Always add `"use client"` at the top of interactive components.
-   **Icons**: Use `lucide-react`.
-   **Animation**: `framer-motion` for transitions.
-   **Mobile First**: Design for `<640px` first, then add `lg:` for desktop overrides.
-   **Files**:
    -   Next.js App Router: `page.tsx` for routes.
    -   Use `index.ts` to export folder contents.

## 5. Critical Developer Commands
-   **Dev Server**: `bun run dev` (Port 3000).
-   **Build**: `bun run build`.
-   **Lint**: `bun run lint`.
-   **Testing**: No automated tests currently. Test manually in browser/simulator.

## 6. Common Tasks
-   **Adding a Collection**:
    1.  Add interface to `src/lib/firebaseServices.ts`.
    2.  Add CRUD functions to `src/lib/firebaseServices.ts`.
    3.  Create/Update hook in `src/hooks/useFirebaseData.ts`.
    4.  Update UI to consume hook.
-   **New Page**:
    1.  Create `src/app/[feature]/page.tsx`.
    2.  Use `FolderLayout` or `DesktopLayout` wrapper.
    3.  Add entry to `Navbar.tsx` or `DesktopLayout.tsx` navigation.

## 7. Known Issues / Quirks
-   **Firebase Indexes**: If queries fail, check browser console for index creation links.
-   **Hydration**: Ensure `useEffect` is used for client-side only logic to avoid mismatched content.
-   **CSS Variables**: Tailwind 4 automatically picks up CSS variables, so you can use `bg-[--pastel-pink]` directly if needed, but prefer defined utility classes if available.

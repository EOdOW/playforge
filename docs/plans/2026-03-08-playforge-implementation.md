# PlayForge Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a web app for youth/rec football coaches to create, save, and share custom football plays using a canvas-based drag-and-drop editor.

**Architecture:** React SPA with Konva.js canvas for the play editor. Zustand manages state with undo/redo middleware. All data persists in localStorage — no backend. Shareable links encode play data in URL hash via lz-string compression.

**Tech Stack:** React 18, TypeScript, Vite, Konva.js/react-konva, Zustand, Tailwind CSS, jsPDF, lz-string

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `vite.config.ts`, `index.html`
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css`

**Step 1: Initialize Vite React-TS project**

Run:
```bash
npm create vite@latest . -- --template react-ts
```

If prompted about non-empty directory, select "Ignore files and continue".

**Step 2: Install dependencies**

Run:
```bash
npm install konva react-konva zustand lz-string jspdf
npm install -D tailwindcss @tailwindcss/vite
```

**Step 3: Configure Tailwind**

Replace `src/index.css` with:
```css
@import "tailwindcss";
```

Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**Step 4: Set up App shell**

Replace `src/App.tsx` with:
```tsx
function App() {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-slate-800 text-white px-4 py-2 flex items-center gap-4">
        <h1 className="text-lg font-bold">PlayForge</h1>
      </header>
      <main className="flex-1 flex items-center justify-center text-gray-400">
        Canvas goes here
      </main>
    </div>
  )
}

export default App
```

**Step 5: Verify it runs**

Run: `npm run dev`
Expected: Browser shows dark header with "PlayForge" and gray placeholder text.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffold project with Vite, React, Tailwind, and dependencies"
```

---

### Task 2: TypeScript Types & Data Model

**Files:**
- Create: `src/types/play.ts`
- Create: `src/data/formations.ts`
- Create: `src/data/routes.ts`

**Step 1: Define core types**

Create `src/types/play.ts`:
```typescript
export interface Point {
  x: number;
  y: number;
}

export type Team = 'offense' | 'defense';
export type RouteStyle = 'solid' | 'dashed';

export interface Player {
  id: string;
  team: Team;
  position: string;
  label: string;
  x: number;
  y: number;
}

export interface Route {
  id: string;
  playerId: string;
  type: string;
  controlPoints: Point[];
  style: RouteStyle;
}

export interface Play {
  id: string;
  name: string;
  scrimmageLineY: number;
  players: Player[];
  routes: Route[];
  createdAt: number;
  updatedAt: number;
}

export interface Formation {
  name: string;
  team: Team;
  players: Omit<Player, 'id'>[];
}

export interface RouteTemplate {
  name: string;
  type: string;
  category: 'receiver' | 'rb' | 'blocking';
  defaultControlPoints: Point[];
}
```

**Step 2: Define formation templates**

Create `src/data/formations.ts`:
```typescript
import { Formation } from '../types/play';

// Field coordinate system: x = 0-1000 (sideline to sideline), y = 0-600 (end zone to mid-field)
// Scrimmage line is at y ~= 400 by default
// Players positioned relative to center of field (x=500)

export const offenseFormations: Formation[] = [
  {
    name: 'I-Formation',
    team: 'offense',
    players: [
      { team: 'offense', position: 'C', label: 'C', x: 500, y: 400 },
      { team: 'offense', position: 'LG', label: 'LG', x: 460, y: 400 },
      { team: 'offense', position: 'RG', label: 'RG', x: 540, y: 400 },
      { team: 'offense', position: 'LT', label: 'LT', x: 420, y: 400 },
      { team: 'offense', position: 'RT', label: 'RT', x: 580, y: 400 },
      { team: 'offense', position: 'TE', label: 'TE', x: 620, y: 400 },
      { team: 'offense', position: 'WR', label: 'WR', x: 200, y: 400 },
      { team: 'offense', position: 'QB', label: 'QB', x: 500, y: 440 },
      { team: 'offense', position: 'FB', label: 'FB', x: 500, y: 480 },
      { team: 'offense', position: 'RB', label: 'RB', x: 500, y: 520 },
      { team: 'offense', position: 'WR', label: 'WR', x: 800, y: 400 },
    ],
  },
  {
    name: 'Shotgun',
    team: 'offense',
    players: [
      { team: 'offense', position: 'C', label: 'C', x: 500, y: 400 },
      { team: 'offense', position: 'LG', label: 'LG', x: 460, y: 400 },
      { team: 'offense', position: 'RG', label: 'RG', x: 540, y: 400 },
      { team: 'offense', position: 'LT', label: 'LT', x: 420, y: 400 },
      { team: 'offense', position: 'RT', label: 'RT', x: 580, y: 400 },
      { team: 'offense', position: 'WR', label: 'WR', x: 150, y: 400 },
      { team: 'offense', position: 'WR', label: 'WR', x: 300, y: 400 },
      { team: 'offense', position: 'WR', label: 'WR', x: 700, y: 400 },
      { team: 'offense', position: 'QB', label: 'QB', x: 500, y: 470 },
      { team: 'offense', position: 'RB', label: 'RB', x: 550, y: 470 },
      { team: 'offense', position: 'TE', label: 'TE', x: 620, y: 400 },
    ],
  },
  {
    name: 'Single Back',
    team: 'offense',
    players: [
      { team: 'offense', position: 'C', label: 'C', x: 500, y: 400 },
      { team: 'offense', position: 'LG', label: 'LG', x: 460, y: 400 },
      { team: 'offense', position: 'RG', label: 'RG', x: 540, y: 400 },
      { team: 'offense', position: 'LT', label: 'LT', x: 420, y: 400 },
      { team: 'offense', position: 'RT', label: 'RT', x: 580, y: 400 },
      { team: 'offense', position: 'TE', label: 'TE', x: 620, y: 400 },
      { team: 'offense', position: 'WR', label: 'WR', x: 150, y: 400 },
      { team: 'offense', position: 'WR', label: 'WR', x: 850, y: 400 },
      { team: 'offense', position: 'QB', label: 'QB', x: 500, y: 440 },
      { team: 'offense', position: 'RB', label: 'RB', x: 500, y: 490 },
      { team: 'offense', position: 'WR', label: 'WR', x: 300, y: 400 },
    ],
  },
  {
    name: 'Wishbone',
    team: 'offense',
    players: [
      { team: 'offense', position: 'C', label: 'C', x: 500, y: 400 },
      { team: 'offense', position: 'LG', label: 'LG', x: 460, y: 400 },
      { team: 'offense', position: 'RG', label: 'RG', x: 540, y: 400 },
      { team: 'offense', position: 'LT', label: 'LT', x: 420, y: 400 },
      { team: 'offense', position: 'RT', label: 'RT', x: 580, y: 400 },
      { team: 'offense', position: 'TE', label: 'TE', x: 620, y: 400 },
      { team: 'offense', position: 'WR', label: 'WR', x: 200, y: 400 },
      { team: 'offense', position: 'QB', label: 'QB', x: 500, y: 440 },
      { team: 'offense', position: 'FB', label: 'FB', x: 500, y: 480 },
      { team: 'offense', position: 'RB', label: 'RB', x: 450, y: 520 },
      { team: 'offense', position: 'RB', label: 'RB', x: 550, y: 520 },
    ],
  },
  {
    name: 'Spread',
    team: 'offense',
    players: [
      { team: 'offense', position: 'C', label: 'C', x: 500, y: 400 },
      { team: 'offense', position: 'LG', label: 'LG', x: 460, y: 400 },
      { team: 'offense', position: 'RG', label: 'RG', x: 540, y: 400 },
      { team: 'offense', position: 'LT', label: 'LT', x: 420, y: 400 },
      { team: 'offense', position: 'RT', label: 'RT', x: 580, y: 400 },
      { team: 'offense', position: 'WR', label: 'WR', x: 100, y: 400 },
      { team: 'offense', position: 'WR', label: 'WR', x: 250, y: 400 },
      { team: 'offense', position: 'WR', label: 'WR', x: 750, y: 400 },
      { team: 'offense', position: 'WR', label: 'WR', x: 900, y: 400 },
      { team: 'offense', position: 'QB', label: 'QB', x: 500, y: 470 },
      { team: 'offense', position: 'RB', label: 'RB', x: 550, y: 470 },
    ],
  },
];

export const defenseFormations: Formation[] = [
  {
    name: '4-3',
    team: 'defense',
    players: [
      { team: 'defense', position: 'DE', label: 'DE', x: 380, y: 370 },
      { team: 'defense', position: 'DT', label: 'DT', x: 460, y: 370 },
      { team: 'defense', position: 'DT', label: 'DT', x: 540, y: 370 },
      { team: 'defense', position: 'DE', label: 'DE', x: 620, y: 370 },
      { team: 'defense', position: 'LB', label: 'WLB', x: 350, y: 330 },
      { team: 'defense', position: 'LB', label: 'MLB', x: 500, y: 330 },
      { team: 'defense', position: 'LB', label: 'SLB', x: 650, y: 330 },
      { team: 'defense', position: 'CB', label: 'CB', x: 150, y: 350 },
      { team: 'defense', position: 'CB', label: 'CB', x: 850, y: 350 },
      { team: 'defense', position: 'S', label: 'FS', x: 400, y: 250 },
      { team: 'defense', position: 'S', label: 'SS', x: 600, y: 270 },
    ],
  },
  {
    name: '3-4',
    team: 'defense',
    players: [
      { team: 'defense', position: 'DE', label: 'DE', x: 400, y: 370 },
      { team: 'defense', position: 'NT', label: 'NT', x: 500, y: 370 },
      { team: 'defense', position: 'DE', label: 'DE', x: 600, y: 370 },
      { team: 'defense', position: 'LB', label: 'LOLB', x: 330, y: 330 },
      { team: 'defense', position: 'LB', label: 'LILB', x: 450, y: 330 },
      { team: 'defense', position: 'LB', label: 'RILB', x: 550, y: 330 },
      { team: 'defense', position: 'LB', label: 'ROLB', x: 670, y: 330 },
      { team: 'defense', position: 'CB', label: 'CB', x: 150, y: 350 },
      { team: 'defense', position: 'CB', label: 'CB', x: 850, y: 350 },
      { team: 'defense', position: 'S', label: 'FS', x: 400, y: 250 },
      { team: 'defense', position: 'S', label: 'SS', x: 600, y: 270 },
    ],
  },
  {
    name: 'Cover 2',
    team: 'defense',
    players: [
      { team: 'defense', position: 'DE', label: 'DE', x: 380, y: 370 },
      { team: 'defense', position: 'DT', label: 'DT', x: 460, y: 370 },
      { team: 'defense', position: 'DT', label: 'DT', x: 540, y: 370 },
      { team: 'defense', position: 'DE', label: 'DE', x: 620, y: 370 },
      { team: 'defense', position: 'LB', label: 'WLB', x: 350, y: 330 },
      { team: 'defense', position: 'LB', label: 'MLB', x: 500, y: 330 },
      { team: 'defense', position: 'LB', label: 'SLB', x: 650, y: 330 },
      { team: 'defense', position: 'CB', label: 'CB', x: 150, y: 370 },
      { team: 'defense', position: 'CB', label: 'CB', x: 850, y: 370 },
      { team: 'defense', position: 'S', label: 'FS', x: 300, y: 220 },
      { team: 'defense', position: 'S', label: 'SS', x: 700, y: 220 },
    ],
  },
  {
    name: 'Cover 3',
    team: 'defense',
    players: [
      { team: 'defense', position: 'DE', label: 'DE', x: 380, y: 370 },
      { team: 'defense', position: 'DT', label: 'DT', x: 460, y: 370 },
      { team: 'defense', position: 'DT', label: 'DT', x: 540, y: 370 },
      { team: 'defense', position: 'DE', label: 'DE', x: 620, y: 370 },
      { team: 'defense', position: 'LB', label: 'WLB', x: 380, y: 320 },
      { team: 'defense', position: 'LB', label: 'MLB', x: 500, y: 320 },
      { team: 'defense', position: 'LB', label: 'SLB', x: 620, y: 320 },
      { team: 'defense', position: 'CB', label: 'CB', x: 150, y: 370 },
      { team: 'defense', position: 'CB', label: 'CB', x: 850, y: 370 },
      { team: 'defense', position: 'S', label: 'FS', x: 500, y: 200 },
      { team: 'defense', position: 'S', label: 'SS', x: 650, y: 280 },
    ],
  },
  {
    name: 'Man-to-Man',
    team: 'defense',
    players: [
      { team: 'defense', position: 'DE', label: 'DE', x: 380, y: 370 },
      { team: 'defense', position: 'DT', label: 'DT', x: 460, y: 370 },
      { team: 'defense', position: 'DT', label: 'DT', x: 540, y: 370 },
      { team: 'defense', position: 'DE', label: 'DE', x: 620, y: 370 },
      { team: 'defense', position: 'LB', label: 'WLB', x: 350, y: 330 },
      { team: 'defense', position: 'LB', label: 'MLB', x: 500, y: 330 },
      { team: 'defense', position: 'LB', label: 'SLB', x: 650, y: 330 },
      { team: 'defense', position: 'CB', label: 'CB', x: 180, y: 380 },
      { team: 'defense', position: 'CB', label: 'CB', x: 820, y: 380 },
      { team: 'defense', position: 'S', label: 'FS', x: 500, y: 220 },
      { team: 'defense', position: 'S', label: 'SS', x: 600, y: 280 },
    ],
  },
];
```

**Step 3: Define route templates**

Create `src/data/routes.ts`:
```typescript
import { RouteTemplate } from '../types/play';

// Control points are relative offsets from the player's position
// y is negative = upfield (toward opponent's end zone)

export const routeTemplates: RouteTemplate[] = [
  // Receiver routes
  {
    name: 'Slant',
    type: 'slant',
    category: 'receiver',
    defaultControlPoints: [
      { x: 0, y: -30 },
      { x: 60, y: -80 },
    ],
  },
  {
    name: 'Post',
    type: 'post',
    category: 'receiver',
    defaultControlPoints: [
      { x: 0, y: -60 },
      { x: 40, y: -140 },
    ],
  },
  {
    name: 'Corner',
    type: 'corner',
    category: 'receiver',
    defaultControlPoints: [
      { x: 0, y: -60 },
      { x: -60, y: -140 },
    ],
  },
  {
    name: 'Out',
    type: 'out',
    category: 'receiver',
    defaultControlPoints: [
      { x: 0, y: -60 },
      { x: -80, y: -60 },
    ],
  },
  {
    name: 'In',
    type: 'in',
    category: 'receiver',
    defaultControlPoints: [
      { x: 0, y: -60 },
      { x: 80, y: -60 },
    ],
  },
  {
    name: 'Curl',
    type: 'curl',
    category: 'receiver',
    defaultControlPoints: [
      { x: 0, y: -80 },
      { x: 0, y: -65 },
    ],
  },
  {
    name: 'Go/Fly',
    type: 'go',
    category: 'receiver',
    defaultControlPoints: [
      { x: 0, y: -150 },
    ],
  },
  {
    name: 'Hitch',
    type: 'hitch',
    category: 'receiver',
    defaultControlPoints: [
      { x: 0, y: -40 },
      { x: 0, y: -30 },
    ],
  },
  {
    name: 'Drag',
    type: 'drag',
    category: 'receiver',
    defaultControlPoints: [
      { x: 0, y: -20 },
      { x: 120, y: -20 },
    ],
  },
  {
    name: 'Wheel',
    type: 'wheel',
    category: 'receiver',
    defaultControlPoints: [
      { x: -30, y: -10 },
      { x: -40, y: -60 },
      { x: 0, y: -150 },
    ],
  },
  // RB/FB routes
  {
    name: 'Flat',
    type: 'flat',
    category: 'rb',
    defaultControlPoints: [
      { x: -60, y: -20 },
    ],
  },
  {
    name: 'Swing',
    type: 'swing',
    category: 'rb',
    defaultControlPoints: [
      { x: -30, y: 10 },
      { x: -80, y: -30 },
    ],
  },
  {
    name: 'Check & Release',
    type: 'check-release',
    category: 'rb',
    defaultControlPoints: [
      { x: 0, y: -10 },
      { x: 40, y: -60 },
    ],
  },
  {
    name: 'Dive',
    type: 'dive',
    category: 'rb',
    defaultControlPoints: [
      { x: 20, y: -50 },
    ],
  },
  // Blocking
  {
    name: 'Block',
    type: 'block',
    category: 'blocking',
    defaultControlPoints: [
      { x: 0, y: -25 },
    ],
  },
];
```

**Step 4: Commit**

```bash
git add src/types/ src/data/
git commit -m "feat: add TypeScript types, formation templates, and route definitions"
```

---

### Task 3: Zustand Store — Play State & Undo/Redo

**Files:**
- Create: `src/store/playStore.ts`
- Create: `src/store/uiStore.ts`
- Create: `src/utils/ids.ts`

**Step 1: Create ID utility**

Create `src/utils/ids.ts`:
```typescript
let counter = 0;

export function generateId(): string {
  return `${Date.now()}-${counter++}`;
}
```

**Step 2: Create the play store with undo/redo**

Create `src/store/playStore.ts`:
```typescript
import { create } from 'zustand';
import { Play, Player, Route, Point } from '../types/play';
import { generateId } from '../utils/ids';

interface HistoryEntry {
  players: Player[];
  routes: Route[];
  scrimmageLineY: number;
}

interface PlayState {
  // Current play
  currentPlay: Play | null;

  // Undo/redo
  history: HistoryEntry[];
  historyIndex: number;

  // Actions
  newPlay: () => void;
  loadPlay: (play: Play) => void;
  setPlayName: (name: string) => void;

  // Player actions
  addPlayer: (player: Omit<Player, 'id'>) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  removePlayer: (id: string) => void;
  setPlayers: (players: Player[]) => void;

  // Route actions
  addRoute: (route: Omit<Route, 'id'>) => void;
  updateRoute: (id: string, updates: Partial<Route>) => void;
  removeRoute: (id: string) => void;

  // Scrimmage line
  setScrimmageLineY: (y: number) => void;

  // Undo/redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

function createEmptyPlay(): Play {
  return {
    id: generateId(),
    name: 'Untitled Play',
    scrimmageLineY: 400,
    players: [],
    routes: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function snapshot(play: Play): HistoryEntry {
  return {
    players: structuredClone(play.players),
    routes: structuredClone(play.routes),
    scrimmageLineY: play.scrimmageLineY,
  };
}

export const usePlayStore = create<PlayState>((set, get) => {
  function pushHistory() {
    const { currentPlay, history, historyIndex } = get();
    if (!currentPlay) return;
    const entry = snapshot(currentPlay);
    const trimmed = history.slice(0, historyIndex + 1);
    set({ history: [...trimmed, entry], historyIndex: trimmed.length });
  }

  return {
    currentPlay: null,
    history: [],
    historyIndex: -1,

    newPlay: () => {
      const play = createEmptyPlay();
      set({ currentPlay: play, history: [snapshot(play)], historyIndex: 0 });
    },

    loadPlay: (play) => {
      set({ currentPlay: structuredClone(play), history: [snapshot(play)], historyIndex: 0 });
    },

    setPlayName: (name) => {
      const { currentPlay } = get();
      if (!currentPlay) return;
      set({ currentPlay: { ...currentPlay, name, updatedAt: Date.now() } });
    },

    addPlayer: (player) => {
      const { currentPlay } = get();
      if (!currentPlay) return;
      pushHistory();
      const newPlayer = { ...player, id: generateId() };
      set({
        currentPlay: {
          ...currentPlay,
          players: [...currentPlay.players, newPlayer],
          updatedAt: Date.now(),
        },
      });
    },

    updatePlayer: (id, updates) => {
      const { currentPlay } = get();
      if (!currentPlay) return;
      pushHistory();
      set({
        currentPlay: {
          ...currentPlay,
          players: currentPlay.players.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
          updatedAt: Date.now(),
        },
      });
    },

    removePlayer: (id) => {
      const { currentPlay } = get();
      if (!currentPlay) return;
      pushHistory();
      set({
        currentPlay: {
          ...currentPlay,
          players: currentPlay.players.filter((p) => p.id !== id),
          routes: currentPlay.routes.filter((r) => r.playerId !== id),
          updatedAt: Date.now(),
        },
      });
    },

    setPlayers: (players) => {
      const { currentPlay } = get();
      if (!currentPlay) return;
      pushHistory();
      set({
        currentPlay: {
          ...currentPlay,
          players,
          routes: [],
          updatedAt: Date.now(),
        },
      });
    },

    addRoute: (route) => {
      const { currentPlay } = get();
      if (!currentPlay) return;
      pushHistory();
      const newRoute = { ...route, id: generateId() };
      set({
        currentPlay: {
          ...currentPlay,
          routes: [...currentPlay.routes, newRoute],
          updatedAt: Date.now(),
        },
      });
    },

    updateRoute: (id, updates) => {
      const { currentPlay } = get();
      if (!currentPlay) return;
      pushHistory();
      set({
        currentPlay: {
          ...currentPlay,
          routes: currentPlay.routes.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
          updatedAt: Date.now(),
        },
      });
    },

    removeRoute: (id) => {
      const { currentPlay } = get();
      if (!currentPlay) return;
      pushHistory();
      set({
        currentPlay: {
          ...currentPlay,
          routes: currentPlay.routes.filter((r) => r.id !== id),
          updatedAt: Date.now(),
        },
      });
    },

    setScrimmageLineY: (y) => {
      const { currentPlay } = get();
      if (!currentPlay) return;
      pushHistory();
      set({
        currentPlay: {
          ...currentPlay,
          scrimmageLineY: y,
          updatedAt: Date.now(),
        },
      });
    },

    undo: () => {
      const { history, historyIndex, currentPlay } = get();
      if (historyIndex <= 0 || !currentPlay) return;
      const prev = history[historyIndex - 1];
      set({
        historyIndex: historyIndex - 1,
        currentPlay: {
          ...currentPlay,
          players: structuredClone(prev.players),
          routes: structuredClone(prev.routes),
          scrimmageLineY: prev.scrimmageLineY,
          updatedAt: Date.now(),
        },
      });
    },

    redo: () => {
      const { history, historyIndex, currentPlay } = get();
      if (historyIndex >= history.length - 1 || !currentPlay) return;
      const next = history[historyIndex + 1];
      set({
        historyIndex: historyIndex + 1,
        currentPlay: {
          ...currentPlay,
          players: structuredClone(next.players),
          routes: structuredClone(next.routes),
          scrimmageLineY: next.scrimmageLineY,
          updatedAt: Date.now(),
        },
      });
    },

    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,
  };
});
```

**Step 3: Create the UI store**

Create `src/store/uiStore.ts`:
```typescript
import { create } from 'zustand';

type View = 'editor' | 'playList';

interface UIState {
  view: View;
  selectedPlayerId: string | null;
  showFormationPicker: boolean;

  setView: (view: View) => void;
  selectPlayer: (id: string | null) => void;
  toggleFormationPicker: () => void;
  setFormationPicker: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  view: 'editor',
  selectedPlayerId: null,
  showFormationPicker: false,

  setView: (view) => set({ view }),
  selectPlayer: (id) => set({ selectedPlayerId: id }),
  toggleFormationPicker: () =>
    set((s) => ({ showFormationPicker: !s.showFormationPicker })),
  setFormationPicker: (show) => set({ showFormationPicker: show }),
}));
```

**Step 4: Commit**

```bash
git add src/store/ src/utils/
git commit -m "feat: add Zustand stores for play state, UI state, and undo/redo"
```

---

### Task 4: Field Canvas Component

**Files:**
- Create: `src/canvas/Field.tsx`
- Create: `src/canvas/FieldCanvas.tsx`
- Create: `src/utils/constants.ts`

**Step 1: Define field constants**

Create `src/utils/constants.ts`:
```typescript
// Canvas coordinate system
export const FIELD_WIDTH = 1000;
export const FIELD_HEIGHT = 600;

// Visual
export const FIELD_COLOR = '#2d8a4e';
export const LINE_COLOR = '#ffffff';
export const SCRIMMAGE_COLOR = '#3b82f6';
export const OFFENSE_COLOR = '#3b82f6';
export const DEFENSE_COLOR = '#ef4444';
export const PLAYER_RADIUS = 16;
export const YARD_LINE_SPACING = 30; // pixels per 5 yards
```

**Step 2: Create Field background component**

Create `src/canvas/Field.tsx`:
```tsx
import { Group, Rect, Line, Text } from 'react-konva';
import {
  FIELD_WIDTH,
  FIELD_HEIGHT,
  FIELD_COLOR,
  LINE_COLOR,
  YARD_LINE_SPACING,
} from '../utils/constants';

export function Field() {
  const lines = [];
  const yardLineCount = Math.floor(FIELD_HEIGHT / YARD_LINE_SPACING);

  for (let i = 0; i <= yardLineCount; i++) {
    const y = i * YARD_LINE_SPACING;
    const isMajor = i % 2 === 0; // every 10 yards

    // Yard line
    lines.push(
      <Line
        key={`yard-${i}`}
        points={[0, y, FIELD_WIDTH, y]}
        stroke={LINE_COLOR}
        strokeWidth={isMajor ? 2 : 1}
        opacity={isMajor ? 0.7 : 0.3}
      />
    );

    // Yard numbers on major lines
    if (isMajor && i > 0 && i < yardLineCount) {
      const yardNumber = Math.abs(50 - (i / 2) * 10);
      lines.push(
        <Text
          key={`num-left-${i}`}
          x={50}
          y={y - 10}
          text={String(yardNumber)}
          fontSize={18}
          fill={LINE_COLOR}
          opacity={0.5}
        />,
        <Text
          key={`num-right-${i}`}
          x={FIELD_WIDTH - 70}
          y={y - 10}
          text={String(yardNumber)}
          fontSize={18}
          fill={LINE_COLOR}
          opacity={0.5}
        />
      );
    }

    // Hash marks
    if (!isMajor) {
      const hashPositions = [330, 340, 660, 670];
      hashPositions.forEach((hx, hi) => {
        lines.push(
          <Line
            key={`hash-${i}-${hi}`}
            points={[hx, y - 4, hx, y + 4]}
            stroke={LINE_COLOR}
            strokeWidth={1}
            opacity={0.4}
          />
        );
      });
    }
  }

  return (
    <Group>
      {/* Field background */}
      <Rect
        x={0}
        y={0}
        width={FIELD_WIDTH}
        height={FIELD_HEIGHT}
        fill={FIELD_COLOR}
      />
      {/* Sidelines */}
      <Rect
        x={0}
        y={0}
        width={FIELD_WIDTH}
        height={FIELD_HEIGHT}
        stroke={LINE_COLOR}
        strokeWidth={3}
        fillEnabled={false}
      />
      {/* Yard lines, numbers, hashes */}
      {lines}
    </Group>
  );
}
```

**Step 3: Create the main canvas wrapper**

Create `src/canvas/FieldCanvas.tsx`:
```tsx
import { Stage, Layer } from 'react-konva';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Field } from './Field';
import { FIELD_WIDTH, FIELD_HEIGHT } from '../utils/constants';

export function FieldCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const scaleX = clientWidth / FIELD_WIDTH;
      const scaleY = clientHeight / FIELD_HEIGHT;
      const newScale = Math.min(scaleX, scaleY);
      setDimensions({ width: clientWidth, height: clientHeight });
      setScale(newScale);
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  const offsetX = (dimensions.width - FIELD_WIDTH * scale) / 2;
  const offsetY = (dimensions.height - FIELD_HEIGHT * scale) / 2;

  return (
    <div ref={containerRef} className="flex-1 w-full h-full">
      <Stage width={dimensions.width} height={dimensions.height}>
        <Layer x={offsetX} y={offsetY} scaleX={scale} scaleY={scale}>
          <Field />
        </Layer>
      </Stage>
    </div>
  );
}
```

**Step 4: Wire into App**

Update `src/App.tsx`:
```tsx
import { FieldCanvas } from './canvas/FieldCanvas';

function App() {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-slate-800 text-white px-4 py-2 flex items-center gap-4">
        <h1 className="text-lg font-bold">PlayForge</h1>
      </header>
      <main className="flex-1 overflow-hidden">
        <FieldCanvas />
      </main>
    </div>
  );
}

export default App;
```

**Step 5: Verify it runs**

Run: `npm run dev`
Expected: Green football field with yard lines, hash marks, and yard numbers rendered in the browser. Field scales responsively to window size.

**Step 6: Commit**

```bash
git add src/canvas/ src/utils/constants.ts src/App.tsx
git commit -m "feat: render football field canvas with yard lines, hash marks, and responsive scaling"
```

---

### Task 5: Player Rendering & Drag-and-Drop

**Files:**
- Create: `src/canvas/PlayerNode.tsx`
- Modify: `src/canvas/FieldCanvas.tsx`

**Step 1: Create PlayerNode component**

Create `src/canvas/PlayerNode.tsx`:
```tsx
import { Group, Circle, Line, Text } from 'react-konva';
import { Player } from '../types/play';
import {
  OFFENSE_COLOR,
  DEFENSE_COLOR,
  PLAYER_RADIUS,
} from '../utils/constants';

interface PlayerNodeProps {
  player: Player;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}

export function PlayerNode({ player, isSelected, onSelect, onDragEnd }: PlayerNodeProps) {
  const color = player.team === 'offense' ? OFFENSE_COLOR : DEFENSE_COLOR;
  const r = PLAYER_RADIUS;

  return (
    <Group
      x={player.x}
      y={player.y}
      draggable
      onClick={() => onSelect(player.id)}
      onTap={() => onSelect(player.id)}
      onDragEnd={(e) => {
        onDragEnd(player.id, e.target.x(), e.target.y());
      }}
    >
      {/* Selection ring */}
      {isSelected && (
        <Circle
          radius={r + 5}
          stroke="#facc15"
          strokeWidth={3}
          fillEnabled={false}
        />
      )}

      {/* Player shape */}
      {player.team === 'offense' ? (
        <Circle
          radius={r}
          fill="white"
          stroke={color}
          strokeWidth={3}
        />
      ) : (
        <>
          <Line
            points={[-r, -r, r, r]}
            stroke={color}
            strokeWidth={3}
          />
          <Line
            points={[r, -r, -r, r]}
            stroke={color}
            strokeWidth={3}
          />
        </>
      )}

      {/* Position label */}
      <Text
        text={player.label}
        fontSize={10}
        fill={player.team === 'offense' ? color : color}
        fontStyle="bold"
        align="center"
        verticalAlign="middle"
        width={r * 2}
        height={r * 2}
        offsetX={r}
        offsetY={r}
      />
    </Group>
  );
}
```

**Step 2: Integrate players into FieldCanvas**

Update `src/canvas/FieldCanvas.tsx` — add imports and render PlayerNode for each player in the current play. Wire up `usePlayStore` and `useUIStore`:

```tsx
import { Stage, Layer } from 'react-konva';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Field } from './Field';
import { PlayerNode } from './PlayerNode';
import { usePlayStore } from '../store/playStore';
import { useUIStore } from '../store/uiStore';
import { FIELD_WIDTH, FIELD_HEIGHT } from '../utils/constants';

export function FieldCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);

  const currentPlay = usePlayStore((s) => s.currentPlay);
  const updatePlayer = usePlayStore((s) => s.updatePlayer);
  const selectedPlayerId = useUIStore((s) => s.selectedPlayerId);
  const selectPlayer = useUIStore((s) => s.selectPlayer);

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const scaleX = clientWidth / FIELD_WIDTH;
      const scaleY = clientHeight / FIELD_HEIGHT;
      const newScale = Math.min(scaleX, scaleY);
      setDimensions({ width: clientWidth, height: clientHeight });
      setScale(newScale);
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  const offsetX = (dimensions.width - FIELD_WIDTH * scale) / 2;
  const offsetY = (dimensions.height - FIELD_HEIGHT * scale) / 2;

  const handleStageTap = (e: any) => {
    if (e.target === e.target.getStage() || e.target.getParent()?.name() === 'field-layer') {
      selectPlayer(null);
    }
  };

  return (
    <div ref={containerRef} className="flex-1 w-full h-full">
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleStageTap}
        onTap={handleStageTap}
      >
        <Layer x={offsetX} y={offsetY} scaleX={scale} scaleY={scale} name="field-layer">
          <Field />
          {currentPlay?.players.map((player) => (
            <PlayerNode
              key={player.id}
              player={player}
              isSelected={selectedPlayerId === player.id}
              onSelect={selectPlayer}
              onDragEnd={(id, x, y) => updatePlayer(id, { x, y })}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
```

**Step 3: Initialize a play on app mount**

Update `src/App.tsx` to create a new play on mount:
```tsx
import { useEffect } from 'react';
import { FieldCanvas } from './canvas/FieldCanvas';
import { usePlayStore } from './store/playStore';

function App() {
  const newPlay = usePlayStore((s) => s.newPlay);
  const currentPlay = usePlayStore((s) => s.currentPlay);

  useEffect(() => {
    if (!currentPlay) {
      newPlay();
    }
  }, [currentPlay, newPlay]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-slate-800 text-white px-4 py-2 flex items-center gap-4">
        <h1 className="text-lg font-bold">PlayForge</h1>
      </header>
      <main className="flex-1 overflow-hidden">
        <FieldCanvas />
      </main>
    </div>
  );
}

export default App;
```

**Step 4: Verify**

Run: `npm run dev`
Expected: Green field renders. No players yet (empty play), but no errors. Clicking the field should not crash.

**Step 5: Commit**

```bash
git add src/canvas/PlayerNode.tsx src/canvas/FieldCanvas.tsx src/App.tsx
git commit -m "feat: add player rendering with drag-and-drop and selection"
```

---

### Task 6: Formation Picker & Toolbar

**Files:**
- Create: `src/components/Toolbar.tsx`
- Create: `src/components/FormationPicker.tsx`
- Modify: `src/App.tsx`

**Step 1: Create the Toolbar**

Create `src/components/Toolbar.tsx`:
```tsx
import { usePlayStore } from '../store/playStore';
import { useUIStore } from '../store/uiStore';

export function Toolbar() {
  const currentPlay = usePlayStore((s) => s.currentPlay);
  const setPlayName = usePlayStore((s) => s.setPlayName);
  const undo = usePlayStore((s) => s.undo);
  const redo = usePlayStore((s) => s.redo);
  const canUndo = usePlayStore((s) => s.canUndo);
  const canRedo = usePlayStore((s) => s.canRedo);
  const toggleFormationPicker = useUIStore((s) => s.toggleFormationPicker);

  return (
    <header className="bg-slate-800 text-white px-4 py-2 flex items-center gap-3">
      <h1 className="text-lg font-bold shrink-0">PlayForge</h1>

      <div className="w-px h-6 bg-slate-600" />

      <input
        type="text"
        value={currentPlay?.name ?? ''}
        onChange={(e) => setPlayName(e.target.value)}
        className="bg-slate-700 text-white px-2 py-1 rounded text-sm w-48 outline-none focus:ring-1 focus:ring-blue-400"
        placeholder="Play name..."
      />

      <div className="w-px h-6 bg-slate-600" />

      <button
        onClick={toggleFormationPicker}
        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm"
      >
        Formations
      </button>

      <div className="flex-1" />

      <button
        onClick={undo}
        disabled={!canUndo()}
        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm disabled:opacity-30 disabled:cursor-not-allowed"
        title="Undo (Ctrl+Z)"
      >
        Undo
      </button>
      <button
        onClick={redo}
        disabled={!canRedo()}
        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm disabled:opacity-30 disabled:cursor-not-allowed"
        title="Redo (Ctrl+Y)"
      >
        Redo
      </button>
    </header>
  );
}
```

**Step 2: Create the FormationPicker**

Create `src/components/FormationPicker.tsx`:
```tsx
import { usePlayStore } from '../store/playStore';
import { useUIStore } from '../store/uiStore';
import { offenseFormations, defenseFormations } from '../data/formations';
import { Formation } from '../types/play';
import { generateId } from '../utils/ids';
import { useState } from 'react';

export function FormationPicker() {
  const showFormationPicker = useUIStore((s) => s.showFormationPicker);
  const setFormationPicker = useUIStore((s) => s.setFormationPicker);
  const setPlayers = usePlayStore((s) => s.setPlayers);
  const [tab, setTab] = useState<'offense' | 'defense'>('offense');

  if (!showFormationPicker) return null;

  const formations = tab === 'offense' ? offenseFormations : defenseFormations;

  const applyFormation = (formation: Formation) => {
    const players = formation.players.map((p) => ({ ...p, id: generateId() }));
    setPlayers(players);
    setFormationPicker(false);
  };

  return (
    <div className="absolute top-12 left-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-64">
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 px-3 py-2 text-sm font-medium ${
            tab === 'offense' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
          onClick={() => setTab('offense')}
        >
          Offense
        </button>
        <button
          className={`flex-1 px-3 py-2 text-sm font-medium ${
            tab === 'defense' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'
          }`}
          onClick={() => setTab('defense')}
        >
          Defense
        </button>
      </div>
      <div className="p-2 max-h-64 overflow-y-auto">
        {formations.map((f) => (
          <button
            key={f.name}
            onClick={() => applyFormation(f)}
            className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100"
          >
            {f.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Step 3: Update App.tsx**

```tsx
import { useEffect } from 'react';
import { FieldCanvas } from './canvas/FieldCanvas';
import { Toolbar } from './components/Toolbar';
import { FormationPicker } from './components/FormationPicker';
import { usePlayStore } from './store/playStore';

function App() {
  const newPlay = usePlayStore((s) => s.newPlay);
  const currentPlay = usePlayStore((s) => s.currentPlay);

  useEffect(() => {
    if (!currentPlay) {
      newPlay();
    }
  }, [currentPlay, newPlay]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Toolbar />
      <main className="flex-1 overflow-hidden relative">
        <FormationPicker />
        <FieldCanvas />
      </main>
    </div>
  );
}

export default App;
```

**Step 4: Verify**

Run: `npm run dev`
Expected: Toolbar shows play name input, Formations button, Undo/Redo buttons. Clicking Formations shows a dropdown with Offense/Defense tabs. Selecting a formation places players on the field. Players are draggable. Undo/Redo works.

**Step 5: Commit**

```bash
git add src/components/ src/App.tsx
git commit -m "feat: add toolbar with play name, undo/redo, and formation picker"
```

---

### Task 7: Scrimmage Line

**Files:**
- Create: `src/canvas/ScrimmageLine.tsx`
- Modify: `src/canvas/FieldCanvas.tsx`

**Step 1: Create ScrimmageLine component**

Create `src/canvas/ScrimmageLine.tsx`:
```tsx
import { Line } from 'react-konva';
import { FIELD_WIDTH, SCRIMMAGE_COLOR } from '../utils/constants';

interface ScrimmageLineProps {
  y: number;
  onDragEnd: (y: number) => void;
}

export function ScrimmageLine({ y, onDragEnd }: ScrimmageLineProps) {
  return (
    <Line
      points={[0, 0, FIELD_WIDTH, 0]}
      stroke={SCRIMMAGE_COLOR}
      strokeWidth={3}
      dash={[10, 5]}
      y={y}
      draggable
      dragBoundFunc={(pos) => ({ x: 0, y: pos.y })}
      onDragEnd={(e) => onDragEnd(e.target.y())}
      opacity={0.8}
    />
  );
}
```

**Step 2: Add to FieldCanvas**

Add the import and render `<ScrimmageLine>` inside the Layer, between `<Field />` and the player map:

```tsx
import { ScrimmageLine } from './ScrimmageLine';

// Inside the Layer, after <Field />:
{currentPlay && (
  <ScrimmageLine
    y={currentPlay.scrimmageLineY}
    onDragEnd={(y) => setScrimmageLineY(y)}
  />
)}
```

Add to the FieldCanvas component:
```tsx
const setScrimmageLineY = usePlayStore((s) => s.setScrimmageLineY);
```

**Step 3: Verify**

Run: `npm run dev`
Expected: Blue dashed line appears on field. Draggable up and down only (locked on x-axis).

**Step 4: Commit**

```bash
git add src/canvas/ScrimmageLine.tsx src/canvas/FieldCanvas.tsx
git commit -m "feat: add draggable scrimmage line"
```

---

### Task 8: Route Rendering & Assignment

**Files:**
- Create: `src/canvas/RouteLine.tsx`
- Create: `src/components/RoutePalette.tsx`
- Modify: `src/canvas/FieldCanvas.tsx`
- Modify: `src/App.tsx`

**Step 1: Create RouteLine component**

Create `src/canvas/RouteLine.tsx`:
```tsx
import { Group, Line, Circle, Arrow } from 'react-konva';
import { Route, Player, Point } from '../types/play';
import { OFFENSE_COLOR, DEFENSE_COLOR } from '../utils/constants';

interface RouteLineProps {
  route: Route;
  player: Player;
  isSelected: boolean;
  onControlPointDrag: (routeId: string, index: number, point: Point) => void;
}

export function RouteLine({ route, player, isSelected, onControlPointDrag }: RouteLineProps) {
  const color = player.team === 'offense' ? OFFENSE_COLOR : DEFENSE_COLOR;

  // Build absolute points from player position + relative control points
  const absolutePoints: Point[] = route.controlPoints.map((cp) => ({
    x: player.x + cp.x,
    y: player.y + cp.y,
  }));

  // Build flat points array for the line: [playerX, playerY, cp1x, cp1y, ...]
  const allPoints = [player.x, player.y];
  absolutePoints.forEach((p) => {
    allPoints.push(p.x, p.y);
  });

  const isBlock = route.type === 'block';
  const lastPoint = absolutePoints[absolutePoints.length - 1];

  return (
    <Group>
      {/* Route line */}
      {isBlock ? (
        <Line
          points={allPoints}
          stroke={color}
          strokeWidth={4}
          dash={route.style === 'dashed' ? [8, 4] : undefined}
          lineCap="round"
          lineJoin="round"
        />
      ) : (
        <Arrow
          points={allPoints}
          stroke={color}
          strokeWidth={2}
          fill={color}
          pointerLength={8}
          pointerWidth={6}
          dash={route.style === 'dashed' ? [8, 4] : undefined}
          lineCap="round"
          lineJoin="round"
        />
      )}

      {/* Control points (only when route's player is selected) */}
      {isSelected &&
        absolutePoints.map((point, i) => (
          <Circle
            key={i}
            x={point.x}
            y={point.y}
            radius={6}
            fill="#facc15"
            stroke="#000"
            strokeWidth={1}
            draggable
            onDragEnd={(e) => {
              const newX = e.target.x() - player.x;
              const newY = e.target.y() - player.y;
              onControlPointDrag(route.id, i, { x: newX, y: newY });
            }}
          />
        ))}
    </Group>
  );
}
```

**Step 2: Create RoutePalette component**

Create `src/components/RoutePalette.tsx`:
```tsx
import { usePlayStore } from '../store/playStore';
import { useUIStore } from '../store/uiStore';
import { routeTemplates } from '../data/routes';
import { RouteTemplate } from '../types/play';

export function RoutePalette() {
  const selectedPlayerId = useUIStore((s) => s.selectedPlayerId);
  const currentPlay = usePlayStore((s) => s.currentPlay);
  const addRoute = usePlayStore((s) => s.addRoute);

  if (!selectedPlayerId || !currentPlay) return null;

  const player = currentPlay.players.find((p) => p.id === selectedPlayerId);
  if (!player) return null;

  // Check if player already has a route
  const existingRoute = currentPlay.routes.find((r) => r.playerId === selectedPlayerId);

  const assignRoute = (template: RouteTemplate) => {
    // Mirror control points for players on the right side of the field
    const isRightSide = player.x > 500;
    const controlPoints = template.defaultControlPoints.map((cp) => ({
      x: isRightSide ? -cp.x : cp.x,
      y: cp.y,
    }));

    addRoute({
      playerId: selectedPlayerId,
      type: template.type,
      controlPoints,
      style: 'solid',
    });
  };

  const categories = [
    { key: 'receiver', label: 'Receiver' },
    { key: 'rb', label: 'RB/FB' },
    { key: 'blocking', label: 'Blocking' },
  ] as const;

  return (
    <div className="absolute top-12 right-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-52">
      <div className="px-3 py-2 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700">
          Routes for {player.label}
        </span>
        {existingRoute && (
          <span className="ml-2 text-xs text-gray-400">(has route)</span>
        )}
      </div>
      <div className="p-2 max-h-72 overflow-y-auto">
        {categories.map(({ key, label }) => {
          const routes = routeTemplates.filter((r) => r.category === key);
          return (
            <div key={key} className="mb-2">
              <div className="text-xs font-semibold text-gray-400 uppercase px-2 mb-1">
                {label}
              </div>
              {routes.map((rt) => (
                <button
                  key={rt.type}
                  onClick={() => assignRoute(rt)}
                  className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-gray-100"
                >
                  {rt.name}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 3: Render routes in FieldCanvas**

Add imports and render RouteLine components after players. Add the control point drag handler:

```tsx
import { RouteLine } from './RouteLine';

// Inside the store hooks:
const updateRoute = usePlayStore((s) => s.updateRoute);

// Inside the Layer, after the player map:
{currentPlay?.routes.map((route) => {
  const player = currentPlay.players.find((p) => p.id === route.playerId);
  if (!player) return null;
  return (
    <RouteLine
      key={route.id}
      route={route}
      player={player}
      isSelected={selectedPlayerId === route.playerId}
      onControlPointDrag={(routeId, index, point) => {
        const r = currentPlay.routes.find((r) => r.id === routeId);
        if (!r) return;
        const newControlPoints = [...r.controlPoints];
        newControlPoints[index] = point;
        updateRoute(routeId, { controlPoints: newControlPoints });
      }}
    />
  );
})}
```

**Step 4: Add RoutePalette to App.tsx**

```tsx
import { RoutePalette } from './components/RoutePalette';

// Inside <main>, alongside FormationPicker:
<RoutePalette />
```

**Step 5: Verify**

Run: `npm run dev`
Expected: Select a formation, click a player, route palette appears on the right. Assign a route — arrow line appears from player through control points. Click the player and drag the yellow control points to reshape the route.

**Step 6: Commit**

```bash
git add src/canvas/RouteLine.tsx src/components/RoutePalette.tsx src/canvas/FieldCanvas.tsx src/App.tsx
git commit -m "feat: add route assignment palette and editable route lines with control points"
```

---

### Task 9: Add/Remove Players & Player Popover

**Files:**
- Create: `src/components/BottomBar.tsx`
- Create: `src/components/PlayerPopover.tsx`
- Modify: `src/App.tsx`

**Step 1: Create BottomBar for adding players**

Create `src/components/BottomBar.tsx`:
```tsx
import { usePlayStore } from '../store/playStore';

export function BottomBar() {
  const addPlayer = usePlayStore((s) => s.addPlayer);

  return (
    <div className="bg-slate-800 px-4 py-2 flex items-center gap-3">
      <button
        onClick={() =>
          addPlayer({
            team: 'offense',
            position: 'WR',
            label: 'WR',
            x: 300,
            y: 400,
          })
        }
        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm"
      >
        + Offense
      </button>
      <button
        onClick={() =>
          addPlayer({
            team: 'defense',
            position: 'LB',
            label: 'LB',
            x: 500,
            y: 300,
          })
        }
        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm"
      >
        + Defense
      </button>
    </div>
  );
}
```

**Step 2: Create PlayerPopover**

Create `src/components/PlayerPopover.tsx`:
```tsx
import { useState, useEffect } from 'react';
import { usePlayStore } from '../store/playStore';
import { useUIStore } from '../store/uiStore';

export function PlayerPopover() {
  const selectedPlayerId = useUIStore((s) => s.selectedPlayerId);
  const selectPlayer = useUIStore((s) => s.selectPlayer);
  const currentPlay = usePlayStore((s) => s.currentPlay);
  const updatePlayer = usePlayStore((s) => s.updatePlayer);
  const removePlayer = usePlayStore((s) => s.removePlayer);
  const removeRoute = usePlayStore((s) => s.removeRoute);

  const player = currentPlay?.players.find((p) => p.id === selectedPlayerId);
  const route = currentPlay?.routes.find((r) => r.playerId === selectedPlayerId);

  const [label, setLabel] = useState('');

  useEffect(() => {
    if (player) setLabel(player.label);
  }, [player]);

  if (!player) return null;

  const handleLabelChange = () => {
    if (label.trim() && label !== player.label) {
      updatePlayer(player.id, { label: label.trim() });
    }
  };

  const handleDelete = () => {
    removePlayer(player.id);
    selectPlayer(null);
  };

  const handleRemoveRoute = () => {
    if (route) removeRoute(route.id);
  };

  return (
    <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-3 flex items-center gap-3">
      <label className="text-xs text-gray-500">Label:</label>
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={handleLabelChange}
        onKeyDown={(e) => e.key === 'Enter' && handleLabelChange()}
        className="border border-gray-300 rounded px-2 py-1 text-sm w-16 outline-none focus:ring-1 focus:ring-blue-400"
      />
      {route && (
        <button
          onClick={handleRemoveRoute}
          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-600"
        >
          Clear Route
        </button>
      )}
      <button
        onClick={handleDelete}
        className="px-2 py-1 bg-red-100 hover:bg-red-200 rounded text-xs text-red-600"
      >
        Delete
      </button>
    </div>
  );
}
```

**Step 3: Add to App.tsx**

```tsx
import { BottomBar } from './components/BottomBar';
import { PlayerPopover } from './components/PlayerPopover';

// Inside the JSX:
<main className="flex-1 overflow-hidden relative">
  <FormationPicker />
  <RoutePalette />
  <PlayerPopover />
  <FieldCanvas />
</main>
<BottomBar />
```

**Step 4: Verify**

Run: `npm run dev`
Expected: Bottom bar has "+ Offense" and "+ Defense" buttons that add players to the field. Clicking a player shows a popover at the bottom with label editing, route clearing, and delete.

**Step 5: Commit**

```bash
git add src/components/BottomBar.tsx src/components/PlayerPopover.tsx src/App.tsx
git commit -m "feat: add bottom bar for adding players and player popover for editing/deleting"
```

---

### Task 10: Keyboard Shortcuts (Undo/Redo, Delete)

**Files:**
- Modify: `src/App.tsx`

**Step 1: Add keyboard event listener**

Add a `useEffect` in App.tsx for keyboard shortcuts:

```tsx
import { useEffect, useCallback } from 'react';

// Inside App component, add:
const undo = usePlayStore((s) => s.undo);
const redo = usePlayStore((s) => s.redo);
const removePlayer = usePlayStore((s) => s.removePlayer);
const selectedPlayerId = useUIStore((s) => s.selectedPlayerId);
const selectPlayer = useUIStore((s) => s.selectPlayer);

const handleKeyDown = useCallback((e: KeyboardEvent) => {
  // Don't handle if typing in an input
  if ((e.target as HTMLElement).tagName === 'INPUT') return;

  if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
    e.preventDefault();
    if (e.shiftKey) {
      redo();
    } else {
      undo();
    }
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
    e.preventDefault();
    redo();
  }
  if ((e.key === 'Delete' || e.key === 'Backspace') && selectedPlayerId) {
    removePlayer(selectedPlayerId);
    selectPlayer(null);
  }
}, [undo, redo, removePlayer, selectedPlayerId, selectPlayer]);

useEffect(() => {
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleKeyDown]);
```

**Step 2: Verify**

Run: `npm run dev`
Expected: Ctrl+Z undoes, Ctrl+Y or Ctrl+Shift+Z redoes, Delete/Backspace removes selected player.

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add keyboard shortcuts for undo, redo, and delete player"
```

---

### Task 11: LocalStorage Persistence & Play List

**Files:**
- Create: `src/utils/storage.ts`
- Create: `src/components/PlayList.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/Toolbar.tsx`

**Step 1: Create storage utility**

Create `src/utils/storage.ts`:
```typescript
import { Play } from '../types/play';

const STORAGE_KEY = 'playforge_plays';

export function loadPlays(): Play[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePlays(plays: Play[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plays));
}

export function savePlay(play: Play): void {
  const plays = loadPlays();
  const index = plays.findIndex((p) => p.id === play.id);
  if (index >= 0) {
    plays[index] = play;
  } else {
    plays.push(play);
  }
  savePlays(plays);
}

export function deletePlay(id: string): void {
  const plays = loadPlays().filter((p) => p.id !== id);
  savePlays(plays);
}
```

**Step 2: Add auto-save to App.tsx**

```tsx
import { useEffect, useCallback, useRef } from 'react';
import { savePlay } from './utils/storage';

// Inside App component, add auto-save:
const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

useEffect(() => {
  if (!currentPlay) return;
  if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
  saveTimeoutRef.current = setTimeout(() => {
    savePlay(currentPlay);
  }, 500);
  return () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
  };
}, [currentPlay]);
```

**Step 3: Create PlayList component**

Create `src/components/PlayList.tsx`:
```tsx
import { useState, useEffect } from 'react';
import { Play } from '../types/play';
import { loadPlays, deletePlay } from '../utils/storage';
import { usePlayStore } from '../store/playStore';
import { useUIStore } from '../store/uiStore';

export function PlayList() {
  const [plays, setPlays] = useState<Play[]>([]);
  const loadPlay = usePlayStore((s) => s.loadPlay);
  const newPlay = usePlayStore((s) => s.newPlay);
  const setView = useUIStore((s) => s.setView);

  useEffect(() => {
    setPlays(loadPlays());
  }, []);

  const handleOpen = (play: Play) => {
    loadPlay(play);
    setView('editor');
  };

  const handleDelete = (id: string) => {
    deletePlay(id);
    setPlays((prev) => prev.filter((p) => p.id !== id));
  };

  const handleNew = () => {
    newPlay();
    setView('editor');
  };

  const [search, setSearch] = useState('');
  const filtered = plays
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">My Plays</h2>
        <button
          onClick={handleNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium"
        >
          New Play
        </button>
      </div>

      <input
        type="text"
        placeholder="Search plays..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 text-sm outline-none focus:ring-2 focus:ring-blue-400"
      />

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          {plays.length === 0 ? 'No plays yet. Create your first one!' : 'No matching plays.'}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((play) => (
            <div
              key={play.id}
              className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-blue-300 cursor-pointer"
              onClick={() => handleOpen(play)}
            >
              <div>
                <div className="font-medium text-gray-800">{play.name}</div>
                <div className="text-xs text-gray-400">
                  {play.players.length} players &middot;{' '}
                  {new Date(play.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(play.id);
                }}
                className="text-xs text-red-400 hover:text-red-600 px-2 py-1"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 4: Add "My Plays" button to Toolbar and wire view switching in App**

Add to Toolbar.tsx after the Formations button:
```tsx
const setView = useUIStore((s) => s.setView);

// In JSX:
<button
  onClick={() => setView('playList')}
  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm"
>
  My Plays
</button>
```

Update App.tsx to conditionally render editor or play list:
```tsx
import { PlayList } from './components/PlayList';

const view = useUIStore((s) => s.view);

// In JSX — replace <main> content:
{view === 'editor' ? (
  <>
    <main className="flex-1 overflow-hidden relative">
      <FormationPicker />
      <RoutePalette />
      <PlayerPopover />
      <FieldCanvas />
    </main>
    <BottomBar />
  </>
) : (
  <main className="flex-1 overflow-y-auto bg-gray-50">
    <PlayList />
  </main>
)}
```

**Step 5: Verify**

Run: `npm run dev`
Expected: Plays auto-save. "My Plays" shows saved plays list. Can search, open, delete plays. "New Play" creates a fresh play.

**Step 6: Commit**

```bash
git add src/utils/storage.ts src/components/PlayList.tsx src/components/Toolbar.tsx src/App.tsx
git commit -m "feat: add localStorage persistence, auto-save, and play list view"
```

---

### Task 12: Export (PNG & PDF)

**Files:**
- Create: `src/utils/export.ts`
- Modify: `src/components/Toolbar.tsx`
- Modify: `src/canvas/FieldCanvas.tsx`

**Step 1: Create export utilities**

Create `src/utils/export.ts`:
```typescript
import Konva from 'konva';
import jsPDF from 'jspdf';

export function exportAsPng(stage: Konva.Stage, playName: string): void {
  const dataUrl = stage.toDataURL({ pixelRatio: 2 });
  const link = document.createElement('a');
  link.download = `${playName || 'play'}.png`;
  link.href = dataUrl;
  link.click();
}

export function exportAsPdf(stage: Konva.Stage, playName: string): void {
  const dataUrl = stage.toDataURL({ pixelRatio: 2 });
  const pdf = new jsPDF('landscape', 'pt', 'letter');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Title
  pdf.setFontSize(18);
  pdf.text(playName || 'Untitled Play', 40, 40);

  // Image — fit to page with margins
  const margin = 40;
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = (imgWidth * stage.height()) / stage.width();

  pdf.addImage(dataUrl, 'PNG', margin, 60, imgWidth, Math.min(imgHeight, pageHeight - 100));
  pdf.save(`${playName || 'play'}.pdf`);
}
```

**Step 2: Expose stage ref from FieldCanvas**

Update FieldCanvas to accept and attach a ref to the Konva Stage:

```tsx
import { forwardRef } from 'react';
import Konva from 'konva';

export const FieldCanvas = forwardRef<Konva.Stage>(function FieldCanvas(_, ref) {
  // ... existing code ...

  return (
    <div ref={containerRef} className="flex-1 w-full h-full">
      <Stage
        ref={ref}
        // ... rest unchanged
      >
```

**Step 3: Add export buttons to Toolbar**

```tsx
import Konva from 'konva';
import { exportAsPng, exportAsPdf } from '../utils/export';

// Add prop:
interface ToolbarProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

export function Toolbar({ stageRef }: ToolbarProps) {
  // ... existing code ...

  const handleExportPng = () => {
    if (stageRef.current && currentPlay) {
      exportAsPng(stageRef.current, currentPlay.name);
    }
  };

  const handleExportPdf = () => {
    if (stageRef.current && currentPlay) {
      exportAsPdf(stageRef.current, currentPlay.name);
    }
  };

  // Add buttons before the Undo button:
  <button
    onClick={handleExportPng}
    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm"
  >
    PNG
  </button>
  <button
    onClick={handleExportPdf}
    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm"
  >
    PDF
  </button>
```

**Step 4: Wire stage ref in App.tsx**

```tsx
import { useRef } from 'react';
import Konva from 'konva';

const stageRef = useRef<Konva.Stage>(null);

// Pass to components:
<Toolbar stageRef={stageRef} />
<FieldCanvas ref={stageRef} />
```

**Step 5: Verify**

Run: `npm run dev`
Expected: PNG button downloads an image of the field. PDF button downloads a PDF with the play name as title and the field image below.

**Step 6: Commit**

```bash
git add src/utils/export.ts src/components/Toolbar.tsx src/canvas/FieldCanvas.tsx src/App.tsx
git commit -m "feat: add PNG and PDF export"
```

---

### Task 13: Shareable Links

**Files:**
- Create: `src/utils/sharing.ts`
- Modify: `src/components/Toolbar.tsx`
- Modify: `src/App.tsx`

**Step 1: Create sharing utilities**

Create `src/utils/sharing.ts`:
```typescript
import lzString from 'lz-string';
import { Play } from '../types/play';

interface ShareablePlay {
  n: string;           // name
  s: number;           // scrimmageLineY
  p: [string, string, string, number, number][]; // [team, position, label, x, y]
  r: [number, string, [number, number][], string][]; // [playerIndex, type, controlPoints, style]
}

export function encodePlayToUrl(play: Play): string {
  const shareable: ShareablePlay = {
    n: play.name,
    s: play.scrimmageLineY,
    p: play.players.map((p) => [p.team[0], p.position, p.label, Math.round(p.x), Math.round(p.y)]),
    r: play.routes.map((r) => {
      const playerIndex = play.players.findIndex((p) => p.id === r.playerId);
      return [
        playerIndex,
        r.type,
        r.controlPoints.map((cp) => [Math.round(cp.x), Math.round(cp.y)] as [number, number]),
        r.style[0],
      ];
    }),
  };

  const json = JSON.stringify(shareable);
  const compressed = lzString.compressToEncodedURIComponent(json);
  return `${window.location.origin}${window.location.pathname}#play=${compressed}`;
}

export function decodePlayFromUrl(hash: string): Play | null {
  try {
    const param = hash.replace('#play=', '');
    const json = lzString.decompressFromEncodedURIComponent(param);
    if (!json) return null;

    const s: ShareablePlay = JSON.parse(json);
    const players = s.p.map((p, i) => ({
      id: `shared-${i}`,
      team: (p[0] === 'o' ? 'offense' : 'defense') as 'offense' | 'defense',
      position: p[1],
      label: p[2],
      x: p[3],
      y: p[4],
    }));

    const routes = s.r.map((r, i) => ({
      id: `shared-route-${i}`,
      playerId: players[r[0]]?.id ?? '',
      type: r[1],
      controlPoints: r[2].map(([x, y]) => ({ x, y })),
      style: (r[3] === 's' ? 'solid' : 'dashed') as 'solid' | 'dashed',
    }));

    return {
      id: `shared-${Date.now()}`,
      name: s.n,
      scrimmageLineY: s.s,
      players,
      routes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  } catch {
    return null;
  }
}
```

**Step 2: Add share button to Toolbar**

```tsx
import { encodePlayToUrl } from '../utils/sharing';

const handleShare = () => {
  if (!currentPlay) return;
  const url = encodePlayToUrl(currentPlay);
  navigator.clipboard.writeText(url);
  // Brief visual feedback — could be a toast, but alert is simplest for MVP
  alert('Share link copied to clipboard!');
};

// Add button:
<button
  onClick={handleShare}
  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm"
>
  Share
</button>
```

**Step 3: Handle shared URL on app load in App.tsx**

```tsx
import { decodePlayFromUrl } from './utils/sharing';

// In the useEffect that initializes the play:
useEffect(() => {
  if (currentPlay) return;

  if (window.location.hash.startsWith('#play=')) {
    const shared = decodePlayFromUrl(window.location.hash);
    if (shared) {
      loadPlay(shared);
      window.location.hash = '';
      return;
    }
  }
  newPlay();
}, [currentPlay, newPlay, loadPlay]);
```

**Step 4: Verify**

Run: `npm run dev`
Expected: Clicking Share copies a URL to clipboard. Pasting the URL in a new tab loads the shared play.

**Step 5: Commit**

```bash
git add src/utils/sharing.ts src/components/Toolbar.tsx src/App.tsx
git commit -m "feat: add shareable links via URL hash with lz-string compression"
```

---

### Task 14: Polish & Final Integration

**Files:**
- Modify: various files for cleanup

**Step 1: Add touch support note**

The canvas already supports touch via Konva.js's built-in touch event handling (`onTap`, draggable). Verify touch works on a tablet/phone viewport in dev tools.

**Step 2: Verify full workflow end-to-end**

Run: `npm run dev`

Test the following flow:
1. App opens with empty play
2. Click Formations > Offense > Shotgun — players appear
3. Click a WR — route palette appears, player popover appears
4. Assign a Slant route — arrow line appears
5. Drag control points to adjust route
6. Rename the play in the toolbar
7. Click My Plays — play appears in list
8. Click PNG — downloads image
9. Click Share — copies URL, paste in new tab, play loads
10. Ctrl+Z undoes, Ctrl+Y redoes
11. Delete key removes selected player

**Step 3: Build for production**

Run: `npm run build`
Expected: Successful build in `dist/` folder, no TypeScript errors.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: final polish and integration verification"
```

---

## Summary

| Task | Description | Estimated Steps |
|------|-------------|----------------|
| 1 | Project scaffold (Vite, React, Tailwind, deps) | 6 |
| 2 | TypeScript types, formations, route templates | 4 |
| 3 | Zustand stores (play state, UI state, undo/redo) | 4 |
| 4 | Field canvas rendering | 6 |
| 5 | Player rendering & drag-and-drop | 5 |
| 6 | Toolbar & formation picker | 5 |
| 7 | Scrimmage line | 4 |
| 8 | Route rendering & assignment | 6 |
| 9 | Add/remove players & popover | 5 |
| 10 | Keyboard shortcuts | 3 |
| 11 | LocalStorage persistence & play list | 6 |
| 12 | Export (PNG & PDF) | 6 |
| 13 | Shareable links | 5 |
| 14 | Polish & final integration | 4 |

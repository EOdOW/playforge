import { create } from 'zustand';
import { Play, Player, Route } from '../types/play';
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

import { create } from 'zustand';

type View = 'editor' | 'playList';

interface UIState {
  view: View;
  selectedPlayerId: string | null;
  showFormationPicker: boolean;
  showMoreMenu: boolean;

  setView: (view: View) => void;
  selectPlayer: (id: string | null) => void;
  toggleFormationPicker: () => void;
  setFormationPicker: (show: boolean) => void;
  toggleMoreMenu: () => void;
  setMoreMenu: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  view: 'editor',
  selectedPlayerId: null,
  showFormationPicker: false,
  showMoreMenu: false,

  setView: (view) => set({ view }),
  selectPlayer: (id) => set({ selectedPlayerId: id }),
  toggleFormationPicker: () =>
    set((s) => ({ showFormationPicker: !s.showFormationPicker })),
  setFormationPicker: (show) => set({ showFormationPicker: show }),
  toggleMoreMenu: () =>
    set((s) => ({ showMoreMenu: !s.showMoreMenu })),
  setMoreMenu: (show) => set({ showMoreMenu: show }),
}));

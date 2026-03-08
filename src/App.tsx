import { useEffect, useCallback } from 'react';
import { FieldCanvas } from './canvas/FieldCanvas';
import { Toolbar } from './components/Toolbar';
import { FormationPicker } from './components/FormationPicker';
import { RoutePalette } from './components/RoutePalette';
import { BottomBar } from './components/BottomBar';
import { PlayerPopover } from './components/PlayerPopover';
import { usePlayStore } from './store/playStore';
import { useUIStore } from './store/uiStore';

function App() {
  const newPlay = usePlayStore((s) => s.newPlay);
  const currentPlay = usePlayStore((s) => s.currentPlay);
  const undo = usePlayStore((s) => s.undo);
  const redo = usePlayStore((s) => s.redo);
  const removePlayer = usePlayStore((s) => s.removePlayer);
  const selectedPlayerId = useUIStore((s) => s.selectedPlayerId);
  const selectPlayer = useUIStore((s) => s.selectPlayer);

  useEffect(() => {
    if (!currentPlay) {
      newPlay();
    }
  }, [currentPlay, newPlay]);

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

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Toolbar />
      <main className="flex-1 overflow-hidden relative">
        <FormationPicker />
        <RoutePalette />
        <PlayerPopover />
        <FieldCanvas />
      </main>
      <BottomBar />
    </div>
  );
}

export default App;

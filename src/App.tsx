import { useEffect, useCallback, useRef } from 'react';
import Konva from 'konva';
import { FieldCanvas } from './canvas/FieldCanvas';
import { Toolbar } from './components/Toolbar';
import { FormationPicker } from './components/FormationPicker';
import { RoutePalette } from './components/RoutePalette';
import { PlayerPopover } from './components/PlayerPopover';
import { BottomBar } from './components/BottomBar';
import { PlayList } from './components/PlayList';
import { usePlayStore } from './store/playStore';
import { useUIStore } from './store/uiStore';
import { savePlay } from './utils/storage';

function App() {
  const stageRef = useRef<Konva.Stage>(null);
  const newPlay = usePlayStore((s) => s.newPlay);
  const currentPlay = usePlayStore((s) => s.currentPlay);
  const undo = usePlayStore((s) => s.undo);
  const redo = usePlayStore((s) => s.redo);
  const removePlayer = usePlayStore((s) => s.removePlayer);
  const selectedPlayerId = useUIStore((s) => s.selectedPlayerId);
  const selectPlayer = useUIStore((s) => s.selectPlayer);
  const view = useUIStore((s) => s.view);

  useEffect(() => {
    if (!currentPlay) {
      newPlay();
    }
  }, [currentPlay, newPlay]);

  // Auto-save
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

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
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
      <Toolbar stageRef={stageRef} />
      {view === 'editor' ? (
        <>
          <main className="flex-1 overflow-hidden relative">
            <FormationPicker />
            <RoutePalette />
            <PlayerPopover />
            <FieldCanvas ref={stageRef} />
          </main>
          <BottomBar />
        </>
      ) : (
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <PlayList />
        </main>
      )}
    </div>
  );
}

export default App;

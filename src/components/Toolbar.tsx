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
  const setView = useUIStore((s) => s.setView);

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

      <button
        onClick={() => setView('playList')}
        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm"
      >
        My Plays
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

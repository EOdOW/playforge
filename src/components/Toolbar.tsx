import Konva from 'konva';
import { usePlayStore } from '../store/playStore';
import { useUIStore } from '../store/uiStore';
import { exportAsPng, exportAsPdf } from '../utils/export';
import { encodePlayToUrl } from '../utils/sharing';

interface ToolbarProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

export function Toolbar({ stageRef }: ToolbarProps) {
  const currentPlay = usePlayStore((s) => s.currentPlay);
  const setPlayName = usePlayStore((s) => s.setPlayName);
  const undo = usePlayStore((s) => s.undo);
  const redo = usePlayStore((s) => s.redo);
  const canUndo = usePlayStore((s) => s.canUndo);
  const canRedo = usePlayStore((s) => s.canRedo);
  const toggleFormationPicker = useUIStore((s) => s.toggleFormationPicker);
  const setView = useUIStore((s) => s.setView);
  const showMoreMenu = useUIStore((s) => s.showMoreMenu);
  const toggleMoreMenu = useUIStore((s) => s.toggleMoreMenu);
  const setMoreMenu = useUIStore((s) => s.setMoreMenu);

  const handleShare = () => {
    if (!currentPlay) return;
    const url = encodePlayToUrl(currentPlay);
    navigator.clipboard.writeText(url);
    alert('Share link copied to clipboard!');
  };

  const handleMyPlays = () => {
    setView('playList');
    setMoreMenu(false);
  };

  const handlePng = () => {
    if (stageRef.current && currentPlay) {
      exportAsPng(stageRef.current, currentPlay.name);
    }
    setMoreMenu(false);
  };

  const handlePdf = () => {
    if (stageRef.current && currentPlay) {
      exportAsPdf(stageRef.current, currentPlay.name);
    }
    setMoreMenu(false);
  };

  const handleShareAndClose = () => {
    handleShare();
    setMoreMenu(false);
  };

  return (
    <header
      className="bg-slate-800 text-white px-4 py-2 flex items-center gap-2 md:gap-3"
      style={{
        paddingTop: 'max(0.5rem, var(--sai-top))',
        paddingLeft: 'max(1rem, var(--sai-left))',
        paddingRight: 'max(1rem, var(--sai-right))',
      }}
    >
      <h1 className="text-lg font-bold shrink-0">PlayForge</h1>

      <div className="w-px h-6 bg-slate-600" />

      <input
        type="text"
        value={currentPlay?.name ?? ''}
        onChange={(e) => setPlayName(e.target.value)}
        className="bg-slate-700 text-white px-2 py-1 rounded text-sm w-32 md:w-48 min-w-0 outline-none focus:ring-1 focus:ring-blue-400 min-h-[44px]"
        placeholder="Play name..."
      />

      <div className="w-px h-6 bg-slate-600" />

      <button
        onClick={toggleFormationPicker}
        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm min-h-[44px]"
      >
        Formations
      </button>

      {/* Desktop-only actions */}
      <button
        onClick={() => setView('playList')}
        className="hidden md:inline-flex px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm min-h-[44px]"
      >
        My Plays
      </button>

      <div className="flex-1" />

      <div className="hidden md:flex items-center gap-2">
        <button
          onClick={handlePng}
          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm min-h-[44px]"
        >
          PNG
        </button>
        <button
          onClick={handlePdf}
          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm min-h-[44px]"
        >
          PDF
        </button>
        <button
          onClick={handleShare}
          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm min-h-[44px]"
        >
          Share
        </button>
      </div>

      <button
        onClick={undo}
        disabled={!canUndo()}
        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px]"
        title="Undo (Ctrl+Z)"
      >
        Undo
      </button>
      <button
        onClick={redo}
        disabled={!canRedo()}
        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px]"
        title="Redo (Ctrl+Y)"
      >
        Redo
      </button>

      {/* Mobile-only more menu */}
      <div className="relative md:hidden">
        <button
          onClick={toggleMoreMenu}
          className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm min-h-[44px]"
        >
          ···
        </button>
        {showMoreMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMoreMenu(false)} />
            <div className="absolute right-0 top-full mt-1 z-50 bg-slate-700 rounded-lg shadow-xl border border-slate-600 py-1 min-w-[140px]">
              <button
                onClick={handleMyPlays}
                className="w-full text-left px-4 py-3 text-sm hover:bg-slate-600 min-h-[44px]"
              >
                My Plays
              </button>
              <button
                onClick={handlePng}
                className="w-full text-left px-4 py-3 text-sm hover:bg-slate-600 min-h-[44px]"
              >
                PNG
              </button>
              <button
                onClick={handlePdf}
                className="w-full text-left px-4 py-3 text-sm hover:bg-slate-600 min-h-[44px]"
              >
                PDF
              </button>
              <button
                onClick={handleShareAndClose}
                className="w-full text-left px-4 py-3 text-sm hover:bg-slate-600 min-h-[44px]"
              >
                Share
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

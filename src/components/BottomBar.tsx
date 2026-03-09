import { usePlayStore } from '../store/playStore';

export function BottomBar() {
  const addPlayer = usePlayStore((s) => s.addPlayer);

  return (
    <div
      className="bg-slate-800 px-4 py-2 flex items-center gap-3"
      style={{
        paddingBottom: 'max(0.5rem, var(--sai-bottom))',
        paddingLeft: 'max(1rem, var(--sai-left))',
        paddingRight: 'max(1rem, var(--sai-right))',
      }}
    >
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
        className="px-3 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm min-h-[44px]"
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
        className="px-3 py-3 bg-red-600 hover:bg-red-500 text-white rounded text-sm min-h-[44px]"
      >
        + Defense
      </button>
    </div>
  );
}

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

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

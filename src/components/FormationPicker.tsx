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

  const close = () => setFormationPicker(false);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={close} />
      <div className="absolute top-12 left-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-[calc(100vw-2rem)] max-w-64 sm:w-64 flex flex-col">
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 px-3 py-3 text-sm font-medium min-h-[44px] ${
              tab === 'offense' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
            onClick={() => setTab('offense')}
          >
            Offense
          </button>
          <button
            className={`flex-1 px-3 py-3 text-sm font-medium min-h-[44px] ${
              tab === 'defense' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'
            }`}
            onClick={() => setTab('defense')}
          >
            Defense
          </button>
        </div>
        <div className="p-2 max-h-[60vh] overflow-y-auto">
          {formations.map((f) => (
            <button
              key={f.name}
              onClick={() => applyFormation(f)}
              className="w-full text-left px-3 py-3 text-sm rounded hover:bg-gray-100 min-h-[44px]"
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

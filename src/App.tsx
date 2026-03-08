import { useEffect } from 'react';
import { FieldCanvas } from './canvas/FieldCanvas';
import { usePlayStore } from './store/playStore';

function App() {
  const newPlay = usePlayStore((s) => s.newPlay);
  const currentPlay = usePlayStore((s) => s.currentPlay);

  useEffect(() => {
    if (!currentPlay) {
      newPlay();
    }
  }, [currentPlay, newPlay]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-slate-800 text-white px-4 py-2 flex items-center gap-4">
        <h1 className="text-lg font-bold">PlayForge</h1>
      </header>
      <main className="flex-1 overflow-hidden">
        <FieldCanvas />
      </main>
    </div>
  );
}

export default App;

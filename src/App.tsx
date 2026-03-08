import { useEffect } from 'react';
import { FieldCanvas } from './canvas/FieldCanvas';
import { Toolbar } from './components/Toolbar';
import { FormationPicker } from './components/FormationPicker';
import { RoutePalette } from './components/RoutePalette';
import { BottomBar } from './components/BottomBar';
import { PlayerPopover } from './components/PlayerPopover';
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

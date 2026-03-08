import { Stage, Layer } from 'react-konva';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Field } from './Field';
import { PlayerNode } from './PlayerNode';
import { ScrimmageLine } from './ScrimmageLine';
import { RouteLine } from './RouteLine';
import { usePlayStore } from '../store/playStore';
import { useUIStore } from '../store/uiStore';
import { FIELD_WIDTH, FIELD_HEIGHT } from '../utils/constants';

export function FieldCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);

  const currentPlay = usePlayStore((s) => s.currentPlay);
  const updatePlayer = usePlayStore((s) => s.updatePlayer);
  const updateRoute = usePlayStore((s) => s.updateRoute);
  const setScrimmageLineY = usePlayStore((s) => s.setScrimmageLineY);
  const selectedPlayerId = useUIStore((s) => s.selectedPlayerId);
  const selectPlayer = useUIStore((s) => s.selectPlayer);

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const scaleX = clientWidth / FIELD_WIDTH;
      const scaleY = clientHeight / FIELD_HEIGHT;
      const newScale = Math.min(scaleX, scaleY);
      setDimensions({ width: clientWidth, height: clientHeight });
      setScale(newScale);
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  const offsetX = (dimensions.width - FIELD_WIDTH * scale) / 2;
  const offsetY = (dimensions.height - FIELD_HEIGHT * scale) / 2;

  const handleStageTap = (e: any) => {
    if (e.target === e.target.getStage() || e.target.getParent()?.name() === 'field-layer') {
      selectPlayer(null);
    }
  };

  return (
    <div ref={containerRef} className="flex-1 w-full h-full">
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleStageTap}
        onTap={handleStageTap}
      >
        <Layer x={offsetX} y={offsetY} scaleX={scale} scaleY={scale} name="field-layer">
          <Field />
          {currentPlay && (
            <ScrimmageLine
              y={currentPlay.scrimmageLineY}
              onDragEnd={(y) => setScrimmageLineY(y)}
            />
          )}
          {currentPlay?.routes.map((route) => {
            const player = currentPlay.players.find((p) => p.id === route.playerId);
            if (!player) return null;
            return (
              <RouteLine
                key={route.id}
                route={route}
                player={player}
                isSelected={selectedPlayerId === route.playerId}
                onControlPointDrag={(routeId, index, point) => {
                  const r = currentPlay.routes.find((r) => r.id === routeId);
                  if (!r) return;
                  const newControlPoints = [...r.controlPoints];
                  newControlPoints[index] = point;
                  updateRoute(routeId, { controlPoints: newControlPoints });
                }}
              />
            );
          })}
          {currentPlay?.players.map((player) => (
            <PlayerNode
              key={player.id}
              player={player}
              isSelected={selectedPlayerId === player.id}
              onSelect={selectPlayer}
              onDragEnd={(id, x, y) => updatePlayer(id, { x, y })}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

import { Group, Line, Circle, Arrow } from 'react-konva';
import { Route, Player, Point } from '../types/play';
import { OFFENSE_COLOR, DEFENSE_COLOR } from '../utils/constants';

interface RouteLineProps {
  route: Route;
  player: Player;
  isSelected: boolean;
  onControlPointDrag: (routeId: string, index: number, point: Point) => void;
}

export function RouteLine({ route, player, isSelected, onControlPointDrag }: RouteLineProps) {
  const color = player.team === 'offense' ? OFFENSE_COLOR : DEFENSE_COLOR;

  // Build absolute points from player position + relative control points
  const absolutePoints: Point[] = route.controlPoints.map((cp) => ({
    x: player.x + cp.x,
    y: player.y + cp.y,
  }));

  // Build flat points array for the line: [playerX, playerY, cp1x, cp1y, ...]
  const allPoints = [player.x, player.y];
  absolutePoints.forEach((p) => {
    allPoints.push(p.x, p.y);
  });

  const isBlock = route.type === 'block';

  return (
    <Group>
      {/* Route line */}
      {isBlock ? (
        <Line
          points={allPoints}
          stroke={color}
          strokeWidth={4}
          dash={route.style === 'dashed' ? [8, 4] : undefined}
          lineCap="round"
          lineJoin="round"
        />
      ) : (
        <Arrow
          points={allPoints}
          stroke={color}
          strokeWidth={2}
          fill={color}
          pointerLength={8}
          pointerWidth={6}
          dash={route.style === 'dashed' ? [8, 4] : undefined}
          lineCap="round"
          lineJoin="round"
        />
      )}

      {/* Control points (only when route's player is selected) */}
      {isSelected &&
        absolutePoints.map((point, i) => (
          <Circle
            key={i}
            x={point.x}
            y={point.y}
            radius={6}
            fill="#facc15"
            stroke="#000"
            strokeWidth={1}
            draggable
            onDragEnd={(e) => {
              const newX = e.target.x() - player.x;
              const newY = e.target.y() - player.y;
              onControlPointDrag(route.id, i, { x: newX, y: newY });
            }}
          />
        ))}
    </Group>
  );
}

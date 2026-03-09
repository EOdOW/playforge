import { Group, Circle, Line, Text } from 'react-konva';
import { Player } from '../types/play';
import {
  OFFENSE_COLOR,
  DEFENSE_COLOR,
  PLAYER_RADIUS,
} from '../utils/constants';

interface PlayerNodeProps {
  player: Player;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}

export function PlayerNode({ player, isSelected, onSelect, onDragEnd }: PlayerNodeProps) {
  const color = player.team === 'offense' ? OFFENSE_COLOR : DEFENSE_COLOR;
  const r = PLAYER_RADIUS;

  return (
    <Group
      x={player.x}
      y={player.y}
      draggable
      onClick={() => onSelect(player.id)}
      onTap={() => onSelect(player.id)}
      onDragEnd={(e) => {
        onDragEnd(player.id, e.target.x(), e.target.y());
      }}
    >
      {/* Expanded touch target */}
      <Circle radius={22} fill="transparent" />

      {/* Selection ring */}
      {isSelected && (
        <Circle
          radius={r + 5}
          stroke="#facc15"
          strokeWidth={3}
          fillEnabled={false}
        />
      )}

      {/* Player shape */}
      {player.team === 'offense' ? (
        <Circle
          radius={r}
          fill="white"
          stroke={color}
          strokeWidth={3}
        />
      ) : (
        <>
          <Line
            points={[-r, -r, r, r]}
            stroke={color}
            strokeWidth={3}
          />
          <Line
            points={[r, -r, -r, r]}
            stroke={color}
            strokeWidth={3}
          />
        </>
      )}

      {/* Position label */}
      <Text
        text={player.label}
        fontSize={10}
        fill={player.team === 'offense' ? color : color}
        fontStyle="bold"
        align="center"
        verticalAlign="middle"
        width={r * 2}
        height={r * 2}
        offsetX={r}
        offsetY={r}
      />
    </Group>
  );
}

import { Line } from 'react-konva';
import { FIELD_WIDTH, SCRIMMAGE_COLOR } from '../utils/constants';

interface ScrimmageLineProps {
  y: number;
  onDragEnd: (y: number) => void;
}

export function ScrimmageLine({ y, onDragEnd }: ScrimmageLineProps) {
  return (
    <Line
      points={[0, 0, FIELD_WIDTH, 0]}
      stroke={SCRIMMAGE_COLOR}
      strokeWidth={3}
      dash={[10, 5]}
      hitStrokeWidth={20}
      y={y}
      draggable
      dragBoundFunc={(pos) => ({ x: 0, y: pos.y })}
      onDragEnd={(e) => onDragEnd(e.target.y())}
      opacity={0.8}
    />
  );
}

import { Group, Rect, Line, Text } from 'react-konva';
import {
  FIELD_WIDTH,
  FIELD_HEIGHT,
  FIELD_COLOR,
  LINE_COLOR,
  YARD_LINE_SPACING,
} from '../utils/constants';

export function Field() {
  const lines = [];
  const yardLineCount = Math.floor(FIELD_HEIGHT / YARD_LINE_SPACING);

  for (let i = 0; i <= yardLineCount; i++) {
    const y = i * YARD_LINE_SPACING;
    const isMajor = i % 2 === 0; // every 10 yards

    // Yard line
    lines.push(
      <Line
        key={`yard-${i}`}
        points={[0, y, FIELD_WIDTH, y]}
        stroke={LINE_COLOR}
        strokeWidth={isMajor ? 2 : 1}
        opacity={isMajor ? 0.7 : 0.3}
      />
    );

    // Yard numbers on major lines
    if (isMajor && i > 0 && i < yardLineCount) {
      const yardNumber = Math.abs(50 - (i / 2) * 10);
      lines.push(
        <Text
          key={`num-left-${i}`}
          x={50}
          y={y - 10}
          text={String(yardNumber)}
          fontSize={18}
          fill={LINE_COLOR}
          opacity={0.5}
        />,
        <Text
          key={`num-right-${i}`}
          x={FIELD_WIDTH - 70}
          y={y - 10}
          text={String(yardNumber)}
          fontSize={18}
          fill={LINE_COLOR}
          opacity={0.5}
        />
      );
    }

    // Hash marks
    if (!isMajor) {
      const hashPositions = [330, 340, 660, 670];
      hashPositions.forEach((hx, hi) => {
        lines.push(
          <Line
            key={`hash-${i}-${hi}`}
            points={[hx, y - 4, hx, y + 4]}
            stroke={LINE_COLOR}
            strokeWidth={1}
            opacity={0.4}
          />
        );
      });
    }
  }

  return (
    <Group>
      {/* Field background */}
      <Rect
        x={0}
        y={0}
        width={FIELD_WIDTH}
        height={FIELD_HEIGHT}
        fill={FIELD_COLOR}
      />
      {/* Sidelines */}
      <Rect
        x={0}
        y={0}
        width={FIELD_WIDTH}
        height={FIELD_HEIGHT}
        stroke={LINE_COLOR}
        strokeWidth={3}
        fillEnabled={false}
      />
      {/* Yard lines, numbers, hashes */}
      {lines}
    </Group>
  );
}

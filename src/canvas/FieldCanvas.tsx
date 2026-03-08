import { Stage, Layer } from 'react-konva';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Field } from './Field';
import { FIELD_WIDTH, FIELD_HEIGHT } from '../utils/constants';

export function FieldCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);

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

  return (
    <div ref={containerRef} className="flex-1 w-full h-full">
      <Stage width={dimensions.width} height={dimensions.height}>
        <Layer x={offsetX} y={offsetY} scaleX={scale} scaleY={scale}>
          <Field />
        </Layer>
      </Stage>
    </div>
  );
}

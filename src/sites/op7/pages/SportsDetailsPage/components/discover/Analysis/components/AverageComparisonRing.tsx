import React from 'react';

const RING_SIZE = 40;
const STROKE_WIDTH = 6;
/** 左侧半环（主队） */
const LEFT_SIDE_COLOR = 'rgba(51, 143, 255, 0.8)';
/** 右侧半环（客队） */
const RIGHT_SIDE_COLOR = 'rgba(51, 143, 255, 0.25)';

const polar = (cx: number, cy: number, r: number, angle: number) => ({
  x: cx + r * Math.cos(angle),
  y: cy + r * Math.sin(angle),
});

const describeArc = (
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string => {
  const start = polar(cx, cy, r, startAngle);
  const end = polar(cx, cy, r, endAngle);
  const sweep = endAngle - startAngle;
  const largeArc = Math.abs(sweep) > Math.PI ? 1 : 0;
  const sweepFlag = sweep > 0 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} ${sweepFlag} ${end.x} ${end.y}`;
};

interface AverageComparisonRingProps {
  leftPercent: number;
  rightPercent: number;
}

/**
 * 左弧逆时针(深色)，右弧顺时针(浅色)，顶部无留隙
 */
const AverageComparisonRing: React.FC<AverageComparisonRingProps> = ({
  leftPercent,
  rightPercent,
}) => {
  const drawTotal = 2 * Math.PI;

  const cx = RING_SIZE / 2;
  const cy = RING_SIZE / 2;
  const r = (RING_SIZE - STROKE_WIDTH) / 2;

  const leftStart = -Math.PI / 2;
  const leftEnd = leftStart - leftPercent * drawTotal;
  const rightStart = -Math.PI / 2;
  const rightEnd = rightStart + rightPercent * drawTotal;

  return (
    <svg
      className="block shrink-0"
      width={RING_SIZE}
      height={RING_SIZE}
      viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
      aria-hidden
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--Button-200)"
        strokeWidth={STROKE_WIDTH}
      />
      {leftPercent > 0 ? (
        <path
          d={describeArc(cx, cy, r, leftStart, leftEnd)}
          fill="none"
          stroke={LEFT_SIDE_COLOR}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="butt"
        />
      ) : null}
      {rightPercent > 0 ? (
        <path
          d={describeArc(cx, cy, r, rightStart, rightEnd)}
          fill="none"
          stroke={RIGHT_SIDE_COLOR}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="butt"
        />
      ) : null}
    </svg>
  );
};

export default AverageComparisonRing;

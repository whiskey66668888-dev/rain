import React from 'react';

export interface DonutSegment {
  value: number;
  color: string;
}

interface DonutProps {
  size: number;
  thickness: number;
  segments: DonutSegment[];
  /** 无数据时的底环颜色 */
  trackColor?: string;
  children?: React.ReactNode;
}

/** 纯 SVG 环形图，对齐 App fl_chart PieChart（起始 -90°，顺时针） */
const Donut: React.FC<DonutProps> = ({
  size,
  thickness,
  segments,
  trackColor = 'var(--Button-200)',
  children,
}) => {
  const radius = (size - thickness) / 2;
  const circ = 2 * Math.PI * radius;
  const total = segments.reduce((sum, seg) => sum + Math.max(0, seg.value), 0);

  let offset = 0;
  const arcs =
    total <= 0
      ? [{ color: trackColor, dash: circ, gap: 0, dashOffset: 0 }]
      : segments
          .filter((seg) => seg.value > 0)
          .map((seg) => {
            const len = (seg.value / total) * circ;
            const arc = { color: seg.color, dash: len, gap: circ - len, dashOffset: -offset };
            offset += len;
            return arc;
          });

  return (
    <div className="relative flex-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={thickness}
              strokeDasharray={`${arc.dash} ${arc.gap}`}
              strokeDashoffset={arc.dashOffset}
            />
          ))}
        </g>
      </svg>
      {children != null && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
      )}
    </div>
  );
};

export default Donut;

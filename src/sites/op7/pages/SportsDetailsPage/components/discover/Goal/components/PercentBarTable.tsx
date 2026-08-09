import React from 'react';
import clsx from 'clsx';

import { formatPercent } from '../utils/goalLogic';

export interface PercentBarRow {
  label: string;
  /** 主队比值 0~1 */
  homePercent: number;
  /** 客队比值 0~1 */
  awayPercent: number;
}

interface BarProps {
  percent: number;
  color: string;
  isHome: boolean;
}

const Bar: React.FC<BarProps> = ({ percent, color, isHome }) => {
  const width = `${Math.min(100, Math.max(0, percent * 100))}%`;
  const bar = (
    <div className="flex-1 h-3px rounded-4px bg-[var(--Button-200)] overflow-hidden">
      <div
        className="h-full rounded-4px"
        style={{ width, marginLeft: isHome ? 'auto' : 0, background: color }}
      />
    </div>
  );
  const text = (
    <span className="_tf[12] font-500 text-[var(--Text-Main-10)] whitespace-nowrap">
      {formatPercent(percent * 100)}
    </span>
  );
  return (
    <div className="flex-[2] flex items-center gap-8px min-w-0">
      {isHome ? (
        <>
          {bar}
          {text}
        </>
      ) : (
        <>
          {text}
          {bar}
        </>
      )}
    </div>
  );
};

interface PercentBarTableProps {
  rows: PercentBarRow[];
}

/** 进度条对比表（对齐 App goal_summary_view / goal_other_stat_view） */
const PercentBarTable: React.FC<PercentBarTableProps> = ({ rows }) => (
  <div className="flex flex-col">
    <div className="flex items-center h-35px bg-[var(--Line-100)]">
      <span className="flex-[2] pr-16px text-right _tf[12] text-[var(--Text-800)]">
        百分比(主队)
      </span>
      <span className="flex-1 text-center _tf[12] text-[var(--Text-800)]">进球数</span>
      <span className="flex-[2] pl-16px _tf[12] text-[var(--Text-800)]">百分比(客队)</span>
    </div>
    {rows.map((row, i) => (
      <div
        key={row.label}
        className={clsx(
          'flex items-center px-16px py-12px',
          i % 2 === 0 ? 'bg-[var(--Background-300)]' : 'bg-[var(--Line-100)]',
        )}
      >
        <Bar percent={row.homePercent} color="var(--Red-300)" isHome />
        <span className="flex-1 text-center _tf[12] text-[var(--Text-Main-10)]">{row.label}</span>
        <Bar percent={row.awayPercent} color="var(--ThemeColor-Main)" isHome={false} />
      </div>
    ))}
  </div>
);

export default PercentBarTable;

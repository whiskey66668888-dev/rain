import React from 'react';

import GoalSectionHeader from '../components/GoalSectionHeader';
import Donut from '../components/Donut';
import { calcRatio, formatPercent, toInt } from '../utils/goalLogic';

export interface GradeStat {
  win: string;
  draw: string;
  lose: string;
  total: string;
}

interface GradeResultViewProps {
  title: string;
  home: GradeStat;
  away: GradeStat;
  homeName: string;
  awayName: string;
}

const ResultDonut: React.FC<{ stat: GradeStat }> = ({ stat }) => {
  const win = toInt(stat.win);
  const draw = toInt(stat.draw);
  const lose = toInt(stat.lose);
  const total = win + draw + lose;
  return (
    <Donut
      size={68}
      thickness={4}
      segments={[
        { value: win, color: 'rgba(51,143,255,0.8)' },
        { value: draw, color: 'var(--Button-200)' },
        { value: lose, color: 'rgba(51,143,255,0.3)' },
      ]}
    >
      <span className="_tf[16] font-500 text-[rgba(51,143,255,0.8)]">{total}</span>
      <span className="_tf[12] font-500 text-[var(--Text-Main-10)]">场次</span>
    </Donut>
  );
};

const StatLine: React.FC<{ rate: string; count: string; label: string; color: string }> = ({
  rate,
  count,
  label,
  color,
}) => (
  <div className="flex items-center justify-center gap-6px">
    <span className="w-52px text-right _tf[12] font-700 truncate" style={{ color }}>
      {rate}
    </span>
    <span className="min-w-16px text-right _tf[12] font-500" style={{ color }}>
      {count}
    </span>
    <span className="w-16px text-center _tf[12] font-500 text-[var(--Text-Main-10)]">{label}</span>
  </div>
);

const SideColumn: React.FC<{ stat: GradeStat; withBorder?: boolean }> = ({ stat, withBorder }) => {
  const line = (count: string, label: string, color: string) => (
    <StatLine
      rate={formatPercent(calcRatio(count, stat.total) * 100)}
      count={count}
      label={label}
      color={color}
    />
  );
  return (
    <div
      className={
        withBorder
          ? 'flex-1 flex flex-col gap-6px border-r-[0.5px] border-[var(--Line-100)]'
          : 'flex-1 flex flex-col gap-6px'
      }
    >
      {line(stat.win, '胜', 'rgba(51,143,255,0.6)')}
      {line(stat.draw, '平', 'var(--Text-700)')}
      {line(stat.lose, '负', 'rgba(51,143,255,0.4)')}
    </div>
  );
};

/** 先进球成绩 / 先丢球成绩视图（对齐 App goal_lead_result_view / goal_concede_result_view） */
const GradeResultView: React.FC<GradeResultViewProps> = ({
  title,
  home,
  away,
  homeName,
  awayName,
}) => (
  <div className="flex flex-col">
    <GoalSectionHeader title={title} showTeams homeName={homeName} awayName={awayName} />

    <div className="flex items-center gap-10px mt-15px mb-10px">
      <ResultDonut stat={home} />
      <div className="flex-1 flex min-w-0">
        <SideColumn stat={home} withBorder />
        <SideColumn stat={away} />
      </div>
      <ResultDonut stat={away} />
    </div>
  </div>
);

export default GradeResultView;

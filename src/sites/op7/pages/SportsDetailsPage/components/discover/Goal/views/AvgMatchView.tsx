import React from 'react';
import clsx from 'clsx';

import type { GoalStaticNumAvgSide } from '@/apis/origin/discover';

import GoalSectionHeader from '../components/GoalSectionHeader';
import Donut from '../components/Donut';

interface AvgMatchViewProps {
  home: GoalStaticNumAvgSide;
  away: GoalStaticNumAvgSide;
  homeName: string;
  awayName: string;
}

const RING_MAX = 6;

interface CardProps {
  total: string;
  stats: [string, string];
  values: [string, string];
  isLeft: boolean;
}

const RingCard: React.FC<CardProps> = ({ total, stats, values, isLeft }) => {
  const progress = Number.parseFloat(total) || 0;
  const remain = Math.max(0, RING_MAX - progress);

  const ring = (
    <Donut
      size={75}
      thickness={5}
      segments={[
        { value: progress, color: 'rgba(51,143,255,0.8)' },
        { value: remain, color: 'rgba(51,143,255,0.24)' },
      ]}
    >
      <span className="_tf[18] font-500 leading-[1.25] text-[rgba(51,143,255,0.8)]">{total}</span>
      <span className="_tf[12] leading-[1.33] text-[var(--Text-Main-10)]">总进球</span>
    </Donut>
  );

  const sideText = (
    <div className="flex flex-col justify-center gap-2px">
      {stats.map((stat, i) => (
        <div key={stat} className="flex items-center gap-2px">
          <span
            className={clsx(
              '_tf[12] font-500',
              i === 0 ? 'text-[rgba(51,143,255,0.4)]' : 'text-[rgba(51,143,255,0.6)]',
            )}
          >
            {values[i]}
          </span>
          <span className="_tf[12] font-500 text-[var(--Text-Main-10)] whitespace-nowrap">
            {stat}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className={clsx('flex items-center gap-8px', !isLeft && 'flex-row-reverse')}>
      {ring}
      {sideText}
    </div>
  );
};

/** 场均统计视图（对齐 App goal_avg_match_view.dart） */
const AvgMatchView: React.FC<AvgMatchViewProps> = ({ home, away, homeName, awayName }) => (
  <div className="flex flex-col">
    <GoalSectionHeader title="场均统计" showTeams homeName={homeName} awayName={awayName} />

    <div className="grid grid-cols-2 gap-x-8px gap-y-25px px-20px py-10px">
      <div className="border-r-[0.5px] border-[var(--Line-100)] pr-8px">
        <RingCard
          total={home.totalNormalGoalAvg}
          stats={['进球', '丢球']}
          values={[home.totalNormalInGoalAvg, home.totalNormalLossGoalAvg]}
          isLeft
        />
      </div>
      <RingCard
        total={away.totalNormalGoalAvg}
        stats={['进球', '丢球']}
        values={[away.totalNormalInGoalAvg, away.totalNormalLossGoalAvg]}
        isLeft={false}
      />
      <div className="border-r-[0.5px] border-[var(--Line-100)] pr-8px">
        <RingCard
          total={home.homeNormalGoalAvg}
          stats={['主场进球', '主场丢球']}
          values={[home.homeNormalInGoalAvg, home.homeNormalLossGoalAvg]}
          isLeft
        />
      </div>
      <RingCard
        total={away.awayNormalGoalAvg}
        stats={['客场进球', '客场丢球']}
        values={[away.awayNormalInGoalAvg, away.awayNormalLossGoalAvg]}
        isLeft={false}
      />
    </div>
  </div>
);

export default AvgMatchView;

import React, { useMemo, useState } from 'react';
import clsx from 'clsx';

import type { GoalDistribution as GoalDistributionData } from '@/apis/origin/discover';
import Empty from '@/common/components/Empty';

import {
  GOAL_AXIS_LABELS,
  hasGoalDistribution,
  parseGoalSegments,
  pickGoalScope,
  type GoalSegments,
} from './utils/historyLogic';

interface GoalDistributionProps {
  data: GoalDistributionData;
  homeName: string;
  awayName: string;
  homeIcon?: string;
  awayIcon?: string;
}

const cellBg = (value: number): string => {
  if (value <= 0) return 'var(--Background-500)';
  if (value <= 2) return 'rgba(51, 143, 255, 0.2)';
  if (value === 3) return 'rgba(51, 143, 255, 0.3)';
  return 'rgba(51, 143, 255, 0.5)';
};

const GoalGridRow: React.FC<{ values: number[]; maxIndex: number }> = ({ values, maxIndex }) => (
  <div className="flex gap-2px h-20px">
    {values.map((v, i) => (
      <span
        key={i}
        className={clsx(
          'flex-1 flex items-center justify-center _tf[12] text-[var(--ThemeColor-Main)]',
          i === maxIndex ? 'font-800' : 'font-500',
        )}
        style={{ background: cellBg(v) }}
      >
        {v}
      </span>
    ))}
  </div>
);

const TeamSection: React.FC<{
  name: string;
  icon?: string;
  seg: GoalSegments;
  withBorder?: boolean;
}> = ({ icon, seg, withBorder }) => {
  const maxIndex = useMemo(() => {
    const totals = seg.scored.map((v, i) => v + (seg.conceded[i] ?? 0));
    const max = Math.max(...totals);
    return max > 0 ? totals.indexOf(max) : -1;
  }, [seg]);

  return (
    <div className={clsx('py-10px', withBorder && 'border-t-[0.5px] border-[var(--Line-100)]')}>
      <div className="flex items-center gap-8px">
        {/* 标签列 */}
        <div className="w-56px flex-none flex flex-col gap-4px">
          <div className="flex items-center gap-4px h-20px">
            {icon ? (
              <img
                className="w-20px h-20px rounded-full object-cover flex-none"
                src={icon}
                alt=""
              />
            ) : (
              <span className="w-20px h-20px rounded-full bg-[var(--Line-100)] flex-none" />
            )}
            <span className="_tf[12] text-[var(--Text-Main-10)]">进球</span>
          </div>
          <div className="flex items-center gap-4px h-20px">
            <span className="w-20px flex-none" />
            <span className="_tf[12] text-[var(--Text-Main-10)]">失球</span>
          </div>
        </div>
        {/* 总数列 */}
        <div className="w-28px flex-none flex flex-col gap-4px text-center">
          <span className="h-20px flex items-center justify-center _tf[12] font-800 text-[var(--ThemeColor-Main)]">
            {seg.totalScored}
          </span>
          <span className="h-20px flex items-center justify-center _tf[12] font-800 text-[var(--ThemeColor-Main)]">
            {seg.totalConceded}
          </span>
        </div>
        {/* 区间格子 */}
        <div className="flex-1 min-w-0 flex flex-col gap-4px">
          <GoalGridRow values={seg.scored} maxIndex={maxIndex} />
          <GoalGridRow values={seg.conceded} maxIndex={maxIndex} />
        </div>
      </div>
      {/* 时间轴 */}
      <div className="flex mt-4px">
        <span className="w-92px flex-none" />
        <div className="flex-1 min-w-0 flex justify-between _tf[10] text-[var(--Text-800)]">
          {GOAL_AXIS_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

const GoalDistribution: React.FC<GoalDistributionProps> = ({
  data,
  homeName,
  awayName,
  homeIcon,
  awayIcon,
}) => {
  const [sameHomeAway, setSameHomeAway] = useState(false);

  const homeSeg = useMemo(
    () => parseGoalSegments(pickGoalScope(data.home, sameHomeAway, 'home')),
    [data.home, sameHomeAway],
  );
  const awaySeg = useMemo(
    () => parseGoalSegments(pickGoalScope(data.guest, sameHomeAway, 'away')),
    [data.guest, sameHomeAway],
  );

  if (!hasGoalDistribution(data.home, data.guest)) {
    return <Empty variant="card" className="py-24px" />;
  }

  return (
    <div className="rounded-8px bg-[var(--Background-300)] p-10px">
      <div className="flex items-baseline gap-4px">
        <span className="_tf[14] font-600 leading-[1.43] text-[var(--Text-Main-10)]">进球分布</span>
        <span className="_tf[11] text-[var(--Text-800)]">(本赛季同赛事进球分布)</span>
      </div>

      <button
        type="button"
        onClick={() => setSameHomeAway((v) => !v)}
        className="flex items-center gap-4px mt-8px cursor-pointer"
      >
        <span
          className={clsx(
            'w-14px h-14px rounded-full border-solid flex items-center justify-center',
            sameHomeAway
              ? 'border-[var(--ThemeColor-Main)] bg-[var(--ThemeColor-Main)]'
              : 'border-[var(--Line-200)] bg-transparent',
          )}
        >
          {sameHomeAway && <span className="w-6px h-6px rounded-full bg-white" />}
        </span>
        <span className="_tf[12] text-[var(--Text-Main-10)]">同主客</span>
      </button>

      <TeamSection name={homeName} icon={homeIcon} seg={homeSeg} />
      <TeamSection name={awayName} icon={awayIcon} seg={awaySeg} withBorder />
    </div>
  );
};

export default GoalDistribution;

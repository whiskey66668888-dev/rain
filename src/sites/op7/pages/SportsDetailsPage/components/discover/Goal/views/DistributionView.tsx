import React, { useMemo, useState } from 'react';
import clsx from 'clsx';

import SegmentedControl from '@/common/components/SegmentedControl';
import type { GoalDist, GoalDistSide } from '@/apis/origin/discover';

import GoalSectionHeader from '../components/GoalSectionHeader';
import { toInt } from '../utils/goalLogic';

interface DistributionViewProps {
  dist: GoalDist;
  homeName: string;
  awayName: string;
  homeIcon?: string;
  awayIcon?: string;
}

const AXIS_LABELS = ["0'", "15'", "30'", "45'", "60'", "75'", "90'"];
const SCOPE_OPTIONS = [
  { value: 0, label: '全部' },
  { value: 1, label: '同主客' },
];

const cellBg = (value: number): string => {
  if (value <= 0) return 'var(--Button-200)';
  if (value <= 2) return 'rgba(51, 143, 255, 0.2)';
  if (value === 3) return 'rgba(51, 143, 255, 0.3)';
  return 'rgba(51, 143, 255, 0.5)';
};

const GridRow: React.FC<{
  label: string;
  total: number;
  values: number[];
  maxIndex: number;
}> = ({ label, total, values, maxIndex }) => (
  <div className="flex items-center">
    <span className="w-16px text-center _tf[12] font-500 text-[var(--Text-Main-10)]">{label}</span>
    <span className="w-28px text-center _tf[12] font-500 text-[#338FFF]">{total}</span>
    <span className="w-4px flex-none" />
    <div className="flex gap-2px">
      {values.map((v, i) => (
        <span
          key={i}
          className={clsx(
            'w-28px h-20px flex items-center justify-center _tf[12] text-[var(--ThemeColor-Main)]',
            i === maxIndex ? 'font-800' : 'font-500',
          )}
          style={{ background: cellBg(v) }}
        >
          {v}
        </span>
      ))}
    </div>
  </div>
);

const TeamBlock: React.FC<{
  name: string;
  icon?: string;
  scored: number[];
  conceded: number[];
}> = ({ name, icon, scored, conceded }) => {
  const maxIndex = useMemo(() => {
    const totals = scored.map((v, i) => v + (conceded[i] ?? 0));
    const max = Math.max(...totals);
    return max > 0 ? totals.indexOf(max) : -1;
  }, [scored, conceded]);

  const scoredTotal = scored.reduce((a, b) => a + b, 0);
  const concededTotal = conceded.reduce((a, b) => a + b, 0);

  return (
    <div className="flex items-center gap-8px">
      <div className="flex-1 min-w-0 flex items-center gap-4px">
        {icon ? (
          <img className="w-24px h-24px rounded-full object-cover flex-none" src={icon} alt="" />
        ) : (
          <span className="w-24px h-24px rounded-full bg-[var(--Line-100)] flex-none" />
        )}
        <span className="_tf[12] text-[var(--Text-Main-10)] truncate">{name}</span>
      </div>
      <div className="flex-none flex flex-col gap-4px">
        <GridRow label="进" total={scoredTotal} values={scored} maxIndex={maxIndex} />
        <GridRow label="失" total={concededTotal} values={conceded} maxIndex={maxIndex} />
      </div>
    </div>
  );
};

const pickScored = (side: GoalDistSide, isAll: boolean, isHome: boolean): number[] =>
  (isAll ? side.totalScored : isHome ? side.homeScored : side.awayScored).map((v) => toInt(v));

const pickConceded = (side: GoalDistSide, isAll: boolean, isHome: boolean): number[] =>
  (isAll ? side.totalConceded : isHome ? side.homeConceded : side.awayConceded).map((v) =>
    toInt(v),
  );

/** 分布时间视图（对齐 App goal_distribution_view.dart） */
const DistributionView: React.FC<DistributionViewProps> = ({
  dist,
  homeName,
  awayName,
  homeIcon,
  awayIcon,
}) => {
  const [scope, setScope] = useState(0);
  const isAll = scope === 0;

  return (
    <div className="flex flex-col">
      <GoalSectionHeader title="分布时间" homeName={homeName} awayName={awayName} />

      <div className="w-124px h-24px">
        <SegmentedControl height={24} options={SCOPE_OPTIONS} value={scope} onChange={setScope} />
      </div>

      <div className="mt-15px flex flex-col">
        <TeamBlock
          name={homeName}
          icon={homeIcon}
          scored={pickScored(dist.home, isAll, true)}
          conceded={pickConceded(dist.home, isAll, true)}
        />
        {/* 时间轴 */}
        <div className="flex items-center gap-8px my-8px">
          <div className="flex-1 h-[0.5px] bg-[var(--Line-100)]" />
          <div className="flex-none flex">
            <span className="w-48px flex-none" />
            <div className="w-178px flex justify-between _tf[10] text-[var(--Text-800)]">
              {AXIS_LABELS.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>
        </div>
        <TeamBlock
          name={awayName}
          icon={awayIcon}
          scored={pickScored(dist.away, isAll, false)}
          conceded={pickConceded(dist.away, isAll, false)}
        />
      </div>
    </div>
  );
};

export default DistributionView;

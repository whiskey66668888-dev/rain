import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

import type { IntelData, IntelItem, IntelSide } from '@/apis/origin/discover';
import Empty from '@/common/components/Empty';

interface BasicIntelProps {
  data: IntelData | null;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamIcon?: string;
  awayTeamIcon?: string;
}

/** 0: 全部, 1: 主队, 2: 客队, 3: 中立 */
type FilterIndex = 0 | 1 | 2 | 3;

const GOOD_COLOR = 'var(--Red-900)';
const NEUTRAL_COLOR = 'var(--green-new)';

const FILTER_PILL_BASE =
  'flex-none h-28px px-12px border-0 rounded-30px leading-[1] cursor-pointer whitespace-nowrap';

const sortByLevelDesc = (list: IntelItem[]): IntelItem[] =>
  [...list].sort((a, b) => b.level - a.level);

/** 有利/不利情报在当前筛选下是否有数据 */
const hasSideData = (side: IntelSide, filterIndex: FilterIndex): boolean => {
  if (filterIndex === 0) return side.home.length + side.away.length > 0;
  if (filterIndex === 1) return side.home.length > 0;
  if (filterIndex === 2) return side.away.length > 0;
  return false;
};

interface TeamHead {
  name: string;
  icon?: string;
}

const TimelineItem: React.FC<{
  text: string;
  color: string;
  isFirst: boolean;
  isLast: boolean;
}> = ({ text, color, isFirst, isLast }) => (
  <div className="flex items-stretch">
    <div className="flex w-20px flex-none flex-col items-center">
      <span
        className="w-[1px]"
        style={{ height: 5, background: isFirst ? 'transparent' : color }}
      />
      <span className="w-6px h-6px my-[1px] rounded-full" style={{ background: color }} />
      <span className="w-[1px]" style={{ flex: 1, background: isLast ? 'transparent' : color }} />
    </div>
    <div className="flex-1 pb-10px _tf[12] leading-[1.33] tracking-[0.5px] text-[var(--Text-Main-10)]">
      {text}
    </div>
  </div>
);

const TeamColumn: React.FC<{
  team: TeamHead;
  items: IntelItem[];
  color: string;
  className?: string;
}> = ({ team, items, color, className }) => (
  <div className={clsx('flex flex-col', className)}>
    <div className="flex items-center gap-4px mb-10px">
      {team.icon ? (
        <img className="w-24px h-24px rounded-full object-cover" src={team.icon} alt="" />
      ) : (
        <span className="w-24px h-24px rounded-full bg-[var(--Line-100)]" />
      )}
      <span className="_tf[12] font-600 tracking-[0.5px] text-[var(--Text-Main-10)]">
        {team.name}
      </span>
    </div>
    {items.map((item, index) => (
      <TimelineItem
        key={index}
        text={item.text}
        color={color}
        isFirst={index === 0}
        isLast={index === items.length - 1}
      />
    ))}
  </div>
);

const SectionTitle: React.FC<{ text: string; color: string }> = ({ text, color }) => (
  <div className="mb-10px _tf[14] font-600 leading-[1.2]" style={{ color }}>
    {text}
  </div>
);

const IntelSection: React.FC<{
  title: string;
  color: string;
  side: IntelSide;
  filterIndex: FilterIndex;
  homeTeam: TeamHead;
  awayTeam: TeamHead;
}> = ({ title, color, side, filterIndex, homeTeam, awayTeam }) => {
  const showHome = filterIndex === 0 || filterIndex === 1;
  const showAway = filterIndex === 0 || filterIndex === 2;
  const homeList = useMemo(() => sortByLevelDesc(side.home), [side.home]);
  const awayList = useMemo(() => sortByLevelDesc(side.away), [side.away]);

  const columns: React.ReactNode[] = [];
  if (showHome && homeList.length > 0) {
    columns.push(<TeamColumn key="home" team={homeTeam} items={homeList} color={color} />);
  }
  if (showAway && awayList.length > 0) {
    columns.push(
      <TeamColumn
        key="away"
        team={awayTeam}
        items={awayList}
        color={color}
        className={columns.length > 0 ? 'mt-4px' : undefined}
      />,
    );
  }

  const totalCount = (showHome ? homeList.length : 0) + (showAway ? awayList.length : 0);
  if (totalCount === 0) return null;

  return (
    <div className="p-10px">
      <SectionTitle text={`${title} (${totalCount})`} color={color} />
      {columns}
    </div>
  );
};

const NeutralSection: React.FC<{ items: IntelItem[] }> = ({ items }) => {
  if (items.length === 0) return null;
  return (
    <div className="p-10px">
      <SectionTitle text={`中立情报 (${items.length})`} color={NEUTRAL_COLOR} />
      {items.map((item, index) => (
        <TimelineItem
          key={index}
          text={item.text}
          color={NEUTRAL_COLOR}
          isFirst={index === 0}
          isLast={index === items.length - 1}
        />
      ))}
    </div>
  );
};

const BasicIntel: React.FC<BasicIntelProps> = ({
  data,
  homeTeamName = '',
  awayTeamName = '',
  homeTeamIcon,
  awayTeamIcon,
}) => {
  const [filterIndex, setFilterIndex] = useState<FilterIndex>(0);

  const good = data?.good ?? { home: [], away: [] };
  const bad = data?.bad ?? { home: [], away: [] };
  const neutral = data?.neutral ?? [];

  const filterTabs = useMemo(() => {
    const tabs: { id: FilterIndex; label: string }[] = [{ id: 0, label: '全部' }];
    if (good.home.length > 0 || bad.home.length > 0) tabs.push({ id: 1, label: '主队' });
    if (good.away.length > 0 || bad.away.length > 0) tabs.push({ id: 2, label: '客队' });
    if (neutral.length > 0) tabs.push({ id: 3, label: '中立' });
    return tabs;
  }, [good.home.length, good.away.length, bad.home.length, bad.away.length, neutral.length]);

  // 当前筛选项被数据变化移除时，回退到「全部」
  useEffect(() => {
    if (!filterTabs.some((tab) => tab.id === filterIndex)) {
      setFilterIndex(0);
    }
  }, [filterTabs, filterIndex]);

  const homeTeam: TeamHead = { name: homeTeamName, icon: homeTeamIcon };
  const awayTeam: TeamHead = { name: awayTeamName, icon: awayTeamIcon };

  const showTeam = filterIndex !== 3;
  const hasGood = showTeam && hasSideData(good, filterIndex);
  const hasBad = showTeam && hasSideData(bad, filterIndex);
  const hasNeutral = (filterIndex === 0 || filterIndex === 3) && neutral.length > 0;
  const hasAny = hasGood || hasBad || hasNeutral;

  if (!hasAny && filterTabs.length <= 1) {
    return <Empty variant="card" className="py-24px" />;
  }

  return (
    <div className="flex flex-col py-10px rounded-8px bg-[var(--Background-300)]">
      {filterTabs.length > 1 && (
        <div className="flex gap-8px px-10px pb-4px overflow-x-auto scrollbar-none">
          {filterTabs.map((tab) => {
            const active = tab.id === filterIndex;
            return (
              <button
                key={tab.id}
                type="button"
                className={clsx(
                  FILTER_PILL_BASE,
                  '_tf[12]',
                  active
                    ? 'bg-[var(--ThemeColor-Main)] text-[var(--White-100)] font-600'
                    : 'bg-[var(--Line-100)] text-[var(--Text-800)] font-400',
                )}
                onClick={() => setFilterIndex(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {!hasAny ? (
        <Empty variant="card" className="py-24px" />
      ) : (
        <>
          {hasGood && (
            <IntelSection
              title="有利情报"
              color={GOOD_COLOR}
              side={good}
              filterIndex={filterIndex}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
            />
          )}
          {hasGood && (hasBad || hasNeutral) && (
            <div className="mx-10px h-[0.5px] bg-[var(--Line-100)]" />
          )}
          {hasBad && (
            <IntelSection
              title="不利情报"
              color={NEUTRAL_COLOR}
              side={bad}
              filterIndex={filterIndex}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
            />
          )}
          {hasBad && hasNeutral && <div className="mx-10px h-[0.5px] bg-[var(--Line-100)]" />}
          {hasNeutral && <NeutralSection items={neutral} />}
        </>
      )}
    </div>
  );
};

export default BasicIntel;

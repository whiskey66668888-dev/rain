import React, { useMemo, useState } from 'react';
import clsx from 'clsx';

import Empty from '@/common/components/Empty';
import homeIcon from '@/sites/op7/images/common/discover/history/home.png';
import awayIcon from '@/sites/op7/images/common/discover/history/away.png';
import vsIcon from '@/sites/op7/images/common/discover/history/vs.png';
import teamPlaceholderIcon from '@/sites/op7/images/common/discover/history/team_placeholder.png';

import type {
  RecentScheduleMatch,
  RecentScheduleResult,
  RecentScheduleSide,
} from './utils/historyLogic';

const DEFAULT_SHOW_COUNT = 5;

interface RecentScheduleProps {
  teamName: string;
  teamLogo?: string;
  side: RecentScheduleSide;
  result: RecentScheduleResult;
  /** 顶部与上方 sub-tab 栏相接：只保留底部圆角 */
  topFlush?: boolean;
}

/** 满 24 小时算 1 天，不足按小时算；>=7 天只显示天数 */
const formatGap = (hours: number | null): string => {
  if (hours == null || hours < 1) return '';
  const days = Math.floor(hours / 24);
  const remainHours = hours % 24;
  if (days >= 7) return `${days}天`;
  if (days > 0 && remainHours > 0) return `${days}天${remainHours}小时`;
  if (days > 0) return `${days}天`;
  return `${remainHours}小时`;
};

const fmtMonthDay = (dt: Date | null): string =>
  dt ? `${dt.getMonth() + 1}月${dt.getDate()}` : '';

const currentDateLabel = (dt: Date | null): string => {
  if (!dt) return '';
  const now = new Date();
  if (
    now.getFullYear() === dt.getFullYear() &&
    now.getMonth() === dt.getMonth() &&
    now.getDate() === dt.getDate()
  ) {
    return '今天';
  }
  return fmtMonthDay(dt);
};

const TeamLogo: React.FC<{ url: string; square?: boolean }> = ({ url, square }) => {
  const shape = square ? 'rounded-4px' : 'rounded-full';
  if (!url)
    return (
      <img className="w-28px h-28px flex-none object-contain" src={teamPlaceholderIcon} alt="" />
    );
  return <img className={clsx('w-28px h-28px flex-none object-cover', shape)} src={url} alt="" />;
};

/** 主/客/VS 标记（主场=绿房子，客场=蓝飞机） */
const SideBadge: React.FC<{ isHome: boolean | null; vs?: boolean }> = ({ isHome, vs }) => {
  if (vs) return <img className="w-16px h-16px flex-none object-contain" src={vsIcon} alt="" />;
  if (isHome == null) return null;
  return (
    <img
      className="w-16px h-16px flex-none object-contain"
      src={isHome ? homeIcon : awayIcon}
      alt=""
    />
  );
};

const TimelineCards: React.FC<{ result: RecentScheduleResult; side: RecentScheduleSide }> = ({
  result,
  side,
}) => {
  const tl = result.timeline;
  if (!tl) return null;

  const focusId =
    tl.focusTeamId || (side === 'home' ? tl.current.homeTeamId : tl.current.awayTeamId);
  const isHomeInMatch = (m: RecentScheduleMatch): boolean | null => {
    if (!focusId) return null;
    if (m.homeTeamId === focusId) return true;
    if (m.awayTeamId === focusId) return false;
    return null;
  };
  const opponentLogo = (m: RecentScheduleMatch): string => {
    const isHome = isHomeInMatch(m);
    if (isHome == null) return '';
    return isHome ? m.awayLogo : m.homeLogo;
  };

  const SideCard: React.FC<{
    match: RecentScheduleMatch | null;
    title: string;
    isLeft: boolean;
  }> = ({ match, title, isLeft }) => (
    <div
      className={clsx(
        'flex-1 mt-5px h-70px relative flex flex-col items-center justify-end pb-4px border-[0.5px] border-[rgba(51,143,255,0.25)] bg-[rgba(51,143,255,0.06)]',
        isLeft ? 'rounded-l-4px' : 'rounded-r-4px',
      )}
    >
      {match?.leagueLogo ? (
        <img
          className={clsx(
            'absolute top-3px w-14px h-14px object-cover',
            isLeft ? 'left-3px' : 'right-3px',
          )}
          src={match.leagueLogo}
          alt=""
        />
      ) : null}
      <div className="relative flex-1 flex items-center justify-center">
        <TeamLogo url={match ? opponentLogo(match) : ''} />
        <span className="absolute bottom-0 right-[calc(50%-20px)]">
          <SideBadge isHome={isHomeInMatch(match ?? tl.current)} />
        </span>
      </div>
      <span className="_tf[12] font-600 text-[var(--Text-Main-10)] leading-[1.17]">{title}</span>
      {match?.matchTime ? (
        <span className="_tf[12] font-400 text-[var(--Text-700)] leading-[1.17]">
          {fmtMonthDay(match.matchTime)}
        </span>
      ) : null}
    </div>
  );

  return (
    <div className="mb-12px">
      <div className="flex items-start">
        <SideCard match={tl.previous} title="上一场" isLeft />
        {/* 本场 */}
        <div className="flex-1 h-80px relative flex flex-col items-center justify-end pb-6px rounded-4px border border-[var(--ThemeColor-Main)] bg-[rgba(51,143,255,0.25)]">
          {tl.current.leagueLogo ? (
            <img
              className="absolute top-3px left-3px w-14px h-14px object-cover"
              src={tl.current.leagueLogo}
              alt=""
            />
          ) : null}
          <div className="relative flex-1 flex items-center justify-center gap-2px">
            <SideBadge isHome={null} vs />
            <TeamLogo url={opponentLogo(tl.current)} square />
            <SideBadge isHome={isHomeInMatch(tl.current)} />
          </div>
          <span className="_tf[12] font-600 text-[var(--Text-Main-10)] leading-[1.5]">本场</span>
          <span className="_tf[12] font-400 text-[var(--Text-800)] leading-[1.17]">
            {currentDateLabel(tl.current.matchTime)}
          </span>
        </div>
        <SideCard match={tl.next} title="下一场" isLeft={false} />
      </div>

      {/* 三角标记线 */}
      <div className="relative h-8px mt-2px">
        <div className="absolute top-1/2 left-[16.6%] right-[16.6%] h-[1px] bg-[var(--ThemeColor-Main)] opacity-40" />
        {['16.6%', '50%', '83.4%'].map((left) => (
          <span
            key={left}
            className="absolute bottom-0"
            style={{
              left,
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderBottom: '6px solid var(--ThemeColor-Main)',
            }}
          />
        ))}
      </div>

      {/* 间隔 */}
      <div className="flex mt-4px _tf[12] font-500 text-[var(--ThemeColor-Main)]">
        <span className="flex-1 text-center">{formatGap(tl.gapToPreviousHours)}</span>
        <span className="flex-1 text-center">{formatGap(tl.gapToNextHours)}</span>
      </div>
    </div>
  );
};

const RecentSchedule: React.FC<RecentScheduleProps> = ({
  teamName,
  teamLogo,
  side,
  result,
  topFlush,
}) => {
  const [expanded, setExpanded] = useState(false);
  const rows = result.rows;
  const showToggle = rows.length > DEFAULT_SHOW_COUNT;
  const displayRows = useMemo(
    () => (showToggle && !expanded ? rows.slice(0, DEFAULT_SHOW_COUNT) : rows),
    [rows, showToggle, expanded],
  );

  return (
    <div
      className={clsx(
        'bg-[var(--Background-300)] pt-10px pb-20px',
        topFlush ? 'rounded-b-8px' : 'rounded-8px',
      )}
    >
      <div className="px-12px _tf[14] font-600 text-[var(--Text-Main-10)]">近期赛程</div>

      {/* 队伍 */}
      <div className="flex items-center gap-6px px-12px mt-8px">
        {teamLogo ? (
          <img
            className="w-18px h-18px rounded-full object-cover flex-none"
            src={teamLogo}
            alt=""
          />
        ) : (
          <span className="w-18px h-18px rounded-full bg-[var(--Line-100)] flex-none" />
        )}
        <span className="truncate _tf[12] font-600 text-[var(--Text-Main-10)]">{teamName}</span>
      </div>

      <div className="mt-10px mx-12px">
        <TimelineCards result={result} side={side} />

        {rows.length === 0 ? (
          <Empty variant="card" className="py-24px" />
        ) : (
          <div className="border border-[var(--Line-100)]">
            {/* 表头 */}
            <div className="flex items-center h-36px bg-[var(--Background-700)] _tf[12] font-500 text-[var(--Text-700)]">
              <span className="w-90px flex-none pl-10px">日期/赛事</span>
              <span className="flex-1 text-center">主队 比分 客队</span>
              <span className="w-50px flex-none text-center">间隔</span>
            </div>
            {displayRows.map((r, index) => (
              <div
                key={`${r.dateText}-${r.homeName}-${index}`}
                className={clsx(
                  'flex items-center h-40px border-t-[0.5px] border-[var(--Line-100)]',
                  r.isCurrent ? 'text-[var(--ThemeColor-Main)]' : 'text-[var(--Text-Main-10)]',
                )}
              >
                <div className="w-90px flex-none flex flex-col justify-center items-center _tf[12] leading-[1.2]">
                  <span className="font-600">{r.dateText}</span>
                  <span className="font-400">{r.leagueText}</span>
                </div>
                <div className="flex-1 min-w-0 flex items-center _tf[12]">
                  <span className="flex-1 min-w-0 text-right truncate font-500">{r.homeName}</span>
                  <span className="px-6px font-600 whitespace-nowrap">{r.scoreText}</span>
                  <span className="flex-1 min-w-0 text-left truncate font-500">{r.awayName}</span>
                </div>
                <span className="w-50px flex-none text-center _tf[12] font-500">{r.gapText}</span>
              </div>
            ))}
          </div>
        )}

        {showToggle ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center justify-center gap-2px w-full mt-10px _tf[12] text-[var(--Text-800)] cursor-pointer bg-transparent border-0"
          >
            {expanded ? '收起' : '更多'}
            <span className={clsx('_tf[10] transition-transform', expanded && 'rotate-180')}>
              ▾
            </span>
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default RecentSchedule;

import React, { useMemo, useState } from 'react';
import clsx from 'clsx';

import { FBSportIdValue } from '@/apis/fbSports/common/constants';
import { useDiscoverMatchAnalysisQuery, useDiscoverMatchInfoQuery } from '@/apis/origin/discover';
import Skeleton from '@/common/components/Skeleton';
import Empty from '@/common/components/Empty';

import GoalDistribution from './GoalDistribution';
import HistoryList from './HistoryList';
import RecentSchedule from './RecentSchedule';
import { buildRecentSchedule } from './utils/historyLogic';
import type {
  CurrentMatchInfo,
  RecentScheduleCompetition,
  RecentScheduleMatchInfo,
  RecentScheduleSide,
} from './utils/historyLogic';

interface HistoryProps {
  scheduleId: string | null;
  sportId?: number;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamIcon?: string;
  awayTeamIcon?: string;
}

const TAB_VS = 0;
const TAB_GOAL = 1;
const TAB_HOME = 2;
const TAB_AWAY = 3;

const PILL_BASE =
  'flex-none h-28px px-12px border-0 rounded-30px leading-[1] cursor-pointer whitespace-nowrap';

const pick = (a: string | undefined, b: string | undefined): string =>
  a && a.trim() ? a : (b ?? '');

const History: React.FC<HistoryProps> = ({
  scheduleId,
  sportId,
  homeTeamName = '',
  awayTeamName = '',
  homeTeamIcon,
  awayTeamIcon,
}) => {
  const sportType = sportId === Number(FBSportIdValue.Basketball) ? 2 : 1;
  const [activeTab, setActiveTab] = useState<number>(TAB_VS);
  const [teamSubTab, setTeamSubTab] = useState<'record' | 'schedule'>('record');

  const { data: analysis, isLoading } = useDiscoverMatchAnalysisQuery(
    scheduleId,
    sportType,
    !!scheduleId,
  );
  const { data: matchInfo } = useDiscoverMatchInfoQuery(scheduleId, !!scheduleId, sportType);

  const info = matchInfo;

  const homeName = pick(info?.home_team_name, homeTeamName) || '主队';
  const awayName = pick(info?.guest_team_name, awayTeamName) || '客队';
  const homeIcon = pick(info?.home_logo, homeTeamIcon);
  const awayIcon = pick(info?.guest_logo, awayTeamIcon);

  const cur: CurrentMatchInfo = useMemo(
    () => ({
      homeTeamId: info?.home_team_id ?? '',
      guestTeamId: info?.guest_team_id ?? '',
      sclassId: info?.sclass_id ?? '',
    }),
    [info?.home_team_id, info?.guest_team_id, info?.sclass_id],
  );

  const tabs = useMemo(
    () => [
      { id: TAB_VS, label: '交锋' },
      { id: TAB_GOAL, label: '进球' },
      { id: TAB_HOME, label: homeName },
      { id: TAB_AWAY, label: awayName },
    ],
    [homeName, awayName],
  );

  if (!scheduleId) return null;

  const renderBody = () => {
    if (isLoading) return <Skeleton type="base" baseClassName="h-260px" />;

    const empty = <Empty className="pb-24px" />;

    if (activeTab === TAB_GOAL) {
      if (!analysis?.goalDistribution) return empty;
      return (
        <GoalDistribution
          data={analysis.goalDistribution}
          homeName={homeName}
          awayName={awayName}
          homeIcon={homeIcon}
          awayIcon={awayIcon}
        />
      );
    }

    if (activeTab === TAB_VS) {
      if (!analysis?.history?.vs?.length) return empty;
      return (
        <HistoryList key="vs" history={analysis.history} ctx="vs" cur={cur} title="历史交锋" />
      );
    }

    // 主队 / 客队：近期战绩 / 近期赛程
    if (!analysis) return empty;
    const side: RecentScheduleSide = activeTab === TAB_HOME ? 'home' : 'away';
    const teamName = activeTab === TAB_HOME ? homeName : awayName;
    const teamLogo = activeTab === TAB_HOME ? homeIcon : awayIcon;

    const hasRecord = (analysis.history?.[side]?.length ?? 0) > 0;
    const hasSchedule = (analysis.future?.[side]?.length ?? 0) > 0;

    const subTabs: Array<{ key: 'record' | 'schedule'; label: string }> = [];
    if (hasRecord) subTabs.push({ key: 'record', label: '近期战绩' });
    if (hasSchedule) subTabs.push({ key: 'schedule', label: '近期赛程' });
    if (subTabs.length === 0) return empty;

    const activeSub = subTabs.some((t) => t.key === teamSubTab) ? teamSubTab : subTabs[0]!.key;

    const hasBar = subTabs.length > 1;
    const subTabBar = hasBar ? (
      <div className="flex gap-8px px-10px pt-10px pb-10px bg-[var(--Background-300)] rounded-t-8px">
        {subTabs.map((t) => {
          const active = t.key === activeSub;
          return (
            <button
              key={t.key}
              type="button"
              className={clsx(
                'flex-1 h-40px rounded-8px _tf[13] cursor-pointer border-0',
                active
                  ? 'bg-[var(--ThemeColor-Main)] text-[var(--White-100)] font-600'
                  : 'bg-[rgba(51,143,255,0.12)] text-[var(--Text-800)] font-400',
              )}
              onClick={() => setTeamSubTab(t.key)}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    ) : null;

    let body: React.ReactNode;
    if (activeSub === 'record') {
      body = (
        <HistoryList
          key={`record-${side}`}
          history={analysis.history}
          ctx={side}
          cur={cur}
          title="近期战绩"
          topFlush={hasBar}
        />
      );
    } else {
      const rsInfo: RecentScheduleMatchInfo | null = info
        ? {
            scheduleId: scheduleId ?? '',
            matchTime: info.match_time ?? '',
            matchTimeStr: info.match_time_str ?? '',
            matchState: info.match_state ?? '',
            homeTeamId: info.home_team_id ?? '',
            guestTeamId: info.guest_team_id ?? '',
            homeTeamName: info.home_team_name ?? '',
            guestTeamName: info.guest_team_name ?? '',
            homeLogo: info.home_logo ?? '',
            guestLogo: info.guest_logo ?? '',
            sclassName: info.sclass_name ?? '',
            homeScore: info.home_score ?? '',
            guestScore: info.guest_score ?? '',
          }
        : null;
      const competition: RecentScheduleCompetition = {
        homeTeamName: homeName,
        awayTeamName: awayName,
        homeTeamIcon: homeIcon,
        awayTeamIcon: awayIcon,
        leagueName: info?.sclass_name ?? '',
      };
      const scheduleResult = buildRecentSchedule({
        side,
        history: analysis.history,
        future: analysis.future,
        info: rsInfo,
        competition,
        scheduleId: scheduleId ?? '',
      });
      body = (
        <RecentSchedule
          key={`sched-${side}`}
          teamName={teamName}
          teamLogo={teamLogo}
          side={side}
          result={scheduleResult}
          topFlush={hasBar}
        />
      );
    }

    return (
      <div>
        {subTabBar}
        {body}
      </div>
    );
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-8px bg-[var(--Background-700)]">
      <div className="flex items-center gap-8px min-h-44px px-10px pt-8px overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              className={clsx(
                PILL_BASE,
                '_tf[12]',
                active
                  ? 'bg-[var(--ThemeColor-Main)] text-[var(--White-100)] font-600'
                  : 'bg-[var(--Background-300)] text-[var(--Text-800)] font-400',
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {renderBody()}
    </div>
  );
};

export default History;

import React, { useMemo, useState } from 'react';
import clsx from 'clsx';

import Skeleton from '@/common/components/Skeleton';
import Empty from '@/common/components/Empty';
import { useGoalQuery, type GoalData } from '@/apis/origin/discover';

import GoalSectionHeader from './components/GoalSectionHeader';
import PercentBarTable, { type PercentBarRow } from './components/PercentBarTable';
import DistributionView from './views/DistributionView';
import AvgMatchView from './views/AvgMatchView';
import FirstGoalAvgView from './views/FirstGoalAvgView';
import GradeResultView from './views/GradeResultView';
import WinStatView from './views/WinStatView';
import CompareView from './views/CompareView';
import { calcRatio } from './utils/goalLogic';

type GoalTabKey =
  | 'distribution'
  | 'summary'
  | 'perMatch'
  | 'firstGoalAvg'
  | 'leadResult'
  | 'concedeResult'
  | 'winStat'
  | 'other'
  | 'compare';

const GOAL_TABS: { key: GoalTabKey; label: string }[] = [
  { key: 'distribution', label: '分布时间' },
  { key: 'summary', label: '进球统计' },
  { key: 'perMatch', label: '场均统计' },
  { key: 'firstGoalAvg', label: '首球平均时间' },
  { key: 'leadResult', label: '先进球成绩' },
  { key: 'concedeResult', label: '先丢球成绩' },
  { key: 'winStat', label: '赢指统计' },
  { key: 'other', label: '其他统计' },
  { key: 'compare', label: '状态对比' },
];

interface GoalProps {
  scheduleId: string | null;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamIcon?: string;
  awayTeamIcon?: string;
}

const buildSummaryRows = (goal: GoalData): PercentBarRow[] => {
  const { home, away } = goal.staticNum;
  const rows: [string, keyof typeof home][] = [
    ['0.5+', 'totalNormal05'],
    ['1.5+', 'totalNormal15'],
    ['2.5+', 'totalNormal25'],
    ['3.5+', 'totalNormal35'],
  ];
  return rows.map(([label, field]) => ({
    label,
    homePercent: calcRatio(home[field], home.totalMatches),
    awayPercent: calcRatio(away[field], away.totalMatches),
  }));
};

const buildOtherRows = (goal: GoalData): PercentBarRow[] => {
  const { home, away } = goal.other;
  const rows: [string, keyof typeof home][] = [
    ['双方先进球', 'totalNormalBts'],
    ['零封对手', 'totalNormalCs'],
    ['上下半场进球', 'totalHalfNormalGoal'],
    ['上下半场丢球', 'totalHalfNormalLossGoal'],
  ];
  return rows.map(([label, field]) => ({
    label,
    homePercent: calcRatio(home[field], home.totalMatches),
    awayPercent: calcRatio(away[field], away.totalMatches),
  }));
};

/** 发现页「进球」tab（对齐 App detail_goal 模块） */
const Goal: React.FC<GoalProps> = ({
  scheduleId,
  homeTeamName = '主队',
  awayTeamName = '客队',
  homeTeamIcon,
  awayTeamIcon,
}) => {
  const [activeTab, setActiveTab] = useState<GoalTabKey>('distribution');
  const { data, isLoading } = useGoalQuery(scheduleId, !!scheduleId);

  const summaryRows = useMemo(() => (data ? buildSummaryRows(data) : []), [data]);
  const otherRows = useMemo(() => (data ? buildOtherRows(data) : []), [data]);

  if (!scheduleId || isLoading) {
    return (
      <div className="flex justify-center py-48px">
        <Skeleton type="base" baseClassName="h-160px" />
      </div>
    );
  }

  if (!data) {
    return <Empty type="data" variant="card" className="py-48px" />;
  }

  const teamProps = { homeName: homeTeamName, awayName: awayTeamName };

  const renderContent = (): React.ReactNode => {
    switch (activeTab) {
      case 'distribution':
        return (
          <DistributionView
            dist={data.dist}
            homeName={homeTeamName}
            awayName={awayTeamName}
            homeIcon={homeTeamIcon}
            awayIcon={awayTeamIcon}
          />
        );
      case 'summary':
        return (
          <div className="flex flex-col">
            <GoalSectionHeader title="进球统计" {...teamProps} />
            <PercentBarTable rows={summaryRows} />
          </div>
        );
      case 'perMatch':
        return (
          <AvgMatchView
            home={data.staticNumAvg.home}
            away={data.staticNumAvg.away}
            {...teamProps}
          />
        );
      case 'firstGoalAvg':
        return (
          <FirstGoalAvgView
            home={data.firstGoalTime.home}
            away={data.firstGoalTime.away}
            {...teamProps}
          />
        );
      case 'leadResult':
        return (
          <GradeResultView
            title="先进球成绩"
            home={{
              win: data.grade.home.totalScoredFirstWin,
              draw: data.grade.home.totalScoredFirstDraw,
              lose: data.grade.home.totalScoredFirstLoss,
              total: data.grade.home.totalScoredFirst,
            }}
            away={{
              win: data.grade.away.totalScoredFirstWin,
              draw: data.grade.away.totalScoredFirstDraw,
              lose: data.grade.away.totalScoredFirstLoss,
              total: data.grade.away.totalScoredFirst,
            }}
            {...teamProps}
          />
        );
      case 'concedeResult':
        return (
          <GradeResultView
            title="先丢球成绩"
            home={{
              win: data.grade.home.totalOpponentScoredWin,
              draw: data.grade.home.totalOpponentScoredDraw,
              lose: data.grade.home.totalOpponentScoredLoss,
              total: data.grade.home.totalOpponentScored,
            }}
            away={{
              win: data.grade.away.totalOpponentScoredWin,
              draw: data.grade.away.totalOpponentScoredDraw,
              lose: data.grade.away.totalOpponentScoredLoss,
              total: data.grade.away.totalOpponentScored,
            }}
            {...teamProps}
          />
        );
      case 'winStat':
        return <WinStatView home={data.handicap.home} away={data.handicap.away} {...teamProps} />;
      case 'other':
        return (
          <div className="flex flex-col">
            <GoalSectionHeader title="其他统计" {...teamProps} />
            <PercentBarTable rows={otherRows} />
          </div>
        );
      case 'compare':
        return <CompareView home={data.state.home} away={data.state.away} {...teamProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="mt-4px rounded-8px bg-[var(--Background-300)]">
      <div className="grid grid-cols-3 gap-8px px-10px pt-10px">
        {GOAL_TABS.map((tab) => {
          const selected = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'h-26px rounded-30px _tf[12] whitespace-nowrap',
                selected
                  ? 'bg-[var(--ThemeColor-Main)] text-[var(--White-100)]'
                  : 'bg-[var(--Button-200)] text-[var(--Text-800)]',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="px-10px pt-14px pb-11px">{renderContent()}</div>
    </div>
  );
};

export default Goal;

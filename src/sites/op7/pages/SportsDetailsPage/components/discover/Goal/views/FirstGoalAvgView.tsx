import React from 'react';

import type { GoalFirstTimeSide } from '@/apis/origin/discover';

import GoalSectionHeader from '../components/GoalSectionHeader';
import { formatFirstGoalMinute } from '../utils/goalLogic';

interface FirstGoalAvgViewProps {
  home: GoalFirstTimeSide;
  away: GoalFirstTimeSide;
  homeName: string;
  awayName: string;
}

const Cell: React.FC<{ text: string; header?: boolean }> = ({ text, header }) => (
  <div
    className={
      header
        ? 'flex-1 min-w-0 text-center _tf[12] text-[var(--Text-800)]'
        : 'flex-1 min-w-0 min-h-48px flex items-center justify-center _tf[12] font-500 text-[var(--Text-Main-10)]'
    }
  >
    {text}
  </div>
);

const Row: React.FC<{
  title: string;
  homeScored: string;
  homeConceded: string;
  awayScored: string;
  awayConceded: string;
}> = ({ title, homeScored, homeConceded, awayScored, awayConceded }) => (
  <div className="flex items-center px-16px bg-[var(--Background-300)] border-b-[0.5px] border-[var(--Line-100)]">
    <Cell text={formatFirstGoalMinute(homeScored)} />
    <Cell text={formatFirstGoalMinute(homeConceded)} />
    <Cell text={title} />
    <Cell text={formatFirstGoalMinute(awayScored)} />
    <Cell text={formatFirstGoalMinute(awayConceded)} />
  </div>
);

/** 首球平均时间视图（对齐 App goal_first_goal_avg_view.dart） */
const FirstGoalAvgView: React.FC<FirstGoalAvgViewProps> = ({ home, away, homeName, awayName }) => (
  <div className="flex flex-col">
    <GoalSectionHeader title="场均进球统计" showTeams homeName={homeName} awayName={awayName} />

    <div className="flex items-center py-10px bg-[var(--Line-100)]">
      <Cell text="首个进球时间" header />
      <Cell text="首个丢球时间" header />
      <Cell text="" header />
      <Cell text="首个进球时间" header />
      <Cell text="首个丢球时间" header />
    </div>

    <Row
      title="全场"
      homeScored={home.totalScoredFirstTimeAvg}
      homeConceded={home.totalConcededFirstTimeAvg}
      awayScored={away.totalScoredFirstTimeAvg}
      awayConceded={away.totalConcededFirstTimeAvg}
    />
    <Row
      title="主场"
      homeScored={home.homeScoredFirstTimeAvg}
      homeConceded={home.homeConcededFirstTimeAvg}
      awayScored={away.homeScoredFirstTimeAvg}
      awayConceded={away.homeConcededFirstTimeAvg}
    />
    <Row
      title="客场"
      homeScored={home.awayScoredFirstTimeAvg}
      homeConceded={home.awayConcededFirstTimeAvg}
      awayScored={away.awayScoredFirstTimeAvg}
      awayConceded={away.awayConcededFirstTimeAvg}
    />
  </div>
);

export default FirstGoalAvgView;

import React from 'react';

import type { GoalStateSide } from '@/apis/origin/discover';

import GoalSectionHeader from '../components/GoalSectionHeader';
import { calcPercentChangeText } from '../utils/goalLogic';

interface CompareViewProps {
  home: GoalStateSide;
  away: GoalStateSide;
  homeName: string;
  awayName: string;
}

const HeaderCell: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex-1 h-38px flex items-center justify-center _tf[12] text-[var(--Text-800)]">
    {text}
  </div>
);

const Cell: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex-1 min-h-48px flex items-center justify-center _tf[12] font-500 text-[var(--Text-Main-10)]">
    {text}
  </div>
);

const StateCell: React.FC<{ value: string }> = ({ value }) => (
  <div
    className="flex-1 min-h-48px flex items-center justify-center _tf[12] font-500"
    style={{ color: value.includes('+') ? 'var(--Red-300)' : 'var(--Green-300)' }}
  >
    {value}%
  </div>
);

interface RowProps {
  title: string;
  home: GoalStateSide;
  away: GoalStateSide;
  pick: (side: GoalStateSide) => { all: string; recent: string };
  reverse?: boolean;
}

const Row: React.FC<RowProps> = ({ title, home, away, pick, reverse }) => {
  const h = pick(home);
  const a = pick(away);
  return (
    <div className="flex items-center bg-[var(--Background-300)] border-b-[0.5px] border-[var(--Line-100)]">
      <Cell text={h.all} />
      <Cell text={h.recent} />
      <StateCell value={calcPercentChangeText(h.recent, h.all, reverse)} />
      <Cell text={title} />
      <Cell text={a.all} />
      <Cell text={a.recent} />
      <StateCell value={calcPercentChangeText(a.recent, a.all, reverse)} />
    </div>
  );
};

/** 状态对比视图（对齐 App goal_compare_view.dart） */
const CompareView: React.FC<CompareViewProps> = ({ home, away, homeName, awayName }) => (
  <div className="flex flex-col">
    <GoalSectionHeader title="状态对比" showTeams homeName={homeName} awayName={awayName} />

    <div className="flex items-center bg-[var(--Line-100)]">
      {['全部', '进6', '状态', '', '全部', '进6', '状态'].map((t, i) => (
        <HeaderCell key={i} text={t} />
      ))}
    </div>

    <Row
      title="场均积分"
      home={home}
      away={away}
      pick={(s) => ({ all: s.totalNormalScoreAvg, recent: s.totalRecentScoreAvg })}
    />
    <Row
      title="场均进球"
      home={home}
      away={away}
      pick={(s) => ({ all: s.totalNormalGoalAvg, recent: s.totalRecentGoalAvg })}
    />
    <Row
      title="场均丢球"
      home={home}
      away={away}
      pick={(s) => ({ all: s.totalNormalConcedeAvg, recent: s.totalRecentConcedeAvg })}
      reverse
    />
  </div>
);

export default CompareView;

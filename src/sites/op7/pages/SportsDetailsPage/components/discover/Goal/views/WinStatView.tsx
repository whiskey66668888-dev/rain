import React from 'react';

import type { GoalHandicapSide } from '@/apis/origin/discover';

import GoalSectionHeader from '../components/GoalSectionHeader';

interface WinStatViewProps {
  home: GoalHandicapSide;
  away: GoalHandicapSide;
  homeName: string;
  awayName: string;
}

const HeaderCell: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex-1 h-38px flex items-center justify-center _tf[12] text-[var(--Text-800)]">
    {text}
  </div>
);

const DataCell: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex-1 min-h-48px flex items-center justify-center _tf[12] font-500 text-[var(--Text-Main-10)]">
    {text || '0'}
  </div>
);

const Row: React.FC<{ title: string; left: string[]; right: string[] }> = ({
  title,
  left,
  right,
}) => (
  <div className="flex items-center px-16px bg-[var(--Background-300)] border-b-[0.5px] border-[var(--Line-100)]">
    {left.map((v, i) => (
      <DataCell key={`l${i}`} text={v} />
    ))}
    <DataCell text={title} />
    {right.map((v, i) => (
      <DataCell key={`r${i}`} text={v} />
    ))}
  </div>
);

/** 赢指统计视图（对齐 App goal_win_stat_view.dart） */
const WinStatView: React.FC<WinStatViewProps> = ({ home, away, homeName, awayName }) => (
  <div className="flex flex-col">
    <GoalSectionHeader title="赢指统计" showTeams homeName={homeName} awayName={awayName} />

    <div className="flex items-center px-16px bg-[var(--Line-100)]">
      {['赢', '输', '大', '小', '', '赢', '输', '大', '小'].map((t, i) => (
        <HeaderCell key={i} text={t} />
      ))}
    </div>

    <Row
      title="全场"
      left={[home.totalAsWin, home.totalAsLoss, home.totalTlOver, home.totalTlUnder]}
      right={[away.totalAsWin, away.totalAsLoss, away.totalTlOver, away.totalTlUnder]}
    />
    <Row
      title="主场"
      left={[home.homeAsWin, home.homeAsLoss, home.homeTlOver, home.homeTlUnder]}
      right={[away.homeAsWin, away.homeAsLoss, away.homeTlOver, away.homeTlUnder]}
    />
    <Row
      title="客场"
      left={[home.awayAsWin, home.awayAsLoss, home.awayTlOver, home.awayTlUnder]}
      right={[away.awayAsWin, away.awayAsLoss, away.awayTlOver, away.awayTlUnder]}
    />
  </div>
);

export default WinStatView;

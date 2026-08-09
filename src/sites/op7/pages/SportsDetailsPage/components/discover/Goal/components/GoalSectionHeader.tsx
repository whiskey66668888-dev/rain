import React from 'react';
import clsx from 'clsx';

interface TeamLabelProps {
  name: string;
  icon?: string;
  reverse?: boolean;
}

const TeamLabel: React.FC<TeamLabelProps> = ({ name, icon, reverse }) => (
  <div className={clsx('flex items-center gap-4px min-w-0', reverse && 'flex-row-reverse')}>
    {icon ? (
      <img className="w-24px h-24px rounded-full object-cover flex-none" src={icon} alt="" />
    ) : (
      <span className="w-24px h-24px rounded-full bg-[var(--Line-100)] flex-none" />
    )}
    <span className="_tf[12] font-500 text-[var(--Text-Main-10)] truncate">{name}</span>
  </div>
);

interface GoalSectionHeaderProps {
  title: string;
  /** 是否展示主客队信息行（对齐 App hideTeamList） */
  showTeams?: boolean;
  homeName: string;
  awayName: string;
  homeIcon?: string;
  awayIcon?: string;
}

/**
 * 统计视图通用标题栏（标题 + 可选主客队信息）
 * App 中标题右侧的「查看详情」跳转独立联赛进球详情页，Web 暂未接入该页，故不渲染。
 */
const GoalSectionHeader: React.FC<GoalSectionHeaderProps> = ({
  title,
  showTeams = false,
  homeName,
  awayName,
  homeIcon,
  awayIcon,
}) => (
  <div className="flex flex-col">
    <div className="flex items-center pl-5px mb-7px">
      <span className="_tf[14] font-700 text-[var(--Text-Main-10)]">{title}</span>
    </div>
    {showTeams && (
      <div className="flex items-center justify-between px-5px py-12px">
        <TeamLabel name={homeName} icon={homeIcon} />
        <TeamLabel name={awayName} icon={awayIcon} reverse />
      </div>
    )}
  </div>
);

export default GoalSectionHeader;

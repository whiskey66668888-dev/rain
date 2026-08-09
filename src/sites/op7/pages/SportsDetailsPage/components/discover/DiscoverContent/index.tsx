import React, { useCallback, useEffect, useMemo } from 'react';
import clsx from 'clsx';

import LineUp from '../LineUp';
import LiveSituation from '../LiveSituation';
import LiveStreaming from '../LiveStreaming';
import { FBSportIdValue } from '@/apis/fbSports/common/constants';
import CornerKick from '../CornerKick';
import type { ChatConfigInfo, TeamLite } from '@/apis/origin/discover';
import type { MatchShareInfo } from '@/core/sdk/IMManager';
import { useAppSelector } from '@/core/store/hooks';
import { getDefaultDiscoverSubTabIndex, getDiscoverSubTabs } from '../utils/getDiscoverSubTabs';
import styles from './DiscoverContent.module.scss';
import ChatContent from './ChatContent';
import IndexOdds from '../IndexOdds';
import Intel from '../Intel';
import History from '../History';
import Analysis from '../Analysis';
import Goal from '../Goal';

interface DiscoverContentProps {
  loading?: boolean;
  sportId?: number;
  chatConfig?: ChatConfigInfo | null;
  enabledSubTabTitles: string[] | null;
  resultMatchId: string | null;
  /** 场馆赛事 ID（FB/OB），指数 marketOdds 专用，对齐 App competition.matchId */
  venueMatchId?: string | number | null;
  activeSubTabIndex: number;
  onSubTabChange: (index: number) => void;
  homeTeam: TeamLite;
  awayTeam: TeamLite;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamIcon?: string;
  awayTeamIcon?: string;
  /** 本场比赛分享（聊天室） */
  matchShareInfo?: MatchShareInfo | null;
  /** 联赛名称 */
  leagueName: string;
  /** PC 右侧栏内嵌 */
  embeddedInSidebar?: boolean;
}

/**
 * 发现 tab 内容区（子 TabBar 由父级吸顶展示，与 App showSubTabBarInParent 一致）
 */
const DiscoverContent: React.FC<DiscoverContentProps> = ({
  loading,
  sportId,
  chatConfig,
  enabledSubTabTitles,
  resultMatchId,
  venueMatchId,
  activeSubTabIndex,
  onSubTabChange,
  homeTeam,
  awayTeam,
  homeTeamName,
  awayTeamName,
  homeTeamIcon,
  awayTeamIcon,
  matchShareInfo,
  leagueName,
  embeddedInSidebar = false,
}) => {
  const subTabs = useMemo(
    () =>
      getDiscoverSubTabs({
        enabledSubTabTitles,
        sportId,
        resultMatchId,
      }),
    [enabledSubTabTitles, resultMatchId, sportId],
  );

  useEffect(() => {
    if (subTabs.length === 0) return;
    if (activeSubTabIndex >= subTabs.length) {
      onSubTabChange(getDefaultDiscoverSubTabIndex(subTabs));
    }
  }, [activeSubTabIndex, onSubTabChange, subTabs]);

  const activeSubTab = subTabs[activeSubTabIndex] ?? subTabs[0];
  const isBasketball = sportId === Number(FBSportIdValue.Basketball);
  const isChatActive = activeSubTab === '聊天';
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = screenBreakpoint === 'md';

  const renderContent = useCallback(() => {
    switch (activeSubTab) {
      case '聊天':
        return (
          <ChatContent
            sportId={sportId}
            loading={loading}
            chatConfig={chatConfig}
            matchShareInfo={matchShareInfo}
          />
        );
      case '直播':
        return (
          <LiveStreaming
            scheduleId={resultMatchId}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            homeTeamName={homeTeamName}
            awayTeamName={awayTeamName}
            homeTeamIcon={homeTeamIcon}
            awayTeamIcon={awayTeamIcon}
          />
        );
      case '赛况':
        if (isBasketball) {
          return (
            <LiveStreaming
              scheduleId={resultMatchId}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              homeTeamName={homeTeamName}
              awayTeamName={awayTeamName}
              homeTeamIcon={homeTeamIcon}
              awayTeamIcon={awayTeamIcon}
            />
          );
        }
        return (
          <LiveSituation
            scheduleId={resultMatchId}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            embeddedInSidebar={embeddedInSidebar}
          />
        );
      case '阵容':
        return (
          <LineUp
            scheduleId={resultMatchId}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            leagueName={leagueName}
          />
        );
      case '角球':
        return (
          <CornerKick
            scheduleId={resultMatchId}
            homeTeamName={homeTeamName}
            awayTeamName={awayTeamName}
            homeTeamIcon={homeTeamIcon}
            awayTeamIcon={awayTeamIcon}
          />
        );
      case '指数':
        return (
          <IndexOdds
            scheduleId={resultMatchId}
            matchId={venueMatchId != null ? String(venueMatchId) : null}
            sportId={sportId}
          />
        );
      case '进球':
        return (
          <Goal
            scheduleId={resultMatchId}
            homeTeamName={homeTeamName}
            awayTeamName={awayTeamName}
            homeTeamIcon={homeTeamIcon}
            awayTeamIcon={awayTeamIcon}
          />
        );
      case '情报':
        return (
          <Intel
            scheduleId={resultMatchId}
            sportId={sportId}
            homeTeamName={homeTeamName}
            awayTeamName={awayTeamName}
            homeTeamIcon={homeTeamIcon}
            awayTeamIcon={awayTeamIcon}
          />
        );
      case '分析':
        return (
          <Analysis
            scheduleId={resultMatchId}
            sportId={sportId}
            homeTeamName={homeTeamName}
            awayTeamName={awayTeamName}
            homeTeamIcon={homeTeamIcon}
            awayTeamIcon={awayTeamIcon}
          />
        );
      case '历史':
        return (
          <History
            scheduleId={resultMatchId}
            sportId={sportId}
            homeTeamName={homeTeamName}
            awayTeamName={awayTeamName}
            homeTeamIcon={homeTeamIcon}
            awayTeamIcon={awayTeamIcon}
          />
        );
      default:
        return null;
    }
  }, [
    activeSubTab,
    awayTeam,
    chatConfig,
    homeTeam,
    loading,
    matchShareInfo,
    resultMatchId,
    venueMatchId,
    sportId,
    homeTeamName,
    awayTeamName,
    homeTeamIcon,
    awayTeamIcon,
    isBasketball,
    leagueName,
    embeddedInSidebar,
  ]);

  return (
    <div className={clsx(styles.content, isChatActive && isMobile && styles.chatLayout)}>
      {renderContent()}
    </div>
  );
};

export default DiscoverContent;

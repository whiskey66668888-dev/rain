import React, { useMemo, useState } from 'react';

import { FBSportIdValue } from '@/apis/fbSports/common/constants';
import { useDiscoverAnalysisQuery, useDiscoverMatchInfoQuery } from '@/apis/origin/discover';
import Skeleton from '@/common/components/Skeleton';

import AnalysisTabGrid from './components/AnalysisTabGrid';
import TeamOverview from './components/TeamOverview';
import AverageComparison from './components/AverageComparison';
import HistoricalMatchup from './components/HistoricalMatchup';
import RecentRecord from './components/RecentRecord';
import RecentSchedule from './components/RecentSchedule';
import ScoreDifference from './components/ScoreDifference';
import HalfFullTime from './components/HalfFullTime';
import {
  buildAverageComparison,
  buildRecentSchedule,
  buildTeamOverview,
} from './utils/analysisLogic';
import styles from './Analysis.module.scss';

const ANALYSIS_TABS = [
  '球队概况',
  '场均对比',
  '历史交锋',
  '近期战绩',
  '近期赛程',
  '胜分差',
  '半全场胜负',
] as const;

interface AnalysisProps {
  scheduleId: string | null;
  sportId?: number;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamIcon?: string;
  awayTeamIcon?: string;
}

/**
 * 发现-分析（篮球）
 * 对齐 App analysis_view.dart
 */
const Analysis: React.FC<AnalysisProps> = ({
  scheduleId,
  sportId,
  homeTeamName = '',
  awayTeamName = '',
  homeTeamIcon,
  awayTeamIcon,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const sportType = sportId === Number(FBSportIdValue.Basketball) ? 2 : 1;
  const enabled = !!scheduleId;

  const { data: analysisData, isLoading: analysisLoading } = useDiscoverAnalysisQuery(
    scheduleId,
    sportType,
    enabled,
  );
  const { data: matchInfo, isLoading: matchLoading } = useDiscoverMatchInfoQuery(
    scheduleId,
    enabled,
    sportType,
  );

  const loading = analysisLoading || matchLoading;

  const teamOverview = useMemo(
    () => buildTeamOverview(analysisData ?? null, matchInfo, homeTeamIcon, awayTeamIcon),
    [analysisData, matchInfo, homeTeamIcon, awayTeamIcon],
  );

  const averageComparison = useMemo(
    () => buildAverageComparison(analysisData?.compare),
    [analysisData?.compare],
  );

  const recentSchedule = useMemo(
    () => buildRecentSchedule(analysisData ?? null, matchInfo, homeTeamName, awayTeamName),
    [analysisData, matchInfo, homeTeamName, awayTeamName],
  );

  const homeId = matchInfo?.home_team_id ?? '';
  const awayId = matchInfo?.guest_team_id ?? '';
  const leagueId = matchInfo?.sclass_id ?? '';

  if (!scheduleId) return null;

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.scrollBody}>
          <div className={styles.loadingWrap}>
            <Skeleton type="base" baseClassName="h-260px" />
          </div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <TeamOverview
            homeName={teamOverview.homeName}
            awayName={teamOverview.awayName}
            homeRecord={teamOverview.homeRecord}
            awayRecord={teamOverview.awayRecord}
            homeLogo={teamOverview.homeLogo}
            awayLogo={teamOverview.awayLogo}
            items={teamOverview.items}
          />
        );
      case 1:
        return (
          <AverageComparison
            circleItems={averageComparison.circleItems}
            statItems={averageComparison.statItems}
          />
        );
      case 2:
        return (
          <HistoricalMatchup
            matches={analysisData?.history?.vs}
            teamName={homeTeamName}
            teamLogo={homeTeamIcon}
            homeId={homeId}
            awayId={awayId}
            leagueId={leagueId}
          />
        );
      case 3:
        return (
          <RecentRecord
            homeData={analysisData?.history?.home}
            awayData={analysisData?.history?.away}
            homeName={homeTeamName}
            awayName={awayTeamName}
            homeLogo={homeTeamIcon}
            awayLogo={awayTeamIcon}
            homeId={homeId}
            guestId={awayId}
            leagueId={leagueId}
          />
        );
      case 4:
        return (
          <RecentSchedule
            homeName={homeTeamName}
            awayName={awayTeamName}
            homeLogo={homeTeamIcon}
            awayLogo={awayTeamIcon}
            homeList={recentSchedule.homeList}
            guestList={recentSchedule.guestList}
          />
        );
      case 5:
        return (
          <ScoreDifference
            vsData={analysisData?.history?.vs}
            homeName={homeTeamName}
            awayName={awayTeamName}
            homeLogo={homeTeamIcon}
            awayLogo={awayTeamIcon}
            homeId={homeId}
            awayId={awayId}
            sclassId={leagueId}
          />
        );
      case 6:
        return (
          <HalfFullTime
            vsData={analysisData?.history?.vs}
            homeName={homeTeamName}
            awayName={awayTeamName}
            homeLogo={homeTeamIcon}
            awayLogo={awayTeamIcon}
            homeId={homeId}
            awayId={awayId}
            sclassId={leagueId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.scrollBody}>
        <div className={styles.panel}>
          <AnalysisTabGrid
            labels={[...ANALYSIS_TABS]}
            selectedIndex={activeTab}
            onChange={setActiveTab}
          />
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Analysis;

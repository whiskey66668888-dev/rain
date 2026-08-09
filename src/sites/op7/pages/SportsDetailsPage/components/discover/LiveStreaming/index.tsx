import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  useDiscoverBasketLiveQuery,
  useDiscoverBasketStatsQuery,
  useDiscoverMatchInfoQuery,
} from '@/apis/origin/discover';
import Skeleton from '@/common/components/Skeleton';
import LiveTextView from './components/LiveTextView';
import ScoreTable from './components/ScoreTable';
import SegmentedTabs from './components/SegmentedTabs';
import StatsView from './components/StatsView';
import TeamComparison from './components/TeamComparison';
import { BASKET_PERIODS } from './constants';
import type { LiveStreamingProps, MainTab, StatsTab } from './types';
import {
  buildScoreTable,
  getInitialBasketPeriod,
  getLiveEventBuckets,
  getLiveItemsByFilter,
  getVisibleLiveFilters,
  type LiveFilterType,
} from './utils';
import styles from './LiveStreaming.module.scss';

/**
 * 篮球赛况入口组件，只负责接口请求、轮询配置和各面板的数据组装。
 */
const LiveStreaming: React.FC<LiveStreamingProps> = ({
  scheduleId,
  homeTeam,
  awayTeam,
  homeTeamName,
  awayTeamName,
  homeTeamIcon,
  awayTeamIcon,
}) => {
  const [currentPeriod, setCurrentPeriod] = useState(0);
  const [mainTab, setMainTab] = useState<MainTab>('live');
  const [liveFilter, setLiveFilter] = useState<LiveFilterType>('all');
  const [statsTab, setStatsTab] = useState<StatsTab>('player');
  const initializedMatchRef = useRef<string | null>(null);

  const fallbackTeams = useMemo(
    () => ({
      homeName: homeTeam.name || homeTeamName,
      awayName: awayTeam.name || awayTeamName,
      homeLogo: homeTeam.logo || homeTeamIcon,
      awayLogo: awayTeam.logo || awayTeamIcon,
    }),
    [
      awayTeam.logo,
      awayTeam.name,
      awayTeamIcon,
      awayTeamName,
      homeTeam.logo,
      homeTeam.name,
      homeTeamIcon,
      homeTeamName,
    ],
  );

  const matchInfoQuery = useDiscoverMatchInfoQuery(scheduleId, !!scheduleId, 2, {
    staleTime: 0,
    refetchInterval: 10 * 1000,
    refetchOnMount: 'always',
  });

  const statsQuery = useDiscoverBasketStatsQuery(scheduleId, !!scheduleId);
  const liveQuery = useDiscoverBasketLiveQuery(scheduleId, currentPeriod, !!scheduleId);

  const matchInfo = matchInfoQuery.data;
  const stats = statsQuery.data?.statistics;
  const stateInfo = statsQuery.data?.state_info;

  useEffect(() => {
    if (!scheduleId || !matchInfo || initializedMatchRef.current === scheduleId) return;
    setCurrentPeriod(getInitialBasketPeriod(matchInfo));
    initializedMatchRef.current = scheduleId;
  }, [matchInfo, scheduleId]);

  const scoreTable = useMemo(
    () => buildScoreTable(matchInfo, fallbackTeams),
    [fallbackTeams, matchInfo],
  );

  const homeScoreRow = { name: fallbackTeams.homeName || '', logo: fallbackTeams.homeLogo || '' };
  const awayScoreRow = { name: fallbackTeams.awayName || '', logo: fallbackTeams.awayLogo || '' };

  const visiblePeriods = useMemo(() => {
    const hasOT = scoreTable.headers.includes('OT');
    return hasOT ? BASKET_PERIODS : BASKET_PERIODS.slice(0, 4);
  }, [scoreTable.headers]);

  useEffect(() => {
    if (currentPeriod >= visiblePeriods.length) {
      setCurrentPeriod(Math.max(visiblePeriods.length - 1, 0));
    }
  }, [currentPeriod, visiblePeriods.length]);

  const liveBuckets = useMemo(
    () => getLiveEventBuckets(liveQuery.data?.period_live ?? []),
    [liveQuery.data?.period_live],
  );
  const visibleFilters = useMemo(() => getVisibleLiveFilters(liveBuckets), [liveBuckets]);

  useEffect(() => {
    if (!visibleFilters.includes(liveFilter)) setLiveFilter('all');
  }, [liveFilter, visibleFilters]);

  const isLoading = matchInfoQuery.isLoading || statsQuery.isLoading;

  if (isLoading) {
    return <Skeleton type="discoverLiveStreaming" />;
  }

  return (
    <div className={styles.liveStreaming}>
      <div className={styles.content}>
        <ScoreTable data={scoreTable} homeTeam={homeScoreRow} awayTeam={awayScoreRow} />

        {stateInfo && (
          <TeamComparison
            stateInfo={stateInfo}
            homeTeam={homeScoreRow}
            awayTeam={awayScoreRow}
            homeStats={stats?.home_team_stats}
            awayStats={stats?.away_team_stats}
          />
        )}

        <SegmentedTabs
          className={styles.mainTabs}
          tabs={[
            { key: 'live', label: '文字直播' },
            { key: 'stats', label: '数据统计' },
          ]}
          activeKey={mainTab}
          onChange={setMainTab}
        />

        <section className={styles.panel}>
          {mainTab === 'live' ? (
            <LiveTextView
              periods={visiblePeriods}
              currentPeriod={currentPeriod}
              onPeriodChange={setCurrentPeriod}
              filters={visibleFilters}
              activeFilter={liveFilter}
              onFilterChange={setLiveFilter}
              items={getLiveItemsByFilter(liveBuckets, liveFilter)}
              allItemsCount={liveBuckets.all.length}
              homeLogo={fallbackTeams.homeLogo}
              awayLogo={fallbackTeams.awayLogo}
              loading={liveQuery.isLoading}
            />
          ) : (
            <StatsView
              activeTab={statsTab}
              onTabChange={setStatsTab}
              homeTeam={homeScoreRow}
              awayTeam={awayScoreRow}
              homePlayers={stats?.home_team_players ?? []}
              awayPlayers={stats?.away_team_players ?? []}
              hasPlayerStats={Boolean(stats)}
              homeStats={stats?.home_team_stats}
              awayStats={stats?.away_team_stats}
              homeMaxStats={stats?.home_max_stats}
              guestMaxStats={stats?.guest_max_stats}
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default LiveStreaming;

import React, { useMemo, useState } from 'react';

import {
  useDiscoverLiveSituationQuery,
  useDiscoverMatchInfoQuery,
  useDiscoverPlayerStatsQuery,
} from '@/apis/origin/discover';
import Skeleton from '@/common/components/Skeleton';
import { formatIncidentData } from '../utils/formatDiscoverData';
import Moments from './components/Moments';
import SituationView from './components/SituationView';
import SituationTabPanel from './components/SituationTabPanel';
import SituationTabs from './components/SituationTabs';
import TrendCard from './components/TrendCard';
import type { LiveSituationProps, SituationTab } from './types';
import WeatherCard from './components/WeatherCard';
import styles from './LiveSituation.module.scss';
import FooterView from '../FooterView';

const LiveSituation: React.FC<LiveSituationProps> = ({
  scheduleId,
  homeTeam,
  awayTeam,
  embeddedInSidebar = false,
}) => {
  const { data, isLoading } = useDiscoverLiveSituationQuery(scheduleId, !!scheduleId);
  const { data: matchData } = useDiscoverMatchInfoQuery(scheduleId, !!scheduleId);
  const homeTeamId = matchData?.home_team_id;
  const awayTeamId = matchData?.guest_team_id;
  const [activeTab, setActiveTab] = useState<SituationTab>('live');
  const homePlayersQuery = useDiscoverPlayerStatsQuery(
    scheduleId,
    homeTeamId || null,
    activeTab === 'player',
  );
  const awayPlayersQuery = useDiscoverPlayerStatsQuery(
    scheduleId,
    awayTeamId || null,
    activeTab === 'player',
  );

  const liveList = useMemo(() => data?.live_info ?? [], [data?.live_info]);
  const incidents = useMemo(() => formatIncidentData(data?.incidents ?? []), [data?.incidents]);

  if (isLoading) {
    return <Skeleton type="discoverLiveSituation" />;
  }

  return (
    <div className={styles.liveSituation}>
      <div className={styles.content}>
        <TrendCard liveSituationData={data} homeTeam={homeTeam} awayTeam={awayTeam} />
        <SituationView list={data?.state_info ?? []} homeTeam={homeTeam} awayTeam={awayTeam} />
        <Moments incidents={incidents} />
        <SituationTabs activeTab={activeTab} onChange={setActiveTab} />
        <SituationTabPanel
          activeTab={activeTab}
          data={data}
          liveList={liveList}
          incidents={incidents}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          homePlayers={homePlayersQuery.data ?? []}
          awayPlayers={awayPlayersQuery.data ?? []}
        />

        <FooterView />
        <WeatherCard weather={data?.environment} compact={embeddedInSidebar} />
      </div>
    </div>
  );
};

export default LiveSituation;

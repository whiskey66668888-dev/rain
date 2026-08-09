import React from 'react';

import ImportantEvents from '../ImportantEvents';
import LiveTextPanel from '../LiveTextPanel';
import PlayerTable from '../PlayerTable';
import TeamStats from '../TeamStats';
import type { SituationTabPanelProps } from '../../types';
import styles from './index.module.scss';

const SituationTabPanel: React.FC<SituationTabPanelProps> = ({
  activeTab,
  data,
  liveList,
  incidents,
  homeTeam,
  awayTeam,
  homePlayers,
  awayPlayers,
}) => (
  <section className={styles.tabPanel}>
    {activeTab === 'live' && (
      <LiveTextPanel list={liveList} homeTeam={homeTeam} awayTeam={awayTeam} />
    )}
    {activeTab === 'events' && <ImportantEvents incidents={incidents} />}
    {activeTab === 'team' && <TeamStats teamStats={data?.team_stats} />}
    {activeTab === 'player' && (
      <div className={styles.playerTables}>
        <PlayerTable team={homeTeam} players={homePlayers} side="home" />
        <PlayerTable team={awayTeam} players={awayPlayers} side="away" />
      </div>
    )}
  </section>
);

export default SituationTabPanel;

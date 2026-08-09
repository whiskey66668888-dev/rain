import React, { useMemo, useState } from 'react';

import type { AnalysisMatchEntity } from '@/apis/origin/discover/analysisTypes';

import AnalysisMatchTable from './AnalysisMatchTable';
import {
  DEFAULT_ANALYSIS_FILTER,
  applyHistoricalMatchup,
  type AnalysisFilterState,
} from '../utils/analysisLogic';
import styles from '../Analysis.module.scss';

interface HistoricalMatchupProps {
  matches?: AnalysisMatchEntity[];
  teamName: string;
  teamLogo?: string;
  homeId: string;
  awayId: string;
  leagueId: string;
}

const HistoricalMatchup: React.FC<HistoricalMatchupProps> = ({
  matches,
  teamName,
  teamLogo,
  homeId,
  awayId,
  leagueId,
}) => {
  const [filter, setFilter] = useState<AnalysisFilterState>(DEFAULT_ANALYSIS_FILTER);

  const { matchList, stats } = useMemo(
    () => applyHistoricalMatchup(matches, filter, homeId, awayId, leagueId),
    [matches, filter, homeId, awayId, leagueId],
  );

  return (
    <div>
      <h3 className={styles.sectionTitle}>历史交锋</h3>
      <AnalysisMatchTable
        teamName={teamName}
        logoUrl={teamLogo}
        filter={filter}
        onFilterChange={(patch) => setFilter((prev) => ({ ...prev, ...patch }))}
        stats={stats}
        matchList={matchList}
      />
    </div>
  );
};

export default HistoricalMatchup;

import React, { useMemo, useState } from 'react';

import type { AnalysisMatchEntity } from '@/apis/origin/discover/analysisTypes';

import AnalysisMatchTable from './AnalysisMatchTable';
import {
  DEFAULT_ANALYSIS_FILTER,
  applyRecentRecord,
  type AnalysisFilterState,
} from '../utils/analysisLogic';
import styles from '../Analysis.module.scss';

interface RecentRecordProps {
  homeData?: AnalysisMatchEntity[];
  awayData?: AnalysisMatchEntity[];
  homeName: string;
  awayName: string;
  homeLogo?: string;
  awayLogo?: string;
  homeId: string;
  guestId: string;
  leagueId: string;
}

const RecentRecord: React.FC<RecentRecordProps> = ({
  homeData,
  awayData,
  homeName,
  awayName,
  homeLogo,
  awayLogo,
  homeId,
  guestId,
  leagueId,
}) => {
  const [homeFilter, setHomeFilter] = useState<AnalysisFilterState>(DEFAULT_ANALYSIS_FILTER);
  const [awayFilter, setAwayFilter] = useState<AnalysisFilterState>(DEFAULT_ANALYSIS_FILTER);

  const homeResult = useMemo(
    () => applyRecentRecord(homeData, homeFilter, homeId, homeId, guestId, leagueId),
    [homeData, homeFilter, homeId, guestId, leagueId],
  );

  const awayResult = useMemo(
    () => applyRecentRecord(awayData, awayFilter, guestId, homeId, guestId, leagueId),
    [awayData, awayFilter, guestId, homeId, leagueId],
  );

  return (
    <div>
      <h3 className={styles.sectionTitle}>近期战绩</h3>
      <div className={styles.recentRecordSection}>
        <AnalysisMatchTable
          teamName={homeName}
          logoUrl={homeLogo}
          filter={homeFilter}
          onFilterChange={(patch) => setHomeFilter((prev) => ({ ...prev, ...patch }))}
          stats={homeResult.stats}
          matchList={homeResult.matchList}
        />
      </div>
      <div className={styles.recentRecordSection}>
        <AnalysisMatchTable
          teamName={awayName}
          logoUrl={awayLogo}
          filter={awayFilter}
          onFilterChange={(patch) => setAwayFilter((prev) => ({ ...prev, ...patch }))}
          stats={awayResult.stats}
          matchList={awayResult.matchList}
        />
      </div>
    </div>
  );
};

export default RecentRecord;

import React, { useMemo, useState } from 'react';

import type { AnalysisMatchEntity } from '@/apis/origin/discover/analysisTypes';

import DistributionTable from './DistributionTable';
import {
  DEFAULT_ANALYSIS_FILTER,
  calculateScoreDifference,
  type AnalysisFilterState,
} from '../utils/analysisLogic';

interface ScoreDifferenceProps {
  vsData?: AnalysisMatchEntity[];
  homeName: string;
  awayName: string;
  homeLogo?: string;
  awayLogo?: string;
  homeId: string;
  awayId: string;
  sclassId: string;
}

const ScoreDifference: React.FC<ScoreDifferenceProps> = ({
  vsData,
  homeName,
  awayName,
  homeLogo,
  awayLogo,
  homeId,
  awayId,
  sclassId,
}) => {
  const [filter, setFilter] = useState<AnalysisFilterState>(DEFAULT_ANALYSIS_FILTER);

  const data = useMemo(
    () => calculateScoreDifference(vsData, filter, homeId, awayId, sclassId),
    [vsData, filter, homeId, awayId, sclassId],
  );

  return (
    <DistributionTable
      title="胜分差"
      homeTeamName={homeName}
      awayTeamName={awayName}
      homeTeamIcon={homeLogo}
      awayTeamIcon={awayLogo}
      filter={filter}
      onFilterChange={(patch) => setFilter((prev) => ({ ...prev, ...patch }))}
      data={data}
    />
  );
};

export default ScoreDifference;

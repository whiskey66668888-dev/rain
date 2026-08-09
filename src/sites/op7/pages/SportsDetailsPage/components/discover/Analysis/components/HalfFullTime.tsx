import React, { useMemo, useState } from 'react';

import type { AnalysisMatchEntity } from '@/apis/origin/discover/analysisTypes';

import DistributionTable from './DistributionTable';
import {
  DEFAULT_ANALYSIS_FILTER,
  calculateHalfFullTime,
  type AnalysisFilterState,
} from '../utils/analysisLogic';

interface HalfFullTimeProps {
  vsData?: AnalysisMatchEntity[];
  homeName: string;
  awayName: string;
  homeLogo?: string;
  awayLogo?: string;
  homeId: string;
  awayId: string;
  sclassId: string;
}

const HalfFullTime: React.FC<HalfFullTimeProps> = ({
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
    () => calculateHalfFullTime(vsData, filter, homeId, awayId, sclassId),
    [vsData, filter, homeId, awayId, sclassId],
  );

  return (
    <DistributionTable
      title="半全场胜负"
      homeTeamName={homeName}
      awayTeamName={awayName}
      homeTeamIcon={homeLogo}
      awayTeamIcon={awayLogo}
      filter={filter}
      onFilterChange={(patch) => setFilter((prev) => ({ ...prev, ...patch }))}
      data={data}
      centerHeader="全场"
    />
  );
};

export default HalfFullTime;

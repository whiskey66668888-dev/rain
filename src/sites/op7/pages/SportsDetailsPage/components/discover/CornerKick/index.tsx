import React, { useMemo, useState } from 'react';

import Skeleton from '@/common/components/Skeleton';
import { useCornerKickQuery } from '@/apis/origin/discover/cornerKickReq';

import CornerKickHistory from './CornerKickHistory';
import CornerKickStatistics from './CornerKickStatistics';
import DiscoverPill from './DiscoverPill';
import {
  buildAgainstStatsRows,
  buildForStatsRows,
  buildHistoryRow,
  buildTotalStatsRows,
  calcBigSmallRate,
  filterHistoryMatches,
  getCornerKickPageTeams,
} from './utils/cornerKickLogic';
import styles from './CornerKick.module.scss';

const CORNER_KICK_TABS = [
  { id: 0, label: '历史' },
  { id: 1, label: '统计' },
];

interface CornerKickProps {
  scheduleId: string | null;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamIcon?: string;
  awayTeamIcon?: string;
}

const CornerKick: React.FC<CornerKickProps> = ({
  scheduleId,
  homeTeamName = '',
  awayTeamName = '',
  homeTeamIcon,
  awayTeamIcon,
}) => {
  const [activeTabId, setActiveTabId] = useState(0);
  const [homeHistoryFilter, setHomeHistoryFilter] = useState(0);
  const [awayHistoryFilter, setAwayHistoryFilter] = useState(0);
  const [totalTabId, setTotalTabId] = useState(0);
  const [forTabId, setForTabId] = useState(0);
  const [againstTabId, setAgainstTabId] = useState(0);
  const [sameHomeAwayTotal, setSameHomeAwayTotal] = useState(false);
  const [sameHomeAwayFor, setSameHomeAwayFor] = useState(false);
  const [sameHomeAwayAgainst, setSameHomeAwayAgainst] = useState(false);

  const { data, isLoading } = useCornerKickQuery(scheduleId, !!scheduleId);

  const conner = data?.conner ?? null;
  const pageTeams = useMemo(() => getCornerKickPageTeams(conner), [conner]);

  const resolvedHomeName = homeTeamName || pageTeams.homeName;
  const resolvedAwayName = awayTeamName || pageTeams.awayName;

  const totalRows = useMemo(() => {
    if (!conner) return [];
    return buildTotalStatsRows({
      conner,
      homeName: pageTeams.homeName,
      awayName: pageTeams.awayName,
      sameHomeAway: sameHomeAwayTotal,
      selectedTabId: totalTabId,
    });
  }, [conner, pageTeams.awayName, pageTeams.homeName, sameHomeAwayTotal, totalTabId]);

  const forRows = useMemo(() => {
    if (!conner) return [];
    return buildForStatsRows({
      conner,
      homeName: pageTeams.homeName,
      awayName: pageTeams.awayName,
      sameHomeAway: sameHomeAwayFor,
      selectedTabId: forTabId,
    });
  }, [conner, forTabId, pageTeams.awayName, pageTeams.homeName, sameHomeAwayFor]);

  const againstRows = useMemo(() => {
    if (!conner) return [];
    return buildAgainstStatsRows({
      conner,
      homeName: pageTeams.homeName,
      awayName: pageTeams.awayName,
      sameHomeAway: sameHomeAwayAgainst,
      selectedTabId: againstTabId,
    });
  }, [againstTabId, conner, pageTeams.awayName, pageTeams.homeName, sameHomeAwayAgainst]);

  const homeHistoryRows = useMemo(() => {
    if (!conner) return [];
    const filtered = filterHistoryMatches({
      list: conner.homeRanking,
      selectedIndex: homeHistoryFilter,
      teamName: pageTeams.homeName,
    });
    return filtered.map((match) => buildHistoryRow(match, pageTeams.homeName));
  }, [conner, homeHistoryFilter, pageTeams.homeName]);

  const awayHistoryRows = useMemo(() => {
    if (!conner) return [];
    const filtered = filterHistoryMatches({
      list: conner.awayRanking,
      selectedIndex: awayHistoryFilter,
      teamName: pageTeams.awayName,
    });
    return filtered.map((match) => buildHistoryRow(match, pageTeams.awayName));
  }, [awayHistoryFilter, conner, pageTeams.awayName]);

  const homeRate = useMemo(() => {
    if (!conner) return { bigRate: 0, smallRate: 0 };
    const filtered = filterHistoryMatches({
      list: conner.homeRanking,
      selectedIndex: homeHistoryFilter,
      teamName: pageTeams.homeName,
    });
    return calcBigSmallRate(filtered);
  }, [conner, homeHistoryFilter, pageTeams.homeName]);

  const awayRate = useMemo(() => {
    if (!conner) return { bigRate: 0, smallRate: 0 };
    const filtered = filterHistoryMatches({
      list: conner.awayRanking,
      selectedIndex: awayHistoryFilter,
      teamName: pageTeams.awayName,
    });
    return calcBigSmallRate(filtered);
  }, [awayHistoryFilter, conner, pageTeams.awayName]);

  if (!scheduleId) {
    return (
      <div className={styles.loadingWrap}>
        <Skeleton type="base" baseClassName="h-120px" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.subTabBar}>
        {CORNER_KICK_TABS.map((tab) => (
          <DiscoverPill
            key={tab.id}
            label={tab.label}
            selected={activeTabId === tab.id}
            onClick={() => setActiveTabId(tab.id)}
          />
        ))}
      </div>
      <div className={styles.scrollBody}>
        <div className={styles.panel}>
          {isLoading ? (
            <div className={styles.loadingWrap}>
              <Skeleton type="base" baseClassName="h-120px" />
            </div>
          ) : activeTabId === 0 ? (
            <CornerKickHistory
              homeTitle={resolvedHomeName}
              awayTitle={resolvedAwayName}
              homeIcon={homeTeamIcon}
              awayIcon={awayTeamIcon}
              homeRows={homeHistoryRows}
              awayRows={awayHistoryRows}
              homeFilterIndex={homeHistoryFilter}
              awayFilterIndex={awayHistoryFilter}
              homeBigRate={homeRate.bigRate}
              homeSmallRate={homeRate.smallRate}
              awayBigRate={awayRate.bigRate}
              awaySmallRate={awayRate.smallRate}
              onHomeFilterChange={setHomeHistoryFilter}
              onAwayFilterChange={setAwayHistoryFilter}
            />
          ) : (
            <CornerKickStatistics
              homeName={resolvedHomeName || '主队'}
              awayName={resolvedAwayName || '客队'}
              totalRows={totalRows}
              forRows={forRows}
              againstRows={againstRows}
              totalTabId={totalTabId}
              forTabId={forTabId}
              againstTabId={againstTabId}
              sameHomeAwayTotal={sameHomeAwayTotal}
              sameHomeAwayFor={sameHomeAwayFor}
              sameHomeAwayAgainst={sameHomeAwayAgainst}
              onTotalTabChange={setTotalTabId}
              onForTabChange={setForTabId}
              onAgainstTabChange={setAgainstTabId}
              onToggleSameHomeAwayTotal={() => setSameHomeAwayTotal((prev) => !prev)}
              onToggleSameHomeAwayFor={() => setSameHomeAwayFor((prev) => !prev)}
              onToggleSameHomeAwayAgainst={() => setSameHomeAwayAgainst((prev) => !prev)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CornerKick;

import React from 'react';
import clsx from 'clsx';

import LazyImage from '@/common/components/LazyImage';
import Empty from '@/common/components/Empty';
import SegmentedControl from '@/common/components/SegmentedControl';

import type { AnalysisFilterState, AnalysisMatchItem, AnalysisStats } from '../utils/analysisLogic';
import styles from '../Analysis.module.scss';

interface AnalysisMatchTableProps {
  teamName: string;
  logoUrl?: string;
  filter: AnalysisFilterState;
  onFilterChange: (patch: Partial<AnalysisFilterState>) => void;
  stats: AnalysisStats | null;
  matchList: AnalysisMatchItem[];
}

const COUNT_OPTIONS = [
  { value: 10, label: '10场' },
  { value: 20, label: '20场' },
];

const getOddsColorClass = (res: string, winVal: string): string => {
  if (res === '-') return styles.neutralColor ?? '';
  if (res === winVal) return styles.winColor ?? '';
  return styles.loseColor ?? '';
};

const AnalysisMatchTable: React.FC<AnalysisMatchTableProps> = ({
  teamName,
  logoUrl,
  filter,
  onFilterChange,
  stats,
  matchList,
}) => (
  <div>
    <div className={styles.filterRow}>
      <div className={styles.filterRowMatchLeft}>
        <div className={styles.teamHeader}>
          {logoUrl ? <LazyImage className={styles.teamLogoSmall} src={logoUrl} alt="" /> : null}
          <span className={styles.teamName}>{teamName}</span>
        </div>
        <button
          type="button"
          className={clsx(styles.filterChip, filter.sameHomeAway && styles.filterChipActive)}
          onClick={() => onFilterChange({ sameHomeAway: !filter.sameHomeAway })}
        >
          同主客
        </button>
        <button
          type="button"
          className={clsx(styles.filterChip, filter.sameLeague && styles.filterChipActive)}
          onClick={() => onFilterChange({ sameLeague: !filter.sameLeague })}
        >
          同赛事
        </button>
      </div>
      <SegmentedControl
        className={styles.filterCountControl}
        options={COUNT_OPTIONS}
        value={filter.matchCount}
        onChange={(v) => onFilterChange({ matchCount: v })}
        height={24}
      />
    </div>

    {stats ? (
      <div className={styles.statsSummary}>
        <div className={styles.recentCountBox}>
          <div className={styles.recentCountTop}>近</div>
          <div className={styles.recentCountBottom}>{stats.count}场</div>
        </div>
        {[
          { label: '胜率', rate: stats.winRate, desc: stats.winDesc },
          { label: '赢率', rate: stats.winOdd, desc: stats.winOddDesc },
          { label: '大率', rate: stats.bigRate, desc: stats.bigDesc },
          { label: '单率', rate: stats.singleRate, desc: stats.singleDesc },
        ].map((item) => (
          <div key={item.label} className={styles.statColumn}>
            <div>
              <span className={styles.statColumnLabel}>{item.label}</span>
              <span className={styles.statColumnRate}> {item.rate}</span>
            </div>
            <span className={styles.statColumnDesc}>{item.desc}</span>
          </div>
        ))}
      </div>
    ) : null}

    <div className={styles.tableHeader}>
      <span className={styles.colDate}>时间/赛事</span>
      <span className={clsx(styles.colTeam, styles.colTeamRight)}>客队</span>
      <span className={styles.colScore}>比分</span>
      <span className={styles.colTeam}>主队</span>
      <span className={styles.colOdds}>让分</span>
      <span className={styles.colOdds}>总分</span>
    </div>

    {matchList.length === 0 ? (
      <Empty type="data" variant="card" />
    ) : (
      matchList.map((item, index) => (
        <div key={`${item.date}-${index}`} className={styles.tableRow}>
          <div className={styles.colDate}>
            <div>{item.date}</div>
            <div>{item.leagueName}</div>
          </div>
          <span className={clsx(styles.colTeam, styles.colTeamRight)}>{item.guestTeam}</span>
          <div className={styles.colScore}>
            <div>{item.score}</div>
            <div className={styles.colHalfScore}>{item.halfScore}</div>
          </div>
          <span className={styles.colTeam}>{item.homeTeam}</span>
          <div className={styles.colOdds}>
            {item.handicap === '0' ? (
              <span className={styles.neutralColor}>-</span>
            ) : (
              <>
                <div className={getOddsColorClass(item.handicapRes, '赢')}>{item.handicap}</div>
                <div className={getOddsColorClass(item.handicapRes, '赢')}>{item.handicapRes}</div>
              </>
            )}
          </div>
          <div className={styles.colOdds}>
            {item.totalScore === '0' ? (
              <span className={styles.neutralColor}>-</span>
            ) : (
              <>
                <div className={getOddsColorClass(item.totalRes, '大')}>{item.totalScore}</div>
                <div className={getOddsColorClass(item.totalRes, '大')}>{item.totalRes}</div>
              </>
            )}
          </div>
        </div>
      ))
    )}
  </div>
);

export default AnalysisMatchTable;

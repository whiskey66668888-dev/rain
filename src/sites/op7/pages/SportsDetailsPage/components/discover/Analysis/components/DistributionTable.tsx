import React from 'react';
import clsx from 'clsx';

import LazyImage from '@/common/components/LazyImage';

import type { DistributionResult } from '../utils/analysisLogic';
import AnalysisFilterBar from './AnalysisFilterBar';
import type { AnalysisFilterState } from '../utils/analysisLogic';
import styles from '../Analysis.module.scss';

interface DistributionTableProps {
  title: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamIcon?: string;
  awayTeamIcon?: string;
  filter: AnalysisFilterState;
  onFilterChange: (patch: Partial<AnalysisFilterState>) => void;
  data: DistributionResult;
  centerHeader?: string;
}

const DistributionTable: React.FC<DistributionTableProps> = ({
  title,
  homeTeamName,
  awayTeamName,
  homeTeamIcon,
  awayTeamIcon,
  filter,
  onFilterChange,
  data,
  centerHeader = '全场',
}) => (
  <div className={styles.distributionSection}>
    <h3 className={styles.sectionTitle}>{title}</h3>
    <AnalysisFilterBar filter={filter} onFilterChange={onFilterChange} />
    <div className={styles.teamHeaderRow}>
      <div className={styles.teamHeader}>
        {homeTeamIcon ? (
          <LazyImage className={styles.teamLogoSmall} src={homeTeamIcon} alt="" />
        ) : null}
        <span className={styles.teamName}>{homeTeamName}</span>
      </div>
      <div className={clsx(styles.teamHeader, styles.teamHeaderRight)}>
        <span className={styles.teamName}>{awayTeamName}</span>
        {awayTeamIcon ? (
          <LazyImage className={styles.teamLogoSmall} src={awayTeamIcon} alt="" />
        ) : null}
      </div>
    </div>

    <div className={styles.distTableHeader}>
      {[`主(${data.hMain})`, `客(${data.hGuest})`, `总(${data.hTotal})`].map((label) => (
        <div key={label} className={clsx(styles.distCell, styles.distCellHeader)}>
          {label}
        </div>
      ))}
      <div className={clsx(styles.distCenterCell, styles.distCenterCellHeader)}>{centerHeader}</div>
      {[`主(${data.gMain})`, `客(${data.gGuest})`, `总(${data.gTotal})`].map((label) => (
        <div key={label} className={clsx(styles.distCell, styles.distCellHeader)}>
          {label}
        </div>
      ))}
    </div>

    {data.items.map((item) => (
      <div key={item.label} className={clsx(styles.distTableRow, styles.distRowBorder)}>
        <div className={clsx(styles.distCell, styles.distCellRed)}>{item.homeMain}</div>
        <div className={styles.distCell}>{item.homeGuest}</div>
        <div className={styles.distCell}>{item.homeTotal}</div>
        <div className={styles.distCenterCell}>{item.label}</div>
        <div className={clsx(styles.distCell, styles.distCellRed)}>{item.guestMain}</div>
        <div className={styles.distCell}>{item.guestGuest}</div>
        <div className={styles.distCell}>{item.guestTotal}</div>
      </div>
    ))}
  </div>
);

export default DistributionTable;

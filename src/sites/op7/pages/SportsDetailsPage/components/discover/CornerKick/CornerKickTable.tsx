import React from 'react';
import clsx from 'clsx';

import type { CornerKickHistoryRow } from '@/apis/origin/discover/cornerKickTypes';

import styles from './CornerKick.module.scss';

interface CornerKickTableProps {
  rows: CornerKickHistoryRow[];
}

const CornerKickTable: React.FC<CornerKickTableProps> = ({ rows }) => {
  if (rows.length === 0) return null;

  return (
    <div className={styles.table}>
      <div className={clsx(styles.tableRow, styles.tableHeader)}>
        <div className={styles.colTime}>时间</div>
        <div className={clsx(styles.colHome, styles.alignRight)}>主队</div>
        <div className={styles.colCorner}>角球</div>
        <div className={clsx(styles.colAway, styles.alignLeft)}>客队</div>
        <div className={styles.colSize}>大小</div>
      </div>
      {rows.map((row, index) => (
        <div key={`${row.date}-${row.home}-${row.away}-${index}`} className={styles.tableRow}>
          <div className={styles.colTime}>
            <div className={styles.dateText}>{row.date}</div>
            <div className={styles.leagueText}>{row.league}</div>
          </div>
          <div
            className={clsx(styles.colHome, styles.alignRight, highlightClass(row.homeHighlight))}
          >
            {row.home}
          </div>
          <div className={styles.colCorner}>{row.corners}</div>
          <div
            className={clsx(styles.colAway, styles.alignLeft, highlightClass(row.awayHighlight))}
          >
            {row.away}
          </div>
          <div className={clsx(styles.colSize, toneClass(row.bigSmallTone))}>
            {row.bigSmallText}
          </div>
        </div>
      ))}
    </div>
  );
};

const highlightClass = (tone: CornerKickHistoryRow['homeHighlight']) => {
  if (tone === 'win') return styles.textWin;
  if (tone === 'lose') return styles.textLose;
  return undefined;
};

const toneClass = (tone: CornerKickHistoryRow['bigSmallTone']) => {
  if (tone === 'big') return styles.textWin;
  if (tone === 'small') return styles.textLose;
  return undefined;
};

export default CornerKickTable;

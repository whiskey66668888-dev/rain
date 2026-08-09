import React from 'react';

import type { LineUpData, TeamLite } from '@/apis/origin/discover';
import { getLineUpInfoRows } from '../../utils';
import styles from './index.module.scss';

const InfoRows: React.FC<{ data?: LineUpData | null; homeTeam: TeamLite; awayTeam: TeamLite }> = ({
  data,
  homeTeam,
  awayTeam,
}) => {
  const rows = getLineUpInfoRows(data, homeTeam, awayTeam);

  return (
    <div className={styles.infoTable}>
      {rows.map((row) => (
        <div className={styles.infoRow} key={row.label || 'team-header'}>
          <span className={styles.label}>{row.label}</span>
          {row.isHeader ? (
            <>
              <span className={styles.value}>
                <span className={styles.team}>
                  <img src={row.home.image || '/images/common/logo_small.png'} alt="" />
                  <b>{row.home.text || '-'}</b>
                </span>
              </span>
              <span className={styles.value}>
                <span className={styles.team}>
                  <img src={row.away.image || '/images/common/logo_small.png'} alt="" />
                  <b>{row.away.text || '-'}</b>
                </span>
              </span>
            </>
          ) : (
            <>
              <span className={styles.value}>{row.home}</span>
              <span className={styles.value}>{row.away}</span>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default InfoRows;

import React from 'react';
import clsx from 'clsx';

import LazyImage from '@/common/components/LazyImage';
import { DEFAULT_AWAY_TEAM_ICON, DEFAULT_HOME_TEAM_ICON } from '../../constants';
import type { TeamDisplayInfo } from '../../types';
import { buildScoreTable } from '../../utils';
import styles from './index.module.scss';

/**
 * 篮球节次比分表。球队列只展示 logo，空比分按产品规则显示 '-'。
 */
const ScoreTable: React.FC<{
  data: ReturnType<typeof buildScoreTable>;
  homeTeam: TeamDisplayInfo;
  awayTeam: TeamDisplayInfo;
}> = ({ data, homeTeam, awayTeam }) => {
  return (
    <section className={styles.scoreCard}>
      <div
        className={clsx(styles.scoreRow, styles.scoreHeader)}
        style={{ '--score-cols': data.headers.length } as React.CSSProperties}
      >
        <div className={styles.teamCell}>球队</div>
        {data.headers.map((header) => (
          <div key={header} className={styles.scoreCell}>
            {header}
          </div>
        ))}
      </div>
      {data.rows.map((row) => {
        const team = row.side === 'home' ? homeTeam : awayTeam;
        const fallback = row.side === 'home' ? DEFAULT_HOME_TEAM_ICON : DEFAULT_AWAY_TEAM_ICON;

        return (
          <div
            key={row.side}
            className={styles.scoreRow}
            style={{ '--score-cols': data.headers.length } as React.CSSProperties}
          >
            <div className={styles.teamCell}>
              <LazyImage
                className={styles.teamLogo}
                imageClassName={styles.teamLogo}
                src={team.logo || fallback}
                fallback={fallback}
                width={24}
                height={24}
                alt=""
              />
              <span>{team.name || '-'}</span>
            </div>
            {row.values.map((value, index) => (
              <div
                key={`${row.side}-${data.headers[index]}`}
                className={clsx(styles.scoreCell, row.highlights[index] && styles.scoreHighlight)}
              >
                {value !== '' ? value : '-'}
              </div>
            ))}
          </div>
        );
      })}
    </section>
  );
};

export default ScoreTable;

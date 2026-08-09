import React from 'react';

import type { AverageCircleItem, AverageStatItem } from '../utils/analysisLogic';
import AverageComparisonRing from './AverageComparisonRing';
import styles from '../Analysis.module.scss';

interface AverageComparisonProps {
  circleItems: AverageCircleItem[];
  statItems: AverageStatItem[];
}

const formatCircleValue = (value: number): string => String(Math.trunc(value));
const formatStatValue = (value: number): string => value.toFixed(1);

const AverageComparison: React.FC<AverageComparisonProps> = ({ circleItems, statItems }) => (
  <div>
    <h3 className={styles.sectionTitle}>场均对比</h3>
    <div className={styles.circleRow}>
      {circleItems.map((item) => {
        const isZeroPercent = item.leftPercent === 0 && item.rightPercent === 0;
        const leftPercent = isZeroPercent ? 0.5 : item.leftPercent;
        const rightPercent = isZeroPercent ? 0.5 : item.rightPercent;

        return (
          <div key={item.label} className={styles.circleItem}>
            <span className={styles.circleLabel}>{item.label}</span>
            <div className={styles.circleContent}>
              <span className={styles.ringValue}>{formatCircleValue(item.leftValue)}</span>
              <AverageComparisonRing leftPercent={leftPercent} rightPercent={rightPercent} />
              <span className={styles.ringValue}>{formatCircleValue(item.rightValue)}</span>
            </div>
          </div>
        );
      })}
    </div>
    {statItems.map((item) => {
      const isEmpty = item.leftValue === 0 && item.rightValue === 0;
      const leftRatio = isEmpty ? 0.5 : Math.min(item.leftValue / item.maxValue, 1);
      const rightRatio = isEmpty ? 0.5 : Math.min(item.rightValue / item.maxValue, 1);
      return (
        <div key={item.label} className={styles.statRow}>
          <span className={`${styles.statValue} ${styles.statValueLeft}`}>
            {formatStatValue(item.leftValue)}
          </span>
          <div className={styles.statBarWrap}>
            <div className={styles.statBarLeft} style={{ width: `${leftRatio * 100}%` }} />
          </div>
          <span className={styles.statLabel}>{item.label}</span>
          <div className={styles.statBarWrap}>
            <div className={styles.statBarRight} style={{ width: `${rightRatio * 100}%` }} />
          </div>
          <span className={styles.statValue}>{formatStatValue(item.rightValue)}</span>
        </div>
      );
    })}
  </div>
);

export default AverageComparison;

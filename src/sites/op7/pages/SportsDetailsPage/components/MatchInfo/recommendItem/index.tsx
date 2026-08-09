import React from 'react';

import type { MatchRecommendItem } from '../../../type';
// styles
import styles from './index.module.scss';

interface RecommendItemProps {
  item: MatchRecommendItem;
  onRecommendOddsClick?: (item: MatchRecommendItem) => void;
  /** 与下方盘口列表同一注是否已加入投注单 */
  isOddsSelected?: boolean;
}

const RecommendItem: React.FC<RecommendItemProps> = ({
  item,
  onRecommendOddsClick,
  isOddsSelected = false,
}) => {
  return (
    <div className={styles.recommendCard}>
      <div className={`${styles.recommendCardTip} _tf[12]`}>{item.tip}</div>
      <div className={styles.recommendCardActions}>
        <div className={styles.recommendCardAction}>
          <span className={`${styles.recommendCardActionLabel} _tf[12]`}>{item.betTypeName}</span>
        </div>
        <div
          className={`${styles.recommendCardAction}${isOddsSelected ? ` ${styles.recommendCardActionActive}` : ''}`}
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRecommendOddsClick?.(item);
          }}
        >
          <span className={`${styles.recommendCardActionLabel} _tf[12]`}>{item.handicap}</span>
          <span className={`${styles.recommendCardOdds} _tf[12]`}>{item.odds}</span>
        </div>
      </div>
    </div>
  );
};

export default RecommendItem;

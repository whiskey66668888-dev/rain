import React from 'react';
import clsx from 'clsx';

import type { BasketLiveItem } from '@/apis/origin/discover';
import LazyImage from '@/common/components/LazyImage';
import Skeleton from '@/common/components/Skeleton';
import { DEFAULT_AVATAR, DEFAULT_AWAY_TEAM_ICON, DEFAULT_HOME_TEAM_ICON } from '../../constants';
import { LIVE_FILTER_LABELS, reverseScoreText, type LiveFilterType } from '../../utils';
import EmptyState from '../EmptyState';
import styles from './index.module.scss';

interface LiveTextViewProps {
  periods: string[];
  currentPeriod: number;
  onPeriodChange: (index: number) => void;
  filters: LiveFilterType[];
  activeFilter: LiveFilterType;
  onFilterChange: (filter: LiveFilterType) => void;
  items: BasketLiveItem[];
  allItemsCount: number;
  homeLogo?: string;
  awayLogo?: string;
  loading: boolean;
}

/**
 * 文字直播面板，负责节次切换、事件类型筛选和时间线展示。
 */
const LiveTextView: React.FC<LiveTextViewProps> = ({
  periods,
  currentPeriod,
  onPeriodChange,
  filters,
  activeFilter,
  onFilterChange,
  items,
  allItemsCount,
  homeLogo,
  awayLogo,
  loading,
}) => (
  <div className={styles.liveText}>
    <div className={styles.periodTabs}>
      {periods.map((period, index) => (
        <button
          key={period}
          type="button"
          className={clsx(styles.periodButton, currentPeriod === index && styles.periodActive)}
          onClick={() => onPeriodChange(index)}
        >
          {period}
        </button>
      ))}
    </div>

    {loading ? (
      <div className={styles.loadingSkeleton}>
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} type="base" baseClassName="h-34px" />
        ))}
      </div>
    ) : allItemsCount === 0 ? (
      <EmptyState />
    ) : (
      <>
        <div className={styles.filterTabs}>
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={clsx(styles.filterButton, activeFilter === filter && styles.filterActive)}
              onClick={() => onFilterChange(filter)}
            >
              {LIVE_FILTER_LABELS[filter]}
            </button>
          ))}
        </div>
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className={styles.timeline}>
            {items.map((item, index) => (
              <LiveEventItem
                key={`${item.game_time}-${item.content}-${index}`}
                item={item}
                homeLogo={homeLogo}
                awayLogo={awayLogo}
              />
            ))}
          </div>
        )}
      </>
    )}
  </div>
);

const LiveEventItem: React.FC<{ item: BasketLiveItem; homeLogo?: string; awayLogo?: string }> = ({
  item,
  homeLogo,
  awayLogo,
}) => {
  const points = Number(item.points || 0);
  const isScoring = points !== 0;
  const side = item.neutrality === '1' ? 'home' : item.neutrality === '2' ? 'away' : undefined;
  const sideLogo = side === 'home' ? homeLogo : side === 'away' ? awayLogo : '';
  const sideFallback = side === 'home' ? DEFAULT_HOME_TEAM_ICON : DEFAULT_AWAY_TEAM_ICON;

  return (
    <div className={styles.liveEvent}>
      <div className={styles.playerAvatar}>
        {isScoring ? (
          <LazyImage
            src={item.player_logo || DEFAULT_AVATAR}
            fallback={DEFAULT_AVATAR}
            width={26}
            height={26}
            alt=""
          />
        ) : null}
      </div>
      <div className={styles.eventTime}>{item.game_time}</div>
      <div className={styles.timelineDot} />
      <div
        className={clsx(
          styles.eventBody,
          isScoring && item.neutrality === '1' && styles.homeScoring,
          isScoring && item.neutrality === '2' && styles.awayScoring,
        )}
      >
        {side ? (
          <LazyImage
            className={styles.eventTeamLogo}
            imageClassName={styles.eventTeamLogo}
            src={sideLogo || sideFallback}
            fallback={sideFallback}
            width={16}
            height={16}
            alt=""
          />
        ) : null}
        <span className={styles.eventContent}>{item.content}</span>
        <div className={styles.score}>
          <span className={styles.eventScore}>{reverseScoreText(item.score)}</span>
          <span className={styles.eventPoint}>{points > 0 ? points : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default LiveTextView;

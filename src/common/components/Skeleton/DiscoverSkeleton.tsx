import React from 'react';
import clsx from 'clsx';

import styles from './Skeleton.module.scss';

type DiscoverSkeletonType = 'discoverLiveStreaming' | 'discoverLiveSituation' | 'discoverLineUp';

interface DiscoverSkeletonProps {
  type: DiscoverSkeletonType;
}

const getDelayClass = (delay: number) => {
  switch (delay) {
    case 2:
      return styles.delay2;
    case 3:
      return styles.delay3;
    case 4:
      return styles.delay4;
    case 5:
      return styles.delay5;
    default:
      return styles.delay1;
  }
};

const block = (className?: string, delay = 1) => (
  <div className={clsx(styles.skeletonBase, getDelayClass(delay), className)} />
);

const DiscoverLiveStreamingSkeleton = () => (
  <div className={styles.discoverSkeleton}>
    <section className={styles.discoverScoreCard}>
      <div className={styles.discoverScoreHeader}>
        {block(styles.discoverScoreTeamLabel)}
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <React.Fragment key={item}>
            {block(styles.discoverScoreCell, (item % 4) + 1)}
          </React.Fragment>
        ))}
      </div>
      {[1, 2].map((row) => (
        <div key={row} className={styles.discoverScoreRow}>
          <div className={styles.discoverScoreTeam}>{block(styles.discoverAvatar, row + 1)}</div>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <React.Fragment key={`${row}-${item}`}>
              {block(styles.discoverScoreValue, ((item + row) % 4) + 1)}
            </React.Fragment>
          ))}
        </div>
      ))}
    </section>

    <section className={styles.discoverCard}>
      <div className={styles.discoverSegment}>
        {block(styles.discoverSegmentItem)}
        {block(styles.discoverSegmentItem, 2)}
      </div>
      <div className={styles.discoverPills}>
        {[1, 2, 3, 4].map((item) => (
          <React.Fragment key={item}>{block(styles.discoverPill, item)}</React.Fragment>
        ))}
      </div>
      <div className={styles.discoverTimeline}>
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className={styles.discoverTimelineRow}>
            {block(styles.discoverAvatar, item)}
            {block(styles.discoverTime, item + 1)}
            <span className={styles.discoverDot} />
            {block(styles.discoverEvent, item + 2)}
          </div>
        ))}
      </div>
    </section>
  </div>
);

const DiscoverLiveSituationSkeleton = () => (
  <div className={styles.discoverSkeleton}>
    <section className={styles.discoverChartCard}>
      <div className={styles.discoverChartTeams}>
        {block(styles.discoverAvatar)}
        {block(styles.discoverAvatar, 2)}
      </div>
      <div className={styles.discoverChartArea}>
        {[1, 2, 3].map((item) => (
          <React.Fragment key={item}>{block(styles.discoverChartLine, item)}</React.Fragment>
        ))}
      </div>
    </section>

    <section className={styles.discoverCard}>
      <div className={styles.discoverTeamRow}>
        {block(styles.discoverTeamName)}
        {block(styles.discoverTeamName, 2)}
      </div>
      <div className={styles.discoverSituationStats}>
        {[1, 2, 3].map((item) => (
          <div key={item} className={styles.discoverSituationItem}>
            {block(styles.discoverShortText, item)}
            {block(styles.discoverRing, item + 1)}
            {block(styles.discoverShortText, item + 2)}
          </div>
        ))}
      </div>
      <div className={styles.discoverBars}>
        {[1, 2, 3].map((item) => (
          <div key={item} className={styles.discoverBarRow}>
            {block(styles.discoverBarValue, item)}
            {block(styles.discoverBarTrack, item + 1)}
            {block(styles.discoverBarLabel, item + 2)}
            {block(styles.discoverBarTrack, item + 3)}
            {block(styles.discoverBarValue, item + 4)}
          </div>
        ))}
      </div>
    </section>

    <section className={styles.discoverCard}>
      <div className={styles.discoverPills}>
        {[1, 2, 3].map((item) => (
          <React.Fragment key={item}>{block(styles.discoverPill, item)}</React.Fragment>
        ))}
      </div>
      {[1, 2, 3].map((item) => (
        <div key={item} className={styles.discoverTextRow}>
          {block(styles.discoverTime, item)}
          {block(styles.discoverWideText, item + 1)}
        </div>
      ))}
    </section>
  </div>
);

const DiscoverLineUpSkeleton = () => (
  <div className={styles.discoverSkeleton}>
    <section className={styles.discoverTitleCard}>
      {block(styles.discoverTitle)}
      {block(styles.discoverButton, 2)}
    </section>
    <section className={styles.discoverInfoCard}>
      {[1, 2].map((item) => (
        <div key={item} className={styles.discoverInfoRow}>
          {block(styles.discoverTeamName, item)}
          {block(styles.discoverShortText, item + 1)}
          {block(styles.discoverTeamName, item + 2)}
        </div>
      ))}
    </section>
    <div className={styles.discoverPills}>
      {[1, 2, 3, 4].map((item) => (
        <React.Fragment key={item}>{block(styles.discoverRoundPill, item)}</React.Fragment>
      ))}
    </div>
    <section className={styles.discoverPitch}>
      <div className={styles.discoverPitchHeader}>
        {block(styles.discoverTeamName)}
        {block(styles.discoverShortText, 2)}
        {block(styles.discoverTeamName, 3)}
      </div>
      <div className={styles.discoverPitchBody}>
        {[1, 2, 3, 4, 5, 6].map((row) => (
          <div key={row} className={styles.discoverPitchRow}>
            {[1, 2, 3].map((item) => (
              <div key={`${row}-${item}`} className={styles.discoverPlayer}>
                {block(styles.discoverPlayerAvatar, row + item)}
                {block(styles.discoverPlayerName, row + item + 1)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
    {[1, 2].map((item) => (
      <section key={item} className={styles.discoverCard}>
        <div className={styles.discoverPanelTitle}>{block(styles.discoverTitle, item)}</div>
        {[1, 2].map((row) => (
          <div key={row} className={styles.discoverLineUpRow}>
            {block(styles.discoverAvatar, row)}
            {block(styles.discoverWideText, row + 1)}
            {block(styles.discoverAvatar, row + 2)}
          </div>
        ))}
      </section>
    ))}
  </div>
);

const DiscoverSkeleton: React.FC<DiscoverSkeletonProps> = ({ type }) => {
  if (type === 'discoverLiveStreaming') return <DiscoverLiveStreamingSkeleton />;
  if (type === 'discoverLiveSituation') return <DiscoverLiveSituationSkeleton />;
  return <DiscoverLineUpSkeleton />;
};

export default React.memo(DiscoverSkeleton);

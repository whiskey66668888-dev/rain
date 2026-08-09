import React, { useMemo, useState } from 'react';
import clsx from 'clsx';

import Empty from '@/common/components/Empty';
import LazyImage from '@/common/components/LazyImage';
import type { LiveInfoItem, TeamLite } from '@/apis/origin/discover';
import {
  filterBroadcastList,
  getBroadcastFilterTabs,
  shouldShowLiveItemBackground,
} from '../../../utils/formatDiscoverData';
import { match_evn_img_map } from '../../constants';
import styles from './index.module.scss';

const fallbackLogo = '/images/common/logo_small.png';

const LiveTextPanel: React.FC<{ list: LiveInfoItem[]; homeTeam: TeamLite; awayTeam: TeamLite }> = ({
  list,
  homeTeam,
  awayTeam,
}) => {
  const [filterType, setFilterType] = useState('all');
  const tabs = useMemo(() => getBroadcastFilterTabs(list), [list]);
  const filteredList = useMemo(() => filterBroadcastList(list, filterType), [filterType, list]);

  const getTeamLogo = (position: string): string => {
    if (position === '1') return homeTeam.logo || fallbackLogo;
    if (position === '2') return awayTeam.logo || fallbackLogo;
    return '';
  };

  return (
    <div className={styles.textPanel}>
      {(filteredList.length > 0 || tabs.length > 1) && (
        <div className={styles.filterTabs}>
          {tabs.map((tab) => (
            <button
              key={tab.type}
              type="button"
              className={clsx(filterType === tab.type && styles.activeFilter)}
              onClick={() => setFilterType(tab.type)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      {filteredList.length === 0 ? (
        <Empty
          text="暂无文字直播"
          variant="card"
          className="h-[160px]"
          imgWrapClassName="w-[64px] h-[64px]"
          iconClassName="w-[30px] h-[30px]"
          textClassName="_tf[13]"
        />
      ) : (
        <div className={styles.timeline}>
          {filteredList.map((item, index) => {
            const icon = match_evn_img_map[Number(item.type)];
            const teamLogo = getTeamLogo(item.position);
            const hasHighlight = shouldShowLiveItemBackground(item.type);

            return (
              <div
                className={clsx(styles.liveItem, hasHighlight && styles.highlightItem)}
                key={`${item.time ?? ''}-${index}`}
              >
                <span className={styles.eventIcon}>{icon && <img src={icon} alt="" />}</span>
                <p className={clsx(hasHighlight && styles.highlightText)}>
                  {(item.data || '-').replaceAll(',', '，')}
                </p>
                {!hasHighlight && teamLogo && (
                  <LazyImage
                    src={teamLogo}
                    alt=""
                    width={20}
                    height={20}
                    lazy={false}
                    fallback={fallbackLogo}
                    className={styles.teamLogo}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LiveTextPanel;

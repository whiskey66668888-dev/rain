import React from 'react';
import clsx from 'clsx';

import LazyImage from '@/common/components/LazyImage';
import Icon from '@/common/components/Icon';
import { HomeListSwitch } from '@/apis/origin/homeList';
import { MergedBaseList } from '@/common/hooks/useHomeList';
import HorizontalScrollSection from '@/sites/op7/pages/LandingPage/components/HorizontalScrollSection';
import VenueMaintenanceMask from '@/sites/op7/components/VenueMaintenanceMask';

import styles from '../SportsPage.module.scss';

type SportsSection = MergedBaseList;
type SportsVenue = SportsSection['children'][number];

interface SportsMaintenancePageProps {
  sportsSection?: SportsSection;
  isLogin: boolean;
  onVenueClick: (venue: SportsVenue) => void;
}

const SportsMaintenancePage: React.FC<SportsMaintenancePageProps> = ({
  sportsSection,
  isLogin,
  onVenueClick,
}) => {
  const sportsVenues = sportsSection?.children ?? [];
  return (
    <div className={styles.sportsMaintenancePage}>
      <div className={styles.maintenancePanel}>
        <LazyImage src="/images/common/maintenance_top.png" width={110} height={103} />
        <div className="_tf[14] font-500 text-[var(--Text-Main-10)] flex items-center justify-center gap-4px">
          <Icon
            src="/images/common/maintenance_info.svg"
            size={15}
            color="var(--ThemeColor-Main)"
          />
          <span>{'OP7场馆升级中'}</span>
        </div>
      </div>
      <div
        className={`${styles.maintenanceTitle} _tf[11] flex flex-col items-center justify-center gap-4px leading-none`}
      >
        <span className="text-Text-800">更多体育场馆</span>

        <Icon
          src="/images/common/arrows_down.svg"
          size={10}
          color="var(--Text-700)"
          className="shrink-0"
        />
      </div>

      <HorizontalScrollSection
        className={styles.cardWrapper}
        title={sportsSection?.label ?? '体育'}
        labelList={sportsSection?.promotionList}
        hideHeader
        icon={
          <Icon
            size="18px"
            color="var(--ThemeColor-Main)"
            src={sportsSection?.icon || '/images/common/menu/sports/sports.svg'}
          />
        }
        listClassName={styles.cardContent}
        viewNav={false}
        listItemClassName={styles.cardItemWrapper}
      >
        {sportsVenues.map((venue) => {
          const hasMaintenanceNotice = Boolean(venue.maintenanceDesc?.trim());
          const normalizedSwitch = String(venue.switch) as HomeListSwitch;
          const isNormalWithNotice =
            normalizedSwitch === HomeListSwitch.NORMAL && hasMaintenanceNotice;

          return (
            <div
              className={`${styles.cardItem} ${styles[`gameId-${venue.gameId}`]} flex-shrink-0`}
              key={venue.gameId}
              onClick={() => onVenueClick(venue)}
            >
              {(normalizedSwitch !== HomeListSwitch.NORMAL || hasMaintenanceNotice) && isLogin && (
                <VenueMaintenanceMask
                  className={isNormalWithNotice ? styles.maintenanceNotice : styles.maintenance}
                  switch={venue.switch}
                  maintenanceDesc={venue.maintenanceDesc}
                />
              )}
              <LazyImage className={clsx(styles.cardImage)} src={venue.cardImage} />
            </div>
          );
        })}
      </HorizontalScrollSection>
    </div>
  );
};

export default SportsMaintenancePage;

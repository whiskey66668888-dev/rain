import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useVenueService } from '@/apis/commonSports';
import { useNoticeListQuery } from '@/apis/origin/noticeList';
import Icon from '@/common/components/Icon';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
// import HomeHotGamesSection from '@/sites/op7/components/home/HomeHotGamesSection';

import LandingPagePopups from './LandingPagePopups';
import styles from './LandingPage.module.scss';
import Footer from './components/Footer';
import HorizontalScrollSection from './components/HorizontalScrollSection';
import LatestGames from './components/LatestGames';
import ValueDeals from './components/ValueDeals';
import BannerSection from './components/banner';
import FeatureCards from './components/featureCards';
import SportsCard from '../../components/SportsCard';
import MobileDownloadAppBanner from '@/sites/op7/components/home/MobileDownloadAppBanner';
import { useAppSelector } from '@/core/store/hooks';
import skeletonStyles from '@/common/components/Skeleton/Skeleton.module.scss';

const LandingPage: React.FC = () => {
  const { data: popularEventsLiveList = [], isLoading: isPopularEventsLoading } =
    useVenueService().useGetRecommendMatchQuery({
      current: 1,
      type: 1,
      size: 20,
    });
  const hasPopularEvents = popularEventsLiveList.length > 0;
  const { t } = useTranslation();
  const navigate = useNavigateWithLanguage();
  const trialInterface = useAppSelector((state) => state.config.system.trialInterface);
  const [noticeBarOpenIndex, setNoticeBarOpenIndex] = useState<number | null>(null);
  const clearNoticeBarOpen = useCallback(() => setNoticeBarOpenIndex(null), []);
  const { data: noticeList = [], isFetched: noticeListReady } = useNoticeListQuery({ limit: 30 });
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);

  return (
    <section className={`${styles.landingPage} base-main-background`}>
      <LandingPagePopups
        noticeList={noticeList}
        noticeListReady={noticeListReady}
        isLogin={isLogin}
        noticeBarOpenIndex={noticeBarOpenIndex}
        onNoticeBarOpenHandled={clearNoticeBarOpen}
      />
      <div className="lg:max-w-1200px w-full mx-auto">
        <div className={styles.mainArea}>
          <BannerSection />
          {/* <HomeHotGamesSection /> */}

          {(isPopularEventsLoading || hasPopularEvents) && (
            <HorizontalScrollSection
              listClassName="!gap-12px"
              title={t('common.recommendedEvents')}
              icon={
                <Icon
                  size="18px"
                  color="var(--ThemeColor-Main)"
                  src="/images/common/recommend.svg"
                />
              }
              flushEndOnMobile
              viewAllText="全部"
              onViewAll={() => navigate(PATHS.sports)}
            >
              {isPopularEventsLoading
                ? Array.from({ length: 2 }).map((_, index) => (
                    <div
                      className={`${skeletonStyles.skeletonBase} h-154px w-351px rounded-10px`}
                      key={index}
                    />
                  ))
                : popularEventsLiveList.map((matchInfo, index: number) => (
                    <div className="h-154px w-351px" key={index}>
                      <SportsCard matchInfo={matchInfo} type="bigCard" />
                    </div>
                  ))}
            </HorizontalScrollSection>
          )}

          <FeatureCards />
          {trialInterface && <LatestGames />}
          <MobileDownloadAppBanner addTopSpacing={hasPopularEvents} />
          <ValueDeals />
          <Footer />
        </div>
      </div>
    </section>
  );
};

export default LandingPage;

import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';

import SportCard from './sportCard';
import SwiperFooter from './swiperFooter';
import RecommendItem from './recommendItem';

import { useMedia } from '../../hooks/useMedia';

import 'swiper/css';
import 'swiper/css/pagination';

import { useMatchWinnersQuery } from '@/apis/fbSports/getMatchWinner';
import type { MatchBaseInfo } from '@/apis/commonSports/types';
import type { VideoLine, MatchRecommendItem } from '../../type';
import type { MediaMode } from '../../hooks/useMedia';
import { useAppSelector } from '@/core/store/hooks';
import styles from './MatchInfo.module.scss';
import clsx from 'clsx';

/** 轮播单页高度（与首页 smallCard 一致） */

interface MatchInfoProps {
  /** 已格式化为统一 MatchBaseInfo（FB/OB 均可） */
  matchInfo: MatchBaseInfo;
  /** FB 初盘 winner 查询用；不传则跳过 */
  enableWinnerQuery?: boolean;
  /** 推荐列表，每项一页轮播（统计文案 + 快速投注标签） */
  recommendList?: MatchRecommendItem[];
  /** 视频线路列表 */
  videoLines?: VideoLine[];
  /** 动画 URL 列表 */
  animationUrls?: string[];
  /** 标签列表（用于视频播放器底部导航） */
  tabs?: string[];
  /** 当前激活的标签 */
  activeTab?: string;
  showSmallCard: boolean;
  pcSmallCardBounds?: { left: number; width: number } | null;
  meidaMode: MediaMode;
  isVideoVisible: boolean;
  /** 主区域数据板（比分/轮播）是否展示；与视频/动画播放态独立 */
  isDataBoardVisible?: boolean;
  /** 标签切换回调 */
  onTabChange?: (tab: string) => void;
  /** 点击推荐项盘口/赔率时调用，相当于点击详情列表对应赔率按钮 */
  onRecommendOddsClick?: (item: MatchRecommendItem) => void;
  /** 推荐项是否与投注单中同一注高亮（由 SportDetail 根据 selectedBets 实现） */
  isRecommendOddsSelected?: (item: MatchRecommendItem) => boolean;
  /** h5 模式下 播放动画或者视频  */
  onMediaPlay: (mediaMode: MediaMode) => void;
  /** 挂载在赛事大卡容器上，供页面上方根据真实高度计算 PC 小卡出现阈值 */
  bannerRef?: React.Ref<HTMLDivElement>;
}

/**
 * 赛事信息组件：头部轮播，第一页用 SportsCard（smallCard）；H5 后续页为推荐+快速投注，PC 仅首屏
 */
const MatchInfo: React.FC<MatchInfoProps> = ({
  matchInfo,
  enableWinnerQuery = false,
  recommendList = [],
  videoLines = [],
  animationUrls = [],
  tabs: _tabs = [],
  activeTab: _activeTab,
  showSmallCard: _showSmallCard,
  pcSmallCardBounds: _pcSmallCardBounds,
  meidaMode,
  isVideoVisible,
  isDataBoardVisible = true,
  onTabChange: _onTabChange,
  onRecommendOddsClick,
  isRecommendOddsSelected,
  onMediaPlay,
  bannerRef,
}) => {
  // 队名加粗：与 App 对齐，改用后端「初盘」winner；后端给不到时回退本地结果。
  const matchIds = useMemo(
    () => (enableWinnerQuery && matchInfo?.matchId != null ? [matchInfo.matchId] : []),
    [enableWinnerQuery, matchInfo?.matchId],
  );
  const matchWinners = useMatchWinnersQuery(matchIds);

  const formattedMatch = useMemo(() => {
    const winner = matchWinners[String(matchInfo?.matchId)];
    return {
      ...matchInfo,
      nameBold: winner ?? matchInfo.nameBold,
      matchPeriod: matchInfo.periodName ?? matchInfo.matchPeriod ?? '',
    };
  }, [matchInfo, matchWinners]);

  const { hasAnimation, hasVideo } = useMedia({
    videoLines,
    animationUrls,
  });

  /** 自动轮播开关（对应 Flutter buildSwiperAutoIcon） */
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const swiperRef = useRef<SwiperType | null>(null);
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  // 根据 screenBreakpoint 判断是否为移动端（md 为 H5，其他为 PC）
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  // const isWebFootballBoard = !isMobile && isFootballMatch(formattedMatch);

  const bannerItems = useMemo(() => {
    const firstSlide = <SportCard key="match" matchInfo={formattedMatch} isMobile={isMobile} />;
    if (!isMobile) {
      return [firstSlide];
    }
    const recommendSlides = recommendList.map((item, idx) => (
      <RecommendItem
        key={idx}
        item={item}
        onRecommendOddsClick={onRecommendOddsClick}
        isOddsSelected={isRecommendOddsSelected?.(item) ?? false}
      />
    ));

    return [firstSlide, ...recommendSlides];
  }, [formattedMatch, recommendList, onRecommendOddsClick, isRecommendOddsSelected, isMobile]);

  // 根据 isAutoPlay 控制 Swiper autoplay
  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper?.autoplay) return;
    if (isAutoPlay && bannerItems.length > 1) {
      swiper.autoplay.start();
    } else {
      swiper.autoplay.stop();
    }
  }, [isAutoPlay, bannerItems.length]);

  const stopAutoPlayOnUserSwipe = useCallback(() => {
    setIsAutoPlay(false);
  }, []);

  /** H5（md）不跟随 PC 顶栏「数据板」开关，始终按视频态决定是否展示 */
  const showDataBoard = !isVideoVisible && (isMobile || isDataBoardVisible);

  return (
    <>
      <div
        ref={bannerRef}
        className={clsx(
          styles.matchInfo,
          isVideoVisible ? styles.video : '',
          !showDataBoard && !isVideoVisible ? styles.dataBoardCollapsed : '',
        )}
      >
        {showDataBoard ? (
          <div className={clsx(styles.matchCard)}>
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={0}
              slidesPerView={1}
              loop={bannerItems.length > 1}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              onSliderFirstMove={stopAutoPlayOnUserSwipe}
              autoplay={
                isAutoPlay && bannerItems.length > 1
                  ? {
                      delay: 5000,
                      disableOnInteraction: true,
                      pauseOnMouseEnter: true,
                    }
                  : false
              }
              watchOverflow={false}
              observer={true}
              observeParents={true}
              pagination={
                isMobile
                  ? {
                      clickable: true,
                      dynamicBullets: false,
                      renderBullet: (_, className) =>
                        `<span class="${className} ${styles.customPagination_d}"></span>`,
                    }
                  : false
              }
              className={styles.infoBannerSwiper}
            >
              {bannerItems.map((item, index) => (
                <SwiperSlide key={index} className={styles.bannerSlide} style={{ width: '100%' }}>
                  {item}
                  {}{' '}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : null}
        {isMobile && (
          <SwiperFooter
            isMobile={isMobile}
            matchInfo={formattedMatch}
            showScore={true}
            isAutoPlay={isAutoPlay}
            toogleAutoPlay={setIsAutoPlay}
            mediaMode={meidaMode}
            hasAnimation={hasAnimation}
            hasVideo={hasVideo}
            onMediaPlay={onMediaPlay}
          />
        )}

        {/* <VideoPlayerWeb videoLines={videoLines} animationUrls={animationUrls} /> */}
      </div>
    </>
  );
};

export default MatchInfo;

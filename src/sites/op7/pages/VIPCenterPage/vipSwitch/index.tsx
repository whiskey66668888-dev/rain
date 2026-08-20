import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import 'swiper/css';

import 'swiper/css/navigation';
import styles from './index.module.scss';
import clsx from 'clsx';
import LazyImage from '@/common/components/LazyImage';
import { VipInfo, VipLevelInfo } from '@/apis/origin/vip/getVipinfo';
import CardProgress from '../CardProgress';
import { useAppSelector } from '@/core/store/hooks';
import VipLevelTabs from '../VipLevelTabs';

interface VipSwitchProps {
  vipData: VipInfo;
  setCheckData: React.Dispatch<React.SetStateAction<VipLevelInfo | undefined>>;
}

const findLevelIndex = (levelList: VipLevelInfo[] | undefined, level: number) =>
  levelList?.findIndex((item) => item.level === level) ?? -1;

const VipSwitch = ({ vipData, setCheckData }: VipSwitchProps) => {
  const vipSwitchRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(() =>
    findLevelIndex(vipData.levelList, vipData.level),
  );
  const [activeLevel, setActiveLevel] = useState(vipData.level);
  const [level, setLevel] = useState(0);
  const [betCash, setBetCash] = useState('0');
  const [nextLevel, setNextLevel] = useState(0);
  const [schedule, setSchedule] = useState('0');
  const progressBar1 = useRef<HTMLDivElement>(null);

  // ✅ 获取屏幕断点
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  useEffect(() => {
    const userLevelIndex = findLevelIndex(vipData.levelList, vipData.level);
    const initialIndex = userLevelIndex >= 0 ? userLevelIndex : 0;

    setLevel(vipData.level);
    setBetCash(vipData.betCash);
    setNextLevel(vipData.nextLevel);
    setSchedule(vipData.schedule);
    setActiveIndex(initialIndex);
    setActiveLevel(vipData.level);

    setTimeout(() => {
      swiperRef.current?.slideTo(initialIndex);
    }, 100);
  }, [vipData]);

  useEffect(() => {
    const root = vipSwitchRef.current;
    if (!root || typeof ResizeObserver === 'undefined') return;

    const cards = Array.from(root.querySelectorAll<HTMLElement>(`.${styles.vip_card}`));
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const card = entry.target as HTMLElement;
        card.style.setProperty('--vip-card-scale', String(entry.contentRect.width / 351));
      });
    });

    cards.forEach((card) => resizeObserver.observe(card));
    return () => resizeObserver.disconnect();
  }, [isMobile, vipData.levelList]);

  const handleTabClick = (level: number) => {
    const index = findLevelIndex(vipData.levelList, level);
    if (index < 0) return;

    setActiveLevel(level);
    setActiveIndex(index);
    swiperRef.current?.slideTo(index);

    const selectedLevel = vipData.levelList?.[index];
    if (selectedLevel) {
      setCheckData(selectedLevel);
    }
  };
  const renderCard = (item: VipLevelInfo, index: number) => {
    const progressFillColor = item.level > 7 ? '#F3C98B' : item.level > 3 ? '#935E5E' : '#1A81FF';
    const isMaxLevel = item.level >= 10;
    const isCurrentLevel = item.level === level;
    const isPreviewCard = !isCurrentLevel;
    // 最高等级或预览其他等级时展示保级流水；最高等级不展示「下一级所需流水」
    const showKeepBetInfo = item.level > 0 && (isPreviewCard || isMaxLevel);
    const showNextLevelBet = !isMaxLevel;
    const currentBetCash = isPreviewCard ? item.betCash : betCash;

    return (
      <div
        className={clsx(
          styles.vip_card,
          level < item.level ? styles.unfinish_card : null,
          styles[`nowMode${item.level}`],
        )}
      >
        <div className={styles.vip_card_content}>
          <div className={styles.nowLevelBox}>
            <div
              className={clsx(
                styles.vip_levelText,
                item.level <= 10 && item.level > 7 ? styles.vip_levelText_3 : null,
              )}
            >
              VIP{item.level}
            </div>
            <div
              className={clsx(
                styles.nowLevelMark,
                item.level <= 10 && item.level > 7 ? styles.nowLevelMark_2 : null,
              )}
            >
              {item.level === level ? '当前等级' : item.level > level ? '尚未达成' : '已达成'}
            </div>
          </div>

          <div className={styles.vip_levelIconContainer}>
            <LazyImage
              className={styles.vip_levelIcon}
              src={'/images/common/vip/vip_card_icon_' + item.level + '_actived.png'}
              alt={''}
            />
          </div>

          {item.level === level && level < 10 && (
            <div className={clsx(styles.progress_box)}>
              <div className={clsx(styles.userLevel, item.level > 7 ? styles.userLevel_2 : null)}>
                VIP{level}
              </div>
              <CardProgress
                num={Number(schedule)}
                index={0}
                progressBar={progressBar1}
                fillColor={progressFillColor}
                currentLevel={level}
              />
              <div
                className={clsx(
                  styles.userLevel,
                  styles.usernextLevel,
                  item.level > 7 ? styles.userLevel_2 : null,
                )}
              >
                VIP{nextLevel}
              </div>
            </div>
          )}

          <div
            className={clsx(
              styles.vip_bottom,
              isCurrentLevel && level < 10 ? styles.vip_bottom_active : '',
              isMaxLevel && !showNextLevelBet ? styles.vip_bottom_max : null,
            )}
          >
            <div
              className={clsx(
                styles.detail_card_fonts,
                isPreviewCard || isMaxLevel ? styles.detail_card_fonts_other : null,
                item.level <= 7 ? styles.detail_card_fonts_white : null,
              )}
            >
              {isPreviewCard ? '达标流水' : '当前流水'}&nbsp;
              <div
                className={clsx(
                  styles.detail_card_fonts_2,
                  item.level <= 7 ? styles.detail_card_fonts_2_white : null,
                )}
              >
                {currentBetCash}
              </div>
            </div>

            {showKeepBetInfo && (
              <>
                <div
                  className={clsx(
                    styles.detail_card_line,
                    item.level > 7 ? styles.detail_card_line_1 : styles.detail_card_line_2,
                  )}
                ></div>
                <div
                  className={clsx(
                    styles.detail_card_fonts,
                    styles.detail_card_fonts_center,
                    isPreviewCard || isMaxLevel ? styles.detail_card_fonts_other : null,
                    item.level <= 7 ? styles.detail_card_fonts_white : null,
                  )}
                >
                  保级流水(三个月)
                  <div
                    className={clsx(
                      styles.detail_card_fonts_2,
                      item.level <= 7 ? styles.detail_card_fonts_2_white : null,
                    )}
                  >
                    {item.keepBetCash}
                  </div>
                </div>
                {showNextLevelBet && (
                  <div
                    className={clsx(
                      styles.detail_card_line,
                      item.level > 7 ? styles.detail_card_line_1 : styles.detail_card_line_2,
                    )}
                  />
                )}
              </>
            )}

            {showNextLevelBet && (
              <div
                className={clsx(
                  styles.detail_card_fonts,
                  isPreviewCard ? styles.detail_card_fonts_other : null,
                  styles.detail_card_fonts_right,
                  item.level <= 7 ? styles.detail_card_fonts_white : null,
                )}
              >
                下一级所需流水&nbsp;
                <div
                  className={clsx(
                    styles.detail_card_fonts_2,
                    item.level <= 7 ? styles.detail_card_fonts_2_white : null,
                  )}
                >
                  {vipData?.levelList?.[index + 1]?.betCash ?? '--'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={vipSwitchRef} className={styles.vipSwitchBox}>
      {/* ✅ 使用独立的 VipLevelTabs 组件（原样式） */}
      <VipLevelTabs
        levelList={vipData?.levelList || []}
        activeLevel={activeLevel}
        currentLevel={level}
        onTabClick={handleTabClick}
      />
      <div className={styles.swiper_box_vip}>
        {vipData?.levelList?.length ? (
          <Swiper
            modules={[Navigation]}
            // ✅ 移动端 1 张，PC 端 3 张
            slidesPerView={isMobile ? 1 : 3}
            // ✅ 卡片间距
            spaceBetween={isMobile ? 0 : 12}
            // ✅ 居中显示
            centeredSlides={isMobile}
            centeredSlidesBounds={isMobile}
            // ✅ 循环播放
            loop={false}
            // ✅ 初始 Slide
            initialSlide={activeIndex}
            // ✅ 导航按钮（PC 端显示）
            navigation={
              isMobile ? false : { prevEl: '.swiper-button-prev', nextEl: '.swiper-button-next' }
            }
            // ✅ Swiper 实例回调
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            // ✅ Slide 切换回调
            onSlideChange={(swiper) => {
              const realIndex = swiper.realIndex;
              const selectedLevel = vipData?.levelList?.[realIndex];
              if (!selectedLevel) return;

              setActiveIndex(realIndex);
              setActiveLevel(selectedLevel.level);
              setCheckData(selectedLevel);
            }}
            className={styles.vipSwiper}
          >
            {vipData.levelList.map((item, index) => (
              <SwiperSlide
                key={index}
                className={clsx(
                  styles.vipSlide,
                  isMobile ? styles.vipSlideMobile : styles.vipSlideDesktop,
                )}
              >
                {renderCard(item, index)}
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <LazyImage src={'/images/common/vip/placeholder.png'} alt={''} />
        )}
      </div>
      {!isMobile && (
        <>
          <div className={clsx('swiper-button-prev', styles.swiperButtonPrev)}>
            <LazyImage src="/images/common/vip/arrow_left.png" alt="" width={14} height={14} />
          </div>
          <div className={clsx('swiper-button-next', styles.swiperButtonNext)}>
            <LazyImage src="/images/common/vip/arrow_right.png" alt="" width={14} height={14} />
          </div>
        </>
      )}
    </div>
  );
};

export default VipSwitch;

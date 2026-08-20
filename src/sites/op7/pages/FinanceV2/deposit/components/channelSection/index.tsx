import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/pagination';

import { ChannelItemV2 } from '@/apis/origin/finance/depositV2';
import Icon from '@/common/components/Icon';
import { useAppSelector } from '@/core/store/hooks';
import PermanentModal from '@/sites/op7/pages/Finance/components/permanentModal';

import styles from './index.module.scss';

interface ChannelSectionProps {
  list: ChannelItemV2[];
  activeIndex: number;
  inModal?: boolean;
  onChange: (index: number, item: ChannelItemV2) => void;
}

const MAX_ROWS = 2;

const chunkList = <T,>(arr: T[], size: number): T[][] => {
  if (size <= 0 || !arr.length) return arr.length ? [arr] : [];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const ChannelSection: React.FC<ChannelSectionProps> = ({
  list,
  activeIndex,
  inModal = false,
  onChange,
}) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const colsPerRow = isMobile || inModal ? 3 : 6;
  const itemsPerPage = colsPerRow * MAX_ROWS;

  const pages = useMemo(() => {
    if (list.length <= itemsPerPage) return [list];
    return chunkList(list, itemsPerPage);
  }, [itemsPerPage, list]);

  const renderPage = (pageItems: ChannelItemV2[], pageIndex: number) => (
    <div className={clsx(styles.channelGrid, colsPerRow === 3 ? styles.cols3 : styles.cols6)}>
      {pageItems.map((item, pageItemIndex) => {
        const index = pageIndex * itemsPerPage + pageItemIndex;
        return (
          <ChannelCard
            key={`${item.groupId}-${item.name}`}
            item={item}
            active={index === activeIndex}
            onClick={() => onChange(index, item)}
          />
        );
      })}
    </div>
  );

  return (
    <div className={styles.block}>
      <div className={styles.blockTitle}>
        <span className={styles.titleText}>充值方式</span>
        <PermanentModal />
      </div>
      <div className={styles.list}>
        {pages.length > 1 ? (
          <Swiper
            className={styles.swiper}
            modules={[Pagination]}
            slidesPerView={1}
            spaceBetween={0}
            pagination={{ clickable: true }}
          >
            {pages.map((pageItems, pageIndex) => (
              <SwiperSlide key={pageIndex}>{renderPage(pageItems, pageIndex)}</SwiperSlide>
            ))}
          </Swiper>
        ) : (
          renderPage(pages[0] ?? [], 0)
        )}
      </div>
    </div>
  );
};

interface ChannelCardProps {
  item: ChannelItemV2;
  active: boolean;
  onClick: () => void;
}

const formatRemain = (seconds: number): string => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const restSeconds = (safeSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${restSeconds}`;
};

const trimRate = (value: number): string => {
  return Number.isInteger(value) ? String(value) : String(value);
};

const ChannelCard: React.FC<ChannelCardProps> = ({ item, active, onClick }) => {
  const [remain, setRemain] = useState(item.lockTime);
  const locked = item.isLock === 1 && remain > 0;
  const needRealName = item.needRealName && !item.hasRealName;

  useEffect(() => {
    setRemain(item.lockTime);
  }, [item.groupId, item.isLock, item.lockTime]);

  useEffect(() => {
    if (!locked) return undefined;
    const timer = window.setInterval(() => {
      setRemain((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [locked]);

  return (
    <button
      type="button"
      className={clsx(styles.channelItem, active ? styles.active : '')}
      onClick={onClick}
    >
      {item.img ? <img src={item.img} alt="" /> : null}
      <div className={styles.channelContent}>
        <span>{item.name}</span>
        {item.bonusRate > 0 ? <em>加送{trimRate(item.bonusRate)}%</em> : null}
      </div>

      {locked ? (
        <div className={styles.mask}>
          <div className={styles.lockPill}>
            <i aria-hidden="true" />
            <span>锁定中</span>
          </div>
          <strong>{formatRemain(remain)}</strong>
        </div>
      ) : needRealName ? (
        <div className={styles.mask}>
          <div className={styles.realNamePill}>
            <span>实名认证</span>
            <Icon
              className={styles.realNameArrow}
              src="/images/common/single_arrow.svg"
              size={14}
              color="var(--White-100)"
            />
          </div>
        </div>
      ) : null}
    </button>
  );
};

export default ChannelSection;

import React, { useMemo } from 'react';
import clsx from 'clsx';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/pagination';

import { PayItem } from '@/apis/origin/finance/deposit';
import { useAppSelector } from '@/core/store/hooks';
import WalletChannelIcon from '@/sites/op7/components/WalletChannelIcon';

import PermanentModal from '../permanentModal';
import styles from './index.module.scss';

interface PayWayListProps {
  list?: PayItem[];
  payIdx: number;
  onChange: (val: number) => void;
  inModal?: boolean;
}

const MAX_ROWS = 2;
const virtualTutorialPayId = -1;

const chunkList = <T,>(arr: T[], size: number): T[][] => {
  if (size <= 0 || !arr.length) return arr.length ? [arr] : [];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const PayWayList: React.FC<PayWayListProps> = ({
  list = [],
  payIdx = 0,
  onChange,
  inModal = false,
}) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const colsPerRow = isMobile || inModal ? 3 : 6;
  const itemsPerPage = colsPerRow * MAX_ROWS;

  const pages = useMemo(() => {
    if (list.length <= itemsPerPage) return [list];
    return chunkList(list, itemsPerPage);
  }, [list, itemsPerPage]);

  const renderItem = (obj: PayItem, index: number) => (
    <div
      className={clsx(styles.item, index === payIdx ? styles.active : '')}
      key={obj.payId}
      onClick={() => onChange(index)}
    >
      {obj.payId === virtualTutorialPayId ? (
        <WalletChannelIcon
          type="virtual"
          selected
          size={16}
          backgroundSize={20}
          selectedBackgroundFill="var(--ThemeColor-Main)"
          selectedIconColor="var(--ThemeColor-Main)"
        />
      ) : (
        <img src={obj.payImage} alt={obj.payName} />
      )}
      <span className={styles.label}>{obj.payName}</span>
      {obj.cashMax > 0 ? (
        <span className={styles.amount}>
          {obj.cashMin}-{obj.cashMax}
        </span>
      ) : null}
    </div>
  );

  const renderPage = (pageItems: PayItem[], pageIndex: number) => (
    <div className={clsx(styles.listWrap, isMobile || inModal ? styles.cols3 : styles.cols6)}>
      {pageItems.map((obj, pageItemIndex) =>
        renderItem(obj, pageIndex * itemsPerPage + pageItemIndex),
      )}
    </div>
  );

  return (
    <div className={clsx(styles.payWayList, !inModal ? styles.autoPC : '')}>
      <div className={styles.title}>
        <span>充值方式</span>
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

export default PayWayList;

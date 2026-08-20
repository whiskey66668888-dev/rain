import React, { useMemo } from 'react';
import clsx from 'clsx';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/pagination';

import { ChannelItemV2 } from '@/apis/origin/finance/depositV2';
import Icon from '@/common/components/Icon';
import { useAppSelector } from '@/core/store/hooks';

import { filterAmount, type FooterText } from '../../utils';
import styles from './index.module.scss';

const MAX_ROWS = 2;

const chunkList = <T,>(arr: T[], size: number): T[][] => {
  if (size <= 0 || !arr.length) return arr.length ? [arr] : [];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

interface AmountSectionProps {
  channelItem: ChannelItemV2;
  amount: string;
  footerText: FooterText;
  isUsdt: boolean;
  usdtRate: string;
  usdtNum: string;
  isUsdtRateRefreshing: boolean;
  inModal?: boolean;
  onAmountChange: (value: string) => void;
  onRefreshUsdtRate: () => Promise<void>;
}

const AmountSection: React.FC<AmountSectionProps> = ({
  channelItem,
  amount,
  footerText,
  isUsdt,
  usdtRate,
  usdtNum,
  isUsdtRateRefreshing,
  inModal = false,
  onAmountChange,
  onRefreshUsdtRate,
}) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const colsPerRow = isMobile || inModal ? 4 : 8;
  const itemsPerPage = colsPerRow * MAX_ROWS;
  const cashList = channelItem.cashList;

  const pages = useMemo(() => {
    if (cashList.length <= itemsPerPage) return [cashList];
    return chunkList(cashList, itemsPerPage);
  }, [cashList, itemsPerPage]);

  const renderPage = (pageItems: string[]) => (
    <div className={clsx(styles.amountList, colsPerRow === 4 ? styles.cols4 : styles.cols8)}>
      {pageItems.map((item) => (
        <button
          type="button"
          key={item}
          className={amount === item ? styles.active : ''}
          onClick={() => onAmountChange(filterAmount(item))}
        >
          ￥{item}
        </button>
      ))}
    </div>
  );

  return (
    <div className={styles.block}>
      <div className={styles.blockTitle}>
        <span>充值金额</span>
        {isUsdt ? (
          <div className={styles.rate}>
            <b>1.00 USDT ≈ {usdtRate} CNY</b>
            <button
              type="button"
              className={styles.refreshButton}
              aria-label="刷新 USDT 汇率"
              disabled={isUsdtRateRefreshing}
              onClick={() => void onRefreshUsdtRate()}
            >
              <Icon
                src="/images/common/refresh.svg"
                size="12px"
                color="var(--ThemeColor-Main)"
                className={isUsdtRateRefreshing ? styles.refreshing : ''}
              />
            </button>
          </div>
        ) : null}
      </div>
      {cashList.length > 0 ? (
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
                <SwiperSlide key={pageIndex}>{renderPage(pageItems)}</SwiperSlide>
              ))}
            </Swiper>
          ) : (
            renderPage(pages[0] ?? [])
          )}
        </div>
      ) : null}
      <div className={clsx(styles.amountInput, footerText.isError ? styles.error : '')}>
        <span>￥</span>
        <div className={styles.line}></div>
        <input
          value={amount}
          inputMode="decimal"
          placeholder={footerText.label}
          onChange={(event) => onAmountChange(filterAmount(event.target.value))}
        />
        <button type="button" onClick={() => onAmountChange(String(channelItem.maxAmount))}>
          最大
        </button>
      </div>
      {isUsdt ? (
        <div className={styles.rateInfo}>
          <span>充值金额</span>
          <strong>{amount ? usdtNum : '0.00'} USDT</strong>
        </div>
      ) : (
        <div className={styles.bottomSpace} />
      )}
    </div>
  );
};

export default AmountSection;

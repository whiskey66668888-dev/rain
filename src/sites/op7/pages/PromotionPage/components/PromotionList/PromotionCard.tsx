'use client';

import styles from './PromotionCard.module.scss';
import LazyImage from '@/common/components/LazyImage';
import { DiscountItem } from '@/apis/origin/promotion/getDiscountList';
import dayjs from 'dayjs';
import { useAppSelector } from '@/core/store/hooks';
import { getSystemTheme } from '@/utils';

interface Props {
  item: DiscountItem;
  onClick?: (item: DiscountItem) => void;
}

const PromotionCard = ({ item, onClick }: Props) => {
  const safeItem: DiscountItem = item; // 显式声明
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;

  return (
    <div className={styles.card} onClick={() => onClick?.(safeItem)}>
      <div className={styles.imageWrapper}>
        <LazyImage
          src={safeItem.imageUrl}
          aspectRatio="5/2"
          placeholder={<img src={`/images/${theme}/discount_lazy_new.png`}></img>}
        />
      </div>
      <div className={styles.footer}>
        <div className={styles.time}>
          截止时间：{dayjs(safeItem.endTime).format('YYYY/MM/DD') ?? '未知'}
        </div>
      </div>
    </div>
  );
};

export default PromotionCard;

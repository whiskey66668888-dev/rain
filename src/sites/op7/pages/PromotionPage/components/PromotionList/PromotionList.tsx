'use client';

import styles from './PromotionList.module.scss';
import PromotionCard from './PromotionCard';
import { DiscountItem } from '@/apis/origin/promotion/getDiscountList';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import { generatePath } from 'react-router-dom';
import { useAppSelector } from '@/core/store/hooks';
import { useMemo } from 'react';
import { useAuthNavigate } from '@/common/hooks/useAuthNavigate';
import { useSearchParams } from 'react-router-dom';
interface Props {
  data: DiscountItem[];
}

const PromotionList = ({ data }: Props) => {
  const navigate = useNavigateWithLanguage();
  const authNavigate = useAuthNavigate();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  return (
    <div className={styles.list}>
      <div className={styles.list_container}>
        {data.map((item) => (
          <PromotionCard
            key={item.id}
            item={item}
            onClick={() => {
              if (!isLogin) {
                return (
                  authNavigate(
                    `${PATHS.promotionDiscount}?${category ? `category=${category}` : ''}`,
                  ),
                  { replace: true }
                );
              }

              if (item.id === 297) {
                navigate(PATHS.mineInviteFriends);
                return;
              }
              if (isMobile) {
                return navigate(generatePath(PATHS.discountDetail, { id: String(item.id) }));
              }
              window.open(generatePath(PATHS.PcDiscountDetail, { id: String(item.id) }), '_blank');
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default PromotionList;

import { generatePath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMemoizedFn } from 'ahooks';

import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { useAppSelector } from '@/core/store/hooks';
import { PATHS } from '@/sites/op7/routes/paths';

/**
 * 打开优惠活动，行为与 PromotionList 一致：H5 内跳，PC 新标签页
 */
export function useOpenDiscountActivity() {
  const navigate = useNavigateWithLanguage();
  const { i18n } = useTranslation();
  const isMobile = useAppSelector((state) => state.config.isMobile);

  const openDiscountDetail = useMemoizedFn((id: string | number) => {
    const idStr = String(id);
    if (idStr === '297') {
      navigate(PATHS.mineInviteFriends);
      return;
    }
    if (isMobile) {
      navigate(generatePath(PATHS.discountDetail, { id: idStr }));
      return;
    }
    window.open(
      `/${i18n.language}${generatePath(PATHS.PcDiscountDetail, { id: idStr })}`,
      '_blank',
    );
  });

  const openPromotionCategory = useMemoizedFn((categoryId: string | number) => {
    const path = `${PATHS.promotionDiscount}?category=${categoryId}`;
    if (isMobile) {
      navigate(path);
      return;
    }
    window.open(`/${i18n.language}${path}`, '_blank');
  });

  return { openDiscountDetail, openPromotionCategory, isMobile };
}

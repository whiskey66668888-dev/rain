import React from 'react';
import { generatePath } from 'react-router-dom';

import Icon from '@/common/components/Icon';
import LazyImage from '@/common/components/LazyImage';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { useAppSelector } from '@/core/store/hooks';
import { PATHS } from '@/sites/op7/routes/paths';
import { getSystemTheme } from '@/utils';
import clsx from 'clsx';
import skeletonStyles from '@/common/components/Skeleton/Skeleton.module.scss';
import HorizontalScrollSection from '../HorizontalScrollSection';
import { ClientOnly } from '../../../../../../common/components/ClientOnly';

const DISCOUNT_IDS = ['11', '238', '297', '309', '286'] as const;
const DISCOUNT_IMAGE: string[] = [
  '/images/light/landing/value-deals/11.webp',
  '/images/light/landing/value-deals/apphb.webp',
  '/images/light/landing/value-deals/1056288.webp',
  '/images/light/landing/value-deals/252BB.webp',
  '/images/light/landing/value-deals/286.webp',
] as const;
const DISCOUNT_IMAGE_DARK: string[] = [
  '/images/dark/landing/value-deals/11.webp',
  '/images/dark/landing/value-deals/apphb.webp',
  '/images/dark/landing/value-deals/1056288.webp',
  '/images/dark/landing/value-deals/252BB.webp',
  '/images/dark/landing/value-deals/286.webp',
] as const;

const ValueDeals: React.FC = () => {
  const navigate = useNavigateWithLanguage();
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const discountImages = theme === 'dark' ? DISCOUNT_IMAGE_DARK : DISCOUNT_IMAGE;
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const handleTabClick = (id: string) => {
    if (id === '297') {
      navigate(PATHS.mineInviteFriends);
      return;
    }
    if (isMobile) {
      return navigate(generatePath(PATHS.discountDetail, { id: String(id) }));
    }
    window.open(generatePath(PATHS.PcDiscountDetail, { id: String(id) }), '_blank');
  };
  return (
    <HorizontalScrollSection
      title="超值优惠"
      icon={
        <Icon size="18px" color="var(--ThemeColor-Main)" src="/images/common/menu/promotion.svg" />
      }
      viewAllText="全部"
      onViewAll={() => navigate(PATHS.promotionDiscount)}
      className="mt-16px"
      flushEndOnMobile
    >
      {DISCOUNT_IDS.map((id, idx) => (
        <button
          key={id}
          type="button"
          className="aspect-[390/156] w-[calc(100vw-24px)] max-w-390px cursor-pointer overflow-hidden rounded-12px border-none bg-[var(--Background-100)] p-0 shadow-none lg:w-390px"
          onClick={() => handleTabClick(id)}
        >
          <ClientOnly
            fallback={
              <div
                className={clsx(
                  skeletonStyles.skeletonBase,
                  'w-full h-full object-cover rounded-8px',
                )}
              />
            }
          >
            <LazyImage
              src={discountImages[idx]!}
              alt={`discount-${id}`}
              className="h-full w-full object-cover"
              lazy={false}
            />
          </ClientOnly>
        </button>
      ))}
    </HorizontalScrollSection>
  );
};

export default ValueDeals;

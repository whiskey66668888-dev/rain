'use client';
import styles from '../PromotionPage.module.scss';
import PromotionList from '../components/PromotionList/PromotionList';
import SecondaryTabs from '../components/SecondaryTabs/SecondaryTabs';
import {
  useDiscountListQuery,
  useDiscountTypeQuery,
} from '@/apis/origin/promotion/getDiscountList';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Empty from '@/common/components/Empty';
import DiscountCompnentSkeleton from '@/common/components/Skeleton/promotion/DiscountCompnentSkeleton';
import SecondaryTabsSkeleton from '@/common/components/Skeleton/promotion/SecondaryTabsSkeleton';
import { ClientOnly } from '@/common/components/ClientOnly';
import { useAppSelector } from '@/core/store/hooks';
import { getSystemTheme } from '@/utils';
import MyPullToRefresh from '@/common/components/MyPullToRefresh';

const SponsorPage = () => {
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const [searchParams, setSearchParams] = useSearchParams();

  // 二级 Tabs
  const { data: discountTypes } = useDiscountTypeQuery();

  // SSR/客户端初始值统一为 ''，避免 hydration mismatch
  // mount 后再从 URL ?category= 或接口 default 字段恢复选中项
  const [categoryTab, setCategoryTab] = useState('');

  useEffect(() => {
    if (!discountTypes?.length) return;
    // URL 优先，其次取接口返回的 default 项，最后兜底第一项
    const fromUrl = searchParams.get('category');
    if (fromUrl) {
      setCategoryTab(fromUrl);
      return;
    }
    const defaultItem = discountTypes.find((item) => item.default) ?? discountTypes[0];
    if (defaultItem) setCategoryTab(String(defaultItem.typeId));
  }, [discountTypes, searchParams]);

  const {
    data: promotionList,
    isLoading: promotionLoading,
    refetch: refetchPromotionList,
  } = useDiscountListQuery(Number(categoryTab), theme);

  const handleCategoryChange = (val: string) => {
    setCategoryTab(val);
    setSearchParams({ category: val });
  };

  return (
    <React.Fragment>
      {discountTypes ? (
        <SecondaryTabs
          tabs={discountTypes.map((t) => ({ label: t.name, value: String(t.typeId) })) || []}
          active={categoryTab}
          onChange={handleCategoryChange}
        />
      ) : (
        <SecondaryTabsSkeleton />
      )}
      <div className={styles.promotionList_box}>
        <MyPullToRefresh
          disabled={promotionLoading || !categoryTab}
          threshold={30}
          onRefresh={async () => {
            await refetchPromotionList();
          }}
        >
          {promotionLoading ? (
            <DiscountCompnentSkeleton />
          ) : promotionList?.length ? (
            <PromotionList data={promotionList} />
          ) : (
            <div className={styles.empty_box}>
              <ClientOnly>
                <Empty />
              </ClientOnly>
            </div>
          )}
        </MyPullToRefresh>
      </div>
    </React.Fragment>
  );
};

export default SponsorPage;

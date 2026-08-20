/* ============================= */
/* ===== 一级 Tabs 类型 ===== */
/* ============================= */

import { PATHS } from '@/sites/op7/routes/paths';
import type { SocialConfigResponse } from '@/apis/origin/social/getSocialConfig';

export type PrimaryTabType =
  | 'sponsor'
  | 'hotEventApp'
  | 'discount'
  | 'momentsPublic'
  | 'momentsOfficial';

export type PrimaryTabItem = {
  label: string;
  value: PrimaryTabType;
  path: string;
};

export const PRIMARY_TABS: PrimaryTabItem[] = [
  { label: '热门', value: 'hotEventApp', path: PATHS.promotionHotEvent },
  { label: '赞助', value: 'sponsor', path: PATHS.promotionSponsor },
  { label: '优惠', value: 'discount', path: PATHS.promotionDiscount },
  { label: '朋友圈', value: 'momentsPublic', path: PATHS.promotionMomentsPublic },
  { label: '官方动态', value: 'momentsOfficial', path: PATHS.promotionMomentsOfficial },
];

export const PRIMARY_TABS_PC: PrimaryTabItem[] = [
  { label: '热门', value: 'hotEventApp', path: PATHS.promotionHotEvent },
  { label: '赞助', value: 'sponsor', path: PATHS.promotionSponsor },
  { label: '优惠', value: 'discount', path: PATHS.promotionDiscount },
];

/** 根据朋友圈全局配置过滤一级 Tab */
export const filterPrimaryTabsBySocialConfig = (
  tabs: PrimaryTabItem[],
  config: SocialConfigResponse | null | undefined,
): PrimaryTabItem[] =>
  tabs.filter((tab) => {
    if (tab.value === 'momentsPublic') {
      return config?.is_open_social?.itemValue === '1';
    }
    if (tab.value === 'momentsOfficial') {
      return config?.is_open_official_social?.itemValue === '1';
    }
    return true;
  });

/* ============================= */
/* ===== 二级 Tabs 类型 ===== */
/* ============================= */

export type CategoryTabType = 'sport' | 'casino' | 'slot';

export const CATEGORY_TABS: {
  label: string;
  value: CategoryTabType;
}[] = [
  { label: '体育', value: 'sport' },
  { label: '真人', value: 'casino' },
  { label: '电子', value: 'slot' },
];

/* ============================= */
/* ===== Mock Sponsor 数据 ===== */
/* ============================= */

export const MOCK_SPONSOR_LIST = [
  {
    id: 1,
    image: '/images/common/menu/sports/op_1.png',
  },
  {
    id: 2,
    image: '/images/common/menu/sports/op_1.png',
  },
];

/* ============================= */
/* ===== Mock Promotion 数据 ===== */
/* ============================= */

export const MOCK_PROMOTION_LIST = [
  {
    id: 1,
    title: '首存 100% 红利',
    image: '/images/common/menu/sports/op_1.png',
    tag: 'HOT',
  },
  {
    id: 2,
    title: '体育返水最高 1.5%',
    image: '/images/common/menu/sports/op_1.png',
  },
  {
    id: 3,
    title: '真人每日红包',
    image: '/images/common/menu/sports/op_1.png',
    tag: 'NEW',
  },
];

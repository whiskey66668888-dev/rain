import { lazy } from 'react';
import type { LazyExoticComponent, ComponentType } from 'react';
import type { DiscountDetail as DiscountDetailInfo } from '@/apis/origin/promotion/discountDeatil';

export interface DiscountActivityProps {
  discountInfo?: DiscountDetailInfo;
}

export type DiscountActivityComponent = LazyExoticComponent<ComponentType<DiscountActivityProps>>;

export const activityRegistry: Record<string, DiscountActivityComponent> = {
  '1': lazy(() => import('./activities/Activity311')),
  '311': lazy(() => import('./activities/Activity311')),
  // '2': lazy(() => import('./activities/Activity2')),
};

export const getDiscountActivityComponent = (id?: string) => {
  if (!id) {
    return null;
  }

  return activityRegistry[id] ?? null;
};

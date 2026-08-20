import type { ReactNode } from 'react';
import { createContextStore, shallowEqual } from '@/common/hooks/createContextStore';
import type { TUseVenueBetData } from '@/common/hooks/bet/useVenueBetData';

const bettingDataStore = createContextStore<TUseVenueBetData>('BettingData');

export function BettingDataProvider({
  value,
  children,
}: {
  value: TUseVenueBetData;
  children: ReactNode;
}) {
  return <bettingDataStore.Provider value={value}>{children}</bettingDataStore.Provider>;
}

export function useBettingDataSelector<S>(
  selector: (state: TUseVenueBetData) => S,
  isEqual: (left: S, right: S) => boolean = Object.is,
): S {
  return bettingDataStore.useSelector(selector, isEqual);
}

export function useBettingDataFields<K extends keyof TUseVenueBetData>(
  ...keys: K[]
): Pick<TUseVenueBetData, K> {
  return bettingDataStore.useFields(...keys);
}

export function useBettingDataGet(): () => TUseVenueBetData {
  return bettingDataStore.useGet();
}

export { shallowEqual };

/** 订阅整份投注数据。高频组件请改用 useBettingDataFields / useBettingDataSelector，避免金额输入带动整个面板重渲染 */
export function useBettingData(): TUseVenueBetData {
  return useBettingDataSelector((state: TUseVenueBetData): TUseVenueBetData => state);
}

/** @deprecated 使用 BettingDataProvider */
export const BettingDataContext = {
  Provider: BettingDataProvider,
};

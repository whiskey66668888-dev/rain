import { useSyncExternalStore } from 'react';

import type { TBetHistoryOrderItem } from '@/apis/commonSports/types';

export interface BetShareState {
  open: boolean;
  order: TBetHistoryOrderItem | null;
  venueId?: string;
}

let state: BetShareState = { open: false, order: null };
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

/** 打开注单分享弹窗（任意入口调用：H5 卡片 / 侧边注单 / PC 注单历史表格） */
export const openBetShare = (order: TBetHistoryOrderItem, venueId?: string): void => {
  state = { open: true, order, venueId };
  emit();
};

/** 关闭（保留 order 供退场动画渲染，destroyOnClose 会卸载内容） */
export const closeBetShare = (): void => {
  state = { ...state, open: false };
  emit();
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

const getSnapshot = () => state;

export const useBetShareState = (): BetShareState =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

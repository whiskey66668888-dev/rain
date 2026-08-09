import { useSyncExternalStore } from 'react';

import type { FullScreenLoadingProps } from '.';

export type FullScreenLoadingOptions = Pick<FullScreenLoadingProps, 'text' | 'width'>;

export interface FullScreenLoadingState extends FullScreenLoadingOptions {
  open: boolean;
}

const CLOSED: FullScreenLoadingState = { open: false };

let state: FullScreenLoadingState = CLOSED;
const listeners = new Set<() => void>();
/** 用引用计数而非布尔量：并发请求各自 show/hide 时不会被先结束的那个提前关掉 */
const tokens = new Map<symbol, FullScreenLoadingOptions>();

const emit = (): void => listeners.forEach((l) => l());

const sync = (): void => {
  const all = [...tokens.values()];
  // 多个并发调用时以最后一次的配置为准
  state = all.length ? { open: true, ...all[all.length - 1] } : CLOSED;
  emit();
};

/**
 * 显示全屏 loading，返回关闭函数。
 * 务必在 finally 里调用返回值，否则 loading 不会消失（或直接用 withLoading）。
 */
export const showLoading = (options: FullScreenLoadingOptions = {}): (() => void) => {
  const token = Symbol('fullScreenLoading');
  tokens.set(token, options);
  sync();
  return () => {
    if (tokens.delete(token)) sync();
  };
};

/** 强制关闭所有在途 loading（异常兜底用，正常流程请用 showLoading 的返回值） */
export const hideLoading = (): void => {
  if (!tokens.size) return;
  tokens.clear();
  sync();
};

/** 包住一个异步任务，成功/失败都会自动关闭 loading */
export const withLoading = async <T>(
  task: () => Promise<T>,
  options?: FullScreenLoadingOptions,
): Promise<T> => {
  const close = showLoading(options);
  try {
    return await task();
  } finally {
    close();
  }
};

const subscribe = (l: () => void): (() => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

const getSnapshot = (): FullScreenLoadingState => state;

export const useFullScreenLoadingState = (): FullScreenLoadingState =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

import { isSSR } from '@/utils/env';

/** SSR 安全入口：动态加载仅浏览器可用的友盟实现 */
function loadUmengClient(): Promise<typeof import('./umeng.client')> {
  return import('./umeng.client');
}

export function initUmengApm(): void {
  if (isSSR()) return;
  void loadUmengClient().then((m) => m.initUmengApm());
}

export function reportUmengException(error: unknown): void {
  if (isSSR()) return;
  void loadUmengClient().then((m) => m.reportUmengException(error));
}

export async function isUmengApmInitialized(): Promise<boolean> {
  if (isSSR()) return false;
  const m = await loadUmengClient();
  return m.isUmengApmInitialized();
}

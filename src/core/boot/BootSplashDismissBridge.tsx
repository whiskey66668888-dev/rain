import { useMatches } from 'react-router-dom';

import type { RouteHandle } from '@/common/router/config';

import { useMarkBootAppReady } from './useMarkBootAppReady';

/**
 * 无站点 MainLayout 的独立路由（PC 优惠详情、赞助、注单等）需在此关闭开屏，
 * 否则会一直显示 index.html 的 #boot-shield。
 */
export function BootSplashDismissBridge(): null {
  const matches = useMatches();
  const underSiteMainLayout = matches.some(
    (match) => (match.handle as RouteHandle | undefined)?.siteMainLayout === true,
  );

  useMarkBootAppReady(!underSiteMainLayout);

  return null;
}

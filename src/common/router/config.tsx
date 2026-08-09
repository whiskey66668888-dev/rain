import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

export interface RouteHandle {
  h5ShowHeader?: boolean; // 是否在 H5 端展示头部导航，默认不展示
  h5ShowFooter?: boolean; // 是否在 H5 端展示底部导航，默认不展示
  h5NoBottomMenu?: boolean; // 是否在 H5 端隐藏底部菜单，默认不隐藏
  module?: string; // 所属模块名称
  showBet?: boolean; // 是否显示投注模块，只有体育相关几个页面需要显示投注模块
  autoTransferPage?: boolean; // 开启自动免转时，是否需要自动转账的页面，
  requiresAuth?: boolean; // 是否需要登录后才能访问
  lineGradient?: boolean; // 是否需要渐变背景
  noPageSkeleton?: boolean; // 子路由/子组件有自己的骨架屏，当前路由无需页面级骨架屏（Suspense fallback=null）
  /** 是否挂在站点带顶底栏的 MainLayout 下（用于开屏关闭逻辑） */
  siteMainLayout?: boolean;
}
/**
 * 路由配置接口
 * @param path 相对于父路由的路径
 * @param element 路由组件
 * @param children 嵌套子路由
 */
export interface RouteConfig {
  path: string;
  element: ComponentType | LazyExoticComponent<ComponentType>;
  children?: RouteConfig[];

  /** 路由元信息（用于 layout 控制） */
  handle?: RouteHandle;
}

/**
 * 公共路由配置
 */
export const commonRoutes: RouteConfig[] = [
  {
    path: 'not-found',
    element: lazy(() => import('@/common/pages/NotFoundPage')),
  },
  {
    path: 'accessRest',
    element: lazy(() => import('@/common/pages/AccessRestPage')),
  },
];

/**
 * 将公共路由和站点路由合并，站点路由优先级更高
 *
 * @param common 公共路由配置
 * @param site 站点路由配置
 * @returns 合并后的路由配置
 */
export function deepMergeRoutes(common: RouteConfig[], site: RouteConfig[]): RouteConfig[] {
  const merged: RouteConfig[] = [...common];

  for (const siteRoute of site) {
    const existingIndex = merged.findIndex((r) => r.path === siteRoute.path);

    if (existingIndex >= 0) {
      const existing = merged[existingIndex];
      if (existing) {
        merged[existingIndex] = {
          ...existing,
          ...siteRoute,
          children: siteRoute.children
            ? deepMergeRoutes(existing.children || [], siteRoute.children)
            : existing.children,
        };
      }
    } else {
      merged.push(siteRoute);
    }
  }

  return merged;
}

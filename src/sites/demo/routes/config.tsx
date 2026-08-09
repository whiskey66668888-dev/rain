import { lazy } from 'react';

import { commonRoutes, deepMergeRoutes, type RouteConfig } from '@/common/router/config';

/**
 * 站点私有路由配置
 */
const siteRoutes: RouteConfig[] = [
  {
    path: '', // 一级路由：RootPage（包含导航和底部）
    element: lazy(() => import('../pages/RootPage')),
    children: [
      // 二级路由
      {
        path: '', // 首页
        element: lazy(() => import('../pages/HomePage')),
      },
      {
        path: 'sports', // 体育页面
        element: lazy(() => import('../pages/SportsPage')),
      },
      {
        path: 'user', // 用户页面
        element: lazy(() => import('../pages/UserPage')),
        children: [
          // 三级路由
          {
            path: '', // 默认显示 Profile
            element: lazy(() => import('../pages/UserPage/ProfilePage')),
          },
          {
            path: 'profile', // 用户资料
            element: lazy(() => import('../pages/UserPage/ProfilePage')),
          },
          {
            path: 'settings', // 用户设置
            element: lazy(() => import('../pages/UserPage/SettingsPage')),
          },
        ],
      },
      {
        path: 'system',
        element: lazy(() => import('../pages/SystemPage')),
      },
    ],
  },
  {
    path: 'login',
    element: lazy(() => import('../pages/LoginPage')),
  },
];

// 导出合并后的路由配置
export default deepMergeRoutes(commonRoutes, siteRoutes);

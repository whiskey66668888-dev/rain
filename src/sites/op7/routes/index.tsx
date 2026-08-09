import React, { Suspense, useEffect } from 'react';
import { Navigate, useRouteError } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ClientOnly } from '@/common/components/ClientOnly';
import { LanguageRouteWrapper } from '@/common/router';
import ProtectedRoute from '@/common/router/ProtectedRoute';
import type { RouteConfig } from '@/common/router/config';
import PageLoading from '@/common/components/Skeleton/PageLoading';

import App from '../App';
import routes from './config';

/** Data Router 根错误边界，替代默认的 "Hey developer" 页面 */
const RootErrorBoundary: React.FC = () => {
  const error = useRouteError();
  console.error('[RootErrorBoundary]', error);

  useEffect(() => {
    if (error == null) return;
    void import('@/core/apm/umeng.client').then((m) => m.reportUmengException(error));
  }, [error]);

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2>Something went wrong</h2>
      <button onClick={() => window.location.reload()}>Reload</button>
    </div>
  );
};

const NotFoundRedirect: React.FC = () => {
  const { i18n } = useTranslation();
  return (
    <ClientOnly>
      <Navigate to={`/${i18n.language}/not-found`} replace />
    </ClientOnly>
  );
};

/** 检查是否为 React.lazy() 返回的懒加载组件 */
function isLazyComponent(element: unknown): boolean {
  return (
    typeof element === 'object' &&
    element !== null &&
    (element as { $$typeof?: symbol }).$$typeof === Symbol.for('react.lazy')
  );
}

/**
 * 将 RouteConfig[] 转换为 Data Router 的 RouteObject[]
 *
 * - config.tsx 中 path 可以是完整路径（如 '/mine/deposit'），
 *   此函数会自动剥离父级前缀，提取 React Router 需要的相对段（'deposit'）
 * - layout 路由（path 为空且有 children）→ pathless 路由
 * - leaf 路由（path 为空且无 children）→ index: true
 */
function buildRouteObjects(routes: RouteConfig[], parentPath = ''): RouteObject[] {
  return routes.map((route) => {
    const Element = route.element as React.ComponentType;
    const rawPath = route.path || '';
    // 从完整路径剥离父级前缀：'/mine/deposit' 在 parentPath='mine' 下 → 'deposit'
    const segment =
      parentPath && rawPath.startsWith(`/${parentPath}/`)
        ? rawPath.slice(parentPath.length + 2)
        : rawPath.replace(/^\//, '');
    const fullPath = parentPath ? `${parentPath}/${segment}` : segment;

    const inner = route.handle?.requiresAuth ? (
      <ProtectedRoute>
        <Element />
      </ProtectedRoute>
    ) : (
      <Element />
    );

    // 只对 lazy() 组件包 Suspense；同步组件包 Suspense 会导致 SSR 水合 mismatch
    // noPageSkeleton=true 表示子路由/子组件有自己的骨架屏，无需页面级骨架屏，避免双重闪烁
    const noPageSkeleton = !!route.handle?.noPageSkeleton;
    const routeElement = isLazyComponent(route.element) ? (
      <Suspense fallback={noPageSkeleton ? null : <PageLoading path={`/${fullPath}`} />}>
        {inner}
      </Suspense>
    ) : (
      inner
    );

    const children = route.children ? buildRouteObjects(route.children, fullPath) : undefined;

    if (segment === '') {
      return children
        ? { element: routeElement, handle: route.handle, children }
        : { index: true as const, element: routeElement, handle: route.handle };
    }

    return { path: segment, element: routeElement, handle: route.handle, children };
  });
}

// 缓存构建结果，语言路由内外共用同一份
const builtRoutes = buildRouteObjects(routes);

export const appRouteObjects: RouteObject[] = [
  {
    element: <App />,
    errorElement: <RootErrorBoundary />,
    children: [
      {
        path: ':language/*',
        element: <LanguageRouteWrapper />,
        children: [...builtRoutes, { path: '*', element: <NotFoundRedirect /> }],
      },
      ...builtRoutes,
    ],
  },
];

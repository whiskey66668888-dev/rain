import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, Navigate } from 'react-router-dom';

import { ClientOnly } from '@/common/components/ClientOnly';

import { LanguageRouteWrapper } from '@/common/router';
import type { RouteConfig } from '@/common/router/config';

import routes from './config';

/**
 * 递归渲染路由配置
 */
function renderRoutes(routes: RouteConfig[]): React.ReactNode[] {
  return routes.map((route) => {
    const Element = route.element as React.ComponentType;
    const path = route.path || '';

    return (
      <Route
        key={path || 'index'}
        path={path}
        element={
          <Suspense fallback={null}>
            <Element />
          </Suspense>
        }
      >
        {route.children && renderRoutes(route.children)}
      </Route>
    );
  });
}

/**
 * 路由组件
 */
export const AppRoutes: React.FC = () => {
  const { i18n } = useTranslation();

  return (
    <Routes>
      {/* 语言路由组 */}
      <Route path=":language/*" element={<LanguageRouteWrapper />}>
        {renderRoutes(routes)}
        {/* 404 重定向 */}
        <Route
          path="*"
          element={
            <ClientOnly>
              <Navigate to={`/${i18n.language}/not-found`} replace />
            </ClientOnly>
          }
        />
      </Route>
    </Routes>
  );
};

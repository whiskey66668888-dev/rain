import React, { useEffect } from 'react';
import { useLocation, useParams, Outlet } from 'react-router-dom';

import { defaultLocale, locales, type Locale } from '@/core/i18n';

/**
 * 语言路由包装器（验证语言参数）
 * 这个组件作为 Route 的 element 使用，内部使用 Outlet 渲染子路由
 */
export const LanguageRouteWrapper: React.FC = () => {
  const { language } = useParams<{ language: string }>();
  const location = useLocation();

  useEffect(() => {
    // 如果语言参数无效，重定向到默认语言
    if (language && !locales.includes(language as Locale)) {
      const pathWithoutLanguage = location.pathname.replace(`/${language}`, '');
      window.location.href = `/${defaultLocale}${pathWithoutLanguage}`;
    }
  }, [language, location.pathname]);

  // 使用 Outlet 渲染子路由
  return <Outlet />;
};

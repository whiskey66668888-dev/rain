import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { NavigateOptions } from 'react-router-dom';

import { useNavigateWithLanguage, type TypeTo } from './useNavigateWithLanguage';

type NavigateFunction = (to: TypeTo, options?: NavigateOptions) => void;

let globalNavigate: NavigateFunction | null = null;
let globalI18n: { language: string } | null = null;

/**
 * 全局的路由
 * ⚠️ ⚠️ ⚠️ ⚠️ ⚠️ ⚠️ 注意！只能在组件外的特殊情况使用。(当前用于api请求时错误处理)
 */

export function useRegisterGlobalActions(): void {
  const navigate = useNavigateWithLanguage();
  const { i18n } = useTranslation();

  useEffect(() => {
    globalNavigate = navigate;
    globalI18n = i18n;
  }, [navigate, i18n]);
}

export function navigateTo(path: TypeTo, options?: NavigateOptions): void {
  if (globalNavigate) {
    globalNavigate(path, options);
  } else {
    console.warn('navigateTo called before registration or outside Router context');
    if (typeof window !== 'undefined') {
      const language = globalI18n?.language || 'zh';
      const pathStr =
        typeof path === 'string'
          ? path
          : `${path.pathname ?? ''}${path.search ?? ''}${path.hash ?? ''}`;
      const fullPath = `/${language}${pathStr}`;
      if (options?.replace) {
        window.location.replace(fullPath);
      } else {
        window.location.href = fullPath;
      }
    }
  }
}

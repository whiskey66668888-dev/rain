import type { AppPath } from '@/sites/op7/routes/paths';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { NavigateOptions, Path, useNavigate as useNavigateOriginal } from 'react-router-dom';

type TypePath = Omit<Path, 'pathname'> & { pathname: AppPath | (string & {}) };

/** 接受 PATHS 常量、generatePath 返回值、或任意拼接的路径字符串 */
export type TypeTo = (AppPath | (string & {})) | Partial<TypePath>;

export type NavigateWithLanguage = ((to: TypeTo, options?: NavigateOptions) => void) &
  ((delta: number) => void);

/**
 * 带语言前缀的导航 Hook，支持路径跳转和历史后退/前进
 * @example
 * ```tsx
 * const navigate = useNavigateWithLanguage();
 * navigate('/sports');           // 自动变成 /zh/sports
 * navigate('/user', { replace: true });
 * navigate(-1);                  // 返回上一级（浏览器后退）
 * navigate(1);                   // 前进一级
 * ```
 */
export function useNavigateWithLanguage(): NavigateWithLanguage {
  const navigateOriginal = useNavigateOriginal();
  const { i18n } = useTranslation();

  const navigate = useCallback<NavigateWithLanguage>(
    (toOrDelta: TypeTo | number, options?: NavigateOptions) => {
      if (typeof toOrDelta === 'number') {
        return navigateOriginal(toOrDelta);
      }
      const path =
        typeof toOrDelta === 'string'
          ? toOrDelta
          : `${toOrDelta.pathname ?? ''}${toOrDelta.search ?? ''}${toOrDelta.hash ?? ''}`;
      return navigateOriginal(`/${i18n.language}${path}`, options);
    },
    [navigateOriginal, i18n.language],
  );

  return navigate;
}

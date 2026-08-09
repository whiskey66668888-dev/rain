import { useCallback } from 'react';

import { Locale } from '@/core/i18n';
import { i18n } from '@/core/i18n';
import { useAppDispatch } from '@/core/store/hooks';
import { setSystemConfig, ThemeMode, ConfigState } from '@/core/store/slices/configSlice';
import { FontScaleType } from '@/utils/constants/system';
import { getSystemTheme } from '@/utils';
import {
  applyFontScaleTypeToDocument,
  applyThemeModeToDocument,
  mapFontScaleTypeToMemberFontSize,
  mapThemeModeToMemberAppearanceStyle,
  useMemberSettingActions,
} from './memberSettingsBridge';

/**
 * 系统配置 Hook 返回值类型
 */
export interface UseSystemReturn {
  setFontScaleType: (fontScaleType: FontScaleType) => void;
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: Locale) => void;
  updateSystemConfig: (config: Partial<ConfigState['system']>) => void;
}

/**
 * 系统配置 Hook
 * 提供系统配置的设置功能，并同步到 localStorage 和 DOM
 *
 * @example
 * ```tsx
 * const { setFontScaleType } = useSystem();
 *
 * return (
 *   <button onClick={() => setFontScaleType(FontScaleType.MEDIUM)}>
 *     切换字体缩放
 *   </button>
 * );
 * ```
 */
export function useSystem(): UseSystemReturn {
  const dispatch = useAppDispatch();
  const { updateManagedSetting } = useMemberSettingActions();
  /**
   * 切换字体缩放
   */
  const setFontScaleType = useCallback(
    (newFontScaleType: FontScaleType): void => {
      void updateManagedSetting('fontSize', mapFontScaleTypeToMemberFontSize(newFontScaleType));
      applyFontScaleTypeToDocument(newFontScaleType);
    },
    [updateManagedSetting],
  );

  /**
   * 设置主题
   */
  const setTheme = useCallback(
    (newTheme: ThemeMode): void => {
      void updateManagedSetting('appearanceStyle', mapThemeModeToMemberAppearanceStyle(newTheme));
      if (newTheme === 'system') {
        const prefersColorScheme = getSystemTheme();
        applyThemeModeToDocument(newTheme, prefersColorScheme);
      } else {
        applyThemeModeToDocument(newTheme, newTheme);
      }
    },
    [updateManagedSetting],
  );

  /**
   * 设置语言
   */
  const setLanguage = useCallback(
    (newLanguage: Locale): void => {
      const currentLang = window.location.pathname.split('/')[1];
      // 如果当前路由的语言前缀和 i18n 语言不一致，才更新 URL
      if (currentLang && currentLang !== newLanguage) {
        const newPath = window.location.pathname.replace(`/${currentLang}`, `/${newLanguage}`);
        const newUrl = newPath + window.location.search + window.location.hash;
        // window.location.href = newUrl;

        i18n.changeLanguage(newLanguage).then(() => {
          dispatch(setSystemConfig({ language: newLanguage }));
          window.history.replaceState(null, '', newUrl);
        });
      }
    },
    [dispatch],
  );

  /**
   * 更新系统设置
   */
  const updateSystemConfig = useCallback(
    (config: Partial<ConfigState['system']>): void => {
      void dispatch(setSystemConfig(config));
    },
    [dispatch],
  );

  return {
    setFontScaleType,
    setTheme,
    setLanguage,
    updateSystemConfig,
  };
}

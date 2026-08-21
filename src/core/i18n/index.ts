import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import { SYSTEM_CONFIG_KEY } from '@/utils/constants/cacheKey';
import { locales, defaultLocale, type Locale, LOCALE_FILE_MAP } from '@/utils/constants/local';
import { safeGetLocalJSON, safeSetLocalJSON } from '@/utils/storage/webStorage';

import { ConfigState } from '../store/slices/configSlice';
import { initialSystemConfig } from '../store/slices/configSlice';

// 标准化语言代码（zh-CN -> zh, en-US -> en）
function normalizeLocale(locale: string): Locale {
  return locales.find((l) => l === locale.replace(/-.*$/, '').toLowerCase()) || defaultLocale;
}

// 客户端初始化
const initI18nClientInit = (): void => {
  const languageDetector = new LanguageDetector();

  // 添加自定义 detector，从 SYSTEM_CONFIG 对象中提取语言
  languageDetector.addDetector({
    name: 'systemConfigStorage',
    lookup: () => {
      try {
        const systemConfig = safeGetLocalJSON<ConfigState['system'] | null>(
          SYSTEM_CONFIG_KEY,
          null,
        );
        if (systemConfig?.language) {
          return systemConfig.language;
        }
        const pathname = window.location.pathname;
        const pathnameParts = pathname.split('/');
        const pathnameLanguage = pathnameParts[1];
        return pathnameLanguage;
      } catch (error) {
        console.error('cacheUserLanguage error', error);
      }
      return defaultLocale;
    },
    cacheUserLanguage: (lng: Locale) => {
      try {
        const systemConfig = safeGetLocalJSON<ConfigState['system']>(
          SYSTEM_CONFIG_KEY,
          JSON.parse(JSON.stringify(initialSystemConfig)) as ConfigState['system'],
        );
        systemConfig.language = lng;

        safeSetLocalJSON(SYSTEM_CONFIG_KEY, systemConfig);
      } catch (error) {
        console.error('cacheUserLanguage error', error);
      }
    },
  });

  i18n
    .use(Backend)
    .use(languageDetector)
    .use(initReactI18next)
    .init({
      // fallbackLng: defaultLocale,
      supportedLngs: locales,
      backend: {
        loadPath: (lng: Locale) => {
          // 映射标准化语言代码到实际文件名
          const actualLocale = LOCALE_FILE_MAP[lng] || lng;
          // 加载合并后的语言文件（构建时已合并）
          return `/locales/${actualLocale}.json?v=${__VERSION__}`;
        },
      },
      detection: {
        order: ['systemConfigStorage', 'navigator', 'htmlTag'],
        caches: ['systemConfigStorage'],
        convertDetectedLanguage: (lng: string) => {
          return normalizeLocale(lng);
        },
      },
      interpolation: {
        escapeValue: false,
      },
    });
};

export { i18n, initI18nClientInit, normalizeLocale, type Locale, locales, defaultLocale };

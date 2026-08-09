import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import { SYSTEM_CONFIG_KEY } from '@/utils/constants/cacheKey';
import { locales, defaultLocale, type Locale, LOCALE_FILE_MAP } from '@/utils/constants/local';

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
        const systemConfigStr = localStorage.getItem(SYSTEM_CONFIG_KEY);
        if (systemConfigStr) {
          const systemConfig = JSON.parse(systemConfigStr) as ConfigState['system'];
          if (systemConfig?.language) {
            return systemConfig.language;
          }
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
        const systemConfigStr = localStorage.getItem(SYSTEM_CONFIG_KEY);
        const systemConfig = systemConfigStr
          ? (JSON.parse(systemConfigStr) as ConfigState['system'])
          : (JSON.parse(JSON.stringify(initialSystemConfig)) as ConfigState['system']);
        systemConfig.language = lng;

        localStorage.setItem(SYSTEM_CONFIG_KEY, JSON.stringify(systemConfig));
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

/**
 * SSR 初始化（同步加载 JSON 文件）
 */
async function initI18nSSR(lng: string): Promise<void> {
  const normalizedLng = normalizeLocale(lng);

  try {
    // 映射标准化语言代码到实际文件名
    const actualLocale = LOCALE_FILE_MAP[normalizedLng];

    // 加载公共和私有语言包（兼容开发环境和生产环境）
    let common;
    let site;

    // 生产环境：使用 require（CommonJS）
    if (__NODE_ENV__ === 'production') {
      common = require(`../client/locales/${actualLocale}.json`) as Record<string, unknown>;

      site = require(`../client/locales/${actualLocale}.json`) as Record<string, unknown>;
    } else {
      // 开发环境：使用 import（ESM）
      const [commonModule, siteModule]: [Record<string, unknown>, Record<string, unknown>] =
        await Promise.all([
          import(`@common/resource/locales/${actualLocale}.json`) as Promise<
            Record<string, unknown>
          >,
          import(`@/sites/${__SITE_ID__}/locales/${actualLocale}.json`) as Promise<
            Record<string, unknown>
          >,
        ]);
      common = commonModule.default || commonModule;
      site = siteModule.default || siteModule;
    }

    // 合并：私有覆盖公共
    const mergedResources = { ...common, ...site };

    await i18n.use(initReactI18next).init({
      resources: {
        [normalizedLng]: {
          translation: mergedResources,
        },
      },
      lng: normalizedLng,
      fallbackLng: defaultLocale,
      supportedLngs: locales,
      react: {
        useSuspense: false,
      },
      interpolation: {
        escapeValue: false,
      },
      initImmediate: false,
    });
  } catch (error) {
    console.error(`Failed to load locale ${normalizedLng}:`, error);
    // 回退到中文
    if (normalizedLng !== defaultLocale) {
      return initI18nSSR(defaultLocale);
    }
  }
}

export {
  i18n,
  initI18nClientInit,
  initI18nSSR,
  normalizeLocale,
  type Locale,
  locales,
  defaultLocale,
};

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

import Overlay from '@/common/components/Overlay';
import { toast } from '@/common/components/Toast';
import { useAppSelector } from '@/core/store/hooks';
import { getSystemTheme } from '@/utils';
import { shouldShowPwaInstallEntry } from '@/utils/appEmbed';
import { isAndroid, isIos } from '@/utils/env';

import styles from './PwaInstall.module.scss';
import Icon from '@/common/components/Icon';
import SegmentedControl from '@/common/components/SegmentedControl';
import {
  safeGetLocalString,
  safeRemoveLocal,
  safeSetLocalString,
} from '@/utils/storage/webStorage';
// import type { SegmentedControlOption } from '@/common/components/SegmentedControl';

type InstallPromptOutcome = 'accepted' | 'dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: InstallPromptOutcome; platform: string }>;
}

/** 单例：侧边栏桌面入口与 MainLayout 移动横幅各自 mount，否则会重复监听 appinstalled → 多条 toast */
let singletonDeferredPrompt: BeforeInstallPromptEvent | null = null;
let singletonInstalled = false;

const CLOSE_AT_KEY = 'op7:pwa:closeAt';
const CLOSE_COUNT_KEY = 'op7:pwa:closeCount';
const SUPPRESS_UNTIL_KEY = 'op7:pwa:suppressUntil';
const INSTALLED_KEY = 'op7:pwa:installed';
/** Safari「文件→添加到程序坞」等不会触发 appinstalled，仅在首次以独立窗口打开时补提示 */
const STANDALONE_WELCOME_KEY = 'op7:pwa:standaloneWelcomeShown';

const DAY_MS = 24 * 60 * 60 * 1000;
const HIDE_24H = DAY_MS;
const HIDE_72H = 3 * DAY_MS;
const HIDE_7D = 7 * DAY_MS;

const isStandalone = (): boolean => {
  const byDisplayMode = window.matchMedia?.('(display-mode: standalone)').matches ?? false;
  const byIOS = Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
  return byDisplayMode || byIOS;
};

const getDeviceEnv = () => {
  const ua = navigator.userAgent.toLowerCase();
  const isIPad = /ipad/.test(ua) || (ua.includes('macintosh') && navigator.maxTouchPoints > 1);
  const isIPhone = isIos();
  const isAndroidPhone = isAndroid();
  /** 与手机区分：侧栏/教程走平板简化条，不走 H5 安卓大图面板 */
  const isAndroidTablet =
    /android/i.test(ua) &&
    (/tablet|;\s*sm-t|gt-\d|nexus 7|nexus 10|kindle|silk|playbook|kfapwi|tb-|mediapad|mipad/i.test(
      ua,
    ) ||
      !/\bmobile\b/i.test(ua));
  const isWindows = ua.includes('windows');
  const isMac = ua.includes('macintosh') && !isIPad;
  const isMobile = isIPhone || isAndroidPhone || isIPad;
  const isDesktop = !isMobile;
  return {
    isIPad,
    isIPhone,
    isAndroidPhone,
    isAndroidTablet,
    isWindows,
    isMac,
    isMobile,
    isDesktop,
  };
};

const getBrowserEnv = () => {
  const ua = navigator.userAgent.toLowerCase();
  const isEdge = ua.includes('edg/');
  const isChrome = ua.includes('chrome') && !isEdge;
  const isSafari = ua.includes('safari') && !ua.includes('chrome') && !isEdge;
  return { isEdge, isChrome, isSafari };
};

/** 微信/QQ 等内嵌 WebView：无法按正常流程安装 PWA，需引导用系统浏览器打开 */
const isLikelyEmbeddedInAppBrowser = (): boolean => {
  const ua = navigator.userAgent.toLowerCase();
  return /micromessenger|wechat| qq\/|mqqbrowser|instagram|fban|fbav|fb_iab|line\/|; wv\)|\bwv\b/.test(
    ua,
  );
};

/**
 * iPhone/iPad 上可走「添加到主屏幕」的系统 Safari（排除第三方壳与内嵌 WebView）。
 * 注意：仅用 UA 含 safari 不可靠（iOS Chrome UA 也带 Safari 字样），需结合 CriOS 等排除。
 */
const isIosNativeSafariForPwa = (): boolean => {
  const raw = navigator.userAgent;
  const ua = raw.toLowerCase();
  if (!/iphone|ipad|ipod/.test(ua)) return false;
  if (isLikelyEmbeddedInAppBrowser()) return false;
  if (/crios|fxios|edgios|opios|\bopr\/|opt\/|miuibrowser/i.test(raw)) return false;
  return /version\/[\d.]+.*mobile\/\w+.*safari/i.test(raw);
};

const getIOSMajorVersion = (): number | null => {
  const ua = navigator.userAgent;
  const match = ua.match(/OS (\d+)_/i);
  return match ? Number(match[1]) : null;
};

/**
 * 原生 Safari（iOS/macOS）：无 Chromium 的 beforeinstallprompt；
 * 「已安装」= 从主屏幕/程序坞以 standalone 打开；普通 Safari 标签在卸载图标后仍会有 beforeinstallprompt 以外的空窗，只靠 standalone 对齐体验。
 */
const usesSafariPwaStandaloneModel = (): boolean => {
  const raw = navigator.userAgent;
  const ua = raw.toLowerCase();
  /** iOS 上 Chrome/Firefox/Edge 等为 WebKit 壳，不得走 Safari standalone 判定 */
  if (/crios|fxios|edgios|opios|\bopr\/|opt\/|miuibrowser/i.test(raw)) return false;
  if (ua.includes('chrome') && !ua.includes('edg')) return false;
  return ua.includes('safari');
};

const shouldShowByFrequency = (): boolean => {
  const suppressUntil = Number(safeGetLocalString(SUPPRESS_UNTIL_KEY) || 0);
  return Date.now() >= suppressUntil;
};

const markInstalled = (): void => {
  singletonInstalled = true;
  safeSetLocalString(INSTALLED_KEY, '1');
};

const markCloseForH5 = (): void => {
  const now = Date.now();
  const lastCloseAt = Number(safeGetLocalString(CLOSE_AT_KEY) || 0);
  const prevCount = Number(safeGetLocalString(CLOSE_COUNT_KEY) || 0);
  const nextCount = now - lastCloseAt <= HIDE_24H ? prevCount + 1 : 1;
  const suppressDuration = nextCount >= 3 ? HIDE_7D : HIDE_24H;

  safeSetLocalString(CLOSE_AT_KEY, String(now));
  safeSetLocalString(CLOSE_COUNT_KEY, String(nextCount));
  safeSetLocalString(SUPPRESS_UNTIL_KEY, String(now + suppressDuration));
};

/** 单步文案 + 可选示意图（无图时 UI 显示占位） */
type DesktopInstallStep = {
  text: string;
  /** 相对站点根路径，如 /images/common/pwa/step1.png；缺省仅展示占位 */
  imageSrc?: string | null;
};

type DesktopTutorial = {
  heroTitle: string;
  heroSubtitle: string;
  /** 头图区右侧/主视觉，缺省为占位 */
  heroImageSrc?: string | null;
  steps: DesktopInstallStep[];
  /** 是否展示「立即安装」：为 true 时再结合 hasPrompt 决定是否可真正调起安装 */
  showInstallButton: boolean;
  /** Windows：仅展示中间一条说明（无顶图、无教程长图） */
  windowsInstructionOnly?: boolean;
  /** 未收到 beforeinstallprompt 时主按钮文案（如 Edge 依赖地址栏安装） */
  installCtaWithoutPromptLabel?: string;
};

const DEFAULT_HERO_VISUAL = '/images/common/pwa/img.png';

/** 桌面安装教程通用示意图（对应各分支中需配图的前若干步） */
const PWA_DESKTOP_STEP_IMAGES = [
  '/images/common/pwa/img1.png',
  '/images/common/pwa/img2.png',
  '/images/common/pwa/img3.png',
] as const;

const threeIllustratedSteps = (texts: [string, string, string]): DesktopInstallStep[] =>
  texts.map((text, i) => ({ text, imageSrc: PWA_DESKTOP_STEP_IMAGES[i] }));

/** 安装教程整页示意图：明暗各一份；iPad 固定使用 light Safari H5 添加主屏幕示意 */
const getPwaDesktopStepGuideSrc = (theme: 'light' | 'dark'): string => {
  if (getDeviceEnv().isIPad) {
    return '/images/light/pwa/safarih5.webp';
  }
  return `/images/${theme}/pwa/step.webp`;
};

const getDesktopTutorial = (options: {
  canDirectInstall: boolean;
  isSecureContext: boolean;
  isSafari: boolean;
}): DesktopTutorial => {
  const env = getDeviceEnv();
  if (env.isMac) {
    if (options.isSafari) {
      return {
        heroTitle: '安装到 macOS',
        heroSubtitle: 'Installing the app on macOS',
        heroImageSrc: DEFAULT_HERO_VISUAL,
        steps: [
          { text: '使用 Safari 浏览器打开网站' },
          {
            text: '点击浏览器右上角的「分享」图标',
            imageSrc: PWA_DESKTOP_STEP_IMAGES[0],
          },
          {
            text: '在下拉菜单中选择「添加到程序坞」',
            imageSrc: PWA_DESKTOP_STEP_IMAGES[1],
          },
          {
            text: '在弹窗中确认名称后点击「添加」',
            imageSrc: PWA_DESKTOP_STEP_IMAGES[2],
          },
        ],
        showInstallButton: false,
      };
    }
    if (!options.canDirectInstall) {
      return {
        heroTitle: '安装到 macOS',
        heroSubtitle: 'Installing the app on macOS',
        heroImageSrc: DEFAULT_HERO_VISUAL,
        steps: threeIllustratedSteps([
          options.isSecureContext
            ? '当前页面暂未满足可安装条件（并非浏览器不支持）'
            : '当前为非 HTTPS 环境，无法调起系统安装',
          '请确认站点已启用 manifest 与 Service Worker',
          '满足条件后可在浏览器菜单中完成安装',
        ]),
        showInstallButton: false,
      };
    }
    return {
      heroTitle: '安装到 macOS',
      heroSubtitle: 'Installing the app on macOS',
      heroImageSrc: DEFAULT_HERO_VISUAL,
      steps: [
        {
          text: '点击浏览器右上角「更多」或菜单中的安装入口',
          imageSrc: PWA_DESKTOP_STEP_IMAGES[0],
        },
        {
          text: '选择「投放、保存与分享」或「安装页面」等选项',
          imageSrc: PWA_DESKTOP_STEP_IMAGES[1],
        },
        {
          text: '在系统弹窗中点击「安装」',
          imageSrc: PWA_DESKTOP_STEP_IMAGES[2],
        },
        { text: '安装完成后可从程序坞或启动台快速打开' },
      ],
      showInstallButton: true,
    };
  }
  if (env.isIPad) {
    const heroTitle = '安装到 IPad';
    const heroSubtitle = 'Installing the app on iPad';
    if (options.isSafari) {
      return {
        heroTitle,
        heroSubtitle,
        heroImageSrc: DEFAULT_HERO_VISUAL,
        steps: [
          { text: '使用 Safari 浏览器打开网站' },
          {
            text: '点击顶栏的「分享」图标',
            imageSrc: PWA_DESKTOP_STEP_IMAGES[0],
          },
          {
            text: '在下拉菜单中选择「添加到主屏幕」',
            imageSrc: PWA_DESKTOP_STEP_IMAGES[1],
          },
          {
            text: '在弹窗中确认名称后点击「添加」',
            imageSrc: PWA_DESKTOP_STEP_IMAGES[2],
          },
        ],
        showInstallButton: false,
      };
    }
    if (!options.canDirectInstall) {
      return {
        heroTitle,
        heroSubtitle,
        heroImageSrc: DEFAULT_HERO_VISUAL,
        steps: threeIllustratedSteps([
          options.isSecureContext
            ? '当前页面暂未满足可安装条件（并非浏览器不支持）'
            : '当前为非 HTTPS 环境，无法添加应用',
          '请使用 Safari 打开本站，通过「分享」→「添加到主屏幕」完成安装',
          '请确认站点已启用 manifest 与 Service Worker',
        ]),
        showInstallButton: false,
      };
    }
    return {
      heroTitle,
      heroSubtitle,
      heroImageSrc: DEFAULT_HERO_VISUAL,
      steps: threeIllustratedSteps([
        '点击浏览器中的「安装」或菜单中的安装入口',
        '在系统弹窗中确认并点击「安装」',
        '安装完成后可从主屏幕快速打开',
      ]),
      showInstallButton: true,
    };
  }
  if (env.isAndroidTablet) {
    return {
      heroTitle: '安装到 Android 平板',
      heroSubtitle: 'Installing the app on your Android tablet',
      heroImageSrc: DEFAULT_HERO_VISUAL,
      steps: [{ text: '点击按钮一键安装到桌面' }],
      showInstallButton: options.canDirectInstall,
      windowsInstructionOnly: true,
    };
  }
  if (!options.canDirectInstall) {
    const canOmniboxHint = options.isSecureContext;
    return {
      heroTitle: '安装到 Windows',
      heroSubtitle: 'Installing the app on Windows',
      heroImageSrc: DEFAULT_HERO_VISUAL,
      steps: [
        {
          text: canOmniboxHint
            ? '请点击浏览器地址栏右侧的「安装」图标完成添加。部分环境（如 Edge）可能不会触发本页「立即安装」，与 Chrome 表现可能略有不同'
            : '当前为非 HTTPS 或 PWA 配置不完整时，地址栏不会出现安装入口',
        },
      ],
      showInstallButton: canOmniboxHint,
      windowsInstructionOnly: true,
      installCtaWithoutPromptLabel: '使用地址栏安装',
    };
  }
  /** Windows + Chromium：仅用分步文案，避免 step.webp 与 Windows 实际界面不一致 */
  return {
    heroTitle: '安装到 Windows',
    heroSubtitle: 'Installing the app on Windows',
    heroImageSrc: DEFAULT_HERO_VISUAL,
    steps: [
      { text: '点击地址栏右侧的「安装」图标' },
      { text: '在浏览器弹窗中点击「安装」' },
      { text: '安装完成后可将应用固定到任务栏或「开始」菜单' },
    ],
    showInstallButton: true,
    windowsInstructionOnly: true,
  };
};

type MobileTutorialThemeSkin = 'light' | 'dark';
type IOSGuideVersion = 'legacy' | 'v26';

const IOS_GUIDE_SEGMENT_OPTIONS = [
  { value: 'legacy' as const, label: 'iPhone V26以下' },
  { value: 'v26' as const, label: 'iPhone V26' },
];

type MobileTutorial = {
  title: string;
  steps: string[];
  buttonText: string;
  showInstallButton: boolean;
  guideImageSrc?: string;
  /** 内嵌浏览器 / 非系统 Safari：全屏「用默认浏览器打开」引导（样式 + SVG，非整图） */
  externalBrowserGuide?: boolean;
  androidBannerSrc?: string;
  iosGuideSrc?: string;
  ios26GuideSrc?: string;
  defaultIOSGuideVersion?: IOSGuideVersion;
};

const getMobileTutorial = (options: {
  canDirectInstall: boolean;
  isSecureContext: boolean;
  /** iOS Safari 示意图按明暗切换 */
  themeSkin: MobileTutorialThemeSkin;
}): MobileTutorial => {
  const device = getDeviceEnv();
  const iosVersion = getIOSMajorVersion();

  if (device.isIPhone || device.isIPad) {
    if (!isIosNativeSafariForPwa()) {
      return {
        title: '如何安装',
        steps: [],
        buttonText: '知道了',
        showInstallButton: false,
        externalBrowserGuide: true,
      };
    }
    return {
      title: '如何安装',
      steps: [],
      buttonText: '查看教程',
      showInstallButton: false,
      iosGuideSrc: `/images/${options.themeSkin}/pwa/ios.webp`,
      ios26GuideSrc: `/images/${options.themeSkin}/pwa/ios26.webp`,
      defaultIOSGuideVersion: iosVersion !== null && iosVersion >= 26 ? 'v26' : 'legacy',
    };
  }

  if (device.isAndroidPhone || device.isAndroidTablet) {
    if (isLikelyEmbeddedInAppBrowser()) {
      return {
        title: '如何安装',
        steps: [],
        buttonText: '知道了',
        showInstallButton: false,
        externalBrowserGuide: true,
      };
    }
    /** 独立浏览器但收不到 beforeinstallprompt：同样引导用系统浏览器 / 可安装环境打开 */
    if (!options.canDirectInstall) {
      return {
        title: '如何安装',
        steps: [],
        buttonText: '知道了',
        showInstallButton: false,
        externalBrowserGuide: true,
      };
    }
    return {
      title: '如何安装',
      steps: [],
      buttonText: '安装到桌面',
      showInstallButton: true,
      androidBannerSrc: `/images/${options.themeSkin}/pwa/android.webp`,
    };
  }

  return {
    title: '如何安装',
    steps: ['点击「立即安装」', '在浏览器弹窗中点击「安装」', '完成后即可从桌面快速进入'],
    buttonText: '立即安装',
    showInstallButton: true,
  };
};

type PwaSubscriber = (prompt: BeforeInstallPromptEvent | null, installed: boolean) => void;

const pwaSubscribers = new Set<PwaSubscriber>();

/**
 * Chromium：standalone 或 INSTALLED_KEY（beforeinstallprompt 再次出现时会移除 KEY）；
 * Safari：仅以 standalone（及 appinstalled 时 markInstalled 立刻写的内存态）表征已安装，避免卸载后 LOCALSTORAGE 仍挡提示。
 */
const syncSingletonInstalledFromStorage = (): void => {
  if (usesSafariPwaStandaloneModel()) {
    singletonInstalled = isStandalone();
    return;
  }
  singletonInstalled = safeGetLocalString(INSTALLED_KEY) === '1' || isStandalone();
};

const notifyPwaSubscribers = (): void => {
  pwaSubscribers.forEach((cb) => cb(singletonDeferredPrompt, singletonInstalled));
};

/** userChoice 接受与 appinstalled 可能接连触发，去重避免两条成功提示 */
let lastPwaInstallSuccessToastAt = 0;
const PWA_INSTALL_SUCCESS_TOAST_DEDUP_MS = 4000;

const showPwaInstallSuccessToast = (): void => {
  const now = Date.now();
  if (now - lastPwaInstallSuccessToastAt < PWA_INSTALL_SUCCESS_TOAST_DEDUP_MS) return;
  lastPwaInstallSuccessToastAt = now;
  toast({ type: 'success', description: '已安装到桌面' });
};

/** 供 MainLayout 调用：独立窗口首次进入时提示（覆盖 Safari 添加到程序坞无 appinstalled 的情况） */
export const runStandaloneWelcomeToastOnce = (): void => {
  if (!isStandalone()) return;
  if (safeGetLocalString(STANDALONE_WELCOME_KEY) === '1') return;
  safeSetLocalString(STANDALONE_WELCOME_KEY, '1');

  const env = getDeviceEnv();
  const description =
    env.isMac && !env.isIPad
      ? '已添加到程序坞，可从 Dock 快速打开'
      : env.isIPhone || env.isIPad
        ? '已添加到主屏幕，可从桌面快速打开'
        : '应用已安装，可固定到桌面或任务栏快速打开';

  toast({ type: 'success', description });
};

const attachPwaWindowListenersOnce = (): void => {
  const win = window as Window & { __op7PwaListeners?: boolean };
  if (win.__op7PwaListeners) return;
  win.__op7PwaListeners = true;

  window.addEventListener('beforeinstallprompt', (event: Event) => {
    event.preventDefault();
    /** 再次可安装时（常见：用户已卸载 PWA），勿继续把页签当成「已安装」 */
    safeRemoveLocal(INSTALLED_KEY);
    syncSingletonInstalledFromStorage();
    singletonDeferredPrompt = event as BeforeInstallPromptEvent;
    notifyPwaSubscribers();
  });

  window.addEventListener('appinstalled', () => {
    markInstalled();
    singletonDeferredPrompt = null;
    notifyPwaSubscribers();
    showPwaInstallSuccessToast();
  });

  const dm = window.matchMedia?.('(display-mode: standalone)');
  if (dm) {
    const onStandaloneDisplayChange = (): void => {
      syncSingletonInstalledFromStorage();
      notifyPwaSubscribers();
    };
    dm.addEventListener('change', onStandaloneDisplayChange);
  }
};

const usePwaInstallState = () => {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(
    () => singletonDeferredPrompt,
  );
  const [installed, setInstalled] = useState<boolean>(() => {
    syncSingletonInstalledFromStorage();
    return singletonInstalled;
  });

  useEffect(() => {
    attachPwaWindowListenersOnce();
    syncSingletonInstalledFromStorage();
    setPromptEvent(singletonDeferredPrompt);
    setInstalled(singletonInstalled);

    const onUpdate = (prompt: BeforeInstallPromptEvent | null, nextInstalled: boolean) => {
      setPromptEvent(prompt);
      setInstalled(nextInstalled);
    };
    pwaSubscribers.add(onUpdate);
    return () => {
      pwaSubscribers.delete(onUpdate);
    };
  }, []);

  const triggerInstall = useCallback(async (): Promise<boolean> => {
    const pe = singletonDeferredPrompt ?? promptEvent;
    if (!pe) return false;
    await pe.prompt();
    const choice = await pe.userChoice;
    singletonDeferredPrompt = null;
    setPromptEvent(null);
    notifyPwaSubscribers();
    if (choice.outcome === 'accepted') {
      markInstalled();
      notifyPwaSubscribers();
      showPwaInstallSuccessToast();
      return true;
    }
    if (getDeviceEnv().isAndroidPhone) {
      safeSetLocalString(SUPPRESS_UNTIL_KEY, String(Date.now() + HIDE_72H));
    }
    return false;
  }, [promptEvent]);

  return { installed, hasPrompt: Boolean(promptEvent), triggerInstall };
};

export const PwaInstallDesktopEntry: React.FC = () => {
  const env = getDeviceEnv();
  const browser = getBrowserEnv();
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const { installed, hasPrompt, triggerInstall } = usePwaInstallState();
  const [open, setOpen] = useState(false);

  const effectiveTheme: 'light' | 'dark' = useMemo(() => {
    const mode = themeMode ?? 'system';
    const resolved = mode === 'system' ? getSystemTheme() : mode;
    return resolved === 'dark' ? 'dark' : 'light';
  }, [themeMode]);

  /** iPad / Android 平板在 lg 侧栏与桌面一致，UA 上属 isMobile，单独放行 */
  const shouldShow =
    shouldShowPwaInstallEntry() &&
    (env.isDesktop || env.isIPad || env.isAndroidTablet) &&
    !installed &&
    shouldShowByFrequency();
  const secureContext = window.isSecureContext;
  const tutorial = useMemo(
    () =>
      getDesktopTutorial({
        canDirectInstall: hasPrompt,
        isSecureContext: secureContext,
        isSafari: browser.isSafari,
      }),
    [hasPrompt, secureContext, browser.isSafari],
  );

  if (!shouldShow) return null;

  return (
    <>
      <button type="button" className={styles.desktopEntry} onClick={() => setOpen(true)}>
        <div className={styles.entryRow}>
          <img src="/images/common/pwa/pwaIcon.png" alt="" className={styles.entryImage} />
          <div className={styles.entryText}>
            <div className={styles.entryTitle}>安装桌面应用</div>
            <div className={styles.entryDesc}>更便捷，更安全</div>
          </div>
          <div className={styles.entryArrowWrapper} aria-hidden>
            <Icon
              src="/images/common/arrow_sports.svg"
              size="8px"
              color="var(--Text-800)"
              className={`flex-shrink-0 ${styles.entryArrow}`}
            />
          </div>
        </div>
      </button>
      <Overlay show={open} close={() => setOpen(false)} position="center" maskClickClose>
        <div className={styles.desktopDialog}>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => setOpen(false)}
            aria-label="关闭"
          >
            <Icon color="var(--White-100)" src="/images/common/close.svg" />
          </button>

          <div className={styles.heroBanner}>
            <div className={styles.heroBannerInner}>
              <div className={styles.heroVisual}>
                {tutorial.heroImageSrc ? (
                  <img src={tutorial.heroImageSrc} alt="" className={styles.heroVisualImg} />
                ) : (
                  <div className={styles.heroVisualPlaceholder} aria-hidden />
                )}
              </div>
              <div className={styles.heroTextBlock}>
                <div className={styles.heroTitle}>{tutorial.heroTitle}</div>
                <div className={styles.heroSubtitle}>{tutorial.heroSubtitle}</div>
              </div>
            </div>
          </div>

          <div className={styles.desktopDialogBody}>
            {tutorial.windowsInstructionOnly ? (
              <div className={styles.windowsInstructionPane}>
                {tutorial.steps.map((step, idx) => (
                  <div key={idx} className={styles.stepHeader}>
                    <span className={styles.stepBadge}>{idx + 1}</span>
                    <p className={styles.stepText}>{step.text ?? '点击按钮一键安装到桌面'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <img
                src={getPwaDesktopStepGuideSrc(effectiveTheme)}
                alt=""
                className={styles.stepGuideImg}
              />
            )}
          </div>

          <div className={styles.desktopDialogFooter}>
            {tutorial.showInstallButton ? (
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => {
                  void (async () => {
                    if (hasPrompt) {
                      const installedNow = await triggerInstall();
                      if (installedNow) setOpen(false);
                      return;
                    }
                    if (env.isWindows) {
                      toast({
                        type: 'info',
                        description: '请点击浏览器地址栏右侧的「安装」图标完成添加。',
                      });
                      return;
                    }
                    const installHint =
                      env.isMac && browser.isSafari
                        ? 'Safari 需通过菜单栏「文件 → 添加到程序坞」完成添加，请按上方步骤操作'
                        : env.isIPad && browser.isSafari
                          ? '请在 Safari 中通过「分享」→「添加到主屏幕」完成添加，请按上方步骤操作'
                          : env.isIPad
                            ? '请使用 Safari 打开本站，并按上方步骤添加到主屏幕'
                            : env.isAndroidTablet
                              ? '请使用 Chrome 等支持安装的浏览器，满足条件后点击「立即安装」'
                              : '当前环境暂不支持直接安装，请按上方教程操作';
                    toast({ type: 'info', description: installHint });
                  })();
                }}
              >
                {hasPrompt ? '立即安装' : (tutorial.installCtaWithoutPromptLabel ?? '立即安装')}
              </button>
            ) : null}
            <button type="button" className={styles.closeFooterBtn} onClick={() => setOpen(false)}>
              关闭
            </button>
          </div>
        </div>
      </Overlay>
    </>
  );
};

export const PwaInstallMobileBanner: React.FC = () => {
  const env = getDeviceEnv();
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const { installed, hasPrompt, triggerInstall } = usePwaInstallState();
  const [visible, setVisible] = useState(true);
  const [openGuide, setOpenGuide] = useState(false);
  const [iosGuideVersion, setIosGuideVersion] = useState<IOSGuideVersion>('legacy');
  const canDirectInstall = hasPrompt;
  const secureContext = window.isSecureContext;

  const mobileTutorialThemeSkin: MobileTutorialThemeSkin = useMemo(() => {
    const mode = themeMode ?? 'system';
    const resolved = mode === 'system' ? getSystemTheme() : mode;
    return resolved === 'dark' ? 'dark' : 'light';
  }, [themeMode]);

  const tutorial = useMemo(
    () =>
      getMobileTutorial({
        canDirectInstall,
        isSecureContext: secureContext,
        themeSkin: mobileTutorialThemeSkin,
      }),
    [canDirectInstall, secureContext, mobileTutorialThemeSkin],
  );
  useEffect(() => {
    if (!openGuide) return;
    if (tutorial.defaultIOSGuideVersion) {
      setIosGuideVersion(tutorial.defaultIOSGuideVersion);
    }
  }, [openGuide, tutorial.defaultIOSGuideVersion]);

  /** 按当前环境配置决定是否展示安装按钮 */
  const showMobileDrawerInstallBtn = tutorial.showInstallButton;
  const mobileDrawerInstallLabel = tutorial.buttonText?.trim() || '立即安装';

  const unsupportedExternalGuide = Boolean(tutorial.externalBrowserGuide);
  const androidInstallPanel = Boolean(tutorial.androidBannerSrc);
  const showIOSGuideTabs = Boolean(tutorial.iosGuideSrc && tutorial.ios26GuideSrc);
  const currentIOSGuideSrc =
    iosGuideVersion === 'v26' ? tutorial.ios26GuideSrc : tutorial.iosGuideSrc;

  const handleDrawerPrimaryInstall = (): void => {
    void (async () => {
      if (hasPrompt) {
        const installedNow = await triggerInstall();
        if (installedNow) setOpenGuide(false);
        return;
      }
    })();
  };
  const shouldShow =
    shouldShowPwaInstallEntry() && env.isMobile && !installed && shouldShowByFrequency() && visible;
  if (!shouldShow) return null;

  return (
    <>
      <div className={styles.mobileBanner}>
        <img src="/images/common/pwa/pwaIcon.png" alt="" className={styles.mobileLogo} />
        <div className={styles.mobileText}>
          <div className={styles.mobileTitle}>添加OP7极速版</div>
          {/* <div className={styles.mobileRatingRow} aria-hidden>
            {MOBILE_RATING_STAR_KEYS.map((k) => (
              <span key={k} className={styles.mobileStar}>
                ★
              </span>
            ))}
            <span className={styles.mobileRatingScore}>5.0</span>
          </div> */}
          <div className={styles.mobileSub}>安装到桌面应用</div>
        </div>
        <button
          type="button"
          className={clsx(styles.primaryBtn, styles.mobileInstallBtn)}
          onClick={() => setOpenGuide(true)}
        >
          立即下载
        </button>
        <button
          type="button"
          className={styles.mobileClose}
          onClick={() => {
            markCloseForH5();
            setVisible(false);
          }}
          aria-label="关闭"
        >
          <Icon src="/images/common/close.svg" size="20px" color="var(--White-100)" />
        </button>
      </div>

      <Overlay
        show={openGuide}
        close={() => setOpenGuide(false)}
        position="center"
        centerFullscreen={unsupportedExternalGuide}
        maskClickClose
        bodyClassname={clsx(
          styles.mobileModalBody,
          unsupportedExternalGuide && styles.mobileModalBodyFullscreen,
        )}
      >
        <div
          className={clsx(
            styles.mobileDrawer,
            unsupportedExternalGuide && styles.mobileDrawerExternalGuide,
            androidInstallPanel && styles.mobileDrawerAndroidInstall,
          )}
        >
          {/* //不支持 */}
          {unsupportedExternalGuide ? (
            <div className={styles.mobileExternalOpenGuide} onClick={() => setOpenGuide(false)}>
              <div className={styles.externalGuideContent}>
                <div className={styles.externalGuideUpper}>
                  <div className={styles.externalGuideArrow} aria-hidden>
                    <img src="/images/common/pwa/arroUp.svg" alt="" />
                  </div>
                  <div className={styles.externalGuideStack}>
                    <div className={styles.externalGuideStep1}>
                      <div className={styles.externalGuideStep1Main}>
                        <span className={styles.externalGuideBadge}>1</span>
                        <span className={styles.externalGuideStep1Text}>点击右上方</span>
                      </div>
                      <Icon src="/images/common/pwa/share.svg" color="var(--Text-800)" />
                    </div>
                    <div className={styles.externalGuideStep2}>
                      <span className={styles.externalGuideBadge}>2</span>
                      <span className={styles.externalGuideStep2Text}>
                        在菜单中点击使用默认浏览器打开
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className={clsx(styles.closeBtnH5, styles.externalGuideClose)}
                onClick={() => setOpenGuide(false)}
              >
                <Icon color="var(--White-100)" src="/images/common/close.svg" />
              </button>
            </div>
          ) : showIOSGuideTabs ? (
            <>
              <div className={styles.iosGuideSegment}>
                <SegmentedControl
                  options={IOS_GUIDE_SEGMENT_OPTIONS}
                  value={iosGuideVersion}
                  onChange={setIosGuideVersion}
                  className="w-full bg-[var(--Background-300)] [--un-selected-color:var(--Text-Main-10)]"
                  height={32}
                  tabButtonClassName="_tf[13]"
                />
              </div>
              <div className={styles.mobileGuideFigure}>
                <img src={currentIOSGuideSrc} alt="" className={styles.mobileGuideImg} />
              </div>
              <button
                type="button"
                className={styles.closeBtnH5}
                onClick={() => setOpenGuide(false)}
              >
                <Icon color="var(--White-100)" src="/images/common/close.svg" />
              </button>
            </>
          ) : androidInstallPanel ? (
            <div>
              <div className={styles.mobileAndroidInstallPane}>
                <div className={styles.mobileAndroidInstallTitle}>如何安装</div>
                <div className={styles.mobileAndroidBanner}>
                  <img
                    src={tutorial.androidBannerSrc}
                    alt=""
                    className={styles.mobileAndroidBannerImg}
                  />
                </div>
                {showMobileDrawerInstallBtn ? (
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={handleDrawerPrimaryInstall}
                  >
                    {mobileDrawerInstallLabel}
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                className={styles.closeBtnH5}
                onClick={() => setOpenGuide(false)}
              >
                <Icon color="var(--White-100)" src="/images/common/close.svg" />
              </button>
            </div>
          ) : tutorial.guideImageSrc ? (
            <div className={styles.mobileGuideFigure}>
              <img src={tutorial.guideImageSrc} alt="" className={styles.mobileGuideImg} />
            </div>
          ) : (
            <ol className={styles.steps}>
              {tutorial.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          )}
        </div>
      </Overlay>
    </>
  );
};

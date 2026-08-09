import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { defaultLocale, Locale } from '@/core/i18n';
import { SYSTEM_CONFIG_KEY } from '@/utils/constants/cacheKey';
import type { TScreenBreakpoint } from '@/utils/constants/breakpoints';
import { FontScaleType, ThemeMode } from '@/utils/constants/system';
import { isSSR } from '@/utils/env';

export type { ThemeMode };
export type EntertainmentCardStyle = 'color' | 'mono';
export interface ConfigState {
  // 页面是否被ssr渲染过
  isSSRRedered: boolean;
  // 系统配置
  system: {
    fontScaleType?: FontScaleType; // 字体缩放 常规|中|大
    themeMode?: ThemeMode; // 主题模式 亮色|暗色|系统
    smsNotification?: boolean; // 短信通知
    appNotification?: boolean; // 应用内通知
    emailNotification?: boolean; // 邮件通知
    trialInterface?: boolean; // 试玩接口
    sportsCardEgg?: boolean; // 体育图卡彩蛋
    language?: Locale; // 语言
    entertainmentCardStyle?: EntertainmentCardStyle; // 娱乐图卡样式（纯色，彩色）
  };
  // 设备是否支持 hover（悬停）操作
  canHover: boolean;
  /** 当前屏幕断点（与 uno.config breakpoints 一致，用于 JS 布局判断） */
  screenBreakpoint: TScreenBreakpoint;
  isMobile: boolean;
  rightSidebarVisible: boolean;
}

export const initialSystemConfig: ConfigState['system'] = {
  fontScaleType: FontScaleType.NORMAL,
  themeMode: 'system',
  smsNotification: true,
  appNotification: true,
  emailNotification: true,
  trialInterface: true,
  sportsCardEgg: true,
  language: defaultLocale,
  entertainmentCardStyle: 'color',
};
const getInitialSystemConfig = (): ConfigState['system'] => {
  if (isSSR()) {
    return initialSystemConfig;
  }
  const systemConfig = localStorage.getItem(SYSTEM_CONFIG_KEY);
  return systemConfig ? (JSON.parse(systemConfig) as ConfigState['system']) : initialSystemConfig;
};
const initialState: ConfigState = {
  isSSRRedered: false, // 初始状态直接由服务端注入
  system: getInitialSystemConfig(),
  canHover: false, // 默认 false，在客户端初始化时检测
  screenBreakpoint: 'md', // 客户端 mount 后由 useScreenBreakpoint 更新
  isMobile: true,
  rightSidebarVisible: true,
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setIsSSRRedered: (state, action: PayloadAction<boolean>) => {
      state.isSSRRedered = action.payload;
    },
    setSystemConfig: (state, action: PayloadAction<ConfigState['system']>) => {
      state.system = {
        ...state.system,
        ...action.payload,
      };
      localStorage.setItem(SYSTEM_CONFIG_KEY, JSON.stringify(state.system));
    },
    setCanHover: (state, action: PayloadAction<boolean>) => {
      state.canHover = action.payload;
    },
    setScreenBreakpoint: (state, action: PayloadAction<TScreenBreakpoint>) => {
      state.screenBreakpoint = action.payload;
      state.isMobile = action.payload === 'md';
    },
    setRightSidebarVisible: (state, action: PayloadAction<boolean>) => {
      state.rightSidebarVisible = action.payload;
    },
    toggleRightSidebarVisible: (state) => {
      state.rightSidebarVisible = !state.rightSidebarVisible;
    },
  },
});

export const {
  setIsSSRRedered,
  setSystemConfig,
  setCanHover,
  setScreenBreakpoint,
  setRightSidebarVisible,
  toggleRightSidebarVisible,
} = configSlice.actions;

export default configSlice.reducer;

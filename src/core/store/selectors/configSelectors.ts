import type { ThemeMode } from '@/utils/constants/system';
import type { TScreenBreakpoint } from '@/utils/constants/breakpoints';

import type { RootState } from '../index';

export const selectIsMobile = (state: RootState): boolean => state.config.isMobile;
export const selectScreenBreakpoint = (state: RootState): TScreenBreakpoint =>
  state.config.screenBreakpoint;
export const selectRightSidebarVisible = (state: RootState): boolean =>
  state.config.rightSidebarVisible;
export const selectCanHover = (state: RootState): boolean => state.config.canHover;
export const selectThemeMode = (state: RootState): ThemeMode | undefined =>
  state.config.system.themeMode;

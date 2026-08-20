import React, { useMemo } from 'react';
import clsx from 'clsx';

import { useAppSelector } from '@/core/store/hooks';
import { getSystemTheme } from '@/utils';

import HeaderH5 from './HeaderH5';
import HeaderPC from './HeaderPC';

/**
 * 头部组件
 */
interface HeaderProps {
  rightSidebarDocked?: boolean;
}

const Header: React.FC<HeaderProps> = ({ rightSidebarDocked = false }) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const rightSidebarVisible = useAppSelector((state) => state.config.rightSidebarVisible);
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme: 'light' | 'dark' =
    themeMode === 'dark' || (themeMode === 'system' && getSystemTheme() === 'dark')
      ? 'dark'
      : 'light';

  const isMobile = useMemo(
    () =>
      screenBreakpoint === 'md' ||
      (!rightSidebarDocked && rightSidebarVisible && screenBreakpoint === 'lg'),
    [screenBreakpoint, rightSidebarDocked, rightSidebarVisible],
  );

  return (
    <div
      className={clsx(
        'w-full max-w-1200px mx-auto flex items-center ',
        isMobile ? 'h-40px px-10px' : 'h-48px pl-12px lg:pr-12px bg-[var(--Background-300)]',
      )}
    >
      {isMobile ? (
        <HeaderH5 theme={theme} />
      ) : (
        <HeaderPC theme={theme} rightSidebarVisible={!rightSidebarDocked && rightSidebarVisible} />
      )}
    </div>
  );
};

export default React.memo(Header);

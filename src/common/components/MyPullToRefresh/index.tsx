import React, { useState, useRef, useMemo } from 'react';
import { PullToRefresh } from 'antd-mobile';
import { PullStatus, PullToRefreshProps } from 'antd-mobile/es/components/pull-to-refresh';
import styles from './index.module.scss';
import clsx from 'clsx';
import Lottie from 'lottie-react';
import smile_line_blue from './image/smile_line_blue.json';
import smile_line_white from './image/smile_line_white.json';
import cry_line_blue from './image/cry_line_blue.json';
import cry_line_white from './image/cry_line_white.json';
import { useAppSelector } from '@/core/store/hooks';
import { getSystemTheme } from '@/utils';

interface MyPullToRefreshProps extends PullToRefreshProps {
  children: React.ReactNode;
}

const MyPullToRefresh: React.FC<MyPullToRefreshProps> = ({ children, onRefresh, ...props }) => {
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const [isError, setIsError] = useState(false);
  const lottieRef = useRef(null);

  const handleRefresh = async () => {
    setIsError(false);
    console.log('开始刷新');
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } catch (e) {
      console.log('刷新过程中发生错误', e);
      console.error('Refresh failed', e);
      setIsError(true);
    }
  };

  // 👇 使用 useMemo 缓存动画组件，避免重新创建
  const loadingStatus = useMemo(() => {
    return (
      <div className={styles.statusWrap}>
        <Lottie
          lottieRef={lottieRef}
          animationData={theme === 'dark' ? smile_line_white : smile_line_blue}
          loop={true}
        />
      </div>
    );
  }, [theme]); // 👈 只在 theme 变化时重新创建

  const statusRecord: Record<PullStatus, React.ReactNode> = {
    pulling: loadingStatus,
    canRelease: loadingStatus,
    refreshing: loadingStatus,
    complete: (
      <div className={clsx(styles.statusWrap, isError ? styles.error : styles.success)}>
        <Lottie
          animationData={
            isError ? (theme === 'dark' ? cry_line_white : cry_line_blue) : smile_line_blue
          }
          loop={false}
        />
      </div>
    ),
  };

  return (
    <PullToRefresh
      {...props}
      onRefresh={handleRefresh}
      completeDelay={1300}
      renderText={(status) => {
        return <div>{statusRecord[status]}</div>;
      }}
    >
      {children}
    </PullToRefresh>
  );
};

export default MyPullToRefresh;

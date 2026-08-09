/// <reference types="../../../../../../types/vite-env" />
import React, { useState, useEffect, useRef } from 'react';

import styles from './AnimationView.module.scss';

interface AnimationViewProps {
  /** 动画 URL */
  url: string;
  /** 是否是视频（用于区分类型，但这里都是动画） */
  isVideo?: boolean;
  /** 侧栏等：容器与 iframe 圆角 */
  rounded?: boolean;
}

/**
 * 动画视图组件（使用 iframe 显示动画内容）
 */
const AnimationView: React.FC<AnimationViewProps> = ({ url, rounded = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLoad = (): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // 重置状态当 URL 变化时
    setIsLoading(true);
    setHasError(false);

    // 设置超时检测（30秒）
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setHasError(true);
    }, 30000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [url]);

  if (!url) {
    return (
      <div className={`${styles.container}${rounded ? ` ${styles.containerRounded}` : ''}`}>
        <div className={styles.error}>暂无动画源</div>
      </div>
    );
  }

  return (
    <div className={`${styles.container}${rounded ? ` ${styles.containerRounded}` : ''}`}>
      {isLoading && (
        <div className={styles.loading}>
          <img className={styles.loadingImg} src={`/images/dark/loading.webp`} alt="loading" />
        </div>
      )}
      {hasError ? (
        <div className={styles.error}>加载失败</div>
      ) : (
        <iframe
          ref={iframeRef}
          src={url}
          className={`${styles.iframe}${rounded ? ` ${styles.iframeRounded}` : ''}`}
          allow="autoplay; fullscreen"
          allowFullScreen
          onLoad={handleLoad}
        />
      )}
    </div>
  );
};

export default AnimationView;

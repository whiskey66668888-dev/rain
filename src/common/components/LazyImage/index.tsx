import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';

import { isBase64 } from '@/utils';

import styles from './LazyImage.module.scss';
import clsx from 'clsx';

/**
 * 占位图片（小图，base64）
 * RICO_TODO: 这里暂时随便用一个图片占位，之后看用oss或其他方案生成占位模糊小图
 */
const PLACEHOLDER_IMAGE =
  'data:image/png;base64,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';

/** 会话级已加载成功图片缓存 */
const LOADED_IMAGE_SRC_CACHE = new Set<string>();

/**
 * Image 组件
 * 继承原生 img 标签的所有属性，添加懒加载相关配置
 * 如果要加入oss相关，统一在这里进行封装
 */
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number;
  height?: number;
  src: string;
  /**
   * 是否启用懒加载
   * @default true
   */
  lazy?: boolean;
  /**
   * 懒加载的根边距（rootMargin）
   * 用于提前加载图片，例如 '100px' 表示在图片进入视口前 100px 时开始加载
   * @default '100px'
   */
  rootMargin?: string;
  /**
   * 自定义占位符（在图片加载前显示）
   * 如果不提供，将使用默认的毛玻璃占位层
   */
  placeholder?: React.ReactNode;
  /**
   * 是否展示占位符
   * @default true
   */
  showPlaceholder?: boolean;
  /**
   * 错误时的备用图片 URL
   * 当图片加载失败时，会尝试加载此图片
   */
  fallback?: string;
  /**
   * 宽高比，用于没有固定宽高时防止塌陷
   * 例如 '16/9' | '4/3' | '1/1'
   *
   */
  aspectRatio?: string;
  /**
   * 错误时的备用图片类名
   * 当图片加载失败时，会尝试加载此图片
   */
  errorClassName?: string;
  /** 图片类名，例如 object-cover/object-contain. */
  imageClassName?: string;
}

/**
 * 公共图片组件
 * 支持懒加载、毛玻璃占位、平滑过渡、错误处理、SSR 兼容
 *
 * @example
 * ```tsx
 * // 默认懒加载（客户端）
 * <LazyImage src="/logo.svg" alt="Logo" />
 *
 * // 禁用懒加载
 * <LazyImage src="/logo.svg" alt="Logo" lazy={false} />
 *
 * // 提前 100px 加载
 * <LazyImage src="/banner.jpg" alt="Banner" rootMargin="100px" />
 *
 * // 自定义占位符
 * <LazyImage src="/photo.jpg" alt="Photo" placeholder={<div>Loading...</div>} />
 *
 * // 错误时使用备用图片
 * <LazyImage src="/photo.jpg" alt="Photo" fallback="/fallback.jpg" />
 * ```
 */
const LazyImage: React.FC<LazyImageProps> = ({
  width,
  height,
  src,
  lazy = true,
  rootMargin = '100px',
  placeholder,
  showPlaceholder = true,
  fallback,
  className = '',
  imageClassName = '',
  errorClassName = '',
  aspectRatio,
  ...restProps
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // 是否为 base64
  const isBase64Url = isBase64(src);
  const justLoad = !lazy || isBase64Url;
  const [inView, setInView] = useState(justLoad);
  const [isLoaded, setIsLoaded] = useState(justLoad);
  const [hasError, setHasError] = useState(false);
  const [hideErrorImage, setHideErrorImage] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>(src);

  // base64 图片或非懒加载，立即标记为已加载
  useEffect(() => {
    if (isBase64Url || !lazy) {
      setIsLoaded((prev) => (prev ? prev : true));
    }
  }, [lazy, isBase64Url]);

  useEffect(() => {
    setCurrentSrc(src);
    const nextLoaded = justLoad || LOADED_IMAGE_SRC_CACHE.has(src);
    setIsLoaded((prev) => (prev === nextLoaded ? prev : nextLoaded));
  }, [src, justLoad]);

  // 懒加载逻辑
  useEffect(() => {
    if (!containerRef.current || inView || isBase64Url) return;

    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
    };
  }, [inView, rootMargin, isBase64Url]);

  // 图片加载完成处理
  const handleLoad = useCallback((): void => {
    LOADED_IMAGE_SRC_CACHE.add(currentSrc);
    setIsLoaded((prev) => (prev ? prev : true));
  }, [currentSrc]);

  // 图片加载错误处理
  const handleError = useCallback((): void => {
    if (fallback && currentSrc !== fallback) {
      // 尝试加载备用图片
      setCurrentSrc(fallback);
      setHasError(true);
      setIsLoaded((prev) => (prev ? false : prev));
    } else {
      // 显示 fallback 小图
      setCurrentSrc(PLACEHOLDER_IMAGE);
      setHasError(true);
      // 暂时不展示错误的小图，后期接入oss后展示动态的错误小图
      setHideErrorImage(true);
      setIsLoaded((prev) => (prev ? prev : true));
    }
  }, [fallback, currentSrc]);

  const shouldLoadImage = inView || !lazy || isBase64Url;
  const isCurrentSrcCached = LOADED_IMAGE_SRC_CACHE.has(currentSrc);
  const shouldShowRealImage = isLoaded || isCurrentSrcCached;

  const showPlaceholderImage =
    showPlaceholder && !placeholder && !shouldShowRealImage && !hasError && lazy;
  const showCustomPlaceholder =
    showPlaceholder && !shouldShowRealImage && !hasError && Boolean(placeholder);

  const containerStyle = useMemo(() => {
    // 有明确宽高，直接用
    if (width || height) {
      return { width, height };
    }
    // 没有宽高，用 aspectRatio 防止塌陷
    if (aspectRatio) {
      return {
        aspectRatio,
        width: '100%',
      };
    }
    return {};
  }, [width, height, aspectRatio]);

  return (
    <div
      ref={containerRef}
      className={clsx(styles.lazyImage, className, hasError && errorClassName)}
      style={containerStyle}
      {...restProps}
    >
      {/* 自定义占位符 */}
      {showCustomPlaceholder ? (
        <div className={styles.placeholderWrapper}>{placeholder}</div>
      ) : null}

      {/* 占位图片（小图，base64）- 底层，初始显示 */}
      {showPlaceholderImage && (
        <img
          src={PLACEHOLDER_IMAGE}
          alt=""
          className={styles.placeholderImage}
          aria-hidden="true"
          draggable="false"
        />
      )}

      {shouldLoadImage &&
        // 暂时不展示错误的小图，后期接入oss后展示动态的错误小图
        (hideErrorImage ? (
          <div
            className={clsx(
              styles.image,
              imageClassName,
              shouldShowRealImage && styles.imageLoaded,
              hasError && styles.imageFailed,
            )}
          />
        ) : (
          <img
            src={currentSrc}
            alt={restProps.alt}
            onLoad={handleLoad}
            onError={handleError}
            loading={lazy ? 'lazy' : 'eager'}
            draggable="false"
            className={clsx(
              styles.image,
              imageClassName,
              shouldShowRealImage && styles.imageLoaded,
              hasError && styles.imageFailed,
            )}
          />
        ))}
    </div>
  );
};

export default React.memo(LazyImage);

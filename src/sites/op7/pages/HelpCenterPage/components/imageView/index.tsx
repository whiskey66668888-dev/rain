import React, { useRef, useEffect } from 'react';
import { ImageViewer } from 'antd-mobile';
import styles from './index.module.scss';
import { toast } from '@/common/components/Toast';
import clsx from 'clsx';
import LazyImage from '@/common/components/LazyImage';
import useFlutterBridge from '@/sites/op7/hooks/useFlutterBridge';
import { SlidesRef } from 'antd-mobile/es/components/image-viewer/slides';
interface ImageViewProps {
  images: string[];
  visible: boolean;
  defaultIndex?: number;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
  customHeader?: (image: string, index: number) => React.ReactNode;
  customFooter?: (image: string, index: number) => React.ReactNode;
  isFullScreen?: boolean;
  statusBarHeight?: number | string;
}

// 如果只需要内部响应 defaultIndex 变化
const ImageView: React.FC<ImageViewProps> = ({
  images,
  visible,
  defaultIndex = 0,
  onClose,
  onIndexChange,
  customHeader,
  customFooter,
  isFullScreen = false,
  statusBarHeight,
}) => {
  const imageViewerRef = useRef<SlidesRef>(null);
  const { sendToFlutter, isInFlutter } = useFlutterBridge();
  console.log(statusBarHeight, isFullScreen);
  // 监听 defaultIndex 变化，自动切换
  useEffect(() => {
    if (visible && imageViewerRef.current && imageViewerRef.current?.swipeTo) {
      const timer = setTimeout(() => {
        imageViewerRef.current?.swipeTo(defaultIndex, true);
      }, 10);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [defaultIndex, visible]);

  console.log(defaultIndex, 'defaultIndex');
  // 使用 file-saver 下载图片
  const handleDownload = (imageUrl: string) => {
    if (isInFlutter()) {
      sendToFlutter('downloadImage', { imageUrl: imageUrl });
      return;
    } else {
      toast({
        description: '长按图片下载',
        type: 'warning',
      });
    }
  };
  // 设置全局 CSS 变量
  useEffect(() => {
    if (isFullScreen && statusBarHeight) {
      document.documentElement.style.setProperty(
        '--image-viewer-body-padding',
        `${statusBarHeight}px`,
      );
    }
    return () => {
      // 清理
      document.documentElement.style.removeProperty('--image-viewer-body-padding');
    };
  }, [isFullScreen, statusBarHeight]);
  return (
    <ImageViewer.Multi
      ref={imageViewerRef}
      images={images}
      visible={visible}
      defaultIndex={defaultIndex}
      onClose={onClose}
      onIndexChange={onIndexChange}
      classNames={{
        mask: styles.customMask,
        body: clsx(styles.customBody, isFullScreen ? styles.fullScreen : ''),
      }}
      renderFooter={(image, index) => (
        <div
          className={clsx(styles.customContainer, isFullScreen ? styles.fullScreen : '')}
          style={{
            top: isFullScreen && statusBarHeight ? `${statusBarHeight}px` : undefined,
          }}
        >
          {/* 自定义顶部 */}
          {customHeader ? (
            <div className={styles.customHeader}>{customHeader(image, index)}</div>
          ) : (
            <div className={styles.defaultHeader}>
              <div className={styles.headerLeft} onClick={onClose}>
                <LazyImage
                  src={'/images/common/helpCenter/close.png'}
                  alt=""
                  width={20}
                  height={20}
                />
              </div>
              <div className={styles.headerCenter}>
                <span className={styles.pageInfo}>
                  {index + 1}/{images.length}
                </span>
              </div>
              <div className={styles.headerRight} onClick={() => handleDownload(image)}>
                <LazyImage
                  src={'/images/common/helpCenter/save.png'}
                  alt=""
                  width={20}
                  height={20}
                />
              </div>
            </div>
          )}

          {/* 自定义底部 */}
          {customFooter && <div className={styles.customFooter}>{customFooter(image, index)}</div>}
        </div>
      )}
    />
  );
};

export default ImageView;

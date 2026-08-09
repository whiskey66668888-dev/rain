import React, { ReactNode, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import clsx from 'clsx';
import { Provider } from 'react-redux';

import Overlay, { type OverlayPosition } from '@/common/components/Overlay';
import Button from '@/common/components/Button';
import { isSSR } from '@/utils/env';

import styles from './Modal.module.scss';
import { useAppSelector } from '@/core/store/hooks';
import { getGlobalStoreForApiRequest } from '@/core/store/util';
import { ModalCloseButton } from '@/sites/op7/components/themeIcon';

export interface ModalProps {
  /** 是否显示 */
  show: boolean;
  /** 关闭回调 */
  onClose?: () => void;
  /** 标题 - 支持传入文本或 ReactNode */
  title?: string | ReactNode;
  /** 内容区域 */
  children: ReactNode;
  /** 是否显示删除按钮（右上角），默认 true */
  showCloseButton?: boolean;
  /** 底部确认按钮文案，默认 "确认" */
  confirmText?: string;
  /** 确认按钮点击回调，可返回 false 阻止关闭，或返回 Promise */
  onConfirm?: () => void | false | Promise<void>;
  /** 自定义底部内容，如果传入则覆盖默认的确认按钮 */
  footer?: ReactNode;
  /** 确认按钮是否禁用 */
  confirmDisabled?: boolean;
  /** 确认按钮是否加载中 */
  confirmLoading?: boolean;
  /** 弹窗宽度，H5模式默认85.333vw（约320/375），非H5模式默认450px */
  width?: number | string;
  /** 弹窗最大高度（桌面端），默认 80vh */
  maxHeight?: number | string;
  /** 点击蒙层是否关闭，默认 true */
  maskClickClose?: boolean;
  /** z-index */
  zIndex?: number;
  /** 自定义类名 */
  className?: string;
  /** 内容区（children 外层）额外类名 */
  contentClassName?: string;
  closeButtonClassName?: string;
  /** 位置/弹框类型 */
  position?: OverlayPosition;
}

/** 函数式调用 Modal 的配置 */
export interface ModalConfig extends Omit<ModalProps, 'show' | 'children' | 'onConfirm'> {
  /** 标题，支持字符串或 JSX */
  title?: string | ReactNode;
  /** 内容区域；可传 (close) => ReactNode，用于在内容内调用 close 关闭弹窗 */
  content?: ReactNode | ((close: () => void) => ReactNode);
  /** 关闭后的回调 */
  onAfterClose?: () => void;
  /** 确认按钮点击回调，可返回 false 阻止关闭，或返回 Promise */
  onConfirm?: () => void | false | Promise<void>;
  // 确认文案
  confirmText?: string;
  /** 自定义底部内容，如果传入则覆盖默认的确认按钮 */
  footer?: ReactNode;
  showCloseButton?: boolean;
}

const ModalComponent: React.FC<ModalProps> = ({
  show,
  onClose,
  title,
  children,
  showCloseButton = true,
  confirmText = '确认',
  onConfirm,
  footer,
  confirmDisabled = false,
  confirmLoading = false,
  width,
  maxHeight = '80vh',
  maskClickClose = true,
  zIndex,
  className,
  contentClassName,
  closeButtonClassName,
  position,
}) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  // 根据 screenBreakpoint 判断是否为移动端（md 为 H5，其他为 PC）
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);

  // bottom 模式在移动端时生效，否则均为 center
  const overlayPosition = useMemo<OverlayPosition>(() => {
    if (position === 'bottom' && isMobile) {
      return 'bottom';
    }
    return 'center';
  }, [position, isMobile]);

  // 根据模式设置默认宽度：H5 使用 vw，避免内联固定 px 无法参与样式换算
  const defaultWidth: number | string = isMobile ? '85.333vw' : 450;
  // H5 下忽略调用方传入的固定宽度（如 Modal.open({ width: 450 })），否则函数式弹窗会一直是 PC 窄窗样式
  const resolvedWidth =
    overlayPosition === 'bottom' ? undefined : isMobile ? defaultWidth : (width ?? defaultWidth);
  const modalWidth = overlayPosition === 'bottom' ? '100%' : resolvedWidth;

  return (
    <Overlay
      show={show}
      close={onClose}
      position={overlayPosition}
      maskClickClose={maskClickClose}
      zIndex={zIndex}
      bodyClassname={
        overlayPosition === 'bottom' ? 'bg-[var(--Background-300)] rounded-t-12px' : ''
      }
    >
      <div
        className={clsx(
          styles.modal,
          isMobile ? styles.mobile : styles.desktop,
          position === 'bottom' && styles.bottom,
          className,
        )}
        style={{
          width: typeof modalWidth === 'number' ? `${modalWidth}px` : modalWidth,
          maxHeight:
            !isMobile && maxHeight
              ? typeof maxHeight === 'number'
                ? `${maxHeight}px`
                : maxHeight
              : undefined,
        }}
      >
        {/* 标题区域 */}
        {title && (
          <div className={styles.header}>
            <div className={styles.titleWrapper}>
              {typeof title === 'string' ? <h2 className={styles.title}>{title}</h2> : title}
            </div>
            {showCloseButton && (
              // <button
              //   type="button"
              //   className={styles.closeButton}
              //   onClick={onClose}
              //   aria-label="关闭"
              // >
              //   <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              //     <path
              //       d="M12 4L4 12M4 4l8 8"
              //       stroke="currentColor"
              //       strokeWidth="1.5"
              //       strokeLinecap="round"
              //       strokeLinejoin="round"
              //     />
              //   </svg>
              // </button>
              <ModalCloseButton
                onClick={onClose}
                className={clsx(styles.closeButton, closeButtonClassName)}
              />
            )}
          </div>
        )}
        {/* 如果没有标题但有关闭按钮，单独显示关闭按钮 */}
        {!title && showCloseButton && (
          <ModalCloseButton
            onClick={onClose}
            className={clsx(styles.closeButton, styles.closeButtonAbsolute, closeButtonClassName)}
          />
          // <button
          //   type="button"
          //   className={`${styles.closeButton} ${styles.closeButtonAbsolute}`}
          //   onClick={onClose}
          //   aria-label="关闭"
          // >
          //   <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          //     <path
          //       d="M12 4L4 12M4 4l8 8"
          //       stroke="currentColor"
          //       strokeWidth="1.5"
          //       strokeLinecap="round"
          //       strokeLinejoin="round"
          //     />
          //   </svg>
          // </button>
        )}

        {/* 内容区域 */}
        <div className={clsx(styles.content, contentClassName)}>{children}</div>

        {/* 底部区域 */}
        <div className={styles.footer}>
          {footer
            ? footer
            : onConfirm && (
                <Button
                  type="primary"
                  onClick={() => {
                    void onConfirm();
                  }}
                  disabled={confirmDisabled}
                  loading={confirmLoading}
                  className={styles.confirmButton}
                  style={{ fontSize: '16px' }}
                >
                  {confirmText}
                </Button>
              )}
        </div>
      </div>
    </Overlay>
  );
};

/** 函数式调用 Modal 的返回值 */
export interface ModalInstance {
  /** 关闭弹窗 */
  close: () => void;
  /** 更新弹窗内容 */
  update: (config: Partial<ModalConfig>) => void;
}

/** 动态创建 Modal 的内部实现 */
const createModalInstance = (config: ModalConfig): ModalInstance => {
  if (isSSR()) {
    // SSR 环境下返回空实现
    return {
      close: () => {},
      update: () => {},
    };
  }

  // 获取全局 Redux store，如果不存在则返回空实例
  const store = getGlobalStoreForApiRequest();
  if (!store) {
    console.error('Redux store is not available. Please ensure the app is properly initialized.');
    return {
      close: () => {},
      update: () => {},
    };
  }

  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  let currentConfig = { ...config };
  let isClosed = false;

  const renderModal = (modalConfig: ModalConfig) => {
    const handleClose = () => {
      if (isClosed) return;
      isClosed = true;
      modalConfig.onClose?.();
      // 延迟卸载，等待动画完成
      setTimeout(() => {
        root.unmount();
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
        modalConfig.onAfterClose?.();
      }, 300);
    };

    const handleConfirm = () => {
      if (modalConfig.onConfirm) {
        try {
          const result = modalConfig.onConfirm();
          // 如果返回 false，不关闭弹窗
          if (result === false) {
            return;
          }
          // 如果返回 Promise，等待完成后关闭
          if (result && typeof result === 'object' && 'then' in result) {
            result
              .then(() => {
                handleClose();
              })
              .catch(() => {
                // 错误时不关闭
              });
            return;
          }
        } catch (error) {
          // 错误时不关闭
          console.error('Modal onConfirm error:', error);
          return;
        }
      }
      handleClose();
    };

    const resolvedContent =
      typeof modalConfig.content === 'function'
        ? modalConfig.content(handleClose)
        : modalConfig.content;

    // 用 Provider 包裹 ModalComponent，因为 ModalComponent 使用了 useAppSelector，需要 Redux context
    const modalElement = (
      <Provider store={store}>
        <ModalComponent
          show={true}
          onClose={handleClose}
          title={modalConfig.title}
          showCloseButton={modalConfig.showCloseButton}
          confirmText={modalConfig.confirmText}
          onConfirm={modalConfig.onConfirm ? handleConfirm : undefined}
          footer={modalConfig.footer}
          confirmDisabled={modalConfig.confirmDisabled}
          confirmLoading={modalConfig.confirmLoading}
          width={modalConfig.width}
          maxHeight={modalConfig.maxHeight}
          maskClickClose={modalConfig.maskClickClose}
          zIndex={modalConfig.zIndex}
          className={clsx(styles.openInstance, modalConfig.className)}
          contentClassName={modalConfig.contentClassName}
          closeButtonClassName={modalConfig.closeButtonClassName}
          position={modalConfig.position}
        >
          {resolvedContent}
        </ModalComponent>
      </Provider>
    );

    root.render(modalElement);
  };

  // 初始渲染
  renderModal(currentConfig);

  return {
    close: () => {
      if (!isClosed) {
        currentConfig.onClose?.();
        isClosed = true;
        setTimeout(() => {
          root.unmount();
          if (container.parentNode) {
            container.parentNode.removeChild(container);
          }
          currentConfig.onAfterClose?.();
        }, 300);
      }
    },
    update: (newConfig: Partial<ModalConfig>) => {
      if (isClosed) return;
      currentConfig = { ...currentConfig, ...newConfig };
      renderModal(currentConfig);
    },
  };
};

/** Modal 组件类型，包含静态方法 */
interface ModalType extends React.FC<ModalProps> {
  /** 动态打开弹窗 */
  open: (config: ModalConfig) => ModalInstance;
}

/** Modal 的静态方法 */
const Modal: ModalType = Object.assign(ModalComponent, {
  open(config: ModalConfig): ModalInstance {
    return createModalInstance(config);
  },
});

export default Modal;

// 测试代码
// Modal.open({
//     title: '测试弹窗1',
//     content: (
//       <div>
//         <p>这是通过函数式 API 动态创建的弹窗！</p>
//         <p style={{ marginTop: '12px', color: 'var(--Text-800)' }}>
//           点击确认按钮或关闭按钮来关闭弹窗。
//         </p>
//       </div>
//     ),
//     onConfirm: () => {
//       console.log('确认按钮被点击');
//     },
//     onClose: () => {
//       console.log('弹窗已关闭');
//     },
//   });

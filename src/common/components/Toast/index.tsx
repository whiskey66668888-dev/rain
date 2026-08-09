import React, { useEffect, useState } from 'react';

import { ClientOnly } from '../ClientOnly';

/**
 * Toast 类型
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';

/**
 * Toast 配置
 */
export interface ToastConfig {
  id: string;
  title?: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  action?: React.ReactNode | (() => void);
  actionLabel?: string;
  content?: React.ReactNode;
  showProgress?: boolean;
}

/**
 * Toast 组件属性
 */
interface ToastProps extends ToastConfig {
  onRemove: (id: string) => void;
}

/**
 * 单个 Toast 组件
 */
const Toast: React.FC<ToastProps> = ({
  id,
  title,
  description,
  type = 'default',
  duration = 3000,
  action,
  actionLabel,
  content,
  showProgress = false,
  onRemove,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = (): void => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(id);
    }, 300);
  };

  const handleActionClick = (): void => {
    if (typeof action === 'function') {
      action();
    }
  };

  useEffect(() => {
    setIsVisible(true);

    if (duration <= 0) return undefined;

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const typeIconPaths = {
    default: '',
    success: '/images/common/toast/success.svg',
    error: '/images/common/toast/error.svg',
    warning: '/images/common/toast/info.svg',
    info: '/images/common/toast/info.svg',
  };

  const typeColors = {
    default: 'var(--Text-Main-10)',
    success: 'var(--Green-300)',
    error: 'var(--Red-400)',
    warning: 'var(--Warning-200)',
    info: 'var(--Warning-200)',
  };

  if (content) {
    return (
      <div
        className="flex-1 min-w-0 py-2 px-3"
        style={{
          borderRadius: '18px',
          background: 'var(--Background-300, #FFF)',
          boxShadow: '0 2px 8px 0 var(--Shadow-400, rgba(141, 145, 154, 0.08))',
        }}
      >
        {content}
      </div>
    );
  }

  const iconPath = typeIconPaths[type];
  const iconColor = typeColors[type];

  // 判断是否使用新布局（同时有 title 和 description，或者明确指定 showProgress）
  const useNewLayout = (title && description) || showProgress;

  if (useNewLayout) {
    return (
      <div
        className="flex flex-col relative"
        style={{
          background: 'var(--Background-300, #FFF)',
          borderRadius: '16px',
          boxShadow: '0px 2px 8px 0px var(--Shadow-400, rgba(122, 133, 153, 0.2))',
          padding: '12px',
          paddingBottom: showProgress ? '10px' : '12px',
          minWidth: '327px',
          maxWidth: '90vw',
          overflow: 'hidden',
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: isVisible && !isExiting ? 1 : 0,
          transform:
            isVisible && !isExiting
              ? 'translateY(0) scale(1)'
              : isExiting
                ? 'translateY(-8px) scale(0.95)'
                : 'translateY(-8px) scale(0.95)',
        }}
        role="alert"
        aria-live="polite"
      >
        <div className="flex gap-[10px] items-center">
          {/* 左侧内容区域 */}
          <div className="flex flex-1 flex-col items-start min-w-0">
            {/* Title 行 */}
            {title && (
              <div className="flex gap-[8px] items-center pb-[4px] pt-[2px] w-full">
                {iconPath && (
                  <div className="flex-shrink-0" style={{ width: '16px', height: '16px' }}>
                    <img
                      src={iconPath}
                      alt=""
                      width="16"
                      height="16"
                      style={{ display: 'block' }}
                    />
                  </div>
                )}
                <div className="flex flex-1 items-center min-w-0">
                  <p
                    style={{
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: iconColor || 'var(--Text-Main-10)',
                      fontWeight: 500,
                      margin: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {title}
                  </p>
                </div>
              </div>
            )}

            {/* Description 行 */}
            {description && (
              <div
                className="flex flex-col items-start justify-center pb-[2px] pl-[24px] w-full"
                style={{
                  paddingTop: title ? '0' : '4px',
                }}
              >
                <p
                  style={{
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: 'var(--Text-800, #7a8499)',
                    fontWeight: 400,
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%',
                  }}
                >
                  {description}
                </p>
              </div>
            )}
          </div>

          {/* 右侧按钮 */}
          {action && (
            <button
              type="button"
              onClick={handleActionClick}
              className="flex-shrink-0"
              style={{
                background: 'var(--Line-100, #eff1f5)',
                height: '28px',
                padding: '10px 16px',
                borderRadius: '100px',
                width: actionLabel ? 'auto' : '72px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                lineHeight: '12px',
                color: 'var(--Text-Main-10, #1f2634)',
                fontWeight: 400,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              {typeof action === 'object' ? action : actionLabel || '查看详情'}
            </button>
          )}
        </div>

        {/* 进度条 - 贴底边，从右到左递减 */}
        {showProgress && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '2px',
              borderRadius: '0 0 16px 16px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: '100%',
                background: 'var(--ThemeColor-Main, #1a81ff)',
                animation: `toast-progress ${duration}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // 原有简单布局
  return (
    <div
      className="flex items-center gap-1"
      style={{
        background: 'var(--Background-300, #FFF)',
        borderRadius: '18px',
        boxShadow: '0px 2px 8px 0px var(--Shadow-400, rgba(122, 133, 153, 0.2))',
        padding: '8px 12px',
        height: '36px',
        minWidth: 'fit-content',
        maxWidth: '90vw',
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isVisible && !isExiting ? 1 : 0,
        transform:
          isVisible && !isExiting
            ? 'translateY(0) scale(1)'
            : isExiting
              ? 'translateY(-8px) scale(0.95)'
              : 'translateY(-8px) scale(0.95)',
      }}
      role="alert"
      aria-live="polite"
    >
      {iconPath && (
        <div className="flex-shrink-0" style={{ width: '16px', height: '16px' }}>
          <img src={iconPath} alt="" width="16" height="16" style={{ display: 'block' }} />
        </div>
      )}

      {description && (
        <p
          style={{
            fontSize: '14px',
            lineHeight: '20px',
            color: iconColor || 'var(--Text-Main-10)',
            fontWeight: 500,
            margin: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {description}
        </p>
      )}
      {!description && title && (
        <p
          style={{
            fontSize: '14px',
            lineHeight: '20px',
            color: iconColor || 'var(--Text-Main-10)',
            fontWeight: 500,
            margin: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </p>
      )}
      {action && typeof action === 'object' && <div>{action}</div>}
    </div>
  );
};

/**
 * Toast 容器组件
 */
const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

  useEffect(() => {
    const unsubscribe = toastStore.subscribe(setToasts);
    setToasts([...toastStore.toasts]);
    return unsubscribe;
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-4 left-0 right-0 md:top-6 flex flex-col items-center pointer-events-none"
      style={{
        zIndex: 9999,
      }}
    >
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="pointer-events-auto"
          style={{
            transition:
              'margin-bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            marginBottom: index < toasts.length - 1 ? '12px' : '0',
            transform: 'translateY(0)',
            opacity: 1,
          }}
        >
          <Toast {...toast} onRemove={toastStore.remove} />
        </div>
      ))}
    </div>
  );
};

/**
 * Toast 全局状态管理
 */
let toastIdCounter = 0;
const toastStore = {
  toasts: [] as ToastConfig[],
  listeners: new Set<(toasts: ToastConfig[]) => void>(),
  subscribe: (listener: (toasts: ToastConfig[]) => void) => {
    toastStore.listeners.add(listener);
    return () => {
      toastStore.listeners.delete(listener);
    };
  },
  notify: () => {
    toastStore.listeners.forEach((listener) => listener([...toastStore.toasts]));
  },
  add: (toast: ToastConfig) => {
    toastStore.toasts.push(toast);
    toastStore.notify();
  },
  remove: (id: string) => {
    toastStore.toasts = toastStore.toasts.filter((t) => t.id !== id);
    toastStore.notify();
  },
  clear: () => {
    toastStore.toasts = [];
    toastStore.notify();
  },
};

/**
 * Toast 函数参数
 *
 * @example
 * // 基础用法
 * toast({
 *   type: 'success',
 *   description: '操作成功'
 * });
 *
 * @example
 * // 新布局：带 title、description、按钮和进度条
 * toast({
 *   type: 'success',
 *   title: '投注成功',
 *   description: '皇家马德里 VS 巴黎圣日耳曼',
 *   action: () => {
 *     console.log('查看详情');
 *   },
 *   actionLabel: '查看详情',
 *   showProgress: true,
 *   duration: 5000
 * });
 */
export interface ToastOptions {
  title?: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  action?: React.ReactNode | (() => void);
  actionLabel?: string;
  showProgress?: boolean;
}

/**
 * Toast 自定义内容参数
 */
export interface ToastCustomOptions {
  content: React.ReactNode;
  type?: ToastType;
  duration?: number;
}

/**
 * 全局 Toast 函数
 */
export const toast = (options: ToastOptions): string => {
  const id = `toast-${++toastIdCounter}`;
  toastStore.add({ id, ...options });
  return id;
};

/**
 * 自定义内容的 Toast 函数
 * 支持传入自定义 ReactNode（如 div、组件等）
 *
 * @example
 * ```tsx
 * toastCustom({
 *   content: <div>自定义内容</div>,
 *   duration: 3000
 * });
 * ```
 */
export const toastCustom = (options: ToastCustomOptions): string => {
  const id = `toast-${++toastIdCounter}`;
  toastStore.add({ id, ...options });
  return id;
};

/**
 * Toast 容器渲染组件
 */
export const ToastViewport: React.FC = () => {
  return (
    <ClientOnly>
      <ToastContainer />
    </ClientOnly>
  );
};

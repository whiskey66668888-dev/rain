import { memo, ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import clsx from 'clsx';
import './overlay.scss';
import { zIndexMap } from '@/utils/constants/zIndex';

export type OverlayPosition = 'bottom' | 'top' | 'left' | 'right' | 'center';

export interface OverlayProps {
  children: ReactNode;
  /** 是否显示 */
  show: boolean;
  zIndex?: number;
  /** 关闭回调（如点击蒙层） */
  close?: () => void;
  containerClassname?: string;
  bodyClassname?: string;
  /** 蒙层背景色 */
  background?: string;
  /** 点击蒙层是否关闭 */
  maskClickClose?: boolean;
  /** 关闭后是否销毁内容 */
  destroyOnClose?: boolean;
  /** 入场动画时长（ms） */
  durationEnter?: number;
  /** 退出动画时长（ms），默认 0 表示无退出动画、立即关闭；> 0 则启用退场动画 */
  durationExit?: number;
  className?: string;
  /** 内容位置：center 为淡入淡出，其余为滑入滑出 */
  position?: OverlayPosition;
  /** center 时铺满视口（蒙层 + 淡入；无卡片缩放位移） */
  centerFullscreen?: boolean;
  /** 内容样式 */
  bodyStyle?: React.CSSProperties;
}

const ANIM_DURATION = 300;

const Overlay = ({
  children,
  show,
  zIndex = zIndexMap.globalOverlay,
  close,
  containerClassname,
  background = 'var(--Black-60)',
  maskClickClose = true,
  destroyOnClose = true,
  durationEnter = ANIM_DURATION,
  durationExit = ANIM_DURATION,
  className,
  position = 'center',
  centerFullscreen = false,
  bodyClassname,
  bodyStyle,
}: OverlayProps) => {
  /**
   * active：弹层是否"在役"（显示中或正在播退出动画）
   * - show=true 时立刻置 true
   * - show=false 且 durationExit=0：立刻置 false（无退出动画，立即卸载）
   * - show=false 且 durationExit>0：等退出动画播完后置 false
   */
  const [active, setActive] = useState(show);

  /**
   * progress：0 = 完全关闭，1 = 完全打开
   * 通过 useTransform 映射为实际 CSS 属性（y / x / opacity），
   * 用 animate() 命令式驱动，从当前值出发，天然支持中途反转。
   */
  const progress = useMotionValue(show ? 1 : 0);

  /** 蒙层透明度直接跟随 progress（0→1 恒等映射，无需 useTransform） */

  /**
   * body 位移 / 透明度：根据 position 将 progress 映射为对应 CSS 值
   * - bottom: y 从 100% → 0
   * - top:    y 从 -100% → 0
   * - left:   x 从 -100% → 0
   * - right:  x 从 100% → 0
   * - center: opacity 从 0 → 1
   */
  const bodyY = useTransform(progress, (v) => {
    if (position === 'bottom') return `${(1 - v) * 100}%`;
    if (position === 'top') return `${(v - 1) * 100}%`;
    return undefined;
  });
  const bodyX = useTransform(progress, (v) => {
    if (position === 'left') return `${(v - 1) * 100}%`;
    if (position === 'right') return `${(1 - v) * 100}%`;
    return undefined;
  });
  const centerBodyOpacity = useTransform(progress, (v) => {
    if (position === 'center') return v;
    return undefined;
  });
  /** center 缩放：0.85 → 1 */
  const centerBodyScale = useTransform(progress, (v) => {
    if (position === 'center') return 0.85 + 0.15 * v;
    return undefined;
  });

  /**
   * DOM 快照：退出动画期间冻结弹窗内容
   * 在 render 阶段检测 show 从 true→false 的瞬间，此时 DOM 还是上一次 commit 的状态（未被清空），
   * 直接读取 innerHTML 作为静态快照，退出动画期间用 dangerouslySetInnerHTML 渲染快照而非 live children，
   * 这样即使调用方在关闭时同步 clearBet() 等清空数据，用户看到的仍是关闭前的完整内容。
   */
  const bodyRef = useRef<HTMLDivElement>(null);
  const exitSnapshotRef = useRef<string | null>(null);
  const prevShowRef = useRef(show);
  if (prevShowRef.current && !show && durationExit > 0 && bodyRef.current) {
    exitSnapshotRef.current = bodyRef.current.innerHTML;
  }
  if (show) {
    exitSnapshotRef.current = null;
  }
  prevShowRef.current = show;

  /** 保存当前动画的 stop 句柄，用于中途反转时取消上一次动画 */
  const stopRef = useRef<(() => void) | null>(null);

  /**
   * 核心动画驱动（useLayoutEffect 保证在 paint 前同步执行）：
   * show 变化时，立即停止上一次动画，读取 progress 当前值，按剩余距离等比缩放 duration。
   * - 入场：duration = durationEnter × (1 - currentProgress)，从当前位置到 1
   * - 退出：duration = durationExit × currentProgress，从当前位置到 0
   * 这样弹窗开到 30% 时关闭，退出动画只需 30% 的 durationExit。
   */
  useLayoutEffect(() => {
    if (show) {
      // 入场
      setActive(true);
      stopRef.current?.();
      const current = progress.get();
      const remaining = 1 - current;
      if (remaining <= 0) {
        stopRef.current = null;
        return;
      }
      const duration = (durationEnter / 1000) * remaining;
      const controls = animate(progress, 1, {
        duration,
        ease: 'easeOut',
        onComplete: () => {
          stopRef.current = null;
        },
      });
      stopRef.current = () => controls.stop();
    } else if (durationExit > 0) {
      // 退出动画：duration 按当前进度等比缩放
      stopRef.current?.();
      const current = progress.get();
      if (current <= 0) {
        stopRef.current = null;
        setActive(false);
        exitSnapshotRef.current = null;
        return;
      }
      const duration = (durationExit / 1000) * current;
      const controls = animate(progress, 0, {
        duration,
        ease: 'easeOut',
        onComplete: () => {
          stopRef.current = null;
          setActive(false);
          exitSnapshotRef.current = null;
        },
      });
      stopRef.current = () => controls.stop();
    } else {
      // 无退出动画：立即跳到 0 并卸载
      stopRef.current?.();
      stopRef.current = null;
      progress.jump(0);
      setActive(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  /** 组件卸载时停止正在进行的动画，防止在已卸载组件上 setState */
  useLayoutEffect(
    () => () => {
      stopRef.current?.();
    },
    [],
  );

  const isVisible = show || active;
  const renderContent = active || !destroyOnClose;

  if (!renderContent) {
    return null;
  }

  return createPortal(
    <div
      className={clsx('global-overlay', className)}
      style={
        {
          display: isVisible ? undefined : 'none',
          pointerEvents: isVisible ? 'auto' : 'none',
          '--global-overlay-z-index': zIndex,
        } as React.CSSProperties
      }
    >
      <div className={clsx('global-overlay-container', containerClassname)}>
        {/* 蒙层：opacity 跟随 progress */}
        <motion.div
          className="global-overlay-mask"
          style={{ background, opacity: progress }}
          aria-hidden
          onClick={maskClickClose && close && show ? close : undefined}
        />
        {/* 内容区：y / x / opacity 由 useTransform 驱动，无需声明式 animate */}
        <motion.div
          ref={bodyRef}
          className={clsx(
            'global-overlay-body',
            `global-overlay-body-position-${position}`,
            position === 'center' && centerFullscreen && 'global-overlay-body-center-fullscreen',
            bodyClassname,
          )}
          style={{
            ...bodyStyle,
            pointerEvents: show ? 'auto' : 'none',
            ...(position === 'bottom' || position === 'top' ? { y: bodyY } : {}),
            ...(position === 'left' || position === 'right' ? { x: bodyX } : {}),
            ...(position === 'center'
              ? {
                  opacity: centerBodyOpacity,
                  ...(centerFullscreen
                    ? { scale: 1, x: 0, y: 0 }
                    : { scale: centerBodyScale, x: '-50%', y: '-50%' }),
                }
              : {}),
          }}
        >
          {exitSnapshotRef.current !== null ? (
            <div
              dangerouslySetInnerHTML={{ __html: exitSnapshotRef.current }}
              style={{ display: 'contents' }}
            />
          ) : (
            children
          )}
        </motion.div>
      </div>
    </div>,
    document.body,
  );
};

export default memo(Overlay);

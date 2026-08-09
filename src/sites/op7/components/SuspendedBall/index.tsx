/** 悬浮球 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import Icon from '@/common/components/Icon';
import styles from './SuspendedBall.module.scss';
import LazyImage from '@/common/components/LazyImage';
import { runAfterLeaveFullscreen } from '@/utils/fullscreen';

const BALL_SIZE = 52;
const EDGE_GAP = 12;
const RIGHT_EDGE_GAP = -8;
const TOP_SAFE_GAP = 12;
const DRAG_THRESHOLD = 6;

type EdgeSide = 'left' | 'right';

export const SuspendedBall = ({
  toggleTransfer,
  toggleRefresh,
  toggleFullscreen,
  toggleExit,
  isTryPlay,
}: {
  toggleTransfer: () => void;
  toggleRefresh: () => void;
  toggleFullscreen: () => void;
  toggleExit: (goToDeposit: boolean) => void;
  isTryPlay: boolean;
}) => {
  const ACTIONS = [
    {
      key: 'transfer',
      icon: '/images/common/game/transfer.svg',
      onClick: () => {
        runAfterLeaveFullscreen({
          requestExit: toggleFullscreen,
          after: toggleTransfer,
        });
      },
    },
    { key: 'refresh', icon: '/images/common/refresh.svg', onClick: toggleRefresh },
    { key: 'fullscreen', icon: '/images/common/game/fullscreen.svg', onClick: toggleFullscreen },
    {
      key: 'exit',
      icon: '/images/common/game/exit.svg',
      onClick: () => {
        runAfterLeaveFullscreen({
          requestExit: toggleFullscreen,
          after: () => toggleExit(false),
        });
      },
    },
  ] as const;

  const [expanded, setExpanded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [side, setSide] = useState<EdgeSide>('left');
  const [position, setPosition] = useState(() => ({
    x: EDGE_GAP,
    y:
      typeof window === 'undefined'
        ? TOP_SAFE_GAP
        : Math.max(TOP_SAFE_GAP, window.innerHeight * 0.35),
  }));
  const dragMetaRef = useRef({
    active: false,
    offsetX: 0,
    offsetY: 0,
    startClientX: 0,
    startClientY: 0,
    moved: false,
  });
  const ballBtnRef = useRef<HTMLButtonElement | null>(null);
  const teardownDragRef = useRef<(() => void) | null>(null);

  const clampY = useCallback((y: number) => {
    const maxY = window.innerHeight - BALL_SIZE - EDGE_GAP;
    return Math.min(Math.max(TOP_SAFE_GAP, y), Math.max(TOP_SAFE_GAP, maxY));
  }, []);

  const snapToEdge = useCallback(
    (rawX: number, rawY: number) => {
      const maxX = window.innerWidth - BALL_SIZE - RIGHT_EDGE_GAP;
      const leftX = EDGE_GAP;
      const rightX = Math.max(RIGHT_EDGE_GAP, maxX);
      const nextSide: EdgeSide = rawX + BALL_SIZE / 2 <= window.innerWidth / 2 ? 'left' : 'right';
      setSide(nextSide);
      setPosition({
        x: nextSide === 'left' ? leftX : rightX,
        y: clampY(rawY),
      });
    },
    [clampY],
  );

  const stopDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragMetaRef.current.active) return;
      dragMetaRef.current.active = false;
      const rawX = clientX - dragMetaRef.current.offsetX;
      const rawY = clientY - dragMetaRef.current.offsetY;
      const deltaX = Math.abs(clientX - dragMetaRef.current.startClientX);
      const deltaY = Math.abs(clientY - dragMetaRef.current.startClientY);
      const isTap = deltaX <= DRAG_THRESHOLD && deltaY <= DRAG_THRESHOLD;
      setDragging(false);

      if (isTap || !dragMetaRef.current.moved) {
        setExpanded(true);
        return;
      }
      snapToEdge(rawX, rawY);
    },
    [snapToEdge],
  );

  useEffect(() => {
    return () => {
      teardownDragRef.current?.();
      teardownDragRef.current = null;
    };
  }, []);

  useEffect(() => {
    const onResize = () => {
      setPosition((prev) => {
        const maxX = window.innerWidth - BALL_SIZE - RIGHT_EDGE_GAP;
        const rightX = Math.max(RIGHT_EDGE_GAP, maxX);
        const nextX = side === 'left' ? EDGE_GAP : rightX;
        return {
          x: nextX,
          y: clampY(prev.y),
        };
      });
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [clampY, side]);

  const rootStyle = useMemo<React.CSSProperties>(
    () => ({
      left: position.x,
      top: position.y,
    }),
    [position.x, position.y],
  );

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (expanded) {
      setExpanded(false);
      return;
    }
    const touch = e.touches[0];
    if (!touch) return;
    const ballRect = ballBtnRef.current?.getBoundingClientRect();
    const ballLeft = ballRect?.left ?? position.x;
    const ballTop = ballRect?.top ?? position.y;
    teardownDragRef.current?.();
    dragMetaRef.current = {
      active: true,
      // 以球本体在视口中的真实位置作为拖拽锚点，避免右侧布局下坐标错位
      offsetX: touch.clientX - ballLeft,
      offsetY: touch.clientY - ballTop,
      startClientX: touch.clientX,
      startClientY: touch.clientY,
      moved: false,
    };
    setDragging(false);
    const onTouchMove = (event: TouchEvent) => {
      if (!dragMetaRef.current.active) return;
      const currentTouch = event.touches[0];
      if (!currentTouch) return;
      const rawX = currentTouch.clientX - dragMetaRef.current.offsetX;
      const rawY = currentTouch.clientY - dragMetaRef.current.offsetY;
      const maxX = window.innerWidth - BALL_SIZE - EDGE_GAP;
      const nextX = Math.min(Math.max(EDGE_GAP, rawX), Math.max(EDGE_GAP, maxX));
      const nextY = clampY(rawY);
      if (
        !dragMetaRef.current.moved &&
        (Math.abs(currentTouch.clientX - dragMetaRef.current.startClientX) > DRAG_THRESHOLD ||
          Math.abs(currentTouch.clientY - dragMetaRef.current.startClientY) > DRAG_THRESHOLD)
      ) {
        dragMetaRef.current.moved = true;
        setDragging(true);
      }
      if (!dragMetaRef.current.moved) {
        return;
      }
      setPosition({ x: nextX, y: nextY });
    };
    const onTouchEnd = (event: TouchEvent) => {
      teardownDragRef.current?.();
      teardownDragRef.current = null;
      const changedTouch = event.changedTouches[0];
      if (!changedTouch) return;
      stopDrag(changedTouch.clientX, changedTouch.clientY);
    };
    const teardown = () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);
    teardownDragRef.current = teardown;
  };

  return (
    <div
      className={clsx(
        styles.suspendedBall,
        dragging && styles.dragging,
        expanded && styles.expanded,
        side === 'left' ? styles.leftSide : styles.rightSide,
      )}
      style={rootStyle}
    >
      <button
        ref={ballBtnRef}
        type="button"
        className={clsx(styles.ballBtn, expanded && styles.closeBtn)}
        onTouchStart={handleTouchStart}
      >
        {expanded ? (
          <Icon src="/images/common/close.svg" size={20} color="var(--White-100)" />
        ) : (
          <div className={styles.ballInner}>
            <Icon src="/images/common/pop.svg" size={32} color="var(--White-100)" />
          </div>
        )}
      </button>

      <div className={styles.actions}>
        <div className={styles.moneyBox}>
          <LazyImage
            className="w-18px h-18px"
            src={`/images/common/money.png`}
            alt="Money"
            lazy={false}
          />
          <span className="text-[var(--White-100)]">游戏使用中</span>
          <LazyImage
            className="w-21px h-21px"
            src="/images/common/header/add-money.png"
            alt=""
            lazy={false}
            onClick={() => {
              toggleFullscreen();
              toggleExit(true);
            }}
          />
        </div>
        <div className={styles.actionBtns}>
          {(isTryPlay ? ACTIONS.slice(1) : ACTIONS).map((item, index) => (
            <button
              type="button"
              key={item.key}
              className={styles.actionBtn}
              style={{ '--i': index } as React.CSSProperties}
              onClick={item.onClick}
            >
              <Icon src={item.icon} size={18} color="var(--White-100)" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

import Button from '@/common/components/Button';
import { ClientOnly } from '@/common/components/ClientOnly';
import Icon from '@/common/components/Icon';
import SegmentedControl from '@/common/components/SegmentedControl';
import Switch from '@/common/components/Switch';
import { EVenue } from '@/apis/commonSports/constants';
import { useLogin } from '@/common/hooks/useLogin';
import { useSystem } from '@/common/hooks/useSystem';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import type { ConfigState } from '@/core/store/slices/configSlice';
import { setVenue } from '@/core/store/slices/sportSlice';
import {
  FontScaleType,
  FONT_SIZE_OPTIONS,
  SPORT_VENUE_OPTIONS,
  THEME_OPTIONS,
} from '@/utils/constants/system';
import { zIndexMap } from '@/utils/constants/zIndex';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';
import { safeGetLocalJSON, safeRemoveLocal, safeSetLocalJSON } from '@/utils/storage/webStorage';

import { CloseSvg } from '../SvgIcons';
import styles from './index.module.scss';

const FLOAT_BUTTON_SIZE = 32;
const FLOAT_BUTTON_VIEWPORT_GAP = 8;
const DRAG_CLICK_THRESHOLD = 10;
const DOUBLE_CLICK_DELAY = 220;
const POSITION_STORAGE_KEY = 'op7_dev_system_settings_float_position';

interface FloatPosition {
  x: number;
  y: number;
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  moved: boolean;
}

const SettingSvg = ({ className }: { className?: string }) => (
  <svg
    className={clsx('shrink-0', className)}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
  >
    <path
      d="M19.43 12.98c.04-.32.07-.65.07-.98s-.02-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.28 7.28 0 0 0-1.69-.98L14.5 2.42A.49.49 0 0 0 14 2h-4a.49.49 0 0 0-.5.42L9.12 5.07c-.61.24-1.18.56-1.69.98l-2.49-1a.5.5 0 0 0-.61.22l-2 3.46c-.12.22-.07.49.12.64l2.11 1.65c-.04.32-.08.65-.08.98s.03.66.08.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.13.22.39.31.61.22l2.49-1c.51.4 1.08.73 1.69.98l.38 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.38-2.65c.61-.25 1.18-.58 1.69-.98l2.49 1c.23.08.48 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z"
      fill="currentColor"
    />
  </svg>
);

const DevSystemSettingsFloat: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [position, setPosition] = useState<FloatPosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<DragState | null>(null);
  const suppressNextClickRef = useRef(false);
  const openTimerRef = useRef<number | null>(null);
  const lastTapTimestampRef = useRef(0);
  const dispatch = useAppDispatch();
  const { logout } = useLogin();
  const openCustomerService = useOpenCustomerService();
  const { setFontScaleType, setTheme, updateSystemConfig } = useSystem();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const userName = useAppSelector((state) => state.user.userInfo.loginName);
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const sportVenue = useAppSelector((state) => state.sport.venue);
  const {
    fontScaleType,
    themeMode,
    smsNotification,
    appNotification,
    emailNotification,
    trialInterface,
  } = useAppSelector((state) => state.config.system);

  const switchOptions: {
    value: keyof ConfigState['system'];
    checked: boolean;
    label: string;
  }[] = useMemo(
    () => [
      { value: 'smsNotification', checked: smsNotification ?? true, label: '短信通知' },
      { value: 'appNotification', checked: appNotification ?? true, label: '应用内通知' },
      { value: 'emailNotification', checked: emailNotification ?? true, label: '邮件通知' },
      { value: 'trialInterface', checked: trialInterface ?? true, label: '试玩接口' },
    ],
    [smsNotification, appNotification, emailNotification, trialInterface],
  );

  const clampPosition = useCallback((nextPosition: FloatPosition): FloatPosition => {
    const maxX = window.innerWidth - FLOAT_BUTTON_SIZE - FLOAT_BUTTON_VIEWPORT_GAP;
    const maxY = window.innerHeight - FLOAT_BUTTON_SIZE - FLOAT_BUTTON_VIEWPORT_GAP;

    return {
      x: Math.min(
        Math.max(nextPosition.x, FLOAT_BUTTON_VIEWPORT_GAP),
        Math.max(maxX, FLOAT_BUTTON_VIEWPORT_GAP),
      ),
      y: Math.min(
        Math.max(nextPosition.y, FLOAT_BUTTON_VIEWPORT_GAP),
        Math.max(maxY, FLOAT_BUTTON_VIEWPORT_GAP),
      ),
    };
  }, []);

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const scheduleOpen = useCallback(() => {
    clearOpenTimer();
    openTimerRef.current = window.setTimeout(() => {
      setOpen(true);
      openTimerRef.current = null;
    }, DOUBLE_CLICK_DELAY);
  }, [clearOpenTimer]);

  useEffect(() => {
    const parsedPosition = safeGetLocalJSON<Partial<FloatPosition> | null>(
      POSITION_STORAGE_KEY,
      null,
    );
    if (!parsedPosition) return;
    if (typeof parsedPosition.x === 'number' && typeof parsedPosition.y === 'number') {
      setPosition(clampPosition({ x: parsedPosition.x, y: parsedPosition.y }));
    } else {
      safeRemoveLocal(POSITION_STORAGE_KEY);
    }
  }, [clampPosition]);

  useEffect(() => {
    if (!position) return undefined;

    const handleResize = () => {
      setPosition((currentPosition) => {
        if (!currentPosition) return currentPosition;
        const nextPosition = clampPosition(currentPosition);
        safeSetLocalJSON(POSITION_STORAGE_KEY, nextPosition);
        return nextPosition;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampPosition, position]);

  useEffect(() => () => clearOpenTimer(), [clearOpenTimer]);

  const handleLogout = () => {
    setOpen(false);
    void logout();
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const rect = event.currentTarget.getBoundingClientRect();
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: rect.left,
      originY: rect.top,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    if (!dragState.moved && Math.hypot(deltaX, deltaY) < DRAG_CLICK_THRESHOLD) return;

    dragState.moved = true;
    setIsDragging(true);
    setPosition(clampPosition({ x: dragState.originX + deltaX, y: dragState.originY + deltaY }));
  };

  const finishPointerInteraction = (event: React.PointerEvent<HTMLButtonElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const totalDistance = Math.hypot(
      event.clientX - dragState.startX,
      event.clientY - dragState.startY,
    );
    const shouldOpen = totalDistance < DRAG_CLICK_THRESHOLD;
    dragStateRef.current = null;
    setIsDragging(false);

    if (!shouldOpen) {
      const finalPosition = clampPosition({
        x: dragState.originX + event.clientX - dragState.startX,
        y: dragState.originY + event.clientY - dragState.startY,
      });
      suppressNextClickRef.current = true;
      setPosition(finalPosition);
      safeSetLocalJSON(POSITION_STORAGE_KEY, finalPosition);
    }
    if (shouldOpen) {
      suppressNextClickRef.current = true;
      const currentTapTimestamp = Date.now();

      if (currentTapTimestamp - lastTapTimestampRef.current <= DOUBLE_CLICK_DELAY) {
        lastTapTimestampRef.current = 0;
        clearOpenTimer();
        setOpen(false);
        setVisible(false);
        return;
      }

      lastTapTimestampRef.current = currentTapTimestamp;
      scheduleOpen();
    }
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragStateRef.current = null;
    setIsDragging(false);
  };

  const floatButton = (
    <button
      type="button"
      className={clsx(styles.floatButton, isDragging && styles.floatButtonDragging)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointerInteraction}
      onPointerCancel={handlePointerCancel}
      onClick={() => {
        if (suppressNextClickRef.current) {
          suppressNextClickRef.current = false;
          return;
        }
        scheduleOpen();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          clearOpenTimer();
          setOpen(true);
        }
      }}
      aria-label="打开开发设置"
      style={{
        zIndex: zIndexMap.globalToast + 2,
        ...(position
          ? {
              left: position.x,
              top: position.y,
              right: 'auto',
              bottom: 'auto',
            }
          : {}),
      }}
    >
      <SettingSvg className={styles.floatIcon} />
    </button>
  );

  if (!visible) {
    return null;
  }

  const modal = open ? (
    <div
      className={styles.overlay}
      onClick={() => setOpen(false)}
      role="presentation"
      style={{ zIndex: zIndexMap.globalToast - 1 }}
    >
      <section
        className={clsx(styles.panel, !isMobile && styles.panelPc)}
        role="dialog"
        aria-modal="true"
        aria-label="开发设置"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <span className={styles.headerSpacer} aria-hidden />
          <h2>系统设置</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={() => setOpen(false)}
            aria-label="关闭"
          >
            <CloseSvg className={styles.closeIcon} />
          </button>
        </header>

        <div className={styles.content}>
          <ul className={styles.btnBox}>
            <li>
              <span>会员账号</span>
              <ClientOnly>
                <span className={styles.userName}>{userName}</span>
              </ClientOnly>
            </li>
          </ul>

          <ul className={styles.btnBox}>
            {switchOptions.map((item) => (
              <li key={item.value}>
                <span>{item.label}</span>
                <ClientOnly>
                  <Switch
                    checked={item.checked}
                    onChange={(checked) => updateSystemConfig({ [item.value]: checked })}
                  />
                </ClientOnly>
              </li>
            ))}
            <li>
              <span>字体大小</span>
              <ClientOnly>
                <SegmentedControl
                  options={FONT_SIZE_OPTIONS}
                  value={fontScaleType ?? FontScaleType.NORMAL}
                  onChange={(value) => setFontScaleType(value)}
                />
              </ClientOnly>
            </li>
            <li>
              <span>外观样式</span>
              <ClientOnly>
                <SegmentedControl
                  options={THEME_OPTIONS}
                  value={themeMode ?? 'system'}
                  onChange={(value) => setTheme(value)}
                />
              </ClientOnly>
            </li>
            <li>
              <span>体育场馆</span>
              <ClientOnly>
                <SegmentedControl
                  options={SPORT_VENUE_OPTIONS}
                  value={sportVenue ?? EVenue.FB}
                  onChange={(value) => dispatch(setVenue(value))}
                />
              </ClientOnly>
            </li>
          </ul>

          {isLogin && (
            <Button type="primary" className={clsx(styles.logoutButton)} onClick={handleLogout}>
              退出登录
            </Button>
          )}
          <button type="button" className={styles.customerButton} onClick={openCustomerService}>
            <Icon
              src="/images/common/CustomerService.svg"
              size={16}
              color="var(--ThemeColor-Main)"
            />
            <span>在线客服</span>
          </button>
        </div>
      </section>
    </div>
  ) : null;

  return createPortal(
    <>
      {floatButton}
      {modal}
    </>,
    document.body,
  );
};

export default DevSystemSettingsFloat;

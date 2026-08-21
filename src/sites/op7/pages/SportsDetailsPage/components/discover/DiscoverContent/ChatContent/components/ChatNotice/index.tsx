import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Icon from '@/common/components/Icon';
import type { ChatNotice } from '@/core/sdk/IMManager';
import {
  safeGetLocalString,
  safeRemoveLocal,
  safeSetLocalString,
} from '@/utils/storage/webStorage';
import styles from './ChatNotice.module.scss';

interface ChatNoticeProps {
  notices: ChatNotice[];
}

/** 与 Flutter SharedPreferences key 对齐 */
const NOTICE_HIDDEN_UNTIL_KEY = 'chat/noticeHiddenUntil';
/** 关闭后隐藏时长（毫秒），对齐 Flutter 24h */
const NOTICE_HIDE_DURATION_MS = 24 * 60 * 60 * 1000;
/** 滚动速度 px/s，对齐 Flutter `_kNoticePixelsPerSecond` */
const PIXELS_PER_SECOND = 50;
/** 最短一轮时长（秒），对齐 Flutter min 3000ms */
const MIN_DURATION_SEC = 3;
/** 首次静止展示时长（秒），对齐 Flutter 2s */
const INITIAL_PAUSE_SEC = 2;
/** 公告间隔（px），对齐 Flutter `_kMarqueeSeparatorWidth` */
const SEPARATOR_WIDTH = 40;

const readHiddenUntil = (): number | null => {
  const raw = safeGetLocalString(NOTICE_HIDDEN_UNTIL_KEY);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
};

const writeHiddenUntil = (until: number) => {
  safeSetLocalString(NOTICE_HIDDEN_UNTIL_KEY, String(until));
};

const clearHiddenUntil = () => {
  safeRemoveLocal(NOTICE_HIDDEN_UNTIL_KEY);
};

/**
 * 聊天室公告栏（对齐 emc ChatNotice）
 * - 可关闭，本地持久化隐藏 24 小时
 * - 双轮文案无缝横向走马灯，50px/s；进入后先静止 2s 再滚动
 */
const ChatNoticeBar: React.FC<ChatNoticeProps> = ({ notices }) => {
  const [hidden, setHidden] = useState(true);
  const [ready, setReady] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [durationSec, setDurationSec] = useState(MIN_DURATION_SEC);
  const trackRef = useRef<HTMLDivElement>(null);

  const contents = useMemo(() => notices.map((item) => item.content).filter(Boolean), [notices]);

  useEffect(() => {
    const until = readHiddenUntil();
    const now = Date.now();
    if (until != null && until > now) {
      setHidden(true);
    } else {
      if (until != null && until <= now) clearHiddenUntil();
      setHidden(false);
    }
    setReady(true);
  }, []);

  const handleClose = useCallback(() => {
    writeHiddenUntil(Date.now() + NOTICE_HIDE_DURATION_MS);
    setHidden(true);
  }, []);

  // 测量单轮宽度 → 时长 = max(3s, width / 50)
  useEffect(() => {
    if (!ready || hidden || contents.length === 0) return;

    const measure = () => {
      const el = trackRef.current;
      if (!el) return;
      const loopWidth = el.scrollWidth / 2;
      if (loopWidth <= 0) return;
      setDurationSec(Math.max(MIN_DURATION_SEC, loopWidth / PIXELS_PER_SECOND));
    };

    measure();
    const raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [contents, hidden, ready]);

  // 首次静止 2s 后再开滚
  useEffect(() => {
    if (!ready || hidden || contents.length === 0) {
      setScrolling(false);
      return;
    }
    setScrolling(false);
    const timer = window.setTimeout(() => setScrolling(true), INITIAL_PAUSE_SEC * 1000);
    return () => window.clearTimeout(timer);
  }, [contents, hidden, ready]);

  if (!ready || hidden || contents.length === 0) return null;

  // 两轮内容：滚完一轮（-50%）时第二轮刚好接上，视觉无缝
  const renderRound = (keyPrefix: string) =>
    contents.map((text, index) => (
      <React.Fragment key={`${keyPrefix}-${index}`}>
        <span className={styles.item}>{text}</span>
        <span className={styles.separator} style={{ width: SEPARATOR_WIDTH }} aria-hidden />
      </React.Fragment>
    ));

  return (
    <div className={styles.noticeBar}>
      <span className={styles.iconWrap} aria-hidden>
        <Icon src="/images/common/notice.svg" size={10} color="var(--White-100)" />
      </span>
      <div className={styles.textWrap}>
        <div
          ref={trackRef}
          className={`${styles.track}${scrolling ? ` ${styles.scrolling}` : ''}`}
          style={{ ['--notice-marquee-duration' as string]: `${durationSec}s` }}
        >
          {renderRound('a')}
          {renderRound('b')}
        </div>
      </div>
      <button type="button" className={styles.closeBtn} onClick={handleClose} aria-label="关闭公告">
        <Icon src="/images/common/close.svg" size={20} color="var(--ThemeColor-Main)" />
      </button>
    </div>
  );
};

export default ChatNoticeBar;

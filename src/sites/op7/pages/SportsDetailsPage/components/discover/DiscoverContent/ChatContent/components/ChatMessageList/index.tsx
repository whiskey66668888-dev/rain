import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChatMessageType, type ChatMessage, type ChatMuteInfo } from '@/core/sdk/IMManager';
import TextMessageItem from '../messages/TextMessageItem';
import BetShareMessageItem from '../messages/BetShareMessageItem';
import MatchShareMessageItem from '../messages/MatchShareMessageItem';
import AdminTextMessageItem from '../messages/AdminTextMessageItem';
import SystemNoticeMessageItem from '../messages/SystemNoticeMessageItem';
import MuteNoticeMessageItem from '../messages/MuteNoticeMessageItem';
import ChatMessageVisibilityItem from '../ChatMessageVisibilityItem';
import { scrollPageBy, useElementHeight } from '../../hooks/useChatLayoutHeight';
import styles from './ChatMessageList.module.scss';
import clsx from 'clsx';
import { useAppSelector } from '@/core/store/hooks';
import { getSystemTheme } from '@/utils';

interface ChatMessageListProps {
  messages: ChatMessage[];
  pendingCount?: number;
  muteInfo?: ChatMuteInfo | null;
  onBottomStateChange?: (isBottom: boolean) => void;
  onFlushPending?: () => void;
  onQuoteMessage?: (message: ChatMessage) => void;
  onContactService?: () => void;
}

const BOTTOM_THRESHOLD = 24;
/** 对齐 Flutter _scrollWhenAttached 重试，消化 H5 布局/懒渲染未完成的贴底抖动 */
const STICK_BOTTOM_RETRY_FRAMES = 16;

/** 同用户连续消息折叠 header（对齐 emc _shouldShowHeader，正序列表） */
const shouldShowHeader = (list: ChatMessage[], index: number): boolean => {
  if (index <= 0) return true;
  const current = list[index];
  const prev = list[index - 1];
  if (!current || !prev) return true;
  if (prev.type === ChatMessageType.SystemNotice) return true;
  if (current.type === ChatMessageType.SystemNotice) return true;
  if (current.type === ChatMessageType.MuteNotice) return true;
  if (prev.type === ChatMessageType.MuteNotice) return true;

  const currentUserId = current.user?.userId ?? '';
  const prevUserId = prev.user?.userId ?? '';
  if (currentUserId !== prevUserId) return true;

  if (
    prev.type === ChatMessageType.BetShare ||
    prev.type === ChatMessageType.MatchShare ||
    prev.type === ChatMessageType.HotWord
  ) {
    return true;
  }
  return false;
};

const isAtBottomEl = (el: HTMLDivElement) =>
  el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD;

/**
 * 消息列表分发（对齐 emc chat_body）
 * - H5 骨架结束后多帧/ResizeObserver 贴底，避免最后一条被裁切
 * - 未到底时右下角悬浮回到底部按钮（对齐 Flutter buildScrollButtons）
 */
const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  pendingCount = 0,
  muteInfo,
  onBottomStateChange,
  onFlushPending,
  onQuoteMessage,
  onContactService,
}) => {
  const { ref: wrapperRef, height: wrapperHeight } = useElementHeight<HTMLDivElement>();
  const listRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const userAtBottomRef = useRef(true);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = screenBreakpoint === 'md';

  const setListNode = useCallback((node: HTMLDivElement | null) => {
    listRef.current = node;
    setScrollRoot(node);
  }, []);

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => Number(a.sendTime) - Number(b.sendTime)),
    [messages],
  );

  const syncBottomState = useCallback(
    (next: boolean) => {
      userAtBottomRef.current = next;
      setIsAtBottom(next);
      onBottomStateChange?.(next);
      if (next && pendingCount > 0) onFlushPending?.();
    },
    [onBottomStateChange, onFlushPending, pendingCount],
  );

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'auto') => {
      const el = listRef.current;
      if (!el) return;
      if (behavior === 'smooth') {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      } else {
        el.scrollTop = el.scrollHeight;
      }
      syncBottomState(true);
    },
    [syncBottomState],
  );

  /** 内容高度仍在变化时连续贴底（解决 H5 首次进入最后一条未露出） */
  const stickToBottomWithRetry = useCallback(() => {
    let frames = 0;
    let lastScrollHeight = -1;

    const step = () => {
      const el = listRef.current;
      if (!el || !userAtBottomRef.current) return;
      el.scrollTop = el.scrollHeight;
      const nextHeight = el.scrollHeight;
      frames += 1;
      if (nextHeight !== lastScrollHeight || frames < 4) {
        lastScrollHeight = nextHeight;
        if (frames < STICK_BOTTOM_RETRY_FRAMES) {
          requestAnimationFrame(step);
          return;
        }
      }
      syncBottomState(isAtBottomEl(el));
    };

    requestAnimationFrame(step);
  }, [syncBottomState]);

  useEffect(() => {
    if (!userAtBottomRef.current) return;
    stickToBottomWithRetry();
  }, [sortedMessages.length, wrapperHeight, stickToBottomWithRetry]);

  // 懒渲染 / 图片撑高后继续贴底
  useEffect(() => {
    const content = contentRef.current;
    if (!content || typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver(() => {
      if (!userAtBottomRef.current) return;
      const el = listRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    });
    ro.observe(content);
    return () => ro.disconnect();
  }, [sortedMessages.length]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    syncBottomState(isAtBottomEl(el));
  };

  /** 列表顶部下拉 → 外层滚回，展开 MatchInfo；上滑只滚列表（仅 H5） */
  useEffect(() => {
    const el = listRef.current;
    if (!el || !isMobile) return;

    const onWheel = (event: WheelEvent) => {
      if (el.scrollTop > 0 || event.deltaY >= 0) return;
      if (scrollPageBy(el, event.deltaY)) event.preventDefault();
    };

    let touchY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (el.scrollTop > 0) return;
      const y = event.touches[0]?.clientY ?? 0;
      const dy = y - touchY;
      if (dy <= 0) return;
      touchY = y;
      if (scrollPageBy(el, -dy)) event.preventDefault();
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, [scrollRoot, isMobile]);

  const handleScrollToBottomClick = () => {
    scrollToBottom('smooth');
    onFlushPending?.();
  };

  const renderItem = (message: ChatMessage, showHeader: boolean) => {
    if (message.type === ChatMessageType.MuteNotice) {
      return (
        <MuteNoticeMessageItem
          message={message}
          liveMuteInfo={muteInfo}
          onContactService={onContactService}
        />
      );
    }
    if (message.type === ChatMessageType.SystemNotice) {
      return <SystemNoticeMessageItem message={message} />;
    }
    if (message.type === ChatMessageType.BetShare) {
      if (!message.betInfo || !message.user) {
        return (
          <TextMessageItem
            message={{
              ...message,
              type: ChatMessageType.Text,
              content: message.content || '[晒单消息解析失败]',
            }}
            showHeader={showHeader}
          />
        );
      }
      return <BetShareMessageItem message={message} showHeader={showHeader} />;
    }
    if (message.type === ChatMessageType.MatchShare) {
      return (
        <MatchShareMessageItem message={message} showHeader={showHeader} onQuote={onQuoteMessage} />
      );
    }
    if (message.isImAdmin && message.type === ChatMessageType.Text) {
      return <AdminTextMessageItem message={message} />;
    }
    return <TextMessageItem message={message} showHeader={showHeader} />;
  };

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <div
        className={styles.list}
        ref={setListNode}
        onScroll={handleScroll}
        style={wrapperHeight > 0 ? { height: wrapperHeight } : undefined}
      >
        <div ref={contentRef} className={styles.content}>
          {sortedMessages.map((message, index) => {
            const showHeader = shouldShowHeader(sortedMessages, index);
            const nextGrouped =
              index + 1 < sortedMessages.length && !shouldShowHeader(sortedMessages, index + 1);
            const grouped = !showHeader || nextGrouped;
            // 贴底附近强制渲染，避免占位高度导致首次滚动不到真正底部
            const forceRender = index >= sortedMessages.length - 12;
            return (
              <ChatMessageVisibilityItem
                key={message.id}
                scrollRoot={scrollRoot}
                forceRender={forceRender}
              >
                <div className={clsx(styles.item, grouped && styles.itemGrouped)}>
                  {renderItem(message, showHeader)}
                </div>
              </ChatMessageVisibilityItem>
            );
          })}
        </div>
      </div>

      {pendingCount > 0 && (
        <button
          type="button"
          className={clsx(styles.pendingBadge, '_tf[12]')}
          onClick={handleScrollToBottomClick}
        >
          {pendingCount} 条新消息
        </button>
      )}

      {/* 对齐 Flutter buildScrollButtons：未到底时右下角回到底部 */}
      {!isAtBottom && (
        <button
          type="button"
          className={styles.scrollToBottomBtn}
          onClick={handleScrollToBottomClick}
          aria-label="回到底部"
        >
          <img src={`/images/${theme}/chat/ic_arrow_down.png`} alt="" width={28} height={28} />
        </button>
      )}
    </div>
  );
};

export default ChatMessageList;

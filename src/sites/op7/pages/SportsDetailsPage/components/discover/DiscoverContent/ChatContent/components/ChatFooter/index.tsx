import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useChatRoomActions, useChatRoomFields } from '../../ChatRoomProvider';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { openLoginModal } from '@/core/store/slices/authUISlice';
import {
  getMatchScoreText,
  type ChatConfigInfo,
  type ChatMessage,
  type HotWordItem,
  type BetShareCard,
} from '@/core/sdk/IMManager';
import { toast } from '@/common/components/Toast';
import emojiIcon from '@/sites/op7/images/common/chat/ic_emoji-56586a.png';
import matchIcon from '@/sites/op7/images/common/chat/ic_match.svg';
import sendIcon from '@/sites/op7/images/common/chat/ic_send.svg';
import openShareOrderDialog from '../ShareOrderDialog';
import EmojiPanel from './EmojiPanel';
import styles from './ChatFooter.module.scss';

const splitGraphemes = (value: string): string[] => {
  try {
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
      return Array.from(segmenter.segment(value), (item) => item.segment);
    }
  } catch {
    // 旧浏览器退回 code point，至少不会拆开代理对。
  }
  return Array.from(value);
};

const deletePreviousGrapheme = (value: string, cursor: number): [string, number] => {
  if (cursor <= 0) return [value, cursor];
  const before = value.slice(0, cursor);
  const graphemes = splitGraphemes(before);
  graphemes.pop();
  const nextBefore = graphemes.join('');
  return [`${nextBefore}${value.slice(cursor)}`, nextBefore.length];
};

interface ChatFooterProps {
  hotWords: HotWordItem[];
  chatConfig?: ChatConfigInfo | null;
  /** 上层已算好的门槛文案；空串=可发 */
  sendDisabledHint?: string;
  sending?: boolean;
  quotedMessage?: ChatMessage | null;
  onClearQuote?: () => void;
  onSendText: (text: string) => Promise<boolean>;
  onSendHotWord: (word: string) => Promise<boolean>;
  onSendMatchShare: () => Promise<boolean>;
  onSendBetShare: (payload: BetShareCard) => Promise<boolean>;
}

/**
 * 底部输入区：热词 / 表情 / 本场比赛 / 晒单 / 文本发送
 * 门槛校验由 useChatRoom 统一产出 sendDisabledHint，这里只负责展示与拦截
 */
const ChatFooter: React.FC<ChatFooterProps> = ({
  hotWords,
  chatConfig,
  sendDisabledHint = '',
  sending,
  quotedMessage,
  onClearQuote,
  onSendText,
  onSendHotWord,
  onSendMatchShare,
  onSendBetShare,
}) => {
  const dispatch = useAppDispatch();
  const [text, setText] = useState('');
  const [emojiPanelVisible, setEmojiPanelVisible] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  /** 软键盘贴底仅 H5 需要；PC 无软键盘，fixed 会错位 */
  const isMobile = screenBreakpoint === 'md';
  const dockToKeyboard = isMobile && inputFocused;
  const footerSlotRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectionRef = useRef({ start: 0, end: 0 });
  const composingRef = useRef(false);

  const canChat = !sendDisabledHint;
  const canAct = isLogin && canChat && !sending;
  const hasText = text.trim().length > 0;
  const maxLength = Number(chatConfig?.textLength ?? 200);

  const placeholder = useMemo(() => {
    if (sendDisabledHint) return sendDisabledHint;
    return '说点什么吧…';
  }, [sendDisabledHint]);

  const quotePreviewText = useMemo(() => {
    const info = quotedMessage?.matchShareInfo;
    if (!info) return '';
    const score = getMatchScoreText(info);
    return `${info.leagueName || ''} ${info.homeTeamName || info.homeTeam || ''} ${score} ${info.awayTeamName || info.awayTeam || ''}`.trim();
  }, [quotedMessage]);

  const requestLogin = useCallback(() => {
    dispatch(openLoginModal());
  }, [dispatch]);

  const guardOrToast = (): boolean => {
    if (!isLogin) {
      requestLogin();
      return false;
    }
    if (sendDisabledHint) {
      toast({ type: 'warning', description: sendDisabledHint });
      return false;
    }
    return true;
  };

  const submitText = async () => {
    const content = text.replace(/\s+/g, ' ').trim();
    if (!content || sending) return;
    if (!guardOrToast()) return;
    if (maxLength > 0 && splitGraphemes(content).length > maxLength) {
      toast({ type: 'warning', description: '消息过长' });
      return;
    }
    const ok = await onSendText(content);
    if (ok) {
      setText('');
      setEmojiPanelVisible(false);
      setInputFocused(false);
      selectionRef.current = { start: 0, end: 0 };
      inputRef.current?.blur();
    }
  };

  const openShareDialog = () => {
    if (!guardOrToast() || sending) return;
    setEmojiPanelVisible(false);
    setInputFocused(false);
    inputRef.current?.blur();
    openShareOrderDialog({
      minAmount: Number(chatConfig?.showBetAmount ?? 0),
      onConfirm: onSendBetShare,
    });
  };

  const syncSelection = () => {
    const input = inputRef.current;
    if (!input) return;
    selectionRef.current = {
      start: input.selectionStart ?? text.length,
      end: input.selectionEnd ?? text.length,
    };
  };

  const updateText = (nextText: string, cursor = nextText.length, restoreCursor = false) => {
    if (maxLength > 0 && splitGraphemes(nextText).length > maxLength) {
      toast({ type: 'warning', description: '消息过长' });
      return;
    }
    setText(nextText);
    selectionRef.current = { start: cursor, end: cursor };
    // 仅表情插入/删除等程序改文案时恢复光标；普通输入由浏览器自己维护，
    // 每次 setSelectionRange 会在 iOS 上造成视口抖动
    if (restoreCursor) {
      requestAnimationFrame(() => inputRef.current?.setSelectionRange(cursor, cursor));
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const { start, end } = selectionRef.current;
    const nextText = `${text.slice(0, start)}${emoji}${text.slice(end)}`;
    updateText(nextText, start + emoji.length, true);
  };

  const handleEmojiDelete = () => {
    const { start, end } = selectionRef.current;
    if (start !== end) {
      updateText(`${text.slice(0, start)}${text.slice(end)}`, start, true);
      return;
    }
    const [nextText, nextCursor] = deletePreviousGrapheme(text, start);
    updateText(nextText, nextCursor, true);
  };

  const toggleEmojiPanel = () => {
    // 对齐 Flutter：未登录时工具图标不触发登录，仅输入胶囊可唤起登录。
    if (!isLogin) return;
    if (!guardOrToast()) return;
    if (emojiPanelVisible) {
      setEmojiPanelVisible(false);
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }
    syncSelection();
    setEmojiPanelVisible(true);
    setInputFocused(false);
    inputRef.current?.blur();
  };

  useEffect(() => {
    if (!emojiPanelVisible) return undefined;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!footerRef.current?.contains(target)) setEmojiPanelVisible(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [emojiPanelVisible]);

  /**
   * iOS 软键盘不会稳定地缩放 layout viewport。
   * 仅 H5：聚焦时将输入栏固定到 visualViewport 底边（即键盘顶边），并保留原占位高度。
   * PC 保持文档流，避免 fixed 相对视口错位（右侧栏/居中内容）。
   * 事件中只写 CSS 变量，不触发 React render，避免滚动时掉帧。
   */
  useLayoutEffect(() => {
    if (!dockToKeyboard) return undefined;

    const slot = footerSlotRef.current;
    const footer = footerRef.current;
    if (!slot || !footer) return undefined;

    let raf = 0;
    const updatePosition = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const visualViewport = window.visualViewport;
        const slotRect = slot.getBoundingClientRect();
        const footerHeight = footer.offsetHeight;
        const visualBottom = visualViewport
          ? visualViewport.offsetTop + visualViewport.height
          : window.innerHeight;

        slot.style.height = `${footerHeight}px`;
        footer.style.setProperty(
          '--chat-footer-top',
          `${Math.round(visualBottom - footerHeight)}px`,
        );
        footer.style.setProperty('--chat-footer-left', `${Math.round(slotRect.left)}px`);
        footer.style.setProperty('--chat-footer-width', `${Math.round(slotRect.width)}px`);
      });
    };

    updatePosition();

    const visualViewport = window.visualViewport;
    visualViewport?.addEventListener('resize', updatePosition);
    visualViewport?.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updatePosition) : null;
    resizeObserver?.observe(footer);

    return () => {
      cancelAnimationFrame(raf);
      visualViewport?.removeEventListener('resize', updatePosition);
      visualViewport?.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
      resizeObserver?.disconnect();
      slot.style.removeProperty('height');
      footer.style.removeProperty('--chat-footer-top');
      footer.style.removeProperty('--chat-footer-left');
      footer.style.removeProperty('--chat-footer-width');
    };
  }, [dockToKeyboard]);

  const showHotWords = inputFocused && !emojiPanelVisible && !quotedMessage && hotWords.length > 0;

  return (
    <div ref={footerSlotRef} className={styles.footerSlot}>
      <div
        ref={footerRef}
        className={clsx(styles.footer, dockToKeyboard && styles.footerKeyboardOpen)}
      >
        {showHotWords ? (
          <div className={styles.hotWordRow} onPointerDown={(event) => event.preventDefault()}>
            {hotWords.map((word) => (
              <button
                type="button"
                key={word.content}
                className={styles.hotWordBtn}
                onClick={() => {
                  if (!guardOrToast()) return;
                  void onSendHotWord(word.content).finally(() => {
                    setInputFocused(false);
                    inputRef.current?.blur();
                  });
                }}
              >
                {word.content}
              </button>
            ))}
          </div>
        ) : null}

        {quotedMessage && quotePreviewText ? (
          <div className={styles.quotePreview}>
            <span className={styles.quoteBar} />
            <span className={styles.quoteText}>{quotePreviewText}</span>
            <button type="button" className={styles.quoteClose} onClick={onClearQuote}>
              ×
            </button>
          </div>
        ) : null}

        <div className={styles.inputRow}>
          {isLogin ? (
            <div
              className={clsx(styles.inputShell, !canChat && styles.inputShellDisabled)}
              onClick={() => {
                if (!canChat) toast({ type: 'warning', description: sendDisabledHint });
              }}
            >
              <input
                ref={inputRef}
                className={styles.input}
                value={text}
                readOnly={!canChat}
                placeholder={placeholder}
                enterKeyHint="send"
                onChange={(event) =>
                  updateText(event.target.value, event.target.selectionStart ?? 0)
                }
                onFocus={() => {
                  if (!canChat) {
                    inputRef.current?.blur();
                    return;
                  }
                  setInputFocused(true);
                  setEmojiPanelVisible(false);
                }}
                onBlur={() => {
                  syncSelection();
                  setInputFocused(false);
                }}
                onClick={syncSelection}
                onKeyUp={syncSelection}
                onSelect={syncSelection}
                onCompositionStart={() => {
                  composingRef.current = true;
                }}
                onCompositionEnd={() => {
                  composingRef.current = false;
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing &&
                    !composingRef.current
                  ) {
                    event.preventDefault();
                    void submitText();
                  }
                }}
              />
            </div>
          ) : (
            <button type="button" className={styles.loginInput} onClick={requestLogin}>
              登录进行聊天
            </button>
          )}

          <button
            type="button"
            className={clsx(styles.iconBtn, !canAct && styles.iconBtnDisabled)}
            aria-label="表情"
            onPointerDown={(event) => event.preventDefault()}
            onClick={toggleEmojiPanel}
          >
            <img src={emojiIcon} alt="" />
          </button>
          <button
            type="button"
            className={clsx(styles.iconBtn, !canAct && styles.iconBtnDisabled)}
            aria-label="发送本场比赛"
            onClick={() => {
              if (!isLogin) return;
              if (!guardOrToast()) return;
              setEmojiPanelVisible(false);
              void onSendMatchShare();
            }}
          >
            <img src={matchIcon} alt="" />
          </button>
          <button
            type="button"
            className={clsx(
              styles.primaryAction,
              hasText && styles.sendAction,
              !canAct && styles.iconBtnDisabled,
            )}
            aria-label={hasText ? '发送' : '晒单'}
            disabled={sending}
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => {
              if (!isLogin) return;
              if (hasText) void submitText();
              else openShareDialog();
            }}
          >
            {hasText ? <img src={sendIcon} alt="" /> : <span>晒</span>}
          </button>
        </div>

        {emojiPanelVisible && isLogin ? (
          <EmojiPanel onSelect={handleEmojiSelect} onDelete={handleEmojiDelete} />
        ) : null}
      </div>
    </div>
  );
};

const ChatFooterView = memo(ChatFooter);

const ChatFooterConnected = memo(function ChatFooterConnected() {
  const { hotWords, chatConfig, sendDisabledHint, sending, quotedMessage } = useChatRoomFields(
    'hotWords',
    'chatConfig',
    'sendDisabledHint',
    'sending',
    'quotedMessage',
  );
  const { setQuotedMessage, sendText, sendHotWord, sendMatchShare, sendBetShare } =
    useChatRoomActions();

  return (
    <ChatFooterView
      hotWords={hotWords}
      chatConfig={chatConfig ?? null}
      sendDisabledHint={sendDisabledHint}
      sending={sending}
      quotedMessage={quotedMessage}
      onClearQuote={() => setQuotedMessage(null)}
      onSendText={sendText}
      onSendHotWord={sendHotWord}
      onSendMatchShare={sendMatchShare}
      onSendBetShare={sendBetShare}
    />
  );
});

export default ChatFooterConnected;

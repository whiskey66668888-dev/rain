import { useRef } from 'react';
import SegmentedControl from '@/common/components/SegmentedControl';
import styles from './ChatContent.module.scss';
import Icon from '@/common/components/Icon';
import { ChatRoomProvider, useChatRoomContext } from './ChatRoomProvider';
import ChatNoticeBar from './components/ChatNotice';
import ChatBody from './components/ChatBody';
import ChatFooter from './components/ChatFooter';
import openChatRuleDialog from './components/ChatRuleDialog';
import VipCelebration from './components/VipCelebration';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';
import { useAppSelector } from '@/core/store/hooks';
import {
  scrollPageBy,
  useChatFixedLayout,
  useFillViewportHeight,
} from './hooks/useChatLayoutHeight';
import type { ChatContentProps, ChatFilterType } from './types';

const CHAT_FILTER_OPTIONS: { value: ChatFilterType; label: string }[] = [
  { value: 'chat', label: '所有聊天' },
  { value: 'share', label: '只看晒单' },
  { value: 'big', label: '只看大单' },
];

/**
 * 聊天内容
 * - H5：fixed + spacer，外层可滚走 MatchInfo，聊天始终贴底
 * - Web：不启用收起头部，按「当前顶 → 视口底」填满，避免滚走后留白
 */
const ChatContentInner = () => {
  const openCustomerService = useOpenCustomerService();
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = screenBreakpoint === 'md';

  const fixedLayout = useChatFixedLayout<HTMLDivElement>(isMobile);
  const fillLayout = useFillViewportHeight<HTMLDivElement>();
  const filterTouchYRef = useRef<number | null>(null);

  const {
    chatFilterType,
    setChatFilterType,
    notices,
    hotWords,
    isInitializing,
    isFilteredLoading,
    messages,
    filteredBetMessages,
    filteredBigOrderMessages,
    pendingMessages,
    sendDisabledHint,
    sending,
    vipEntry,
    muteInfo,
    quotedMessage,
    setQuotedMessage,
    chatConfig,
    setIsAtBottom,
    flushPendingMessages,
    sendText,
    sendHotWord,
    sendMatchShare,
    sendBetShare,
  } = useChatRoomContext();

  const handleChangeFilter = (value: ChatFilterType) => {
    setChatFilterType(value);
    flushPendingMessages();
  };

  const chatPanel = (
    <>
      <div
        className={styles.chatFilter}
        onWheel={
          isMobile
            ? (e) => {
                if (e.deltaY === 0) return;
                if (scrollPageBy(e.currentTarget, e.deltaY)) e.preventDefault();
              }
            : undefined
        }
        onTouchStart={
          isMobile
            ? (e) => {
                filterTouchYRef.current = e.touches[0]?.clientY ?? null;
              }
            : undefined
        }
        onTouchMove={
          isMobile
            ? (e) => {
                if (filterTouchYRef.current == null) return;
                const y = e.touches[0]?.clientY;
                if (y == null) return;
                const delta = filterTouchYRef.current - y;
                filterTouchYRef.current = y;
                if (delta !== 0 && scrollPageBy(e.currentTarget, delta)) {
                  e.preventDefault();
                }
              }
            : undefined
        }
        onTouchEnd={
          isMobile
            ? () => {
                filterTouchYRef.current = null;
              }
            : undefined
        }
      >
        <SegmentedControl
          options={CHAT_FILTER_OPTIONS}
          value={chatFilterType}
          onChange={handleChangeFilter}
          className="bg-[var(--Background-300)]"
          height={28}
          tabButtonClassName="_tf[12]"
        />
        <button
          type="button"
          className={styles.ruleButton}
          onClick={() => openChatRuleDialog(chatConfig ?? null)}
        >
          <Icon src="/images/common/information.svg" size="18px" color="var(--Text-800)" />
        </button>
      </div>
      <ChatNoticeBar notices={notices} />
      <div className={styles.mainStack}>
        {vipEntry && (
          <div className={styles.vipOverlay}>
            <VipCelebration vipLevel={vipEntry.vipLevel} nickname={vipEntry.nickname} />
          </div>
        )}
        <ChatBody
          loading={isInitializing}
          isFilteredLoading={isFilteredLoading}
          filterType={chatFilterType}
          chatConfig={chatConfig}
          messages={messages}
          shareMessages={filteredBetMessages}
          bigMessages={filteredBigOrderMessages}
          pendingCount={pendingMessages.length}
          muteInfo={muteInfo}
          onBottomStateChange={setIsAtBottom}
          onFlushPending={flushPendingMessages}
          onQuoteMessage={setQuotedMessage}
          onContactService={openCustomerService}
        />
      </div>
      <ChatFooter
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
    </>
  );

  if (!isMobile) {
    return (
      <div
        ref={fillLayout.ref}
        className={styles.chatWrapper}
        style={fillLayout.height ? { height: fillLayout.height } : undefined}
      >
        {chatPanel}
      </div>
    );
  }

  const { spacerHeight, panelStyle } = fixedLayout.layout;
  return (
    <div className={styles.chatRoot} data-chat-root>
      <div ref={fixedLayout.anchorRef} className={styles.chatAnchor} aria-hidden />
      <div className={styles.chatSpacer} style={{ height: spacerHeight }} aria-hidden />
      <div className={styles.chatWrapper} style={panelStyle}>
        {chatPanel}
      </div>
    </div>
  );
};

const ChatContent = ({ sportId, chatConfig, matchShareInfo }: ChatContentProps) => {
  return (
    <ChatRoomProvider sportId={sportId} chatConfig={chatConfig} matchShareInfo={matchShareInfo}>
      <ChatContentInner />
    </ChatRoomProvider>
  );
};

export default ChatContent;

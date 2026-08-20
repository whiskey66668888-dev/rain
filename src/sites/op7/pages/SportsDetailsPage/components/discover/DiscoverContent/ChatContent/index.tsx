import { memo } from 'react';
import styles from './ChatContent.module.scss';
import { ChatRoomProvider, useChatRoomFields } from './ChatRoomProvider';
import ChatNoticeBar from './components/ChatNotice';
import ChatBody from './components/ChatBody';
import ChatFooter from './components/ChatFooter';
import ChatFilterBar from './components/ChatFilterBar';
import VipCelebration from './components/VipCelebration';
import { useAppSelector } from '@/core/store/hooks';
import { useChatFixedLayout, useFillViewportHeight } from './hooks/useChatLayoutHeight';
import type { ChatContentProps } from './types';

const ConnectedChatNoticeBar = memo(function ConnectedChatNoticeBar() {
  const { notices } = useChatRoomFields('notices');
  return <ChatNoticeBar notices={notices} />;
});

const ChatVipOverlay = memo(function ChatVipOverlay() {
  const { vipEntry } = useChatRoomFields('vipEntry');
  if (!vipEntry) return null;
  return (
    <div className={styles.vipOverlay}>
      <VipCelebration vipLevel={vipEntry.vipLevel} nickname={vipEntry.nickname} />
    </div>
  );
});

/**
 * 聊天内容
 * - H5：fixed + spacer，外层可滚走 MatchInfo，聊天始终贴底
 * - Web：不启用收起头部，按「当前顶 → 视口底」填满，避免滚走后留白
 * - 自身不订阅消息/发送状态，避免新消息带动整棵聊天树重渲染
 */
const ChatContentInner = memo(function ChatContentInner() {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = screenBreakpoint === 'md';

  const fixedLayout = useChatFixedLayout<HTMLDivElement>(isMobile);
  const fillLayout = useFillViewportHeight<HTMLDivElement>();

  const chatPanel = (
    <>
      <ChatFilterBar />
      <ConnectedChatNoticeBar />
      <div className={styles.mainStack}>
        <ChatVipOverlay />
        <ChatBody />
      </div>
      <ChatFooter />
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
});

const ChatContent = ({ sportId, chatConfig, matchShareInfo }: ChatContentProps) => {
  return (
    <ChatRoomProvider sportId={sportId} chatConfig={chatConfig} matchShareInfo={matchShareInfo}>
      <ChatContentInner />
    </ChatRoomProvider>
  );
};

export default ChatContent;

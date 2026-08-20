import { memo, useRef } from 'react';
import SegmentedControl from '@/common/components/SegmentedControl';
import Icon from '@/common/components/Icon';
import { useAppSelector } from '@/core/store/hooks';
import { scrollPageBy } from '../../hooks/useChatLayoutHeight';
import {
  useChatFilterContext,
  useChatRoomActions,
  useChatRoomFields,
} from '../../ChatRoomProvider';
import openChatRuleDialog from '../ChatRuleDialog';
import type { ChatFilterType } from '../../types';
import styles from '../../ChatContent.module.scss';

const CHAT_FILTER_OPTIONS: { value: ChatFilterType; label: string }[] = [
  { value: 'chat', label: '所有聊天' },
  { value: 'share', label: '只看晒单' },
  { value: 'big', label: '只看大单' },
];

const ChatFilterBar = memo(function ChatFilterBar() {
  const isMobile = useAppSelector((state) => state.config.screenBreakpoint) === 'md';
  const { chatFilterType, setChatFilterType } = useChatFilterContext();
  const { flushPendingMessages } = useChatRoomActions();
  const { chatConfig } = useChatRoomFields('chatConfig');
  const filterTouchYRef = useRef<number | null>(null);

  const handleChangeFilter = (value: ChatFilterType) => {
    setChatFilterType(value);
    flushPendingMessages();
  };

  return (
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
  );
});

export default ChatFilterBar;

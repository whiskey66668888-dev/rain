import { memo } from 'react';
import ChatSkeleton from '../ChatSkeleton';
import ChatMessageList from '../ChatMessageList';
import styles from './ChatBody.module.scss';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';
import {
  useChatFilterContext,
  useChatRoomActions,
  useChatRoomFields,
  useChatRoomSelector,
  type TChatRoom,
} from '../../ChatRoomProvider';

const ChatBodyView = memo(function ChatBodyView() {
  const { chatFilterType } = useChatFilterContext();
  const { setIsAtBottom, flushPendingMessages, setQuotedMessage } = useChatRoomActions();
  const openCustomerService = useOpenCustomerService();
  const { isInitializing, isFilteredLoading, chatConfig, muteInfo } = useChatRoomFields(
    'isInitializing',
    'isFilteredLoading',
    'chatConfig',
    'muteInfo',
  );
  const messages = useChatRoomSelector((state: TChatRoom) => {
    if (chatFilterType === 'share') return state.filteredBetMessages;
    if (chatFilterType === 'big') return state.filteredBigOrderMessages;
    return state.messages;
  });
  const pendingCount = useChatRoomSelector((state: TChatRoom) =>
    chatFilterType === 'chat' ? state.pendingMessages.length : 0,
  );

  // 对齐 Flutter：chatSwitch != 1 未开放；配置未返回时不在此拦截（由 loading 骨架承接）
  if (chatConfig != null && chatConfig.chatSwitch !== 1) {
    return (
      <div className={styles.body}>
        <div className={styles.stateText}>聊天室暂未开放</div>
      </div>
    );
  }

  if (isInitializing || isFilteredLoading) {
    return (
      <div className={styles.body}>
        <ChatSkeleton />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={styles.body}>
        <div className={styles.stateText}>暂无聊天内容</div>
      </div>
    );
  }

  return (
    <div className={styles.body}>
      <ChatMessageList
        key={chatFilterType}
        messages={messages}
        pendingCount={pendingCount}
        muteInfo={muteInfo}
        onBottomStateChange={setIsAtBottom}
        onFlushPending={flushPendingMessages}
        onQuoteMessage={setQuotedMessage}
        onContactService={openCustomerService}
      />
    </div>
  );
});

export default ChatBodyView;

import React, { createContext, useCallback, useContext } from 'react';
import type { ChatConfigInfo, MatchShareInfo } from '@/core/sdk/IMManager';
import { useChatFilter } from './hooks/useChatFilter';
import { useChatRoom } from './hooks/useChatRoom';

interface ChatRoomProviderProps {
  children: React.ReactNode;
  sportId?: number;
  chatConfig?: ChatConfigInfo | null;
  matchShareInfo?: MatchShareInfo | null;
}

type ChatRoomContextValue = ReturnType<typeof useChatFilter> & ReturnType<typeof useChatRoom>;

const ChatRoomContext = createContext<ChatRoomContextValue | null>(null);

/** 聊天室局部状态：filter + 消息/发送/禁言，不进 Redux */
export const ChatRoomProvider: React.FC<ChatRoomProviderProps> = ({
  children,
  sportId,
  chatConfig,
  matchShareInfo,
}) => {
  const filterState = useChatFilter();
  const { setChatFilterType } = filterState;
  const onSwitchToChatTab = useCallback(() => {
    setChatFilterType('chat');
  }, [setChatFilterType]);

  const roomState = useChatRoom({
    sportId,
    chatConfig,
    activeFilterType: filterState.chatFilterType,
    matchShareInfo,
    onSwitchToChatTab,
  });

  return (
    <ChatRoomContext.Provider
      value={{
        ...filterState,
        ...roomState,
      }}
    >
      {children}
    </ChatRoomContext.Provider>
  );
};

export const useChatRoomContext = (): ChatRoomContextValue => {
  const ctx = useContext(ChatRoomContext);
  if (!ctx) {
    throw new Error('useChatRoomContext must be used in ChatRoomProvider');
  }
  return ctx;
};

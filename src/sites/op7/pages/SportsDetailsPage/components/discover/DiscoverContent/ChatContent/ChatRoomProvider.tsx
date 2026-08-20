import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import type { ChatConfigInfo, MatchShareInfo } from '@/core/sdk/IMManager';
import { createContextStore } from '@/common/hooks/createContextStore';
import { useChatFilter } from './hooks/useChatFilter';
import { useChatRoom } from './hooks/useChatRoom';

interface ChatRoomProviderProps {
  children: React.ReactNode;
  sportId?: number;
  chatConfig?: ChatConfigInfo | null;
  matchShareInfo?: MatchShareInfo | null;
}

export type TChatFilter = ReturnType<typeof useChatFilter>;
export type TChatRoom = ReturnType<typeof useChatRoom>;
export type TChatRoomActions = Pick<
  TChatRoom,
  | 'setQuotedMessage'
  | 'setIsAtBottom'
  | 'flushPendingMessages'
  | 'sendText'
  | 'sendHotWord'
  | 'sendMatchShare'
  | 'sendBetShare'
>;

const ChatFilterContext = createContext<TChatFilter | null>(null);
const ChatRoomActionsContext = createContext<TChatRoomActions | null>(null);
const chatRoomStore = createContextStore<TChatRoom>('ChatRoom');

function useStableChatRoomActions(room: TChatRoom): TChatRoomActions {
  const roomRef = useRef(room);
  roomRef.current = room;
  return useMemo<TChatRoomActions>(
    () => ({
      setQuotedMessage: (...args: Parameters<TChatRoom['setQuotedMessage']>) =>
        roomRef.current.setQuotedMessage(...args),
      setIsAtBottom: (...args: Parameters<TChatRoom['setIsAtBottom']>) =>
        roomRef.current.setIsAtBottom(...args),
      flushPendingMessages: () => roomRef.current.flushPendingMessages(),
      sendText: (...args: Parameters<TChatRoom['sendText']>) => roomRef.current.sendText(...args),
      sendHotWord: (...args: Parameters<TChatRoom['sendHotWord']>) =>
        roomRef.current.sendHotWord(...args),
      sendMatchShare: (...args: Parameters<TChatRoom['sendMatchShare']>) =>
        roomRef.current.sendMatchShare(...args),
      sendBetShare: (...args: Parameters<TChatRoom['sendBetShare']>) =>
        roomRef.current.sendBetShare(...args),
    }),
    [],
  );
}

/** 聊天室局部状态：filter 与消息分开展示，避免新消息带动筛选栏/输入区重渲染 */
export const ChatRoomProvider: React.FC<ChatRoomProviderProps> = ({
  children,
  sportId,
  chatConfig,
  matchShareInfo,
}) => {
  const filterState = useChatFilter();
  const { setChatFilterType, chatFilterType, isChatTab, isShareTab, isBigTab } = filterState;
  const onSwitchToChatTab = useCallback(() => {
    setChatFilterType('chat');
  }, [setChatFilterType]);

  const roomState = useChatRoom({
    sportId,
    chatConfig,
    activeFilterType: chatFilterType,
    matchShareInfo,
    onSwitchToChatTab,
  });

  const filterValue = useMemo<TChatFilter>(
    () => ({
      chatFilterType,
      setChatFilterType,
      isChatTab,
      isShareTab,
      isBigTab,
    }),
    [chatFilterType, setChatFilterType, isChatTab, isShareTab, isBigTab],
  );

  const actions = useStableChatRoomActions(roomState);

  return (
    <ChatFilterContext.Provider value={filterValue}>
      <ChatRoomActionsContext.Provider value={actions}>
        <chatRoomStore.Provider value={roomState}>{children}</chatRoomStore.Provider>
      </ChatRoomActionsContext.Provider>
    </ChatFilterContext.Provider>
  );
};

export const useChatFilterContext = (): TChatFilter => {
  const ctx = useContext(ChatFilterContext);
  if (!ctx) {
    throw new Error('useChatFilterContext must be used in ChatRoomProvider');
  }
  return ctx;
};

export function useChatRoomSelector<S>(
  selector: (state: TChatRoom) => S,
  isEqual: (left: S, right: S) => boolean = Object.is,
): S {
  return chatRoomStore.useSelector(selector, isEqual);
}

export function useChatRoomFields<K extends keyof TChatRoom>(...keys: K[]): Pick<TChatRoom, K> {
  return chatRoomStore.useFields(...keys);
}

export const useChatRoomActions = (): TChatRoomActions => {
  const actions = useContext(ChatRoomActionsContext);
  if (!actions) {
    throw new Error('useChatRoomActions must be used in ChatRoomProvider');
  }
  return actions;
};

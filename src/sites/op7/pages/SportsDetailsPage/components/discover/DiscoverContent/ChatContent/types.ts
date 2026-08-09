import type {
  ChatConfigInfo,
  ChatMessage,
  ChatNotice,
  ChatRoomInfo,
  HotWordItem,
  MatchShareInfo,
} from '@/core/sdk/IMManager';

export type ChatFilterType = 'chat' | 'share' | 'big';

export const CHAT_FILTER_INDEX_MAP: Record<ChatFilterType, 0 | 1 | 2> = {
  chat: 0,
  share: 1,
  big: 2,
};

export interface ChatContentProps {
  sportId?: number;
  loading?: boolean;
  chatConfig?: ChatConfigInfo | null;
  /** 本场比赛分享用（对齐 Flutter SportItemInfo） */
  matchShareInfo?: MatchShareInfo | null;
}

export interface ChatRoomState {
  isInitializing: boolean;
  isImReady: boolean;
  connectionState: string;
  chatRoomInfo: ChatRoomInfo | null;
  notices: ChatNotice[];
  hotWords: HotWordItem[];
  onlineUsers: number;
  messages: ChatMessage[];
  filteredBetMessages: ChatMessage[];
  filteredBigOrderMessages: ChatMessage[];
  pendingMessages: ChatMessage[];
}

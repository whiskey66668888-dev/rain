import { useMemo } from 'react';
import { useQueryHook } from '@/core/query/hooks';
import { useAppSelector } from '@/core/store/hooks';
import {
  convertNotLoginMsgContentList,
  getNotLoginMsgContent,
  getSportType,
  type ChatMessage,
} from '@/core/sdk/IMManager';

/** 游客历史轮询间隔（对齐 emc 5s） */
const GUEST_CHAT_REFETCH_MS = 5_000;

export const GUEST_CHAT_QUERY_KEY = ['origin', 'im', 'guest', 'msg_content'] as const;

/**
 * 未登录游客聊天历史（对齐 emc loadChatHistoryWithoutLogin）
 *
 * 使用 useQueryHook：
 * - enabled=false（已登录）时不请求、不轮询
 * - refetchInterval 做定时刷新，带 queryKey 缓存
 * - 晒单按当前场馆过滤（对齐 Flutter getActiveVenueId）
 * - 软撤回信令与被撤回目标不展示（对齐登录态 retractMap）
 */
export const useGuestChat = (sportId?: number, enabled = true) => {
  const sportType = useMemo(() => getSportType(sportId), [sportId]);
  const venue = useAppSelector((state) => state.sport.venue);

  const query = useQueryHook<ChatMessage[], Error>({
    queryKey: [...GUEST_CHAT_QUERY_KEY, sportType, venue],
    queryFn: async () => {
      const list = await getNotLoginMsgContent(sportType);
      return convertNotLoginMsgContentList(list, {
        allowedVenueId: venue,
      });
    },
    staleTime: GUEST_CHAT_REFETCH_MS,
    retry: false,
    refetchInterval: GUEST_CHAT_REFETCH_MS,
    enabled,
  });

  return {
    guestMessages: query.data ?? [],
    guestLoading: query.isLoading,
  };
};

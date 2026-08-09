import { useQueryHook } from '@/core/query/hooks';
import {
  ChatMessageType,
  getMsgContent,
  isBigBet,
  normalizeBetShareCard,
  type ChatConfigInfo,
  type ChatMessage,
} from '@/core/sdk/IMManager';

const FILTERED_MESSAGES_STALE_TIME = 5 * 60 * 1000;

export const FILTERED_BET_MESSAGES_QUERY_KEY = ['origin', 'im', 'chat', 'msg_content'] as const;

interface UseFilteredBetMessagesOptions {
  enabled: boolean;
  sportType: 1 | 2;
  msgType: 1 | 2;
  gameType: 1 | 2 | 3;
  venue?: string;
  limit: number;
  chatConfig?: ChatConfigInfo | null;
  selfUserId: string;
}

/**
 * 登录态晒单/大单列表。
 *
 * queryKey 按赛种、场馆和列表类型隔离；切回已加载的 tab 时直接使用缓存，
 * 仅首次加载显示骨架，过期数据则保留展示并在后台刷新。
 */
export const useFilteredBetMessages = ({
  enabled,
  sportType,
  msgType,
  gameType,
  venue,
  limit,
  chatConfig,
  selfUserId,
}: UseFilteredBetMessagesOptions) => {
  const activeVenueId = String(venue || '').toLowerCase();
  const bigBetAmount = msgType === 2 ? Number(chatConfig?.bigBetAmount ?? 0) : 0;

  return useQueryHook<ChatMessage[], Error>({
    queryKey: [
      ...FILTERED_BET_MESSAGES_QUERY_KEY,
      sportType,
      msgType,
      gameType,
      activeVenueId,
      selfUserId,
      limit,
      bigBetAmount,
    ],
    enabled,
    queryFn: async () => {
      const list = await getMsgContent({ sportType, msgType, gameType });
      const parsed = list
        .map<ChatMessage | null>((item, index) => {
          if (!item.content) return null;
          try {
            let map: Record<string, unknown> = {};
            if (typeof item.content === 'string') {
              const decoded = JSON.parse(item.content) as Record<string, unknown>;
              const dataRaw = decoded.Data ?? decoded.data;
              if (typeof dataRaw === 'string') {
                map = JSON.parse(dataRaw) as Record<string, unknown>;
              } else if (dataRaw && typeof dataRaw === 'object' && !Array.isArray(dataRaw)) {
                map = dataRaw as Record<string, unknown>;
              } else {
                map = decoded;
              }
            } else if (typeof item.content === 'object') {
              map = item.content;
            }

            const betInfo = normalizeBetShareCard(map);
            if (!betInfo) return null;

            const venueId = String(betInfo.venueId || '').toLowerCase();
            if (!venueId || venueId !== activeVenueId) return null;
            if (msgType === 2 && !isBigBet(betInfo, chatConfig ?? null)) {
              return null;
            }

            const rawUserId = item.user_id;
            const rawNickname = item.nickname;
            const rawLevel = item.member_level;
            const userId =
              typeof rawUserId === 'string' || typeof rawUserId === 'number'
                ? String(rawUserId)
                : '';
            const nickname =
              typeof rawNickname === 'string' && rawNickname ? rawNickname : '匿名用户';
            const memberLevel =
              typeof rawLevel === 'number' || typeof rawLevel === 'string' ? Number(rawLevel) : 0;

            return {
              id: `msg_content_${item.seq ?? item.send_time ?? index}_${msgType}`,
              type: ChatMessageType.BetShare,
              content: betInfo.title || '晒单',
              sendTime: Number(item.send_time ?? 0),
              isMine: !!selfUserId && userId === selfUserId,
              user: {
                userId,
                nickname,
                vipLevel: Math.max(0, Math.min(10, memberLevel || 0)),
              },
              betInfo,
            };
          } catch {
            return null;
          }
        })
        .filter((item): item is ChatMessage => item !== null)
        .sort((a, b) => a.sendTime - b.sendTime);

      return parsed.length > limit ? parsed.slice(-limit) : parsed;
    },
    staleTime: FILTERED_MESSAGES_STALE_TIME,
    retry: false,
  });
};

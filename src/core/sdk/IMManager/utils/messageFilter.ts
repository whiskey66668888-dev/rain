import type { MessageItem } from '@front-openim/wasm-client-sdk';
import type { ChatConfigInfo } from '../types/chatRoom';
import type { ChatMessage } from '../types/message';
import { ChatMessageType } from '../types/message';

/** 大单判定：投注额 ≥ bigBetAmount（对齐 emc isBigBet；bigWinAmount/bigCondition 未使用） */
export const isBigBet = (
  betCard: Record<string, unknown>,
  chatConfig: ChatConfigInfo | null,
): boolean => {
  if (!chatConfig) return false;
  const amount = Number(betCard.amount ?? 0);
  return amount >= Number(chatConfig.bigBetAmount ?? 0);
};

/** OpenIM 实时/历史：晒单按 extension 过滤场馆（对齐 emc allowedBetCardExtension） */
export const isBetShareMatchedVenue = (
  message: MessageItem,
  allowedExtension?: string,
): boolean => {
  if (!allowedExtension) return true;
  // 仅晒单按场馆过滤；热词/本场不过滤（对齐 emc）
  const description = message.customElem?.description?.trim() ?? '';
  const isBet =
    !description ||
    description === 'Emc1' ||
    description === '晒单消息' ||
    description === '大单消息';
  if (!isBet) return true;
  const extension = message.customElem?.extension?.trim();
  if (!extension) return true;
  return extension === allowedExtension;
};

/** ChatMessage 晒单是否属于当前场馆（对齐 emc venueId == getActiveVenueId） */
export const isBetShareForVenue = (message: ChatMessage, allowedVenueId?: string): boolean => {
  if (message.type !== ChatMessageType.BetShare) return false;
  if (!allowedVenueId) return true;
  const venueId = String(message.betInfo?.venueId || '').toLowerCase();
  // 无 venueId 视为不匹配（对齐 Flutter：空串 != activeVenueId）
  return !!venueId && venueId === allowedVenueId.toLowerCase();
};

/**
 * 从主列表拆出晒单 / 大单（游客态或兜底用）
 * 登录态晒单/大单 tab 以 get/msg_content + 实时追加为主，勿用此函数覆盖 API 列表。
 */
export const splitMessagesByFilterType = (
  messages: ChatMessage[],
  chatConfig: ChatConfigInfo | null,
  allowedVenueId?: string,
) => {
  const shareMessages = messages.filter((item) => isBetShareForVenue(item, allowedVenueId));
  const bigMessages = shareMessages.filter((item) =>
    isBigBet((item.betInfo ?? {}) as Record<string, unknown>, chatConfig),
  );
  return {
    shareMessages,
    bigMessages,
  };
};

/**
 * 实时晒单追加到晒单/大单列表（对齐 emc _tryAddBetCardToFilteredMessages）
 * 列表按 sendTime 升序（旧→新），与主聊天列表一致。
 */
export const appendBetShareToFilteredLists = (params: {
  message: ChatMessage;
  shareMessages: ChatMessage[];
  bigMessages: ChatMessage[];
  chatConfig: ChatConfigInfo | null;
  allowedVenueId?: string;
  limit?: number;
}): { shareMessages: ChatMessage[]; bigMessages: ChatMessage[] } => {
  const { message, chatConfig, allowedVenueId, limit = 50 } = params;
  let { shareMessages, bigMessages } = params;

  if (!isBetShareForVenue(message, allowedVenueId)) {
    return { shareMessages, bigMessages };
  }

  if (!shareMessages.some((m) => m.id === message.id)) {
    shareMessages = [...shareMessages, message]
      .sort((a, b) => a.sendTime - b.sendTime)
      .slice(-limit);
  }

  if (isBigBet(message.betInfo ?? {}, chatConfig)) {
    if (!bigMessages.some((m) => m.id === message.id)) {
      bigMessages = [...bigMessages, message].sort((a, b) => a.sendTime - b.sendTime).slice(-limit);
    }
  }

  return { shareMessages, bigMessages };
};

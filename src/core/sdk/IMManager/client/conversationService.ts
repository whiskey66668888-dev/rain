import { MessageType, ViewType, type MessageItem } from '@front-openim/wasm-client-sdk';
import { getOpenImConfig } from '@/apis/origin/discover';
import { IM_SUPPORTED_CONTENT_TYPES } from '../constants/contentTypes';
import { EMC_MSG_DESCRIPTION_LABEL, isBetShareDescription } from '../constants/emcMessage';
import { IM_ERROR_CODES, parseImErrorCode } from '../constants/errorCodes';
import { createImLogger } from '../logger/imLogger';
import type { ChatMessage, ChatUserInfo, SendMessageResult } from '../types/message';
import { convertImMessageToChatMessage, extractRetractInfo } from '../utils/messageConverter';
import { isBetShareMatchedVenue } from '../utils/messageFilter';
import { getConversationId } from '../utils/venue';
import { getUsersInfoByGroup } from './groupMemberService';
import { openIMClient } from './OpenIMClient';

const logger = createImLogger('conversationService');

const getMessageKey = (item: MessageItem): string =>
  item.clientMsgID || item.serverMsgID || `${item.seq}_${item.sendTime}`;

/** 从 OpenIM SDK 抛错对象里解析业务错误码 / 文案（对齐 Flutter _parseErrorCode） */
const asErrorText = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || undefined;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
};

const parseSendFailure = (
  error: unknown,
  fallback?: { clientMsgID?: string; sessionType?: number },
): SendMessageResult => {
  const parsed = error as {
    errCode?: unknown;
    errMsg?: unknown;
    code?: unknown;
    message?: unknown;
    data?: { errCode?: unknown; errMsg?: unknown; clientMsgID?: string; sessionType?: number };
  };
  return {
    errorCode: parseImErrorCode(parsed.errCode ?? parsed.code ?? parsed.data?.errCode),
    errorMsg:
      asErrorText(parsed.errMsg) ?? asErrorText(parsed.message) ?? asErrorText(parsed.data?.errMsg),
    clientMsgID: fallback?.clientMsgID ?? parsed.data?.clientMsgID,
    sessionType: fallback?.sessionType ?? parsed.data?.sessionType,
  };
};

/**
 * 拉取群历史（对齐 Flutter OpenIMChatService.loadHistoryMessages）
 * 遇 10004/10005（资源未就绪）等 sync 后最多重试 3 次
 */
export const loadHistoryMessages = async (params: {
  groupId: string;
  limit?: number;
  allowedBetCardExtension?: string;
  /** 当前用户 VIP，自己的消息用（对齐 emc userStore.userInfo.level） */
  selfVipLevel?: number;
  retryCount?: number;
}): Promise<ChatMessage[]> => {
  const sdk = openIMClient.getSDKInstance();
  const siteCode = getOpenImConfig()?.siteCodeThl ?? '';
  if (!sdk || !siteCode || !params.groupId) {
    logger.warn('loadHistoryMessages skip', {
      hasSdk: !!sdk,
      siteCode,
      groupId: params.groupId,
    });
    return [];
  }

  const retryCount = params.retryCount ?? 0;
  const limit = params.limit ?? 50;
  const count = Math.max(50, Math.min(200, limit * 2));
  const conversationID = getConversationId(siteCode, params.groupId);
  const collected = new Map<string, MessageItem>();
  /** clientMsgId → visibleForSelfOnly（对齐 emc retractMap） */
  const retractMap = new Map<string, boolean>();
  let startClientMsgID = '';
  let isEnd = false;
  let page = 0;

  while (!isEnd && collected.size < limit && page < 30) {
    page += 1;
    try {
      const response = await sdk.getAdvancedHistoryMessageList({
        count,
        viewType: ViewType.History,
        startClientMsgID,
        conversationID,
      });
      const list = response.data?.messageList ?? [];
      isEnd = !!response.data?.isEnd || list.length === 0;

      for (const item of list) {
        if (!IM_SUPPORTED_CONTENT_TYPES.has(item.contentType)) continue;
        if (item.groupID && item.groupID !== params.groupId) continue;

        const retract = extractRetractInfo(item);
        if (retract) {
          retractMap.set(retract.clientMsgId, retract.visibleForSelfOnly);
          continue;
        }

        if (!isBetShareMatchedVenue(item, params.allowedBetCardExtension)) continue;
        collected.set(getMessageKey(item), item);
      }

      const nextStart = list[list.length - 1]?.clientMsgID;
      if (!nextStart || nextStart === startClientMsgID) {
        isEnd = true;
      } else {
        startClientMsgID = nextStart;
      }
    } catch (error) {
      const maybeCode = (error as { errCode?: number })?.errCode;
      if (
        (maybeCode === IM_ERROR_CODES.SDK_RESOURCE_NOT_READY ||
          maybeCode === IM_ERROR_CODES.SDK_INTERNAL_ERROR) &&
        retryCount < 3
      ) {
        logger.warn(`history not ready code=${maybeCode}, wait sync then retry`, { retryCount });
        await openIMClient.waitForSync(5000);
        return loadHistoryMessages({ ...params, retryCount: retryCount + 1 });
      }
      logger.error('loadHistoryMessages failed', error);
      break;
    }
  }

  const selfUserId = openIMClient.getSelfUserId();
  const sliced = Array.from(collected.values())
    .filter((item) => {
      const id = item.clientMsgID;
      if (!id || !retractMap.has(id)) return true;
      const visibleForSelfOnly = retractMap.get(id);
      // visibleForSelfOnly=true：仅撤回他人消息，自己的保留
      if (visibleForSelfOnly && selfUserId && item.sendID === selfUserId) return true;
      return false;
    })
    .sort((a, b) => Number(a.sendTime) - Number(b.sendTime));
  const latest = sliced.length > limit ? sliced.slice(sliced.length - limit) : sliced;

  const senderIds = [
    ...new Set(latest.map((item) => item.sendID).filter((id): id is string => !!id)),
  ];
  const usersInfo = await getUsersInfoByGroup(senderIds, params.groupId);
  const usersInfoMap = new Map<string, ChatUserInfo>();
  for (const info of usersInfo) {
    if (info.userId) usersInfoMap.set(info.userId, info);
  }

  return latest
    .map((item) =>
      convertImMessageToChatMessage(item, {
        selfUserId,
        usersInfoMap,
        selfVipLevel: params.selfVipLevel ?? 0,
      }),
    )
    .filter((item): item is ChatMessage => !!item);
};

export const sendTextMessage = async (
  groupId: string,
  text: string,
  quoteMessage?: MessageItem,
): Promise<SendMessageResult> => {
  const sdk = openIMClient.getSDKInstance();
  if (!sdk) return { errorMsg: 'IM 未初始化' };

  let clientMsgID: string | undefined;
  let sessionType: number | undefined;
  try {
    // 对齐 Flutter OpenIMChatService.sendTextMessage → createQuoteMessage
    // 勿用 createAdvancedQuoteMessage（需 messageEntityList，缺省会创建失败）
    const wsMessage = quoteMessage
      ? await sdk.createQuoteMessage({
          text,
          // SDK QuoteMsgParams.message 为 JSON string
          message: JSON.stringify(quoteMessage),
        })
      : await sdk.createTextMessage(text);

    clientMsgID = wsMessage.data?.clientMsgID;
    sessionType = wsMessage.data?.sessionType;

    const sent = await sdk.sendMessage({
      recvID: '',
      groupID: groupId,
      message: wsMessage.data,
    });
    return {
      message: sent.data,
      clientMsgID: sent.data.clientMsgID,
      sessionType: sent.data.sessionType,
    };
  } catch (error) {
    return parseSendFailure(error, { clientMsgID, sessionType });
  }
};

export const sendCustomMessage = async (params: {
  groupId: string;
  /** EmcMsgDescription value 或 Flutter label（如「晒单消息」） */
  description: string;
  extension: string;
  payload: Record<string, unknown>;
}): Promise<SendMessageResult> => {
  const sdk = openIMClient.getSDKInstance();
  if (!sdk) return { errorMsg: 'IM 未初始化' };

  let clientMsgID: string | undefined;
  let sessionType: number | undefined;
  try {
    const wsMessage = await sdk.createCustomMessage({
      data: JSON.stringify(params.payload),
      description: params.description,
      extension: params.extension,
    });
    clientMsgID = wsMessage.data?.clientMsgID;
    sessionType = wsMessage.data?.sessionType;

    const sent = await sdk.sendMessage({
      recvID: '',
      groupID: params.groupId,
      message: wsMessage.data,
    });
    return {
      message: sent.data,
      clientMsgID: sent.data.clientMsgID,
      sessionType: sent.data.sessionType,
    };
  } catch (error) {
    return parseSendFailure(error, { clientMsgID, sessionType });
  }
};

/**
 * 发送被后端拦截后清理本地脏消息（对齐 Flutter deleteMessageFromLocalStorage）
 */
export const cleanupFailedSendLocalMessage = async (params: {
  groupId: string;
  clientMsgID?: string;
}): Promise<void> => {
  if (!params.clientMsgID || !params.groupId) return;
  const siteCode = getOpenImConfig()?.siteCodeThl ?? '';
  if (!siteCode) return;
  await deleteMessageFromLocalStorage(
    getConversationId(siteCode, params.groupId),
    params.clientMsgID,
  );
};

export const deleteMessageFromLocalStorage = async (
  conversationID: string,
  clientMsgID: string,
): Promise<void> => {
  const sdk = openIMClient.getSDKInstance();
  if (!sdk) return;
  try {
    await sdk.deleteMessageFromLocalStorage({
      conversationID,
      clientMsgID,
    });
  } catch (error) {
    logger.warn('deleteMessageFromLocalStorage failed', error);
  }
};

export const isBetShareImMessage = (message: MessageItem): boolean =>
  message.contentType === MessageType.CustomMessage &&
  isBetShareDescription(message.customElem?.description);

/** 晒单发送 description：对齐 Flutter 用中文 label「晒单消息」 */
export const BET_SHARE_SEND_DESCRIPTION = EMC_MSG_DESCRIPTION_LABEL.Emc1;

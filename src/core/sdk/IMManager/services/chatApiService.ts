import requestImOrigin from '@/core/sdk/requestImOrigin';
import requestOpenIm from '@/core/sdk/requestOpenIm';
import { getOpenImConfig } from '@/apis/origin/discover/imConfig';
import { normalizeChatConfigInfo } from '@/apis/origin/discover/types';
import type {
  ChatConfigInfo,
  ChatNotice,
  ChatRoomInfo,
  HotWordItem,
  MsgContentItem,
} from '../types/chatRoom';

interface CommonListResponse<T> {
  list?: T[];
}

interface ChatRoomRaw {
  group_id?: string;
  historical_msg_num?: number;
}

interface AccountInfoRaw {
  mute_type?: number;
  mute_end_time?: number;
}

export const getChatConfigInfo = async (sportType: number): Promise<ChatConfigInfo | null> => {
  try {
    const res = await requestOpenIm.post<ChatConfigInfo, { sport_type: number }, ChatConfigInfo>(
      '/v1/emc/config/info',
      {
        body: { sport_type: sportType },
        isErrorToast: false,
        transformResponse: (payload) => ({
          ...payload,
          data: normalizeChatConfigInfo(payload.data ?? {}),
        }),
      },
    );
    return res.data ?? null;
  } catch {
    return null;
  }
};

export const getBulletinInfo = async (sportType: number): Promise<ChatNotice[]> => {
  try {
    const res = await requestOpenIm.post<
      CommonListResponse<{ content?: string }>,
      { sport_type: number },
      ChatNotice[]
    >('/v1/emc/config/bulletin/info', {
      body: { sport_type: sportType },
      isErrorToast: false,
      transformResponse: (payload) => ({
        ...payload,
        data: (payload.data?.list ?? [])
          .map((item) => ({ content: String(item.content ?? '').trim() }))
          .filter((item) => !!item.content),
      }),
    });
    return res.data ?? [];
  } catch {
    return [];
  }
};

export const getHotContentList = async (sportType: number): Promise<HotWordItem[]> => {
  try {
    const res = await requestOpenIm.post<
      CommonListResponse<{ content?: string; sort?: number }>,
      { sport_type: number },
      HotWordItem[]
    >('/v1/emc/get/hot_content/list', {
      body: { sport_type: sportType },
      isErrorToast: false,
      transformResponse: (payload) => ({
        ...payload,
        data: (payload.data?.list ?? [])
          .map((item) => ({
            content: String(item.content ?? '').trim(),
            sort: Number(item.sort ?? 0),
          }))
          .filter((item) => !!item.content),
      }),
    });
    return res.data ?? [];
  } catch {
    return [];
  }
};

/** 公共聊天室是全站唯一的一间（接口无入参），一次会话内 groupId 不变，故可缓存 */
let cachedChatRoomInfo: ChatRoomInfo | null = null;
/** 在飞请求，避免分享预热与聊天室初始化并发时打两次 */
let chatRoomInfoTask: Promise<ChatRoomInfo | null> | null = null;
/** 缓存世代：登出/换号自增，用于丢弃跨越了这次重置的在飞结果 */
let chatRoomCacheEpoch = 0;

/** 登出 / 换号时清空（由 resetOpenImSession 调用） */
export const resetChatRoomInfoCache = (): void => {
  chatRoomCacheEpoch += 1;
  cachedChatRoomInfo = null;
  chatRoomInfoTask = null;
};

const requestChatRoomInfo = async (): Promise<ChatRoomInfo | null> => {
  const epoch = chatRoomCacheEpoch;
  try {
    const res = await requestOpenIm.post<ChatRoomRaw, { emc_send_msg: number }, ChatRoomInfo>(
      '/v1/get/public/football_chat_room',
      {
        body: { emc_send_msg: 1 },
        isErrorToast: false,
        transformResponse: (payload) => ({
          ...payload,
          data: {
            groupId: String(payload.data?.group_id ?? ''),
            historicalMsgNum: Number(payload.data?.historical_msg_num ?? 0),
          },
        }),
      },
    );
    if (!res.data?.groupId) return null;
    // 只缓存登录态结果：游客口径可能不同，且 isLogin false→true 不会走 resetOpenImSession；
    // 期间发生过登出/换号（epoch 变了）的结果已过期，不许写回。失败同样不缓存，下次重试。
    if (epoch === chatRoomCacheEpoch && getOpenImConfig()?.reqToken) {
      cachedChatRoomInfo = res.data;
    }
    return res.data;
  } catch {
    return null;
  }
};

/**
 * 获取公共聊天室 groupId（对齐 emc getChatRoomInfo）
 */
export const getChatRoomInfo = async (): Promise<ChatRoomInfo | null> => {
  if (cachedChatRoomInfo) return cachedChatRoomInfo;
  if (chatRoomInfoTask) return chatRoomInfoTask;
  chatRoomInfoTask = requestChatRoomInfo().finally(() => {
    chatRoomInfoTask = null;
  });
  return chatRoomInfoTask;
};

export const getOnlineUsers = async (groupId: string, type: 1 | 2): Promise<number> => {
  try {
    const res = await requestOpenIm.post<
      { online_users?: number },
      { group_id: string; type: 1 | 2 },
      number
    >('/v1/get/group/public_room/online_users', {
      body: { group_id: groupId, type },
      isErrorToast: false,
      transformResponse: (payload) => ({
        ...payload,
        data: Number(payload.data?.online_users ?? 0),
      }),
    });
    return res.data ?? 0;
  } catch {
    return 0;
  }
};

export const getMsgContent = async (params: {
  sportType: 1 | 2;
  msgType: 1 | 2;
  gameType: 1 | 2 | 3;
}): Promise<MsgContentItem[]> => {
  try {
    const res = await requestOpenIm.post<
      CommonListResponse<MsgContentItem>,
      { sport_type: 1 | 2; msg_type: 1 | 2; game_type: 1 | 2 | 3 },
      MsgContentItem[]
    >('/v1/emc/get/msg_content', {
      body: {
        sport_type: params.sportType,
        msg_type: params.msgType,
        game_type: params.gameType,
      },
      isErrorToast: false,
      transformResponse: (payload) => ({
        ...payload,
        data: payload.data?.list ?? [],
      }),
    });
    return res.data ?? [];
  } catch {
    return [];
  }
};

export const getNotLoginMsgContent = async (sportType: 1 | 2): Promise<MsgContentItem[]> => {
  try {
    const res = await requestOpenIm.post<
      CommonListResponse<MsgContentItem>,
      { sport_type: 1 | 2 },
      MsgContentItem[]
    >('/v1/emc/get/not_login/msg_content', {
      body: { sport_type: sportType },
      isErrorToast: false,
      transformResponse: (payload) => ({
        ...payload,
        data: payload.data?.list ?? [],
      }),
    });
    return res.data ?? [];
  } catch {
    return [];
  }
};

export const getAccountMuteInfo = async (): Promise<AccountInfoRaw | null> => {
  try {
    const res = await requestOpenIm.post<AccountInfoRaw, void, AccountInfoRaw>('/v1/account/info', {
      isErrorToast: false,
    });
    return res.data ?? null;
  } catch {
    return null;
  }
};

export const getUserValidMoney = async (): Promise<number> => {
  try {
    // 对齐 emc：字段可能是 validMoney / valid_money
    const res = await requestImOrigin.post<
      { valid_money?: number | string; validMoney?: number | string },
      void,
      number
    >('/api/im/getUserValidMoney', {
      isErrorToast: false,
      transformResponse: (payload) => ({
        ...payload,
        data: Number(payload.data?.validMoney ?? payload.data?.valid_money ?? 0),
      }),
    });
    return res.data ?? 0;
  } catch {
    return 0;
  }
};

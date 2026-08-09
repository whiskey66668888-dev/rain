import { CbEvents, type MessageItem, type WSEvent } from '@front-openim/wasm-client-sdk';
import { createImLogger } from '../logger/imLogger';

const logger = createImLogger('listenerRegistry');

/**
 * 定制 OpenIM 事件（Flutter onGroupMemberJoinTheGroupChat / tf90 同名）
 * 标准 WASM 类型里没有，但服务端会推这条
 */
export const CUSTOM_CB_GROUP_MEMBER_JOIN_CHAT = 'OnGroupMemberJoinTheGroupChat';

export interface ListenerRegistry {
  bindMessageListener: (callback: (message: MessageItem) => void) => void;
  bindConnectListener: (callback: () => void) => void;
  /** VIP 进场：定制「进入聊天室」事件（对齐 emc） */
  bindGroupMemberJoinChatListener: (callback: (raw: unknown) => void) => void;
  clearAll: () => void;
}

interface SDKLike {
  on: (event: CbEvents, callback: (event: WSEvent<unknown>) => void) => void;
  off: (event: CbEvents, callback: (event: WSEvent<unknown>) => unknown) => unknown;
}

/** 兼容 OpenIM 回调：data 可能是数组 / 单条 / 包在 event 上（对齐 tf90 normalizeImCallbackList） */
const normalizeMessageList = (payload: unknown): MessageItem[] => {
  if (Array.isArray(payload)) return payload as MessageItem[];
  if (payload && typeof payload === 'object') {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) return data as MessageItem[];
    if (data && typeof data === 'object') return [data as MessageItem];
    if ('clientMsgID' in payload || 'contentType' in payload) {
      return [payload as MessageItem];
    }
  }
  return [];
};

/**
 * OpenIM WASM 实时消息监听。
 *
 * 注意：Web WASM SDK 主推 **OnRecvNewMessages（复数批量）**（见 SDK README / tf90），
 * Flutter 原生才是 onRecvNewMessage 单条。只绑单数会导致「能发不能收」。
 */
export const createListenerRegistry = (sdk: SDKLike): ListenerRegistry => {
  let newMessagesHandler: ((event: WSEvent<unknown>) => void) | null = null;
  let offlineMessagesHandler: ((event: WSEvent<unknown>) => void) | null = null;
  let legacySingleHandler: ((event: WSEvent<unknown>) => void) | null = null;
  let connectHandler: ((event: WSEvent<unknown>) => void) | null = null;
  let memberJoinChatHandler: ((event: WSEvent<unknown>) => void) | null = null;

  const joinChatEvent = CUSTOM_CB_GROUP_MEMBER_JOIN_CHAT as CbEvents;

  const dispatchMessages = (callback: (message: MessageItem) => void, payload: unknown) => {
    const list = normalizeMessageList(payload);
    if (list.length === 0) {
      logger.warn('recv messages empty payload', payload);
      return;
    }
    list.forEach((msg) => callback(msg));
  };

  const bindMessageListener = (callback: (message: MessageItem) => void) => {
    if (newMessagesHandler) {
      sdk.off(CbEvents.OnRecvNewMessages, newMessagesHandler);
    }
    if (offlineMessagesHandler) {
      sdk.off(CbEvents.OnRecvOfflineNewMessages, offlineMessagesHandler);
    }
    if (legacySingleHandler) {
      sdk.off(CbEvents.OnRecvNewMessage, legacySingleHandler);
    }

    newMessagesHandler = (event) => {
      dispatchMessages(callback, event?.data ?? event);
    };
    offlineMessagesHandler = (event) => {
      dispatchMessages(callback, event?.data ?? event);
    };
    legacySingleHandler = (event) => {
      dispatchMessages(callback, event?.data ?? event);
    };

    sdk.on(CbEvents.OnRecvNewMessages, newMessagesHandler);
    sdk.on(CbEvents.OnRecvOfflineNewMessages, offlineMessagesHandler);
    sdk.on(CbEvents.OnRecvNewMessage, legacySingleHandler);
    logger.debug('message listeners bound (OnRecvNewMessages + offline + legacy)');
  };

  const bindConnectListener = (callback: () => void) => {
    if (connectHandler) {
      sdk.off(CbEvents.OnConnectSuccess, connectHandler);
    }
    connectHandler = () => callback();
    sdk.on(CbEvents.OnConnectSuccess, connectHandler);
  };

  /** 对齐 Flutter setGroupEventListener(onGroupMemberJoinTheGroupChat) */
  const bindGroupMemberJoinChatListener = (callback: (raw: unknown) => void) => {
    if (memberJoinChatHandler) {
      sdk.off(joinChatEvent, memberJoinChatHandler);
    }
    memberJoinChatHandler = (event) => {
      // Flutter 收的是 rawJson string；WASM 可能是 event / event.data / 字符串
      callback(event?.data ?? event);
    };
    sdk.on(joinChatEvent, memberJoinChatHandler);
  };

  const clearAll = () => {
    logger.debug('clear all listeners');
    if (newMessagesHandler) {
      sdk.off(CbEvents.OnRecvNewMessages, newMessagesHandler);
      newMessagesHandler = null;
    }
    if (offlineMessagesHandler) {
      sdk.off(CbEvents.OnRecvOfflineNewMessages, offlineMessagesHandler);
      offlineMessagesHandler = null;
    }
    if (legacySingleHandler) {
      sdk.off(CbEvents.OnRecvNewMessage, legacySingleHandler);
      legacySingleHandler = null;
    }
    if (connectHandler) {
      sdk.off(CbEvents.OnConnectSuccess, connectHandler);
      connectHandler = null;
    }
    if (memberJoinChatHandler) {
      sdk.off(joinChatEvent, memberJoinChatHandler);
      memberJoinChatHandler = null;
    }
  };

  return {
    bindMessageListener,
    bindConnectListener,
    bindGroupMemberJoinChatListener,
    clearAll,
  };
};

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MessageType } from '@front-openim/wasm-client-sdk';
import {
  ChatMessageType,
  EmcMsgDescription,
  chatMuteWsClient,
  convertImMessageToChatMessage,
  createMuteInfoFromAccount,
  createMuteInfoFromToken,
  extractRetractInfo,
  extractVipLevelFromEx,
  getAccountMuteInfo,
  getBulletinInfo,
  getChatRoomInfo,
  getChatSendDisabledHint,
  getExtensionFromVenueId,
  getGameType,
  getHotContentList,
  getOnlineUsers,
  getSendTextErrorToast,
  getSportType,
  getUserValidMoney,
  isBetShareMatchedVenue,
  isBigBet,
  serializeMatchShareForFlutter,
  splitMessagesByFilterType,
  type ChatConfigInfo,
  type ChatMessage,
  type ChatMuteInfo,
  type ChatNotice,
  type ChatRoomInfo,
  type ChatUserInfo,
  type HotWordItem,
  type MatchShareInfo,
  type BetShareCard,
} from '@/core/sdk/IMManager';
import { openIMClient } from '@/core/sdk/IMManager/client/OpenIMClient';
import {
  BET_SHARE_SEND_DESCRIPTION,
  cleanupFailedSendLocalMessage,
  loadHistoryMessages,
  sendCustomMessage,
  sendTextMessage,
} from '@/core/sdk/IMManager/client/conversationService';
import {
  getUserInfoByGroup,
  putUserInfoCache,
} from '@/core/sdk/IMManager/client/groupMemberService';
import { resetOpenImSession } from '@/core/sdk/IMManager/utils/resetOpenImSession';
import {
  ensureOpenImConfigLoaded,
  getOpenImConfig as readImConfigCache,
} from '@/apis/origin/discover/imConfig';
import { submitShareReq, toBetShareVenueCode } from '@/apis/origin/discover';
import { useAppSelector } from '@/core/store/hooks';
import { toast } from '@/common/components/Toast';
import { useGuestChat } from './useGuestChat';
import { useFilteredBetMessages } from './useFilteredBetMessages';
import { serializeBetShareForFlutter } from '../utils/shareOrderMapper';
import { registerMountedChatRoom } from '@/sites/op7/pages/SportsDetailsPage/components/share/chatShareBridge';
import type { ChatFilterType } from '../types';

interface UseChatRoomOptions {
  sportId?: number;
  chatConfig?: ChatConfigInfo | null;
  activeFilterType: ChatFilterType;
  /** 本场比赛分享 payload（对齐 Flutter SportItemInfo） */
  matchShareInfo?: MatchShareInfo | null;
  /** 筛选 tab 切回「聊天」（发送本场/热词/文本时） */
  onSwitchToChatTab?: () => void;
}

export interface VipEntryState {
  vipLevel: number;
  nickname: string;
  userId: string;
}

/**
 * 聊天室生命周期编排（对齐 emc ChatLogic）
 */
export const useChatRoom = ({
  sportId,
  chatConfig,
  activeFilterType,
  matchShareInfo,
  onSwitchToChatTab,
}: UseChatRoomOptions) => {
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const vipLevel = useAppSelector((state) => Number(state.user.memberInfo.level ?? 0));
  const venue = useAppSelector((state) => state.sport.venue);
  const sportType = useMemo(() => getSportType(sportId), [sportId]);
  const gameType = useMemo(() => getGameType(venue), [venue]);
  const venueExtension = useMemo(() => getExtensionFromVenueId(venue), [venue]);
  // 仅未登录轮询 not_login/msg_content；已登录走 OpenIM，禁止继续轮询
  const { guestMessages, guestLoading } = useGuestChat(sportId, !isLogin);
  const matchShareInfoRef = useRef(matchShareInfo);
  matchShareInfoRef.current = matchShareInfo;

  const [isInitializing, setIsInitializing] = useState(false);
  const [isImReady, setIsImReady] = useState(false);
  const [connectionState, setConnectionState] = useState('idle');
  const [chatRoomInfo, setChatRoomInfo] = useState<ChatRoomInfo | null>(null);
  const [notices, setNotices] = useState<ChatNotice[]>([]);
  const [hotWords, setHotWords] = useState<HotWordItem[]>([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [filteredBetMessages, setFilteredBetMessages] = useState<ChatMessage[]>([]);
  const [filteredBigOrderMessages, setFilteredBigOrderMessages] = useState<ChatMessage[]>([]);
  const [pendingMessages, setPendingMessages] = useState<ChatMessage[]>([]);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [sending, setSending] = useState(false);
  const [muteInfo, setMuteInfo] = useState<ChatMuteInfo | null>(null);
  const [validMoney, setValidMoney] = useState(0);
  const [vipEntry, setVipEntry] = useState<VipEntryState | null>(null);
  /** 引用中的本场比赛消息（对齐 emc setQuotedMessage） */
  const [quotedMessage, setQuotedMessage] = useState<ChatMessage | null>(null);
  const vipEntryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** 用于区分「一直游客」与「刚登出」，避免游客进聊天误清 getInfo 缓存 */
  const prevIsLoginRef = useRef<boolean | null>(null);
  const chatRoomRef = useRef<ChatRoomInfo | null>(null);
  const chatConfigRef = useRef(chatConfig);
  const vipLevelRef = useRef(vipLevel);

  chatRoomRef.current = chatRoomInfo;
  // 游客态配置可能短暂变空；保留最后一次有效配置，避免轮询时把大单列表清空。
  if (chatConfig) chatConfigRef.current = chatConfig;
  vipLevelRef.current = vipLevel;

  const selfMuted = !!muteInfo?.isMuted;
  const baseMessages = isLogin ? messages : guestMessages;
  const selfUserId = isImReady ? openIMClient.getSelfUserId() : '';
  const filteredMessagesLimit = Math.max(chatRoomInfo?.historicalMsgNum || 50, 50);
  const shareMessagesQuery = useFilteredBetMessages({
    enabled: isLogin && activeFilterType === 'share' && !!chatRoomInfo?.groupId,
    sportType,
    msgType: 1,
    gameType,
    venue,
    limit: filteredMessagesLimit,
    chatConfig,
    selfUserId,
  });
  const bigOrderMessagesQuery = useFilteredBetMessages({
    enabled: isLogin && activeFilterType === 'big' && !!chatRoomInfo?.groupId,
    sportType,
    msgType: 2,
    gameType,
    venue,
    limit: filteredMessagesLimit,
    chatConfig,
    selfUserId,
  });
  // isLoading 仅在缓存为空的首次请求为 true；后台刷新不会反复显示骨架。
  const isFilteredLoading =
    (activeFilterType === 'share' && shareMessagesQuery.isLoading) ||
    (activeFilterType === 'big' && bigOrderMessagesQuery.isLoading);

  useEffect(() => {
    if (shareMessagesQuery.data) setFilteredBetMessages(shareMessagesQuery.data);
  }, [shareMessagesQuery.data]);

  useEffect(() => {
    if (bigOrderMessagesQuery.data) setFilteredBigOrderMessages(bigOrderMessagesQuery.data);
  }, [bigOrderMessagesQuery.data]);

  /** 发言门槛文案；空串表示可发（对齐 emc chat_footer） */
  const sendDisabledHint = useMemo(
    () =>
      getChatSendDisabledHint({
        isLogin,
        vipLevel,
        validMoney,
        selfMuted,
        chatConfig,
      }),
    [chatConfig, isLogin, selfMuted, validMoney, vipLevel],
  );

  const refreshStaticData = useCallback(async (): Promise<ChatRoomInfo | null> => {
    const [noticeList, hotWordList, roomInfo, accountMute, money] = await Promise.all([
      getBulletinInfo(sportType),
      getHotContentList(sportType),
      getChatRoomInfo(),
      getAccountMuteInfo(),
      isLogin ? getUserValidMoney() : Promise.resolve(0),
    ]);
    setNotices(noticeList);
    setHotWords(hotWordList);
    setChatRoomInfo(roomInfo);
    setValidMoney(money);

    // 禁言：优先 account/info；若无则回落 getImMessage 登录态三元组
    const fromAccount = createMuteInfoFromAccount(accountMute);
    if (fromAccount.isMuted) {
      setMuteInfo(fromAccount);
    } else {
      const cfg = readImConfigCache();
      if (cfg) {
        setMuteInfo(
          createMuteInfoFromToken({
            status: cfg.muteStatus,
            until: cfg.muteUntil,
            reason: cfg.muteReason,
          }),
        );
      } else {
        setMuteInfo(fromAccount);
      }
    }

    if (roomInfo?.groupId) {
      const users = await getOnlineUsers(roomInfo.groupId, sportType);
      setOnlineUsers(users);
    } else {
      setOnlineUsers(0);
    }
    return roomInfo;
  }, [isLogin, sportType]);

  const rebuildFilteredFromMain = useCallback(
    (nextMessages: ChatMessage[]) => {
      // 游客态：晒单/大单从主列表拆分；登录态以 API + 实时追加为准，勿覆盖
      const effectiveConfig = chatConfig ?? chatConfigRef.current ?? null;
      const split = splitMessagesByFilterType(nextMessages, effectiveConfig, venue);
      setFilteredBetMessages(split.shareMessages);
      // 没有任何有效配置时无法判断大单，保留已有结果，不用空数组覆盖。
      if (effectiveConfig) setFilteredBigOrderMessages(split.bigMessages);
    },
    [chatConfig, venue],
  );

  /** 实时晒单追加到晒单/大单 tab（对齐 emc _tryAddBetCardToFilteredMessages） */
  const tryAddBetCardToFiltered = useCallback(
    (message: ChatMessage) => {
      if (message.type !== ChatMessageType.BetShare) return;
      const venueId = String(message.betInfo?.venueId || '').toLowerCase();
      if (!venueId || venueId !== String(venue).toLowerCase()) return;

      const limit = Math.max(chatRoomRef.current?.historicalMsgNum || 50, 50);
      setFilteredBetMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message].sort((a, b) => a.sendTime - b.sendTime).slice(-limit);
      });

      const qualifiesAsBig = isBigBet(message.betInfo ?? {}, chatConfigRef.current ?? null);
      if (qualifiesAsBig) {
        setFilteredBigOrderMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message].sort((a, b) => a.sendTime - b.sendTime).slice(-limit);
        });
      }
    },
    [venue],
  );

  const appendIncomingMessage = useCallback(
    (message: ChatMessage) => {
      if (!isAtBottom && activeFilterType === 'chat') {
        setPendingMessages((prev) => [...prev, message]);
      }
      setMessages((prev) => [...prev, message]);
      // 登录态：追加到晒单/大单独立列表，不覆盖 API 数据
      tryAddBetCardToFiltered(message);
    },
    [activeFilterType, isAtBottom, tryAddBetCardToFiltered],
  );

  /**
   * 加载已登录历史。
   * 必须显式传入 room：同轮 bootstrap 里 setChatRoomInfo 尚未提交，读 state 会是 null。
   */
  const loadLoggedInHistory = useCallback(
    async (room: ChatRoomInfo | null | undefined) => {
      if (!room?.groupId) return;
      const history = await loadHistoryMessages({
        groupId: room.groupId,
        limit: Math.max(room.historicalMsgNum || 60, 60),
        allowedBetCardExtension: venueExtension,
        selfVipLevel: vipLevelRef.current,
      });
      setMessages(history);
      // 晒单/大单列表由 get/msg_content + 实时追加维护，不从主历史覆盖
    },
    [venueExtension],
  );

  const showVipCelebration = useCallback((entry: VipEntryState) => {
    if (vipEntryTimerRef.current) clearTimeout(vipEntryTimerRef.current);
    setVipEntry(entry);
    vipEntryTimerRef.current = setTimeout(() => {
      setVipEntry(null);
      vipEntryTimerRef.current = null;
    }, 2000);
  }, []);

  /**
   * 解析定制事件 payload（对齐 Flutter _handleGroupMemberJoin + tf90 getJoinEventData）
   */
  const parseJoinChatPayload = useCallback((raw: unknown) => {
    const asStr = (v: unknown, fallback = ''): string =>
      typeof v === 'string'
        ? v
        : typeof v === 'number' && Number.isFinite(v)
          ? String(v)
          : fallback;

    let data: Record<string, unknown> | null = null;
    if (typeof raw === 'string') {
      try {
        data = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        return null;
      }
    } else if (raw && typeof raw === 'object') {
      const obj = raw as Record<string, unknown>;
      if (obj.data && typeof obj.data === 'object') {
        data = obj.data as Record<string, unknown>;
      } else if (typeof obj.data === 'string') {
        try {
          data = JSON.parse(obj.data) as Record<string, unknown>;
        } catch {
          data = obj;
        }
      } else {
        data = obj;
      }
    }
    if (!data) return null;

    const member =
      data.member && typeof data.member === 'object'
        ? (data.member as Record<string, unknown>)
        : data.user && typeof data.user === 'object'
          ? (data.user as Record<string, unknown>)
          : undefined;
    const userId =
      asStr(data.userID) || asStr(data.userId) || asStr(member?.userID) || asStr(member?.userId);
    const nickname = asStr(data.nickname) || asStr(member?.nickname) || userId;
    const groupId = asStr(data.groupID) || asStr(data.groupId);
    const ex = asStr(data.ex) || asStr(member?.ex);
    return { userId, nickname, groupId, ex, vipLevel: extractVipLevelFromEx(ex) };
  }, []);

  /**
   * VIP 进场横幅（对齐 Flutter _handleGroupMemberJoin）
   * 门槛：vipLevel >= specialVipLevel，且不是自己
   */
  const handleVipEnter = useCallback(
    (info: {
      userId: string;
      nickname: string;
      vipLevel: number;
      groupId?: string;
      ex?: string;
    }) => {
      const currentGroupId = chatRoomRef.current?.groupId ?? '';
      const selfId = openIMClient.getSelfUserId();
      const specialVipLevel = Number(chatConfigRef.current?.specialVipLevel ?? 0);
      const vipLevel = info.vipLevel || extractVipLevelFromEx(info.ex) || 0;

      if (info.groupId && currentGroupId && info.groupId !== currentGroupId) return;
      if (!info.userId) return;
      if (selfId && info.userId === selfId) return;
      if (!chatConfigRef.current) return;
      if (vipLevel < specialVipLevel) return;

      const nickname = info.nickname || info.userId;
      putUserInfoCache(currentGroupId || info.groupId || '', {
        userId: info.userId,
        nickname,
        vipLevel,
      });
      showVipCelebration({ vipLevel, nickname, userId: info.userId });
    },
    [showVipCelebration],
  );

  const bindMuteWs = useCallback(() => {
    const imCfg = readImConfigCache();
    if (!imCfg?.reqWsUrl || !imCfg.reqToken) return;

    chatMuteWsClient.connectIfNeeded({
      reqWsUrl: imCfg.reqWsUrl,
      siteCode: imCfg.siteCodeThl,
      token: imCfg.reqToken,
    });

    return chatMuteWsClient.subscribe((event) => {
      toast({
        type: event.isUnmute ? 'success' : 'warning',
        description: event.content || event.title || (event.isUnmute ? '禁言已解除' : '您已被禁言'),
      });

      void getAccountMuteInfo().then((accountMute) => {
        const next = createMuteInfoFromAccount(accountMute);
        setMuteInfo(next);
        appendIncomingMessage({
          id: `mute_notice_${Date.now()}`,
          type: ChatMessageType.MuteNotice,
          content: event.content || (event.isUnmute ? '禁言已解除' : '您已被禁言'),
          sendTime: Date.now(),
          isMine: false,
          muteSnapshot: next,
        });
      });
    });
  }, [appendIncomingMessage]);

  /** 登录后绑定 OpenIM 实时消息 + VIP 进场 */
  const bindImRealtime = useCallback(
    (room: ChatRoomInfo | null) => {
      openIMClient.bindConnectListener(() => {
        void loadLoggedInHistory(room);
        setConnectionState('ready');
      });

      openIMClient.bindMessageListener((incoming) => {
        void (async () => {
          // 次要路径：标准 MemberEnter 通知（WASM；Flutter 主路径是定制事件）
          if (Number(incoming.contentType) === Number(MessageType.MemberEnter)) {
            try {
              const detail = incoming.notificationElem?.detail
                ? (JSON.parse(incoming.notificationElem.detail) as Record<string, unknown>)
                : null;
              const user =
                (detail?.opUser as Record<string, unknown> | undefined) ||
                (detail?.entrantUser as Record<string, unknown> | undefined);
              const asStr = (v: unknown) => (typeof v === 'string' ? v : '');
              const userId = asStr(user?.userID) || asStr(user?.userId);
              const nickname = asStr(user?.nickname) || userId;
              const ex = asStr(user?.ex);
              handleVipEnter({
                userId,
                nickname,
                vipLevel: extractVipLevelFromEx(ex),
                groupId: typeof incoming.groupID === 'string' ? incoming.groupID : '',
                ex,
              });
              if (room?.groupId) {
                void getOnlineUsers(room.groupId, sportType).then(setOnlineUsers);
              }
            } catch {
              // ignore malformed MemberEnter
            }
            return;
          }

          // 实时软撤回（对齐 emc _handleRetractMessage）
          const retract = extractRetractInfo(incoming);
          if (retract) {
            const selfId = openIMClient.getSelfUserId();
            const targetId = retract.clientMsgId;
            const visibleForSelfOnly = retract.visibleForSelfOnly;
            if (!targetId) return;
            const shouldKeep = (msg: ChatMessage) => {
              if (msg.id !== targetId && msg.rawMessage?.clientMsgID !== targetId) {
                return true;
              }
              if (visibleForSelfOnly) {
                if (msg.isMine) return true;
                if (selfId && msg.user?.userId === selfId) return true;
              }
              return false;
            };
            setMessages((prev) => prev.filter(shouldKeep));
            setPendingMessages((prev) => prev.filter(shouldKeep));
            setFilteredBetMessages((prev) => prev.filter(shouldKeep));
            setFilteredBigOrderMessages((prev) => prev.filter(shouldKeep));
            return;
          }

          const groupId = room?.groupId ?? '';
          const selfId = openIMClient.getSelfUserId();

          if (!isBetShareMatchedVenue(incoming, venueExtension)) return;

          const usersInfoMap = new Map<string, ChatUserInfo>();

          if (groupId && incoming.sendID && incoming.sendID !== selfId) {
            const info = await getUserInfoByGroup(incoming.sendID, groupId);
            if (info) usersInfoMap.set(info.userId, info);
          }

          const converted = convertImMessageToChatMessage(incoming, {
            selfUserId: selfId,
            usersInfoMap,
            selfVipLevel: vipLevelRef.current,
          });
          if (!converted) return;
          appendIncomingMessage(converted);
        })();
      });

      // 主路径：对齐 Flutter onGroupMemberJoinTheGroupChat / tf90 OnGroupMemberJoinTheGroupChat
      openIMClient.bindGroupMemberJoinChatListener((raw) => {
        const parsed = parseJoinChatPayload(raw);
        if (!parsed) return;
        if (room?.groupId) {
          void getOnlineUsers(room.groupId, sportType).then(setOnlineUsers);
        }
        handleVipEnter(parsed);
      });
    },
    [
      appendIncomingMessage,
      handleVipEnter,
      loadLoggedInHistory,
      parseJoinChatPayload,
      sportType,
      venueExtension,
    ],
  );

  useEffect(() => {
    let disposed = false;
    let unsubscribeMute: (() => void) | undefined;

    const bootstrap = async () => {
      setIsInitializing(true);

      if (!isLogin) {
        const wasLoggedIn = prevIsLoginRef.current === true;
        prevIsLoginRef.current = false;

        // 登出后释放 OpenIM；纯游客进聊天不要 reset（会清 cachedConfig，导致 requestOpenIm 无 baseUrl）
        if (wasLoggedIn) {
          await resetOpenImSession();
        }
        await ensureOpenImConfigLoaded();

        setMessages([]);
        setFilteredBetMessages([]);
        setFilteredBigOrderMessages([]);
        await refreshStaticData();
        if (!disposed) {
          setIsImReady(false);
          setConnectionState('guest');
          setIsInitializing(false);
        }
        return;
      }

      prevIsLoginRef.current = true;

      // ① Flutter ensureImStarted：先 OpenIM ready
      const ready = await openIMClient.ensureReady();
      if (disposed) return;
      setIsImReady(ready);
      setConnectionState(openIMClient.getConnectionState());
      if (!ready) {
        setIsInitializing(false);
        return;
      }

      // ② 再拉聊天室等业务接口
      const roomInfo = await refreshStaticData();
      if (disposed) return;

      // ③ 历史 + 实时
      await loadLoggedInHistory(roomInfo);
      if (disposed) return;
      bindImRealtime(roomInfo);

      // ④ 禁言 WS
      unsubscribeMute = bindMuteWs();
      if (!disposed) setIsInitializing(false);
    };
    void bootstrap();

    return () => {
      disposed = true;
      unsubscribeMute?.();
      openIMClient.clearListeners();
      chatMuteWsClient.disconnect();
      if (vipEntryTimerRef.current) {
        clearTimeout(vipEntryTimerRef.current);
        vipEntryTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 仅登录态变化时重建，避免反复重登
  }, [isLogin]);

  useEffect(() => {
    if (!isLogin) {
      setMessages(guestMessages);
      rebuildFilteredFromMain(guestMessages);
    }
  }, [guestMessages, isLogin, rebuildFilteredFromMain]);

  const notifySendFailure = useCallback(
    async (
      groupId: string,
      result: { errorCode?: number; errorMsg?: string; clientMsgID?: string },
    ) => {
      // 对齐 Flutter：业务拦截用 info；未知错误才用 error
      toast({
        // type: isBusinessSendIntercept(result.errorCode) ? 'info' : 'error',
        type: 'info',
        description: getSendTextErrorToast(result.errorCode, result.errorMsg),
      });
      // 被后端拦截时清理 SDK 本地脏消息（对齐 Flutter deleteMessageFromLocalStorage）
      if (result.errorCode != null && result.clientMsgID) {
        await cleanupFailedSendLocalMessage({ groupId, clientMsgID: result.clientMsgID });
      }
    },
    [],
  );

  const sendText = useCallback(
    async (text: string) => {
      if (!chatRoomInfo?.groupId || !text.trim()) return false;
      if (sendDisabledHint) {
        toast({ type: 'warning', description: sendDisabledHint });
        return false;
      }
      // 筛选页发送时切回「聊天」（对齐 emc）
      if (activeFilterType !== 'chat') onSwitchToChatTab?.();
      setSending(true);
      const quoteRaw = quotedMessage?.rawMessage;
      // 引用依赖 OpenIM 原始消息；无 rawMessage 时无法建引用（游客历史等）
      if (quotedMessage && !quoteRaw) {
        setSending(false);
        toast({ type: 'warning', description: '该消息暂不支持引用，请重新打开聊天后再试' });
        return false;
      }
      const result = await sendTextMessage(chatRoomInfo.groupId, text.trim(), quoteRaw);
      setSending(false);
      if (!result.message) {
        await notifySendFailure(chatRoomInfo.groupId, result);
        return false;
      }
      setQuotedMessage(null);
      const message = convertImMessageToChatMessage(result.message, {
        selfUserId: openIMClient.getSelfUserId(),
        selfVipLevel: vipLevelRef.current,
      });
      if (message) appendIncomingMessage(message);
      return true;
    },
    [
      activeFilterType,
      appendIncomingMessage,
      chatRoomInfo?.groupId,
      notifySendFailure,
      onSwitchToChatTab,
      quotedMessage,
      sendDisabledHint,
    ],
  );

  const sendHotWord = useCallback(
    async (word: string) => {
      if (!chatRoomInfo?.groupId || !word.trim()) return false;
      if (sendDisabledHint) {
        toast({ type: 'warning', description: sendDisabledHint });
        return false;
      }
      if (activeFilterType !== 'chat') onSwitchToChatTab?.();
      // Flutter 热词 payload 字段为 hotWord
      const result = await sendCustomMessage({
        groupId: chatRoomInfo.groupId,
        description: EmcMsgDescription.HotWord,
        extension: '',
        payload: { hotWord: word.trim() },
      });
      if (!result.message) {
        await notifySendFailure(chatRoomInfo.groupId, result);
        return false;
      }
      const message = convertImMessageToChatMessage(result.message, {
        selfUserId: openIMClient.getSelfUserId(),
        selfVipLevel: vipLevelRef.current,
      });
      if (message) appendIncomingMessage(message);
      return true;
    },
    [
      activeFilterType,
      appendIncomingMessage,
      chatRoomInfo?.groupId,
      notifySendFailure,
      onSwitchToChatTab,
      sendDisabledHint,
    ],
  );

  /** 分享面板未挂载聊天室时会传入 info；聊天页内部调用则取当前赛事 */
  const sendMatchShare = useCallback(
    async (matchInfo?: MatchShareInfo) => {
      // 分享面板会走到这里，静默 return 会让用户以为没点上，必须给出原因
      if (!chatRoomInfo?.groupId) {
        toast({ type: 'error', description: '聊天室连接失败' });
        return false;
      }
      if (sendDisabledHint) {
        toast({ type: 'warning', description: sendDisabledHint });
        return false;
      }
      const info = matchInfo ?? matchShareInfoRef.current;
      if (!info?.homeTeamName && !info?.homeTeam) {
        toast({ type: 'warning', description: '赛事信息未就绪，请稍后再试' });
        return false;
      }
      if (activeFilterType !== 'chat') onSwitchToChatTab?.();
      // payload 对齐 Flutter SportItemInfo.toJson / fromJson（字段类型严格）
      const result = await sendCustomMessage({
        groupId: chatRoomInfo.groupId,
        description: EmcMsgDescription.MatchShare,
        extension: '',
        payload: serializeMatchShareForFlutter(info),
      });
      if (!result.message) {
        await notifySendFailure(chatRoomInfo.groupId, result);
        return false;
      }
      const message = convertImMessageToChatMessage(result.message, {
        selfUserId: openIMClient.getSelfUserId(),
        selfVipLevel: vipLevelRef.current,
      });
      if (message) appendIncomingMessage(message);
      return true;
    },
    [
      activeFilterType,
      appendIncomingMessage,
      chatRoomInfo?.groupId,
      notifySendFailure,
      onSwitchToChatTab,
      sendDisabledHint,
    ],
  );

  /** 晒单发送（对齐 emc sendBetCardMessage：description=「晒单消息」+ 场馆 extension） */
  const sendBetShare = useCallback(
    async (payload: BetShareCard) => {
      // 同 sendMatchShare：分享面板调用时不能静默失败
      if (!chatRoomInfo?.groupId) {
        toast({ type: 'error', description: '聊天室连接失败' });
        return false;
      }
      if (sendDisabledHint) {
        toast({ type: 'warning', description: sendDisabledHint });
        return false;
      }
      if (activeFilterType !== 'chat') onSwitchToChatTab?.();

      // Flutter BetDataItem.fromJson 对 amount 等字段是 as String?，数字会解析失败整条丢弃
      const sendPayload = serializeBetShareForFlutter(payload);
      const extension = getExtensionFromVenueId(String(payload.venueId || '')) || venueExtension;

      const result = await sendCustomMessage({
        groupId: chatRoomInfo.groupId,
        description: BET_SHARE_SEND_DESCRIPTION,
        extension,
        payload: sendPayload,
      });
      if (!result.message) {
        await notifySendFailure(chatRoomInfo.groupId, result);
        return false;
      }
      const message = convertImMessageToChatMessage(result.message, {
        selfUserId: openIMClient.getSelfUserId(),
        selfVipLevel: vipLevelRef.current,
      });
      if (message) appendIncomingMessage(message);
      toast({ type: 'success', description: '晒单成功' });

      // 聊天晒单成功后上报晒单记录（失败不影响 IM 已发送的消息）
      const orderId = String(payload.orderNo || payload.id || '').trim();
      if (orderId) {
        void submitShareReq({
          orderId,
          venueCode: toBetShareVenueCode(String(payload.venueId || '')),
        });
      }

      return true;
    },
    [
      activeFilterType,
      appendIncomingMessage,
      chatRoomInfo?.groupId,
      notifySendFailure,
      onSwitchToChatTab,
      sendDisabledHint,
      venueExtension,
    ],
  );

  // 分享面板走这里发送时能拿到本地回显（对齐 emc 的 Get.isRegistered<ChatLogic>() 分支）。
  // 用 ref 转发，注册只在挂载/卸载时发生，避免每次 useCallback 重建都重注册。
  const sendMatchShareRef = useRef(sendMatchShare);
  sendMatchShareRef.current = sendMatchShare;
  const sendBetShareRef = useRef(sendBetShare);
  sendBetShareRef.current = sendBetShare;
  useEffect(
    () =>
      registerMountedChatRoom({
        sendMatchShare: (info) => sendMatchShareRef.current(info),
        sendBetShare: (card) => sendBetShareRef.current(card),
      }),
    [],
  );

  const flushPendingMessages = useCallback(() => {
    if (pendingMessages.length === 0) return;
    setPendingMessages([]);
  }, [pendingMessages.length]);

  return {
    chatConfig,
    isInitializing: isInitializing || (!isLogin && guestLoading),
    isImReady,
    connectionState,
    chatRoomInfo,
    notices,
    hotWords,
    onlineUsers,
    messages: baseMessages,
    filteredBetMessages,
    filteredBigOrderMessages,
    pendingMessages,
    isFilteredLoading,
    sending,
    selfMuted,
    muteInfo,
    validMoney,
    sendDisabledHint,
    vipEntry,
    quotedMessage,
    setQuotedMessage,
    setIsAtBottom,
    flushPendingMessages,
    sendText,
    sendHotWord,
    sendMatchShare,
    sendBetShare,
  };
};

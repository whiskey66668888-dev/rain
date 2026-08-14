import { ensureOpenImAuthConfigLoaded } from '@/apis/origin/discover';
import { getChatRoomInfo, type ChatRoomInfo } from '@/core/sdk/IMManager';

/**
 * 分享/晒单直发前的链路准备（聊天室未挂载时走这里）。
 *
 * 顺序上做了两件事：
 * 1. 先拿 IM 配置——`getChatRoomInfo` 的 baseURL/token 都取自它，绕不开；
 * 2. 建连与取房间号并行——`ensureReady` 重（首次要下 34MB wasm + login），
 *    `getChatRoomInfo` 只是 1 个 RTT 且不依赖 WASM，串行等于白排队。
 *
 * `waitSync: false`：发消息不需要等 login 后那串增量同步（会话/群成员/好友/黑名单）。
 */
export const prepareChatShare = async (): Promise<ChatRoomInfo | null> => {
  if (!(await ensureOpenImAuthConfigLoaded())) return null;
  const { openIMClient } = await import('@/core/sdk/IMManager/client/OpenIMClient');
  const [ready, room] = await Promise.all([
    openIMClient.ensureReady({ waitSync: false }),
    getChatRoomInfo(),
  ]);
  if (!ready || !room?.groupId) return null;
  return room;
};

/**
 * 分享弹窗打开时预热（不 await、失败静默）。
 *
 * 冷启动的大头是 34MB `openIM.wasm` 的下载与编译，点了「聊天室」才开始做的话用户只能干等。
 * 弹窗打开到点击之间的空档正好拿来建连；真点下去时 `ensureReady` 的在飞任务会被复用，
 * `getChatRoomInfo` 也有在飞去重，不会重复请求。
 */
export const prewarmChatShare = (): void => {
  void prepareChatShare().catch(() => null);
};

export default prepareChatShare;

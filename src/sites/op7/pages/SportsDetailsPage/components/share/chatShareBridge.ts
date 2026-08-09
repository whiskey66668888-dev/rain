import type { BetShareCard, MatchShareInfo } from '@/core/sdk/IMManager';

/**
 * 已挂载的聊天室发送能力。
 * 对齐 emc 的 `Get.isRegistered<ChatLogic>()`：聊天页在场时走它的链路，
 * 好处是发送后能本地回显（OpenIM 不会把自己发的消息推回来）。
 */
export type MountedChatSenders = {
  sendMatchShare: (info: MatchShareInfo) => Promise<boolean>;
  sendBetShare: (card: BetShareCard) => Promise<boolean>;
};

let mountedSenders: MountedChatSenders | null = null;

/** 聊天室挂载时注册，返回注销函数（直接用作 useEffect 的 cleanup） */
export function registerMountedChatRoom(senders: MountedChatSenders): () => void {
  mountedSenders = senders;
  return () => {
    // 严格比对：避免两个聊天室先后挂载时，先卸载的那个把后者的注册清掉
    if (mountedSenders === senders) mountedSenders = null;
  };
}

/** 取当前挂载的聊天室；未挂载返回 null，调用方应回退到独立发送 */
export function getMountedChatRoom(): MountedChatSenders | null {
  return mountedSenders;
}

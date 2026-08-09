/**
 * 聊天跟单上下文：点击跟单后暂存晒单号，投注成功后再上报 submitFollow。
 * 放在 common/hooks/bet，供 followBetHandler 与 usePlaceBet 共用。
 */
export type ChatFollowContext = {
  shareOrderId: string;
  venueCode: string;
};

let chatFollowContext: ChatFollowContext | null = null;

export const setChatFollowContext = (ctx: ChatFollowContext | null) => {
  chatFollowContext = ctx;
};

/** 读取并清空（投注成功后消费一次） */
export const takeChatFollowContext = (): ChatFollowContext | null => {
  const ctx = chatFollowContext;
  chatFollowContext = null;
  return ctx;
};

export const clearChatFollowContext = () => {
  chatFollowContext = null;
};

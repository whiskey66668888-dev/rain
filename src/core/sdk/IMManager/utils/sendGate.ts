import type { ChatConfigInfo } from '../types/chatRoom';

export interface ChatSendGateInput {
  isLogin: boolean;
  /** 用户 VIP 等级（Redux memberInfo.level） */
  vipLevel: number;
  /** 90 天有效投注额（元），来自 /api/im/getUserValidMoney */
  validMoney: number;
  /** 单用户禁言 */
  selfMuted: boolean;
  chatConfig?: ChatConfigInfo | null;
}

/**
 * 发言门槛文案（对齐 emc chat_footer.dart）
 * - sendMsgVipLevel / sendMsgBetAmount 为 0 表示该维度不限制
 * - 返回空字符串表示可发言
 */
export const getChatSendDisabledHint = ({
  isLogin,
  vipLevel,
  validMoney,
  selfMuted,
  chatConfig,
}: ChatSendGateInput): string => {
  if (!isLogin) return '登录后可发言';
  if (selfMuted) return '您已被禁言，暂时无法发言';
  if (!chatConfig || chatConfig.chatSwitch !== 1) return '聊天室暂未开放';
  if (chatConfig.allMuted === 1) return '当前聊天室全员禁言中';

  const requiredLevel = Number(chatConfig.sendMsgVipLevel ?? 0);
  const requiredBet = Number(chatConfig.sendMsgBetAmount ?? 0);
  const needVip = requiredLevel > 0;
  const needBet = requiredBet > 0;
  const hasVip = !needVip || vipLevel >= requiredLevel;
  const hasBet = !needBet || validMoney >= requiredBet;

  if (hasVip && hasBet) return '';

  if (needVip && needBet) {
    return `达到VIP${requiredLevel}且有效投注满${requiredBet}元后可聊天`;
  }
  if (needBet) return `有效投注最低${requiredBet}元可聊天`;
  return `VIP${requiredLevel}-10可聊天`;
};

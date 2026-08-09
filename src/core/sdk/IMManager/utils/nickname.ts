/**
 * 昵称掩码（对齐 emc chat_utils.maskNickname）
 * - 长度 ≤4：前 2 位 + ***
 * - 更长：前 2 位 + *** + 后 2 位
 */
export const maskNickname = (nickname: string): string => {
  const name = (nickname || '').trim();
  if (!name) return '匿名用户';
  if (name.length <= 4) {
    return `${name.slice(0, Math.min(2, name.length))}***`;
  }
  return `${name.slice(0, 2)}***${name.slice(-2)}`;
};

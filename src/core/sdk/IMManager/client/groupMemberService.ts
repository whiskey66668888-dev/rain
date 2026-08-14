import type { GroupMemberItem } from '@front-openim/wasm-client-sdk';
import { createImLogger } from '../logger/imLogger';
import type { ChatUserInfo } from '../types/message';
import { extractVipLevelFromEx } from '../utils/vipLevel';
import { getCachedGroupMember, setCachedGroupMember } from './groupMemberCache';
import { openIMClient } from './OpenIMClient';

export { clearGroupMemberCache, putUserInfoCache } from './groupMemberCache';

const logger = createImLogger('groupMemberService');

const memberToUserInfo = (member: GroupMemberItem): ChatUserInfo => ({
  userId: String(member.userID ?? ''),
  nickname: String(member.nickname ?? member.userID ?? '用户'),
  vipLevel: extractVipLevelFromEx(member.ex),
});

/**
 * 批量查群成员 VIP（对齐 emc OpenIMChatService.getUsersInfoByGroup）
 * - 优先读缓存；未命中再调 getSpecifiedGroupMembersInfo
 * - 结果写入缓存，供实时消息复用
 */
export const getUsersInfoByGroup = async (
  userIds: string[],
  groupId: string,
): Promise<ChatUserInfo[]> => {
  const sdk = openIMClient.getSDKInstance();
  if (!sdk || !groupId || userIds.length === 0) return [];

  const uniqueIds = [...new Set(userIds.map((id) => id.trim()).filter(Boolean))];
  const result: ChatUserInfo[] = [];
  const missing: string[] = [];

  for (const userId of uniqueIds) {
    const cached = getCachedGroupMember(userId, groupId);
    if (cached) {
      result.push(cached);
    } else {
      missing.push(userId);
    }
  }

  if (missing.length === 0 || !sdk.getSpecifiedGroupMembersInfo) {
    return result;
  }

  try {
    const response = await sdk.getSpecifiedGroupMembersInfo({
      groupID: groupId,
      userIDList: missing,
    });
    const members = response.data ?? [];
    for (const member of members) {
      const info = memberToUserInfo(member);
      if (!info.userId) continue;
      setCachedGroupMember(groupId, info);
      result.push(info);
    }
  } catch (error) {
    logger.warn('getSpecifiedGroupMembersInfo failed', error);
  }

  return result;
};

/** 实时消息：单用户查 VIP（带缓存） */
export const getUserInfoByGroup = async (
  userId: string,
  groupId: string,
): Promise<ChatUserInfo | null> => {
  if (!userId || !groupId) return null;
  const list = await getUsersInfoByGroup([userId], groupId);
  return list.find((item) => item.userId === userId) ?? null;
};

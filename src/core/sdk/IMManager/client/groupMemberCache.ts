import type { ChatUserInfo } from '../types/message';

/** 群成员 VIP 缓存：`${userId}:${groupId}` → ChatUserInfo */
const userInfoCache = new Map<string, ChatUserInfo>();

export const groupMemberCacheKey = (userId: string, groupId: string): string =>
  `${userId}:${groupId}`;

export const getCachedGroupMember = (userId: string, groupId: string): ChatUserInfo | undefined =>
  userInfoCache.get(groupMemberCacheKey(userId, groupId));

export const setCachedGroupMember = (groupId: string, info: ChatUserInfo): void => {
  if (!info.userId || !groupId) return;
  userInfoCache.set(groupMemberCacheKey(info.userId, groupId), info);
};

export const putUserInfoCache = (groupId: string, info: ChatUserInfo): void => {
  setCachedGroupMember(groupId, info);
};

export const clearGroupMemberCache = (): void => {
  userInfoCache.clear();
};

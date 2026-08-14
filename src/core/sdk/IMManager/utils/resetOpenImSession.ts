import { OPEN_IM_CONFIG_QUERY_KEY, resetOpenImConfigCache } from '@/apis/origin/discover/imConfig';
import { clearGroupMemberCache } from '../client/groupMemberCache';
import { runRegisteredOpenImLogoutReset } from '../client/openImSessionHooks';
import { resetChatRoomInfoCache } from '../services/chatApiService';
import { createImLogger } from '../logger/imLogger';

const logger = createImLogger('resetOpenImSession');

type QueryClientLike = {
  removeQueries: (filters: { queryKey: readonly unknown[] }) => void;
};

/**
 * 网站登出 / 换号时重置 OpenIM 会话（对齐 Flutter OpenIMService.uninit）。
 * - 清 getImMessage 缓存（避免下一账号复用旧 token）
 * - SDK 已加载时走注册钩子 logout + 本地状态复位（绝不 import OpenIMClient，避免首屏拉 wasm）
 * - 清群成员 VIP 缓存 / 公共聊天室缓存
 */
export const resetOpenImSession = async (queryClient?: QueryClientLike): Promise<void> => {
  try {
    resetOpenImConfigCache();
    clearGroupMemberCache();
    resetChatRoomInfoCache();
    queryClient?.removeQueries({ queryKey: [...OPEN_IM_CONFIG_QUERY_KEY] });
    await runRegisteredOpenImLogoutReset();
  } catch (error) {
    logger.warn('resetOpenImSession failed', error);
  }
};

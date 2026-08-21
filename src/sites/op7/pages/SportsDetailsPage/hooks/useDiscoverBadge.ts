import { useCallback, useEffect, useState } from 'react';

import { DISCOVER_BADGE_SEEN_KEY } from '../components/discover/constants';
import { safeGetSessionString, safeSetSessionString } from '@/utils/storage/webStorage';

interface UseDiscoverBadgeResult {
  /** 是否展示发现 tab 的引导红点 */
  showDiscoverBadge: boolean;
  /** 用户点击发现 tab 后调用，隐藏红点并写入 sessionStorage */
  dismissDiscoverBadge: () => void;
}

/**
 * 发现 tab 引导红点状态，对齐 App appService.showDiscoverBadge。
 * - 默认展示（未点过发现 tab）
 * - 点击发现 tab 后隐藏，本次会话内不再出现
 * - 用 sessionStorage 存储：关闭标签页/会话结束后重置为展示，等价于 App 冷启动重置
 *
 * SSR 安全：初始渲染统一为「不展示」，挂载后再从 sessionStorage 读取，避免 hydration 不一致。
 */
export const useDiscoverBadge = (): UseDiscoverBadgeResult => {
  const [showDiscoverBadge, setShowDiscoverBadge] = useState(false);

  useEffect(() => {
    setShowDiscoverBadge(safeGetSessionString(DISCOVER_BADGE_SEEN_KEY) !== '1');
  }, []);

  const dismissDiscoverBadge = useCallback(() => {
    setShowDiscoverBadge((prev) => {
      if (!prev) return prev;
      safeSetSessionString(DISCOVER_BADGE_SEEN_KEY, '1');
      return false;
    });
  }, []);

  return { showDiscoverBadge, dismissDiscoverBadge };
};

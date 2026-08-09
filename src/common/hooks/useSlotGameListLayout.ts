import { useCallback, useEffect, useState } from 'react';

import {
  calcSlotGameColumnsPerRow,
  calcSlotGamePageSize,
  SLOT_GAME_DEFAULT_ROWS,
} from '@/utils/slotGameGrid';

/**
 * 监听电子游戏列表容器宽度，动态计算每行数量与分页大小。
 */
export function useSlotGameListLayout() {
  const [listContainer, setListContainer] = useState<HTMLDivElement | null>(null);
  const [columnsPerRow, setColumnsPerRow] = useState(3);

  const listContainerRef = useCallback((node: HTMLDivElement | null) => {
    setListContainer(node);
  }, []);

  useEffect(() => {
    if (!listContainer) return;

    const updateLayout = () => {
      const style = window.getComputedStyle(listContainer);
      const paddingX = parseFloat(style.paddingLeft || '0') + parseFloat(style.paddingRight || '0');
      const contentWidth = Math.max(0, listContainer.clientWidth - paddingX);
      setColumnsPerRow(calcSlotGameColumnsPerRow(contentWidth));
    };

    updateLayout();

    const resizeObserver = new ResizeObserver(() => {
      updateLayout();
    });

    resizeObserver.observe(listContainer);

    return () => {
      resizeObserver.disconnect();
    };
  }, [listContainer]);

  const pageSize = calcSlotGamePageSize(columnsPerRow, SLOT_GAME_DEFAULT_ROWS);

  return {
    listContainerRef,
    columnsPerRow,
    pageSize,
  };
}

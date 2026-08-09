import React, { useCallback } from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

interface VirtualListProps<T> {
  /** 数据数组 */
  data: T[];
  /** 每个列表项的固定高度 */
  itemSize: number;
  /** 列表容器高度 */
  height: number;
  /** 列表容器宽度（像素或百分比字符串） */
  width: number | string;
  /** 渲染单个列表项的函数 */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** 滚动到底部时的回调函数（用于无限滚动） */
  onEndReach?: () => void;
}

/**
 * 虚拟滚动列表组件，只渲染可见区域的列表项
 *
 * @template T - 列表项数据类型
 *
 * @example
 * ```tsx
 * const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` }));
 *
 * <VirtualList
 *   data={items}
 *   itemSize={50}
 *   height={600}
 *   width="100%"
 *   renderItem={(item) => <div>{item.name}</div>}
 *   onEndReach={() => console.log('到达底部')}
 * />
 * ```
 */
export function VirtualList<T>({
  data,
  itemSize,
  height,
  width,
  renderItem,
  onEndReach,
}: VirtualListProps<T>): React.ReactNode {
  const itemCount = data.length;

  //渲染单个列表行
  const Row = useCallback(
    ({ index, style }: ListChildComponentProps): React.ReactNode => {
      const item = data[index];
      if (!item) {
        return null;
      }
      return <div style={style}>{renderItem(item, index)}</div>;
    },
    [data, renderItem],
  );

  const handleScroll = useCallback(
    ({
      scrollOffset,
      scrollUpdateWasRequested,
    }: {
      scrollOffset: number;
      scrollUpdateWasRequested: boolean;
    }) => {
      if (scrollUpdateWasRequested || !onEndReach) {
        return;
      }

      // 计算是否接近底部（距离底部还有 5 个项目的距离时触发）
      const threshold = itemSize * (itemCount - 5);
      if (scrollOffset > threshold) {
        onEndReach();
      }
    },
    [itemSize, itemCount, onEndReach],
  );

  return (
    <FixedSizeList
      height={height}
      width={width}
      itemSize={itemSize}
      itemCount={itemCount}
      onScroll={handleScroll}
    >
      {Row}
    </FixedSizeList>
  );
}

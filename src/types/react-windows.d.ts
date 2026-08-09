declare module 'react-window' {
  import * as React from 'react';

  export interface ListOnScrollProps {
    scrollDirection: 'forward' | 'backward';
    scrollOffset: number;
    scrollUpdateWasRequested: boolean;
  }

  export interface ListOnItemsRenderedProps {
    overscanStartIndex: number;
    overscanStopIndex: number;
    visibleStartIndex: number;
    visibleStopIndex: number;
  }

  export interface FixedSizeListProps {
    children: React.ComponentType<{
      index: number;
      style: React.CSSProperties;
    }>;
    className?: string;
    height: number;
    itemCount: number;
    itemSize: number;
    width: number | string;
    onScroll?: (props: ListOnScrollProps) => unknown;
    onItemsRendered?: (props: ListOnItemsRenderedProps) => unknown;
  }

  export const FixedSizeList: React.ComponentType<FixedSizeListProps>;
  export interface ListChildComponentProps {
    index: number; //  当前渲染项的索引
    style: React.CSSProperties; // 必须传给元素的 style（包含 position、top/left、height/width）
    data?: unknown; // 如果使用了 List 的 data prop，会传过来
  }
}

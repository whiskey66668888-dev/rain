/**
 * 体育 H5：列表在 ul 或内层可滚父级滚动，通过 `window` 事件把 `scrollTop` 交给 MainLayout。
 */
export const H5_SPORTS_MAIN_LIST_SCROLL = 'h5-sports-main-list-scroll' as const;

export type H5SportsMainListScrollDetail = { scrollTop: number };

/** 找到实际产生滚动的节点（PullToRefresh 等可能包在 ul 外） */
export function findH5SportsListScrollElement(listRoot: HTMLElement | null): HTMLElement | null {
  if (!listRoot) return null;

  const isScrollable = (node: HTMLElement) => {
    const { overflowY, overflow } = getComputedStyle(node);
    const oy = overflowY === 'visible' ? overflow : overflowY;
    if (oy !== 'auto' && oy !== 'scroll' && oy !== 'overlay') return false;
    return node.scrollHeight > node.clientHeight + 1;
  };

  if (isScrollable(listRoot)) return listRoot;

  for (
    let p: HTMLElement | null = listRoot.parentElement, i = 0;
    p && i < 16;
    p = p.parentElement, i++
  ) {
    if (isScrollable(p)) return p;
  }

  const main = document.getElementById('layout-main-content');
  if (main && isScrollable(main)) return main;
  return listRoot;
}

/**
 * H5 固定联赛快捷筛选：渲染在搜索栏行内，占「联赛/时间」到右侧收起按钮之间的剩余空间。
 * 数据与选中态见 useFixedLeagueTabs。
 */
import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';

import { useAppSelector } from '@/core/store/hooks';

import useFixedLeagueTabs from './useFixedLeagueTabs';

const LeagueTabsH5: React.FC = () => {
  // 简洁版那一行已经被玩法 tab 占满，不再挤进联赛（对齐 App 的 pro 模式限制）
  const isSimpleOdds = useAppSelector((state) => state.sport.mainList.settings.isSimpleOdds);
  const { visible, items, activeId, select } = useFixedLeagueTabs({ enabled: !isSimpleOdds });
  const itemRefs = useRef<Map<number, HTMLSpanElement>>(new Map());

  // 选中项滚动到可视区域，避免筛选来自弹窗时选中项在屏幕外
  useEffect(() => {
    if (activeId === null) return;
    itemRefs.current.get(activeId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [activeId]);

  if (!visible) return null;

  const setItemRef =
    (leagueId: number) =>
    (el: HTMLSpanElement | null): void => {
      if (el) {
        itemRefs.current.set(leagueId, el);
      } else {
        itemRefs.current.delete(leagueId);
      }
    };

  return (
    <div className="ml-[12px] flex min-w-0 flex-1 items-center gap-[12px] self-stretch overflow-x-auto [&::-webkit-scrollbar]:hidden">
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <span
            key={item.id}
            ref={setItemRef(item.id)}
            onClick={() => select(item.id)}
            className={clsx(
              'relative flex h-full flex-shrink-0 cursor-pointer items-center whitespace-nowrap',
              '_tf[12]',
              isActive ? 'font-semibold text-[var(--ThemeColor-Main)]' : 'text-[var(--Text-800)]',
            )}
          >
            {item.name}
            {isActive && (
              <span className="absolute bottom-[3px] left-0 right-0 h-[2px] rounded-[1px] bg-[var(--ThemeColor-Main)]" />
            )}
          </span>
        );
      })}
    </div>
  );
};

export default React.memo(LeagueTabsH5);

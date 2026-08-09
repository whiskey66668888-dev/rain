/**
 * PC 固定联赛快捷筛选：主列表上方单独一行，跟着 NavbarMenuPC 一起吸顶。
 * 选中项是实心胶囊（设计稿），其余为纯文字。数据与选中态见 useFixedLeagueTabs。
 */
import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';

import useFixedLeagueTabs from './useFixedLeagueTabs';

const LeagueTabsPC: React.FC = () => {
  const { visible, items, activeId, select } = useFixedLeagueTabs();
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // 选中项滚动到可视区域，避免筛选来自「赛事筛选」弹窗时选中项在可视区外
  useEffect(() => {
    if (activeId === null) return;
    itemRefs.current.get(activeId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }, [activeId]);

  if (!visible) return null;

  const setItemRef =
    (leagueId: number) =>
    (el: HTMLButtonElement | null): void => {
      if (el) {
        itemRefs.current.set(leagueId, el);
      } else {
        itemRefs.current.delete(leagueId);
      }
    };

  return (
    <div className="flex h-[44px] items-center gap-[4px] overflow-x-auto border-t border-solid border-[var(--Line-100)] px-[12px] [&::-webkit-scrollbar]:hidden">
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            ref={setItemRef(item.id)}
            onClick={() => select(item.id)}
            className={clsx(
              'flex h-[28px] flex-shrink-0 cursor-pointer items-center whitespace-nowrap rounded-[14px] px-[16px]',
              '_tf[14]',
              isActive
                ? 'bg-[var(--ThemeColor-Main)] font-medium text-[var(--White-100)]'
                : 'text-[var(--Text-800)] hover:text-[var(--Text-Main-10)]',
            )}
          >
            {item.name}
          </button>
        );
      })}
    </div>
  );
};

export default React.memo(LeagueTabsPC);

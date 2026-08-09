import React, { useEffect } from 'react';

import MainList from '../../pages/SportsPage/components/MainList';
import SimpleTabList from '../../pages/SportsPage/components/SearchBarH5/components/simpleTabList';
import useSportsMainListControl from '@/common/hooks/useSportsMainListControl';
import { FBCompetitionMap, FBSportId, MatchPlayType } from '@/apis/fbSports/common/constants';
import { LocalHandicapItem } from '@/apis/fbSports/common/types';
import { useAppSelector } from '@/core/store/hooks';
import { PlayType } from '@/apis/commonSports/constants';
import clsx from 'clsx';

/**
 * 赛事详情页右侧栏：投注模块下方的「所有滚球」列表（与 MatchDrawer 内列表一致，非弹层）
 */
const SportsDetailsSidebarMatchList: React.FC = () => {
  const sportId = useAppSelector((state) => state.sport.mainList.settings.sportId);
  const playType = useAppSelector((state) => state.sport.mainList.settings.playType);
  const { changeSimpleActiveItem, switchPlayType } = useSportsMainListControl();
  const isLivingPlayType = playType !== PlayType.Today;

  useEffect(() => {
    changeSimpleActiveItem(
      (Object.values(FBCompetitionMap).find((item) => item.id === sportId)
        ?.simpleList[0] as LocalHandicapItem) ?? FBCompetitionMap[FBSportId.Football].simpleList[0],
    );
  }, [changeSimpleActiveItem, sportId]);

  const handleChangePlayType = (nextPlayType: PlayType) => {
    if (nextPlayType === playType) return;
    switchPlayType(
      nextPlayType,
      sportId,
      nextPlayType === PlayType.Today ? MatchPlayType.TODAY : MatchPlayType.LIVE,
    );
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full overflow-hidden border-t border-[var(--Line-100)]">
      <div className="rounded-4px overflow-hidden m-8px mt-0px bg-[var(--Background-300)] border border-[var(--White-20)] shrink-0 flex">
        <button
          type="button"
          className={clsx(
            'flex-1 h-30px border-none cursor-pointer _tf[12]',
            isLivingPlayType
              ? 'bg-[var(--ThemeColor-Main)] text-[var(--White-100)]  font-500'
              : 'bg-transparent text-[var(--Text-800)]',
          )}
          onClick={() => handleChangePlayType(PlayType.Living)}
        >
          进行中
        </button>
        <button
          type="button"
          className={clsx(
            'flex-1 h-30px border-none  cursor-pointer _tf[12]',
            !isLivingPlayType
              ? 'bg-[var(--ThemeColor-Main)] text-[var(--White-100)] font-500'
              : 'bg-transparent text-[var(--Text-800)]',
          )}
          onClick={() => handleChangePlayType(PlayType.Today)}
        >
          即将开始
        </button>
      </div>
      <div className="bg-[var(--Background-300)] rounded-40px mb-8px mx-8px shrink-0 p-2px">
        <SimpleTabList variant="betting" bettingCompact />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain px-8px pb-8px">
        <MainList
          forceMobile={true}
          isSimpleOdds={true}
          threeLineColumn={true}
          localTimeOrder={!isLivingPlayType}
          hideMatchNum={true}
          compactLeftInfo={true}
        />
      </div>
    </div>
  );
};

export default SportsDetailsSidebarMatchList;

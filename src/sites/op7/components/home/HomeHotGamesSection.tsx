import React from 'react';
import { generatePath } from 'react-router-dom';

import { useGameSlotListQuery } from '@/apis/origin/gamePlay';
import Icon from '@/common/components/Icon';
import LazyImage from '@/common/components/LazyImage';
import { useEntertainmentHooks } from '@/common/hooks/useEntertainmentHooks';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import { ENTERTAINMENT_HOME_PAGE_TYPE, HomeListId } from '@/utils/constants/entertainment';
import HorizontalScrollSection from '@/sites/op7/pages/LandingPage/components/HorizontalScrollSection';
import { useAppDispatch } from '@/core/store/hooks';
import { setExpandedMenuId } from '@/core/store/slices/entertainmentSlice';

const HomeHotGamesSection: React.FC = () => {
  const { handleOpenGame } = useEntertainmentHooks();
  const dispatch = useAppDispatch();
  const navigate = useNavigateWithLanguage();
  const { data: hotGameSlotList } = useGameSlotListQuery({
    clType: 'hot',
    displaySize: 20,
    pageNumber: 1,
    pageSize: 20,
  });
  const hotGames = hotGameSlotList?.gameList ?? [];

  if (hotGames.length === 0) {
    return null;
  }

  return (
    <HorizontalScrollSection
      title="热门游戏"
      icon={
        <Icon size="18px" color="var(--ThemeColor-Main)" src="/images/common/menu/sports/hot.svg" />
      }
      flushEndOnMobile
      viewAllText="全部"
      onViewAll={() => {
        navigate(
          generatePath(PATHS.entertainment, {
            pageType: ENTERTAINMENT_HOME_PAGE_TYPE.HOME,
            id: '',
          }),
        );
        dispatch(setExpandedMenuId(HomeListId.SLOTS));
      }}
      className="mb-0px"
    >
      {hotGames.map((item, index: number) => (
        <button
          type="button"
          className="h-80px w-80px shrink-0 cursor-pointer overflow-hidden rounded-10px border-none bg-transparent p-0"
          key={`${item.id}-${index}`}
          onClick={() => handleOpenGame(item, false)}
        >
          <LazyImage className="h-full w-full object-cover" src={item.imageUrl} alt={item.name} />
        </button>
      ))}
    </HorizontalScrollSection>
  );
};

export default HomeHotGamesSection;

import React from 'react';
import { generatePath } from 'react-router-dom';

import { useGameSlotListInfiniteQuery } from '@/apis/origin/gamePlay';
import LazyImage from '@/common/components/LazyImage';
import { useEntertainmentHooks } from '@/common/hooks/useEntertainmentHooks';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import { ENTERTAINMENT_HOME_PAGE_TYPE, TRY_PLAY_VENUE_ID } from '@/utils/constants/entertainment';

import HorizontalScrollSection from '../HorizontalScrollSection';
import Icon from '@/common/components/Icon';

const LatestGames: React.FC = () => {
  const navigate = useNavigateWithLanguage();
  const { handleOpenGame } = useEntertainmentHooks();
  const { data } = useGameSlotListInfiniteQuery({
    gameId: -1,
    tryPlay: true,
    pageSize: 20,
  });
  const trialGames = data?.pages.flatMap((page) => page.gameList) ?? [];

  if (trialGames.length === 0) {
    return null;
  }

  return (
    <HorizontalScrollSection
      title="免费试玩"
      icon={<Icon size="18px" color="var(--ThemeColor-Main)" src="/images/common/free-play.svg" />}
      viewAllText="全部"
      onViewAll={() =>
        navigate(
          generatePath(PATHS.entertainment, {
            pageType: ENTERTAINMENT_HOME_PAGE_TYPE.SLOT_GAME,
            id: String(TRY_PLAY_VENUE_ID),
          }),
        )
      }
      className="mt-16px px-12px"
      listClassName="![scroll-padding-left:0px]"
      listItemClassName="w-[calc((100%-24px)/4)] lg:w-[calc((100%-104px)/14)]"
      scrollItemsPerPage={14}
      flushEndOnMobile
    >
      {trialGames.map((game, index) => (
        <button
          key={`${game.id}-${index}`}
          type="button"
          className="w-full cursor-pointer border-none bg-transparent p-0 text-left can-hover:transition-transform can-hover:duration-200 can-hover:ease can-hover:hover:-translate-y-1"
          onClick={() => handleOpenGame(game, true)}
        >
          <div className="relative aspect-[76/94] w-full overflow-hidden rounded-12px bg-[var(--Background-100)]">
            <LazyImage
              src={game.imageUrl}
              alt={game.name}
              className="h-full w-full"
              imageClassName="object-cover"
              lazy={true}
            />
            {/* <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(10,16,22,0.8)] via-[rgba(10,16,22,0.18)] to-transparent px-6px pb-8px pt-18px">
              <p className="_tf[12] m-0 line-clamp-2 text-center leading-[1.15] font-600 text-[var(--White-100)]">
                {game.name}
              </p>
            </div> */}
          </div>
        </button>
      ))}
    </HorizontalScrollSection>
  );
};

export default LatestGames;

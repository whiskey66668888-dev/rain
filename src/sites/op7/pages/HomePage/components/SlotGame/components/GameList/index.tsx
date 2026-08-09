/**
 * @description 游戏列表组件
 */

import styles from './GameList.module.scss';
import React, { useMemo } from 'react';
import Skeleton from '@/common/components/Skeleton';
import { TGameList } from '@/apis/origin/gamePlay';
import { useEntertainmentHooks } from '@/common/hooks/useEntertainmentHooks';
import LazyImage from '@/common/components/LazyImage';
import Icon from '@/common/components/Icon';
import clsx from 'clsx';
import { HomeListSwitch } from '@/apis/origin/homeList';
import VenueMaintenanceMask from '@/sites/op7/components/VenueMaintenanceMask';
import { useAppSelector } from '@/core/store/hooks';
import Empty from '@/common/components/Empty';
import { TRY_PLAY_VENUE_ID } from '@/utils/constants/entertainment';
interface GameListProps {
  data: TGameList[];
  skeletonCount?: number;
  isLoading: boolean;
  isTryPlay: boolean;
  venueId?: number;
  venueName?: string;
  venueSwitch?: string | number;
  venueMaintenanceDesc?: string;
  listSimpleView?: boolean; // 列表只有字的简单视图或者有图有字的正常视图
  isFavoriteTab?: boolean;
}
const GameList: React.FC<GameListProps> = ({
  data,
  skeletonCount,
  isLoading,
  isTryPlay,
  venueId,
  venueSwitch,
  venueMaintenanceDesc,
  listSimpleView = false,
  isFavoriteTab,
}) => {
  const { handleCollectGame, favoriteOverrides, handleOpenGame } = useEntertainmentHooks();
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const gameList: TGameList[] = useMemo(() => {
    const _data = data?.map((game) => ({
      ...game,
      isFavorite:
        game.id in favoriteOverrides
          ? (favoriteOverrides[game.id] ?? false)
          : (game.isFavorite ?? false),
    }));
    if (venueId === TRY_PLAY_VENUE_ID) {
      return _data.filter((game) => game.haveTest);
    }
    if (isFavoriteTab) {
      return _data.filter((game) => game.transferId === venueId);
    }
    return _data;
  }, [data, favoriteOverrides, isFavoriteTab, venueId]);

  if (!isLoading && gameList.length === 0) {
    return (
      <div className="flex items-center justify-center flex-1 pt-100px">
        <Empty text="暂无数据" variant="card" imgWrapClassName="w-[64px] h-[64px]" />
      </div>
    );
  }

  return (
    <div>
      <div
        className={clsx(
          styles.gameList,
          // !showLabel && styles.gameListWithoutLabel,
          listSimpleView && styles.gameListSimpleView,
        )}
      >
        {isLoading ? (
          <Skeleton type="slotList" slotListCount={skeletonCount} />
        ) : (
          gameList?.map((game: TGameList) => {
            const gameWithMaintenance = game as TGameList & {
              switch?: string | number;
              maintenanceDesc?: string;
            };
            const normalizedSwitch = String(
              gameWithMaintenance.switch ?? venueSwitch ?? HomeListSwitch.NORMAL,
            ) as HomeListSwitch;
            const shouldBlockClick =
              normalizedSwitch === HomeListSwitch.MAINTENANCE ||
              normalizedSwitch === HomeListSwitch.EXPECT;
            const maintenanceDesc = `${gameWithMaintenance.maintenanceDesc ?? venueMaintenanceDesc ?? ''}`;
            const hasMaintenanceNotice = /\S/.test(maintenanceDesc);
            const shouldShowMask =
              normalizedSwitch !== HomeListSwitch.NORMAL || hasMaintenanceNotice;

            return (
              <div
                className={styles.gameItem}
                key={game.id}
                onClick={(event) => {
                  const target = event.target as HTMLElement | null;
                  if (target?.closest('[data-maintenance-interactive="true"]')) return;
                  if (shouldBlockClick) return;
                  handleOpenGame(game, isTryPlay);
                }}
              >
                <div className={styles.gameItemImage}>
                  {!listSimpleView && (
                    <>
                      <LazyImage
                        src={game.imageUrl}
                        fallback={`/images/${themeMode}/imgPlaceholder.png`}
                        alt={game.name}
                        className="flex-1"
                        errorClassName={styles.gameItemImageLazyImageError}
                      />
                      <div className={styles.hover}>
                        <LazyImage lazy={false} src={'/images/common/play.png'} />
                      </div>
                      <div className={styles.gameItemFavoriteIcon}>
                        <Icon
                          src={
                            game.isFavorite
                              ? '/images/common/flow_game_ed.svg'
                              : '/images/common/flow_game.svg'
                          }
                          size="13px"
                          color={'#1A81FF'}
                          className="flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCollectGame(game.id, game.isFavorite ?? false);
                          }}
                        />
                      </div>
                      {shouldShowMask && (
                        <VenueMaintenanceMask
                          className={clsx(
                            styles.maintenanceMask,
                            shouldBlockClick
                              ? styles.maintenanceMaskBlocked
                              : styles.maintenanceMaskNotice,
                          )}
                          switch={normalizedSwitch}
                          maintenanceDesc={maintenanceDesc}
                        />
                      )}
                    </>
                  )}
                  {listSimpleView && (
                    <div className={styles.gameItemLable}>
                      <LazyImage
                        src={game.thumbnailImg || game.imageUrl}
                        fallback={`/images/${themeMode}/imgPlaceholder.png`}
                        alt={game.name}
                        className="w-24px h-24px rounded-6px flex-shrink-0"
                        // errorClassName={styles.gameItemImageLazyImageError}
                      />
                      <p>{game.name}</p>
                      <Icon
                        src={
                          game.isFavorite
                            ? '/images/common/flow_game_ed.svg'
                            : '/images/common/flow_game.svg'
                        }
                        size="16px"
                        color={game.isFavorite ? '#1A81FF' : 'var(--Text-800)'}
                        className="flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCollectGame(game.id, game.isFavorite ?? false);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GameList;

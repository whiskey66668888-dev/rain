import React, { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '@/core/store/hooks';
import {
  selectFollowMatch,
  selectMainListPlayType,
  selectMainListSportId,
  selectMenus,
} from '@/core/store/selectors/sportSelectors';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import { useLocation } from 'react-router-dom';
import useSportsMainListControl from '@/common/hooks/useSportsMainListControl';
import {
  PlayType,
  HotSportId,
  PlayTypeId,
  ESportsLeftPanelType,
} from '@/apis/commonSports/constants';
import clsx from 'clsx';
import Icon from '@/common/components/Icon';
import { ClientOnly } from '@/common/components/ClientOnly';

import styles from './SidebarMenu.module.scss';
import { useMemoizedFn } from 'ahooks';
import { useUnsettledCount } from '@/common/hooks/betHistory/useUnsettledCount';
import { useAllBetItemIds } from '@/common/hooks/bet/useAllBetItemIds';

const SportsMenu: React.FC<{
  isSidebarMenuOpen: boolean;
  setIsSidebarMenuOpen: (isSidebarMenuOpen: boolean) => void;
}> = ({ isSidebarMenuOpen, setIsSidebarMenuOpen }) => {
  const menus = useAppSelector(selectMenus);
  const currentPlayType = useAppSelector(selectMainListPlayType);
  const currentSportId = useAppSelector(selectMainListSportId);
  const followMatch = useAppSelector(selectFollowMatch);
  const [isSportsMenuExpanded, setIsSportsMenuExpanded] = useState(false);
  const [menuPlayType, setMenuPlayType] = useState(PlayType.Today);
  const { switchPlayType, switchSportId, switchSportsLeftPanelType } = useSportsMainListControl();
  const navigate = useNavigateWithLanguage();
  const location = useLocation();
  const unSettledBetActive = false;
  const { unsettledCount } = useUnsettledCount();
  const allBetItemIds = useAllBetItemIds();

  useEffect(() => {
    if ([PlayType.Today, PlayType.Early].includes(currentPlayType)) {
      setMenuPlayType(currentPlayType);
    }
  }, [currentPlayType]);

  const activeRoute = useMemo(() => {
    return location.pathname.split('/').pop();
  }, [location.pathname]);

  const isBetResultPage = useMemo(() => {
    return activeRoute === 'betting' && location.search.includes('betOrderType=amidithion');
  }, [activeRoute, location.search]);

  const isHomePage = useMemo(() => {
    return activeRoute === 'sports';
  }, [activeRoute]);

  const handleSportsMenuClick = useMemoizedFn(
    (sportId: number, playType: PlayType, playTypeId: number): void => {
      switchPlayType(playType, sportId, playTypeId);
      switchSportId(sportId);
      navigate(PATHS.sports);
    },
  );

  const handleTypeMenuClick = useMemoizedFn((type: PlayType, typeId: number): void => {
    switchPlayType(type, menus?.[type]?.[0]?.sportId ?? HotSportId, typeId);
    navigate(PATHS.sports);
  });

  const sportsMenu = menus[menuPlayType].map((item) => {
    const isExpanded =
      currentSportId === item.sportId && isHomePage && currentPlayType === menuPlayType;
    return (
      <button
        key={item.sportId}
        className={clsx(styles.menuButton, styles.sportsMenuButton, {
          [styles.menuItemActive as string]: isExpanded,
        })}
        onClick={() =>
          handleSportsMenuClick(
            item.sportId,
            menuPlayType,
            menuPlayType === PlayType.Today ? PlayTypeId.Today : PlayTypeId.Early,
          )
        }
      >
        <div className="flex items-center gap-12px flex-1">
          {isExpanded && item.sportId === HotSportId ? (
            <img
              alt={item.name}
              src="/images/common/menu/sports/sid/-2_active.svg"
              className={styles.sportsMenuIcon}
            />
          ) : (
            <Icon
              src={`/images/common/menu/sports/sid/${item.viewId}.svg`}
              size="16px"
              className={styles.sportsMenuIcon}
              color={isExpanded ? 'var(--ThemeColor-Main)' : 'var(--Text-800)'}
            />
          )}
          <span className="flex-1 text-left _tf[14]">{item.name}</span>
        </div>
        {
          // 热门赛种不展示数量
          item.sportId !== HotSportId && (
            <p className="_tf[12] leading-[1] font-500 text-center text-[var(--Text-Main-10)]  bg-[var(--Background-300)] py-2px px-6px rounded-10px">
              {item.count}
            </p>
          )
        }
      </button>
    );
  });
  return (
    <>
      {/* 关注 */}
      <div className="flex flex-col">
        <button
          className={clsx(styles.menuButton, {
            [styles.menuItemActive as string]: currentPlayType === PlayType.Follow && isHomePage,
          })}
          onClick={() => handleTypeMenuClick(PlayType.Follow, PlayTypeId.Follow)}
        >
          <div className="flex items-center gap-12px flex-1">
            <Icon
              src={'/images/common/menu/follow.svg'}
              size="16px"
              color={
                currentPlayType === PlayType.Follow && isHomePage
                  ? 'var(--ThemeColor-Main)'
                  : 'var(--Text-800)'
              }
              className="flex-shrink-0"
            />
            <span className="flex-1 text-left _tf[14]">我的关注</span>
          </div>
          {
            <ClientOnly>
              <p className="_tf[12] leading-[1] font-500 text-center text-[var(--Text-Main-10)]  bg-[var(--Background-300)] py-2px px-6px rounded-10px">
                {_.size(followMatch)}
              </p>
            </ClientOnly>
          }
        </button>
      </div>
      {/* 未结算注单 */}
      <div className="flex flex-col">
        <button
          className={clsx(styles.menuButton, {
            [styles.menuItemActive as string]: unSettledBetActive,
          })}
          onClick={() => switchSportsLeftPanelType(ESportsLeftPanelType.BET_HISTORY)}
        >
          <div className="flex items-center gap-12px flex-1">
            <Icon
              src={'/images/common/menu/bethistory.svg'}
              size="16px"
              color={unSettledBetActive ? 'var(--ThemeColor-Main)' : 'var(--Text-800)'}
              className="flex-shrink-0"
            />
            <span className="flex-1 text-left _tf[14]">未结算注单</span>
          </div>
          <ClientOnly>
            <p className="_tf[12] leading-[1] font-500 text-center text-[var(--Text-Main-10)]  bg-[var(--Background-300)] py-2px px-6px rounded-10px">
              {unsettledCount}
            </p>
          </ClientOnly>
        </button>
      </div>
      {/*   投注单 */}
      <div className="flex flex-col">
        <button
          className={clsx(styles.menuButton, {
            [styles.menuItemActive as string]: activeRoute === 'betting' && !isBetResultPage,
          })}
          onClick={() => switchSportsLeftPanelType(ESportsLeftPanelType.ORDER_CART)}
        >
          <div className="flex items-center gap-12px flex-1">
            <Icon
              src={'/images/common/menu/bet.svg'}
              size="16px"
              color={activeRoute === 'betting' ? 'var(--ThemeColor-Main)' : 'var(--Text-800)'}
              className="flex-shrink-0"
            />
            <span className="flex-1 text-left _tf[14]">投注单</span>
          </div>
          <ClientOnly>
            <p className="_tf[12] leading-[1] font-500 text-center text-[var(--Text-Main-10)]  bg-[var(--Background-300)] py-2px px-6px rounded-10px">
              {allBetItemIds.length}
            </p>
          </ClientOnly>
        </button>
      </div>
      {/* 滚球 */}
      <div className="flex flex-col">
        <button
          className={clsx(styles.menuButton, {
            [styles.menuItemActive as string]: currentPlayType === PlayType.Living && isHomePage,
          })}
          onClick={() => handleTypeMenuClick(PlayType.Living, PlayTypeId.Living)}
        >
          <div className="flex items-center gap-12px flex-1">
            <Icon
              src={'/images/common/menu/live.svg'}
              size="16px"
              color={
                currentPlayType === PlayType.Living && isHomePage
                  ? 'var(--ThemeColor-Main)'
                  : 'var(--Text-800)'
              }
              className="flex-shrink-0"
            />
            <span className="flex-1 text-left _tf[14]">LIVE滚球</span>
          </div>
          <p className="_tf[12] leading-[1] font-500 text-center text-[var(--Text-Main-10)]  bg-[var(--Background-300)] py-2px px-6px rounded-10px">
            {menus?.living.reduce((acc, item) => acc + item.count, 0)}
          </p>
        </button>
      </div>
      <div className={styles.line}></div>
      {/* 赛种菜单 */}
      <div className="flex flex-col rounded-8px overflow-hidden">
        <button
          className={clsx(styles.menuButton, styles.sportsMenuButton, {
            [styles.expandedMenuItemActive as string]: isSportsMenuExpanded,
          })}
          onClick={() => {
            if (!isSidebarMenuOpen) {
              setIsSidebarMenuOpen(true);
              setIsSportsMenuExpanded(true);
            } else {
              setIsSportsMenuExpanded(!isSportsMenuExpanded);
            }
          }}
        >
          <div className="flex items-center gap-12px flex-1">
            <Icon
              src={'/images/common/menu/sports.svg'}
              size="16px"
              color={isSportsMenuExpanded ? 'var(--ThemeColor-Main)' : 'var(--Text-800)'}
              className="flex-shrink-0"
            />
            <span className="flex-1 text-left _tf[14]">体育赛事</span>
          </div>
          <div className={styles.arrowIconWrapper}>
            <Icon
              src="/images/common/arrow_sports.svg"
              size="8px"
              color={isSportsMenuExpanded ? 'var(--Text-Main-10)' : 'var(--Text-800)'}
              className={`flex-shrink-0 ${styles.arrowIcon} ${isSportsMenuExpanded ? styles.arrowIconExpanded : ''}`}
            />
          </div>
        </button>
        <div
          className={`${styles.subMenu} ${isSportsMenuExpanded && isSidebarMenuOpen ? styles.subMenuExpanded : styles.subMenuCollapsed}`}
        >
          <div className={clsx(styles.menuButton, styles.sportsMenuButton, styles.subMenuItem)}>
            <div className="flex-shrink-0 min-w-162px">
              <span
                className={clsx({
                  [styles.subMenuItemActive as string]: menuPlayType === PlayType.Today,
                })}
                onClick={() => setMenuPlayType(PlayType.Today)}
              >
                今日
              </span>
              <span
                className={clsx({
                  [styles.subMenuItemActive as string]: menuPlayType !== PlayType.Today,
                })}
                onClick={() => setMenuPlayType(PlayType.Early)}
              >
                早盘
              </span>
            </div>
          </div>
          {sportsMenu}
        </div>
        {/* 赛果比分 */}
        {/* <button
          className={clsx(styles.menuButton, styles.sportsMenuButton, {
            [styles.menuItemActive as string]: isBetResultPage,
          })}
          onClick={() => navigate(PATHS.betHistoryH5 + '?betOrderType=amidithion')}
        >
          <div className="flex items-center gap-12px flex-1">
            <Icon
              src={'/images/common/menu/result.svg'}
              size="16px"
              color={isBetResultPage ? 'var(--ThemeColor-Main)' : 'var(--Text-800)'}
              className="flex-shrink-0"
            />
            <span className="flex-1 text-left _tf[14]">赛果&比分</span>
          </div>
        </button> */}
      </div>
      {/* 冠军投注 */}
      <button
        className={clsx(styles.menuButton, {
          [styles.menuItemActive as string]: currentPlayType === PlayType.Champion && isHomePage,
        })}
        onClick={() => handleTypeMenuClick(PlayType.Champion, PlayTypeId.Champion)}
      >
        <div className="flex items-center gap-12px flex-1">
          <Icon
            src={'/images/common/menu/champion.svg'}
            size="16px"
            color={
              currentPlayType === PlayType.Champion && isHomePage
                ? 'var(--ThemeColor-Main)'
                : 'var(--Text-800)'
            }
            className="flex-shrink-0"
          />
          <span className="flex-1 text-left _tf[14]">冠军赛事</span>
        </div>
        <p className="_tf[12] leading-[1] font-500 text-center text-[var(--Text-Main-10)]  bg-[var(--Background-300)] py-2px px-6px rounded-10px">
          {menus?.champion.reduce((acc, item) => acc + item.count, 0)}
        </p>
      </button>
    </>
  );
};

export default SportsMenu;

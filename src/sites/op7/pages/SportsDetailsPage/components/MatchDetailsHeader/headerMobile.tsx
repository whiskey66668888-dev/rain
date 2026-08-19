import React, { useMemo, useState } from 'react';

import Icon from '@/common/components/Icon';
import Timing from '@/common/components/Timing';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import type { MatchBaseInfo } from '@/apis/commonSports/types';
import { getSpecialSportScore } from '@/apis/fbSports/common/fbFormat';

import styles from './headerMobile.module.scss';
import LazyImage from '@/common/components/LazyImage';
import clsx from 'clsx';

import { Popover } from 'antd-mobile';

interface HeaderMobileProps {
  matchInfo: MatchBaseInfo;
  isFavorite: boolean;
  isMatchTeamHeader: boolean;
  isVideoVisible: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
  onDrawerOpen?: () => void;
  /** 打开分享弹窗（未登录时不传，即不展示分享入口） */
  onShare?: () => void;
}

/**
 * 赛事详情页头部组件
 */
const HeaderMobile: React.FC<HeaderMobileProps> = ({
  matchInfo,
  isFavorite,
  isMatchTeamHeader,
  isVideoVisible,
  onBack,
  onToggleFavorite,
  onDrawerOpen,
  onShare,
}) => {
  const navigate = useNavigateWithLanguage();
  const [menuVisible, setMenuVisible] = useState(false);

  const {
    homeName,
    homeLogo,
    awayName,
    awayLogo,
    homeScore = 0,
    awayScore = 0,
    matchDate,
    isLive,
    isEnded = false,
    isCountdown,
    matchTime = 0,
    leagueName,
    clockType,
    sportId = 0,
  } = matchInfo;
  const matchPeriod = matchInfo.periodName ?? matchInfo.matchPeriod ?? '';

  const showTeamHeader = useMemo(() => {
    return isVideoVisible || isMatchTeamHeader;
  }, [isVideoVisible, isMatchTeamHeader]);

  /** 头部收起后，收藏/注单/分享收进 ... 菜单 */
  const menuItems = useMemo(() => {
    const items = [
      {
        key: 'favorite',
        label: isFavorite ? '取消收藏' : '收藏',
        icon: isFavorite ? (
          <img src="/images/common/favorite_sel.png" width={20} alt="" />
        ) : (
          <Icon src="/images/common/followed_h5.svg" size={20} color="var(--Text-Main-10)" />
        ),
        onClick: onToggleFavorite,
      },
      {
        key: 'betHistory',
        label: '注单',
        icon: <Icon src="/images/common/record_h5.svg" size={20} color="var(--Text-Main-10)" />,
        onClick: () => navigate(PATHS.betHistoryH5),
      },
    ];

    if (onShare) {
      items.push({
        key: 'share',
        label: '分享',
        icon: (
          <Icon
            src="/images/common/sportDetail/nav_share.png"
            size={20}
            color="var(--Text-Main-10)"
          />
        ),
        onClick: onShare,
      });
    }

    return items;
  }, [isFavorite, onToggleFavorite, onShare, navigate]);

  return (
    <div className={clsx(styles.headerMobile, showTeamHeader ? styles.scrolled : '')}>
      <div className={styles.left}>
        <button className={styles.backButton} onClick={onBack} aria-label="返回">
          {isVideoVisible ? (
            <Icon src="/images/common/close.svg" size="24px" color="var(--Text-Main-10)" />
          ) : (
            <Icon
              src="/images/common/back.svg"
              size="18px"
              color={showTeamHeader ? 'var(--Text-Main-10)' : 'var(--White-100)'}
            />
          )}
        </button>
      </div>

      <div className={styles.center} onClick={onDrawerOpen}>
        <div className={clsx(styles.league, showTeamHeader ? styles.hide : '')}>
          <span className={`${styles.leagueName} _tf[16]`}>{leagueName}</span>
          <Icon
            src="/images/common/arrow_down.svg"
            size="12px"
            color="var(--White-100)"
            className="shrink-0"
          />
        </div>

        <div className={clsx(styles.match, showTeamHeader ? styles.show : '')}>
          <div className={clsx(styles.team, 'justify-end')}>
            <span className={`${styles.label} _tf[12]`}>{homeName}</span>
            <LazyImage src={homeLogo} width={16} height={16} className={styles.teamLogo} />
          </div>
          <div className={styles.info}>
            <div>
              <span className="_tf[10]">{isLive || isEnded ? matchPeriod : matchDate}</span>
              {isLive && matchTime !== 0 && (
                <span className={styles.matchTime}>
                  <Timing
                    className="_tf[10]"
                    time={matchTime}
                    running={!!isCountdown}
                    isCountdown={clockType === 'DESC'}
                  />
                </span>
              )}
            </div>
            <div className="_tf[12] font-din-pro">
              {isLive || isEnded
                ? `${getSpecialSportScore(sportId, homeScore)} - ${getSpecialSportScore(sportId, awayScore)}`
                : 'VS'}
            </div>
          </div>
          <div className={clsx(styles.team, 'justify-start')}>
            <LazyImage src={awayLogo} width={16} height={16} className={styles.teamLogo} />
            <span className={`${styles.label} _tf[12]`}>{awayName}</span>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        {showTeamHeader ? (
          <Popover
            className={styles.menuPopover}
            trigger="click"
            placement="bottom-end"
            visible={menuVisible}
            onVisibleChange={setMenuVisible}
            content={
              <div className="min-w-[120px]">
                {menuItems.map((item, index) => (
                  <div
                    key={item.key}
                    className={clsx(
                      'flex items-center gap-8px h-44px px-16px cursor-pointer',
                      '_tf[14] text-[var(--Text-Main-10)]',
                      index !== menuItems.length - 1 &&
                        'shadow-[0_-1px_0_0_var(--Background-500)_inset]',
                    )}
                    onClick={() => {
                      setMenuVisible(false);
                      item.onClick();
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            }
          >
            <Icon
              src="/images/common/sportDetail/three_dots.png"
              size={20}
              color={showTeamHeader ? 'var(--Text-Main-10)' : 'var(--White-100)'}
            />
          </Popover>
        ) : (
          <>
            <button
              className={`${styles.iconButton} ${isFavorite ? styles.active : ''}`}
              onClick={onToggleFavorite}
              aria-label={isFavorite ? '取消收藏' : '收藏'}
            >
              {isFavorite ? (
                <img src="/images/common/favorite_sel.png" width={20} alt="" className="shrink-0" />
              ) : (
                <Icon
                  src="/images/common/followed_h5.svg"
                  size={20}
                  color={
                    isFavorite
                      ? 'var(--Warning-200)'
                      : showTeamHeader
                        ? 'var(--Text-Main-10)'
                        : 'var(--White-100)'
                  }
                />
              )}
            </button>
            <button
              className={styles.iconButton}
              aria-label="注单"
              onClick={() => navigate(PATHS.betHistoryH5)}
            >
              <Icon
                src="/images/common/record_h5.svg"
                size={20}
                color={showTeamHeader ? 'var(--Text-Main-10)' : 'var(--White-100)'}
              />
            </button>
            {onShare && (
              <button className={styles.iconButton} aria-label="分享" onClick={onShare}>
                <Icon
                  src="/images/common/sportDetail/nav_share.png"
                  size={20}
                  color={showTeamHeader ? 'var(--Text-Main-10)' : 'var(--White-100)'}
                />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HeaderMobile;

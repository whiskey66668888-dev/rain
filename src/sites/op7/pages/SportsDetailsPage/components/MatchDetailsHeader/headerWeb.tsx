import React, { useMemo } from 'react';
import clsx from 'clsx';

import Icon from '@/common/components/Icon';
import type { MatchRecord } from '@/apis/fbSports/getList';
import { formatFBSportItem } from '@/apis/fbSports/common/fbFormat';

import styles from './headerWeb.module.scss';

interface HeaderWebProps {
  match: MatchRecord;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  /** 主区域数据板（比分/轮播）是否展开 */
  isDataBoardVisible: boolean;
  onToggleDataBoard: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  fixedStyle?: React.CSSProperties;
  /** 打开分享弹窗（未登录时不传，即不展示分享入口） */
  onShare?: () => void;
}

/**
 * PC 赛事详情顶栏：白底、联赛名居中、隐藏/刷新/收藏（仅 lg+）
 */
const HeaderWeb: React.FC<HeaderWebProps> = ({
  match,
  onBack,
  isFavorite,
  onToggleFavorite,
  isDataBoardVisible,
  onToggleDataBoard,
  onRefresh,
  isRefreshing,
  fixedStyle,
  onShare,
}) => {
  const leagueName = useMemo(() => {
    const base = formatFBSportItem(match);
    return base.leagueName ?? '';
  }, [match]);

  const dataBoardLabel = isDataBoardVisible ? '隐藏' : '显示';
  const mergedFixedStyle = fixedStyle ? { ...fixedStyle, right: 'auto' } : undefined;

  return (
    <header className={styles.headerWeb} style={mergedFixedStyle}>
      <button type="button" className={styles.backButton} onClick={onBack} aria-label="返回">
        <Icon src="/images/common/back.svg" size="12px" color="var(--Text-800)" />
      </button>

      <h1 className={`${styles.title} _tf[14]`}>{leagueName}</h1>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.textAction}
          onClick={onToggleDataBoard}
          aria-label={isDataBoardVisible ? '隐藏数据板' : '显示数据板'}
        >
          <span className="_tf[12]">{dataBoardLabel}</span>
          <Icon
            src={
              isDataBoardVisible
                ? '/images/common/login/close-eye.svg'
                : '/images/common/login/eye.svg'
            }
            size={14}
            color="var(--Text-800)"
            className="shrink-0"
          />
        </button>

        <button
          type="button"
          className={styles.textAction}
          onClick={onRefresh}
          aria-label="刷新"
          disabled={isRefreshing}
        >
          <span className="_tf[12]">刷新</span>
          <Icon
            src="/images/common/refresh.svg"
            size={16}
            color="var(--Text-800)"
            className={clsx('shrink-0', isRefreshing && styles.refreshing)}
          />
        </button>

        <button
          type="button"
          className={styles.iconButton}
          onClick={onToggleFavorite}
          aria-label={isFavorite ? '取消收藏' : '收藏'}
        >
          <Icon
            src={isFavorite ? '/images/common/followed.svg' : '/images/common/followed.svg'}
            size={18}
            color={isFavorite ? 'var(--Warning-200)' : 'var(--Text-700)'}
            className="shrink-0"
          />
        </button>

        {onShare && (
          <button type="button" className={styles.iconButton} onClick={onShare} aria-label="分享">
            <Icon
              src="/images/common/sportDetail/nav_share.png"
              size={18}
              color="var(--Text-700)"
              className="shrink-0"
            />
          </button>
        )}
      </div>
    </header>
  );
};

export default HeaderWeb;

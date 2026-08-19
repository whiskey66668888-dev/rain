import React, { useMemo } from 'react';
import clsx from 'clsx';

import Icon from '@/common/components/Icon';
import { EOddsStatus } from '@/apis/commonSports/constants';
import type { TBaseBetItem } from '@/apis/commonSports/types';
import { OddBtn } from '@/sites/op7/pages/SportsPage/components/BettingOdds/OddBtn';
import type { OBDetailMarketItem } from '@/apis/obSports/getMatchDetail';
import { OB_POINT_HPIDS } from '@/apis/obSports/common/constants/obDetailCategory';

/** 与 FB BettingMarket 共用同一套样式，保证详情 UI 一致 */
import styles from '../BettingMarket/BettingMarket.module.scss';

export interface OBBettingMarketProps {
  market: OBDetailMarketItem;
  collapsed?: boolean;
  fixed?: boolean;
  selectedBetItemIds?: Set<string>;
  /** PC 右侧栏嵌入详情：压缩赔率钮高度等 */
  embeddedInSidebar?: boolean;
  onToggleCollapse: (marketId: string) => void;
  onToggleFixed: (marketId: string) => void;
  onToggleOdds: (betItem: TBaseBetItem) => void;
}

function isLockedBet(betItem: TBaseBetItem): boolean {
  return (
    !betItem.baseOdds ||
    betItem.oddsStatus === EOddsStatus.Suspended ||
    betItem.oddsStatus === EOddsStatus.Closed
  );
}

/**
 * OB 详情盘口卡片
 * UI 对齐 FB BettingMarket（头栏 / 波胆三列 / 2·3·单列网格），数据仍为 OB 格式化结果
 */
const OBBettingMarket: React.FC<OBBettingMarketProps> = ({
  market,
  collapsed = false,
  fixed = false,
  selectedBetItemIds,
  embeddedInSidebar = false,
  onToggleCollapse,
  onToggleFixed,
  onToggleOdds,
}) => {
  const lineCount = market.lineCount || 1;
  const isTwoColumn = lineCount === 2;
  const isThreeColumn = lineCount === 3;
  const isSingleColumn = !isTwoColumn && !isThreeColumn;
  const isCorrectScore = OB_POINT_HPIDS.has(market.betTypeId);

  /** 波胆：按主/和/客拆成三列（format 已按 home,draw,away 交错排序） */
  const correctScoreColumns = useMemo(() => {
    if (!isCorrectScore || !isThreeColumn) {
      return { home: [] as TBaseBetItem[], draw: [] as TBaseBetItem[], away: [] as TBaseBetItem[] };
    }
    const home: TBaseBetItem[] = [];
    const draw: TBaseBetItem[] = [];
    const away: TBaseBetItem[] = [];
    market.lists.forEach((item, index) => {
      const col = index % 3;
      if (col === 0) home.push(item);
      else if (col === 1) draw.push(item);
      else away.push(item);
    });
    return { home, draw, away };
  }, [isCorrectScore, isThreeColumn, market.lists]);

  return (
    <div
      className={clsx(
        styles.marketGroup,
        fixed && styles.fixed,
        collapsed && styles.collapsed,
        embeddedInSidebar && styles.embeddedInSidebar,
      )}
      data-market-anchor={market.marketId}
    >
      <div
        className={clsx(styles.marketHeader, collapsed && styles.collapsedHeader)}
        onClick={() => onToggleCollapse(market.marketId)}
      >
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={styles.pinButton}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFixed(market.marketId);
            }}
            aria-label={fixed ? '取消置顶' : '置顶'}
          >
            <Icon
              src={`/images/common/sportsDetails/pin_status${fixed ? '_active' : ''}.svg`}
              size="12px"
              color={fixed ? 'var(--ThemeColor-Main)' : 'var(--Text-800)'}
            />
          </button>
          <span className={`${styles.marketName} _tf[14]`}>{market.betTypeName}</span>
        </div>
        <button
          type="button"
          className={styles.collapseButton}
          aria-label={collapsed ? '展开' : '收起'}
        >
          <Icon
            src="/images/common/sportsDetails/vector.svg"
            size="14px"
            color="var(--Text-700)"
            className={clsx(styles.collapseIcon, collapsed && styles.collapsedIcon)}
          />
        </button>
      </div>

      {!collapsed && (
        <div className={styles.marketsContent}>
          {market.lists.length === 0 ? (
            <div className={`${styles.emptyMarkets} _tf[14]`}>暂无盘口</div>
          ) : isCorrectScore && isThreeColumn ? (
            <div className={styles.correctScoreContainer}>
              <div className={styles.correctScoreColumn}>
                {correctScoreColumns.home.map((betItem, idx) => (
                  <OddBtn
                    key={betItem.betItemId || `home_${idx}`}
                    betItem={betItem}
                    isLocked={isLockedBet(betItem)}
                    active={!!selectedBetItemIds?.has(betItem.betItemId)}
                    className={styles.correctScoreBtn}
                    onClick={onToggleOdds}
                  />
                ))}
              </div>
              <div className={styles.correctScoreColumn}>
                {correctScoreColumns.draw.map((betItem, idx) => (
                  <OddBtn
                    key={betItem.betItemId || `draw_${idx}`}
                    betItem={betItem}
                    isLocked={isLockedBet(betItem)}
                    active={!!selectedBetItemIds?.has(betItem.betItemId)}
                    className={styles.correctScoreBtn}
                    onClick={onToggleOdds}
                  />
                ))}
              </div>
              <div className={styles.correctScoreColumn}>
                {correctScoreColumns.away.map((betItem, idx) => (
                  <OddBtn
                    key={betItem.betItemId || `away_${idx}`}
                    betItem={betItem}
                    isLocked={isLockedBet(betItem)}
                    active={!!selectedBetItemIds?.has(betItem.betItemId)}
                    className={styles.correctScoreBtn}
                    onClick={onToggleOdds}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div
              className={clsx(
                styles.marketRow,
                isTwoColumn && styles.twoColumn,
                isThreeColumn && styles.threeColumn,
              )}
            >
              {market.lists.map((betItem, index) => {
                const locked = isLockedBet(betItem);
                return (
                  <OddBtn
                    key={betItem.betItemId || `${market.marketId}_${index}`}
                    betItem={betItem}
                    isLocked={locked}
                    threeLine={isSingleColumn}
                    active={!!selectedBetItemIds?.has(betItem.betItemId)}
                    className={clsx(
                      styles.oddsBtn,
                      isSingleColumn && styles.horizontalLayout,
                      isTwoColumn && styles.twoColumnLayout,
                      isThreeColumn && styles.threeColumnLayout,
                      locked && styles.lockedPc,
                    )}
                    onClick={onToggleOdds}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OBBettingMarket;

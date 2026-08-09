import React from 'react';
import clsx from 'clsx';

import type { MarketGroup, MarketItem, OddsOption } from '@/apis/fbSports/common/types';
import {
  mtyAnotherNameSet,
  mtyLiNameSet,
  mtyHandBigSet,
  mtyPointSet,
} from '@/apis/fbSports/common/constants/fbPlays';
import type { TBaseBetItem } from '@/apis/commonSports/types';

import styles from './BettingMarket.module.scss';
import { OddBtn } from '@/sites/op7/pages/SportsPage/components/BettingOdds/OddBtn';
import { EFbSelectionType } from '@/apis/fbSports/common/constants/selectionType';
import {
  EFbMarketCurtSaleStatusEnum,
  EFbOddsFormatType,
} from '@/apis/fbSports/common/constants/enum';
import { normalizeFbMarketDisplayName, oddsStatusFormatFb } from '@/apis/fbSports/common/fbFormat';
import Icon from '@/common/components/Icon';

/**
 * 根据 marketGroup + market + option 构建 TBaseBetItem
 * 与 OddBtn 点击时传入 onToggleOdds 的 betItem 完全一致，供推荐点击等场景复用
 */
export function buildBaseBetItemFromOption(
  marketGroup: MarketGroup,
  market: MarketItem,
  option: OddsOption,
): TBaseBetItem {
  const marketType = Number(marketGroup.mty);
  const marketId = market.id;
  const getOptionName = (opt: OddsOption): string => {
    let name = '';
    if (mtyAnotherNameSet.has(marketType)) {
      name = opt.nm || opt.na || '';
    } else {
      name = opt.na || opt.nm || '';
    }
    const ty = Number(opt.ty);
    if (ty === 1) return '主';
    if (ty === 2) return '客';
    if (ty === 3) return '和'; // EFbSelectionType.draw
    return name;
  };
  const shouldShowLineValue = (m: MarketItem) => mtyLiNameSet.has(marketType) && !!m.li;
  const isHandicapMarket = () => mtyHandBigSet.has(marketType);
  const isOverUnderMarket = (m: MarketItem): boolean => {
    if (!shouldShowLineValue(m)) return false;
    const ops = m.op || [];
    return ops.some((op) => {
      const name = getOptionName(op);
      return name.includes('大') || name.includes('小');
    });
  };
  const optionName = getOptionName(option);
  const isOverUnder = isOverUnderMarket(market);
  const isHandicap = !isOverUnder && isHandicapMarket();
  let marketValue = optionName;
  if (isOverUnder && market.li) {
    marketValue = `${optionName}/${String(market.li)}`;
  } else if (isHandicap) {
    marketValue = `${optionName} ${option.li != null ? String(option.li) : '0'}`;
  }
  const od = Number(option.od);
  const ss = market.ss ?? EFbMarketCurtSaleStatusEnum.Suspended;
  const oddsStatus = oddsStatusFormatFb({ ss });
  return {
    isSupportHK: false,
    canParlay: market.au === 1,
    canPreBet: true,
    playName: normalizeFbMarketDisplayName(marketGroup.nm ?? '', marketGroup.mty),
    playId: `${marketGroup.mty}_${marketGroup.pe}`,
    marketId: String(marketId),
    marketValue: market.li ?? marketValue,
    betItemShortName: option.nm || option.na || optionName,
    betItemFullName: option.na || option.nm || optionName,
    betItemId: `${marketId}_${option.ty}`,
    baseOdds: od >= 0 ? od : 0,
    oddsStatus,
    fb: {
      mty: marketGroup.mty,
      pe: marketGroup.pe,
      ty: option.ty,
    },
  };
}

/** 点击赔率时传给父组件的 payload，用于构建 TBetItem 并调用投注方法 */
export interface BetClickPayload {
  betItem: TBaseBetItem & { _marketId: string; _selectionId: string };
  marketGroup: MarketGroup;
  market: MarketItem;
  option: OddsOption;
  optionIndex: number;
}

interface BettingMarketProps {
  marketGroup: MarketGroup;
  /** 与列表 key 一致，用于从首页推荐等场景滚入可视区 */
  scrollAnchorId?: string;
  isCollapsed: boolean;
  isFixed: boolean;
  selectedBets: Array<{ marketId: string; selectionId: string }>;
  onToggleCollapse: () => void;
  onToggleFixed: () => void;
  /** 点击赔率时调用，与 OddListPro 一致，加入投注单并打开投注抽屉 */
  onToggleOdds?: (betItem: TBaseBetItem) => void;
  /** PC 右侧栏嵌入详情：压缩赔率钮高度等 */
  embeddedInSidebar?: boolean;
}

/**
 * 投注盘口组件
 */
const BettingMarket: React.FC<BettingMarketProps> = ({
  marketGroup,
  scrollAnchorId,
  isCollapsed,
  isFixed,
  selectedBets,
  onToggleCollapse,
  onToggleFixed,
  onToggleOdds,
  embeddedInSidebar = false,
}) => {
  // 确保 marketGroup 的类型正确
  const { nm: marketName, mks, mty: marketType } = marketGroup;
  const displayMarketName = normalizeFbMarketDisplayName(marketName || '', marketType);
  const markets: MarketItem[] = mks || [];

  // 格式化赔率
  // const formatOdds = (odds: number): string => {
  //   if (odds < 0) return '锁盘';
  //   return odds.toFixed(2);
  // };

  // 判断选项是否被选中（selectionId 与 betItem.betItemId 一致，格式为 marketId_ty）
  const isSelected = (marketId: number, selectionId: number | string): boolean => {
    const key = typeof selectionId === 'number' ? `${marketId}_${selectionId}` : selectionId;
    return selectedBets.some(
      (bet) => bet.marketId === marketId.toString() && bet.selectionId === key,
    );
  };

  // 判断选项是否锁定：赔率 < 0 表示锁盘，或玩法销售状态非开售（1=开售）
  const isLocked = (odds: number, marketSs?: number): boolean => {
    if (odds < 0) return true;
    if (marketSs != null && marketSs !== 1) return true; // 1 = EFbMarketCurtSaleStatusEnum.Active
    return false;
  };

  // 获取选项名称：根据盘口类型决定使用 na 还是 nm，并根据 ty 字段替换队名为主客
  const getOptionName = (option: OddsOption): string => {
    let name = '';
    const mty = Number(marketType);
    if (mtyAnotherNameSet.has(mty)) {
      // 需要取 nm 字段作为投注选项名称
      name = option.nm || option.na || '';
    } else {
      // 默认使用 na 字段
      name = option.na || option.nm || '';
    }

    // 根据 ty 字段替换队名为主客和
    // ty === 1 主队，ty === 2 客队，ty === 3 和（EFbSelectionType.draw）
    const ty = Number(option.ty);
    if (ty === 1) {
      // 主队：如果名称包含队名，替换为"主"
      return '主';
    } else if (ty === 2) {
      // 客队：如果名称包含队名，替换为"客"
      return '客';
    } else if (ty === 3) {
      return '和';
    }

    return name;
  };

  // 判断是否需要显示 li 字段的 handicap
  const shouldShowLineValue = (market: MarketItem): boolean => {
    const mty = Number(marketType);
    return mtyLiNameSet.has(mty) && !!market.li;
  };

  // 判断是否是让球/大小盘口（需要水平布局）
  const isHandicapMarket = (): boolean => {
    const mty = Number(marketType);
    return mtyHandBigSet.has(mty);
  };

  // 判断是否是大小球盘口（需要显示选项名称+让球值）
  const isOverUnderMarket = (market: MarketItem): boolean => {
    // 大小球盘口通常有 li 字段，且选项名称包含"大"或"小"
    if (!shouldShowLineValue(market)) return false;
    // 检查当前 market 的选项是否包含"大"或"小"
    const ops = market.op || [];
    return ops.some((op) => {
      const name = getOptionName(op);
      return name.includes('大') || name.includes('小');
    });
  };

  // 统一让球盘文案，确保只输出「主/客/和 + 盘口值」格式
  const formatHandicapLabel = (side: string, lineValue: string): string => {
    const normalizedSide = side.trim();
    const normalizedLine = lineValue.trim();
    return `${normalizedSide} ${normalizedLine}`.trim();
  };

  // 判断是否是波胆盘口
  const isCorrectScoreMarket = (): boolean => {
    const mty = Number(marketType);
    return mtyPointSet.has(mty);
  };

  // 与 OddBtn 点击时一致：复用 buildBaseBetItemFromOption
  const toBetItem = (
    option: OddsOption,
    market: MarketItem,
    _marketId: number,
    _optionIndex: number,
  ): TBaseBetItem => {
    const betItem = buildBaseBetItemFromOption(marketGroup, market, option);
    const isOverUnder = isOverUnderMarket(market);
    const isHandicap = !isOverUnder && isHandicapMarket();

    // 让球盘按 UI 文案显示「主/客/和 + 盘口值」，如：主 +0.5、客 -0.5、和 -1
    if (isHandicap) {
      const side = getOptionName(option);
      const lineValue = option.li != null ? String(option.li) : String(market.li ?? '0');
      // 仅在明确主/客/和时覆盖，避免异常数据把其它盘口文案污染
      if (side === '主' || side === '客' || side === '和') {
        const display = formatHandicapLabel(side, lineValue);
        betItem.betItemShortName = display;
        betItem.betItemFullName = display;
      }
    }

    return betItem;
  };

  // 处理波胆的数据：分类到三列（主胜、平局、客胜）
  // 入参为带 market 的选项列表，保证每个选项用各自所属 market 的 id 生成 betItemId，避免“点选一个全部高亮”
  const categorizeCorrectScoreOptions = (
    optionsWithMarket: Array<{ option: OddsOption; market: MarketItem }>,
  ): {
    homeArray: Array<{
      option: OddsOption;
      index: number;
      marketId: number;
      market: MarketItem;
    }>;
    drawArray: Array<{
      option: OddsOption;
      index: number;
      marketId: number;
      market: MarketItem;
    }>;
    awayArray: Array<{
      option: OddsOption;
      index: number;
      marketId: number;
      market: MarketItem;
    }>;
  } => {
    try {
      type Item = { option: OddsOption; index: number; marketId: number; market: MarketItem };
      const homeArray: Item[] = [];
      const drawArray: Item[] = [];
      const awayArray: Item[] = [];

      // 半/全场正确比分：不按比分拆列，按接口顺序轮流填入三列即可
      if (Number(marketType) === 1186) {
        optionsWithMarket.forEach(({ option, market }, index) => {
          const item: Item = { option, index, marketId: Number(market.id), market };
          const col = index % 3;
          if (col === 0) homeArray.push(item);
          else if (col === 1) drawArray.push(item);
          else awayArray.push(item);
        });
      } else {
        // 解析比分字符串（如 "2-1", "1-1", "0-1"）
        const parseScore = (
          scoreStr: string | undefined,
        ): { home: number; away: number } | null => {
          if (!scoreStr) return null;
          const match = scoreStr.match(/^(\d+)[-:](\d+)$/);
          if (match && match[1] && match[2]) {
            return {
              home: parseInt(match[1], 10),
              away: parseInt(match[2], 10),
            };
          }
          return null;
        };

        // 分类选项（每个选项使用其所属 market 的 id）
        optionsWithMarket.forEach(({ option, market }, index) => {
          const optionName = getOptionName(option);
          const score = parseScore(optionName);
          const marketId = Number(market.id);

          if (score) {
            if (score.home > score.away) {
              homeArray.push({ option, index, marketId, market });
            } else if (score.home < score.away) {
              awayArray.push({ option, index, marketId, market });
            } else if (score.home === score.away) {
              drawArray.push({ option, index, marketId, market });
            }
          }
        });

        // homeArray 排序：先按主队得分，再按客队得分，从小到大
        homeArray.sort((a, b) => {
          const optionNameA = getOptionName(a.option);
          const optionNameB = getOptionName(b.option);
          const scoreA = parseScore(optionNameA);
          const scoreB = parseScore(optionNameB);

          if (!scoreA || !scoreB) {
            // 如果解析失败，按字符串排序
            return (optionNameA || '').localeCompare(optionNameB || '');
          }

          // 先按主队得分排序
          if (scoreA.home !== scoreB.home) {
            return scoreA.home - scoreB.home;
          }
          // 主队得分相同时，按客队得分排序
          return scoreA.away - scoreB.away;
        });

        // drawArray 排序：按主队得分（或客队得分，因为相等）从小到大
        drawArray.sort((a, b) => {
          const optionNameA = getOptionName(a.option);
          const optionNameB = getOptionName(b.option);
          const scoreA = parseScore(optionNameA);
          const scoreB = parseScore(optionNameB);

          if (!scoreA || !scoreB) {
            // 如果解析失败，按字符串排序
            return (optionNameA || '').localeCompare(optionNameB || '');
          }
          return scoreA.home - scoreB.home;
        });

        // awayArray 排序：先按客队得分，再按主队得分，从小到大
        awayArray.sort((a, b) => {
          const optionNameA = getOptionName(a.option);
          const optionNameB = getOptionName(b.option);
          const scoreA = parseScore(optionNameA);
          const scoreB = parseScore(optionNameB);

          if (!scoreA || !scoreB) {
            // 如果解析失败，按字符串排序
            return (optionNameA || '').localeCompare(optionNameB || '');
          }

          // 先按客队得分排序
          if (scoreA.away !== scoreB.away) {
            return scoreA.away - scoreB.away;
          }
          // 客队得分相同时，按主队得分排序
          return scoreA.home - scoreB.home;
        });
      }

      // 主/客队/和局不足，则补齐空的投注选项（占位用同一 market 即可）
      const homeLen = homeArray.length;
      const drawLen = drawArray.length;
      const awayLen = awayArray.length;
      const lenList = [homeLen, drawLen, awayLen];
      const maxLen = Math.max(...lenList);
      const defaultMarket = optionsWithMarket[0]?.market;
      const defaultMarketId = defaultMarket ? Number(defaultMarket.id) : 0;

      const emptyOption: OddsOption = {
        na: '',
        nm: '',
        od: -1,
        ty: EFbSelectionType.none,
        bod: -1,
        odt: EFbOddsFormatType.Europe,
      };
      const emptyItem: Item = {
        option: emptyOption,
        index: -1,
        marketId: defaultMarketId,
        market: defaultMarket as MarketItem,
      };
      while (homeArray.length < maxLen) {
        homeArray.push(emptyItem);
      }
      while (drawArray.length < maxLen) {
        drawArray.push(emptyItem);
      }
      while (awayArray.length < maxLen) {
        awayArray.push(emptyItem);
      }

      return { homeArray, drawArray, awayArray };
    } catch (_e) {
      // 如果处理失败，返回空数组
      return {
        homeArray: [],
        drawArray: [],
        awayArray: [],
      };
    }
  };

  return (
    <div
      className={clsx(
        styles.marketGroup,
        isFixed && styles.fixed,
        isCollapsed && styles.collapsed,
        embeddedInSidebar && styles.embeddedInSidebar,
      )}
      data-market-anchor={scrollAnchorId}
    >
      <div
        className={`${styles.marketHeader} ${isCollapsed ? styles.collapsedHeader : ''}`}
        onClick={onToggleCollapse}
      >
        <div className={styles.headerLeft}>
          <button
            className={styles.pinButton}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFixed();
            }}
            aria-label={isFixed ? '取消置顶' : '置顶'}
          >
            <Icon
              src={`/images/common/sportsDetails/pin_status${isFixed ? '_active' : ''}.svg`}
              size={'12px'}
              color={isFixed ? 'var(--ThemeColor-Main)' : 'var(--Text-800)'}
            />
          </button>
          <span className={`${styles.marketName} _tf[14]`}>{displayMarketName}</span>
        </div>
        <button className={styles.collapseButton} aria-label={isCollapsed ? '展开' : '收起'}>
          <Icon
            src="/images/common/sportsDetails/vector.svg"
            size={'14px'}
            color={'var(--Text-700)'}
            className={`${styles.collapseIcon} ${isCollapsed ? styles.collapsedIcon : ''}`}
          />
          {/* <LazyImage
            src={`/images/${theme}/arrow_up_down.png`}
            alt="collapse"
            className={`flex-shrink-0 w-30px h-30px ${styles.collapseIcon} ${isCollapsed ? styles.collapsedIcon : ''}`}
          /> */}
        </button>
      </div>

      {!isCollapsed && (
        <div className={styles.marketsContent}>
          {markets.length === 0 ? (
            <div className={`${styles.emptyMarkets} _tf[14]`}>暂无盘口</div>
          ) : (
            markets.map((market: MarketItem, marketIndex: number) => {
              const isCorrectScore = isCorrectScoreMarket();

              // 波胆盘口使用三列布局（主胜、平局、客胜）
              // 只渲染第一个 market，因为所有选项应该合并显示
              if (isCorrectScore) {
                // 只处理第一个 market，合并所有 markets 的选项（保留每个选项所属 market，保证 betItemId 唯一）
                if (marketIndex === 0) {
                  const allOptionsWithMarket = markets.flatMap((m: MarketItem) =>
                    (m.op || []).map((option: OddsOption) => ({ option, market: m })),
                  );
                  const { homeArray, drawArray, awayArray } =
                    categorizeCorrectScoreOptions(allOptionsWithMarket);

                  // 渲染选项按钮的通用函数（每个选项用各自的 marketId/market 判断选中与构建 betItem）
                  const renderOptionButton = (
                    item: {
                      option: OddsOption;
                      index: number;
                      marketId: number;
                      market: MarketItem;
                    },
                    arrayIndex: number,
                    columnType: 'home' | 'draw' | 'away',
                  ) => {
                    const { option, index: optIndex, marketId: mid, market: optMarket } = item;
                    // 如果是补齐的空选项，显示锁盘状态
                    if (optIndex === -1) {
                      return (
                        <OddBtn
                          key={`empty-${mid}-${columnType}-${arrayIndex}`}
                          isLocked
                          className={styles.correctScoreBtn}
                        />
                      );
                    }

                    const od = Number(option.od);
                    const betItem: TBaseBetItem = toBetItem(option, optMarket, mid, optIndex);
                    const isOptionSelected = isSelected(mid, Number(option.ty));
                    const isOptionLocked = isLocked(od, optMarket.ss);

                    return (
                      <OddBtn
                        key={`${mid}_${option.ty}_${columnType}_${arrayIndex}`}
                        betItem={betItem}
                        isLocked={isOptionLocked}
                        active={isOptionSelected}
                        className={styles.correctScoreBtn}
                        onClick={onToggleOdds}
                      />
                    );
                  };
                  return (
                    <div key={market.id} className={styles.correctScoreContainer}>
                      {/* 主胜列 */}
                      <div className={styles.correctScoreColumn}>
                        {homeArray.map((item, idx) => renderOptionButton(item, idx, 'home'))}
                      </div>
                      {/* 平局列 */}
                      <div className={styles.correctScoreColumn}>
                        {drawArray.map((item, idx) => renderOptionButton(item, idx, 'draw'))}
                      </div>
                      {/* 客胜列 */}
                      <div className={styles.correctScoreColumn}>
                        {awayArray.map((item, idx) => renderOptionButton(item, idx, 'away'))}
                      </div>
                    </div>
                  );
                }
                // 波胆盘口的其他 markets 不渲染，避免重复显示
                return null;
              }

              // 根据选项数量决定布局
              const optionCount = market.op.length;
              const isTwoColumn = optionCount === 2;
              const isThreeColumn = optionCount === 3;
              // 当不是两列或三列布局时（即单列布局），使用水平布局
              const isSingleColumn = !isTwoColumn && !isThreeColumn;

              return (
                <div
                  key={market.id}
                  className={`${styles.marketRow} ${isTwoColumn ? styles.twoColumn : ''} ${isThreeColumn ? styles.threeColumn : ''}`}
                >
                  {(market.op || []).map((option: OddsOption, index: number) => {
                    const mid = Number(market.id);
                    const od = Number(option.od);
                    const betItem: TBaseBetItem = toBetItem(option, market, mid, index);
                    const isOptionSelected = isSelected(mid, Number(option.ty));
                    const isOptionLocked = isLocked(od, market.ss);
                    const isOverUnder = isOverUnderMarket(market);
                    const isHandicap = !isOverUnder && isHandicapMarket();

                    return (
                      <OddBtn
                        key={index}
                        betItem={betItem}
                        isLocked={isOptionLocked}
                        threeLine={isSingleColumn}
                        active={isOptionSelected}
                        className={`${styles.oddsBtn} ${isHandicap ? styles.handicapLayout : ''} ${isOverUnder ? styles.overUnderLayout : ''} ${isSingleColumn ? styles.horizontalLayout : ''} ${isTwoColumn ? styles.twoColumnLayout : ''} ${isThreeColumn ? styles.threeColumnLayout : ''} ${isOptionLocked ? styles.lockedPc : ''}`}
                        onClick={onToggleOdds}
                      />
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default BettingMarket;

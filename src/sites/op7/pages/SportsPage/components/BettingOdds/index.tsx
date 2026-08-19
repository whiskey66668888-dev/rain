/**
 * 专业版：翻页展示多玩法（让球/大小、独赢/角球等）；简洁版：仅赔率区，玩法名由外部 SimplePlayNamesRow + Redux 控制
 * 比赛已结束时隐藏赔率
 */

import React, { useMemo } from 'react';
import { useAppSelector } from '@/core/store/hooks';
import {
  selectRightSidebarVisible,
  selectScreenBreakpoint,
} from '@/core/store/selectors/configSelectors';
import type { TBaseBetItem, MatchBaseInfo } from '@/apis/commonSports/types';
import styles from './BettingOdds.module.scss';
import OddListPro from './OddListPro';
import { useMemoizedFn } from 'ahooks';
import { useClickBetItem } from '@/common/hooks/bet/useClickBetItem';
import OddListSimple from './OddListSimple';
import { isFBMatchEnded } from '@/apis/fbSports/common/fbFormat';

export interface BettingOddsProps {
  match: MatchBaseInfo;
  /** 专业版 / 简洁版，默认 true（先写死专业版，后续可改为从配置读取） */
  isPro?: boolean;
  /** 数据源标识（如 'fb' | 'ob' | 'btizx'），下注时透传，FB 时用 betTypeId 精确匹配 */
  l1?: string;
  /** 简洁版当前玩法项：不传则从 Redux simpleActiveIndex 取，与 SimplePlayNamesRow 同步 */
  currentHandicapItem?: { idList: string[]; row: 2 | 3; name?: string } | null;
  /** 当前选中的赔率 id（同组互斥，可选由外部 store 控制） */
  selectedOddsId?: string | null;
  /** 点击赔率回调 */
  onToggleOdds?: (odds: { oddsId: string }, willSelect: boolean) => void;
  /** 可选的过滤市场类型列表，只显示这些类型的玩法 */
  filterMarketTypes?: number[];
  /** 紧凑模式：横向排列、无标题，用于抽屉等场景 */
  compact?: boolean;
  /** 强制使用移动端样式（maxRows=2），用于弹窗等场景 */
  forceMobile?: boolean;
  /** 三行盘口在 OddBtn 内是否使用纵向布局 */
  threeLineColumn?: boolean;
  hideMatchNum?: boolean;
}

const BettingOdds: React.FC<BettingOddsProps> = ({
  match,
  isPro,
  filterMarketTypes,
  forceMobile,
  threeLineColumn,
  hideMatchNum,
}) => {
  const screenBreakpoint = useAppSelector(selectScreenBreakpoint);
  const rightSidebarVisible = useAppSelector(selectRightSidebarVisible);
  const { clickBetItem } = useClickBetItem();

  const isEnded = isFBMatchEnded(match);

  const maxRows = useMemo(() => {
    // 强制使用移动端样式  bold={match.nameBold === 'home'}
    if (forceMobile) {
      return 2;
    }
    switch (screenBreakpoint) {
      case '2xl':
        return 8;
      case 'xl':
        return 8;
      case 'lg':
        return rightSidebarVisible ? 2 : 4;
      case 'md':
        return 2;
      default:
        return 2;
    }
  }, [screenBreakpoint, forceMobile, rightSidebarVisible]);

  const toggleOdds = useMemoizedFn((betItem: TBaseBetItem) => {
    clickBetItem({ baseMatch: match, baseBetItem: betItem });
  });

  return (
    <div className={styles.wrap}>
      <div className={styles.oddsArea}>
        {isPro ? (
          <OddListPro
            matchId={match.matchId}
            matchMarket={match.children}
            periodName={match.periodName ?? ''}
            sportId={match.sportId ?? 0}
            maxRows={maxRows}
            isEnded={isEnded}
            threeLineColumn={threeLineColumn}
            onToggleOdds={toggleOdds}
            filterMarketTypes={filterMarketTypes}
          />
        ) : (
          <OddListSimple
            matchMarket={match.children}
            sportId={match.sportId ?? 0}
            isEnded={isEnded}
            threeLineColumn={threeLineColumn}
            hideMatchNum={hideMatchNum}
            onToggleOdds={toggleOdds}
            match={match}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(BettingOdds);

import { TBetItem } from '@/apis/commonSports/types';
import styles from './BetItem.module.scss';
import { useBettingData } from '@/common/hooks/bet/context/BettingDataContext';
import useBetMethods from '@/common/hooks/bet/useBetMethods';
import { memo, useCallback, useMemo } from 'react';
import clsx from 'clsx';
import { EOddsStatus } from '@/apis/commonSports/constants';
import { OddsChangeArrowSvg } from '@/sites/op7/components/SvgIcons';
import { bigNB } from '@/utils/bet/bigMath';
import { useGoMatchDetail } from '@/sites/op7/hooks/useGoMatchDetail';
interface BetItemProps {
  betItem: TBetItem;
  isFirstOne?: boolean;
}

const BetItem = ({ betItem, isFirstOne }: BetItemProps) => {
  const {
    venue,
    isParlay,
    showBetPanel,
    showOrdersPanel,
    syncSingleParlay,
    singleBetData,
    parlayBetData,
  } = useBettingData();
  const { removeBetItem, hideBetDrawer } = useBetMethods();
  const goMatchDetail = useGoMatchDetail();
  const canGoMatchDetail = showOrdersPanel && Number(betItem.matchId) > 0;

  const betItemClass = useMemo(() => {
    if (showBetPanel) {
      return isParlay ? styles.betItemParlayBetPanel : styles.betItemSingleBetPanel;
    } else if (showOrdersPanel) {
      return isParlay ? styles.betItemParlayOrderPanel : styles.betItemSingleOrderPanel;
    }
    return '';
  }, [isParlay, showBetPanel, showOrdersPanel]);

  const betItemClosed = useMemo(() => {
    return betItem.oddsStatus !== EOddsStatus.Open;
  }, [betItem.oddsStatus]);

  const handleDelete = useCallback(() => {
    const ids = isParlay ? parlayBetData.ids : singleBetData.ids;
    if (ids.length === 1 && ids[0] === betItem.betItemId) {
      hideBetDrawer();
    }
    removeBetItem({ venue, isParlay, betItemId: betItem.betItemId, syncSingleParlay });
  }, [
    betItem.betItemId,
    hideBetDrawer,
    isParlay,
    parlayBetData.ids,
    removeBetItem,
    singleBetData.ids,
    syncSingleParlay,
    venue,
  ]);

  return (
    <div
      className={clsx(
        styles.betItem,
        betItemClosed ? styles.betItemClosed : '',
        isFirstOne ? styles.topBlueBg : '',
        betItemClass,
        betItem.isChampion ? styles.championBetItem : '',
      )}
    >
      <div
        className={clsx(canGoMatchDetail && styles.matchDetailClickable)}
        onClick={
          canGoMatchDetail
            ? () => goMatchDetail(betItem.matchId, { isChampion: betItem.isChampion })
            : undefined
        }
        role={canGoMatchDetail ? 'button' : undefined}
        tabIndex={canGoMatchDetail ? 0 : undefined}
      >
        <div className={styles.header}>
          <div className={styles.playInfo}>
            <span className={styles.betType}>{betItem.playName}</span>
            <span className={styles.marketType}>[欧洲盘]</span>
          </div>
          <div
            className={clsx(
              styles.oddsInfo,
              !betItemClosed && showBetPanel ? styles[betItem.oddsChange ?? ''] : '',
            )}
          >
            <p className={clsx(styles.atSymbol, '-translate-y-1px')}>@</p>
            <div className={styles.oddValueContainer}>
              <span className={styles.oddValue}>{bigNB(betItem.baseOdds).toFixed(2)}</span>
              <OddsChangeArrowSvg className={clsx('w-8px h-10px', styles.oddsChangeArrow)} />
            </div>
          </div>
        </div>

        <div className={styles.infoRow}>
          <div className={styles.leagueName}>{betItem.leagueName}</div>

          <div className={styles.selectionInfo}>
            {!!betItem.score && <span className="mr-2px">({betItem.score.replace('-', ':')})</span>}
            <span>{betItem.betItemFullName}</span>
          </div>
        </div>

        <div className={styles.teamsRow}>
          <span>{betItem.homeName}</span>
          <span className={styles.vs}> VS </span>
          <span>{betItem.awayName}</span>
        </div>
      </div>

      {showBetPanel && (
        <div className={styles.footerRow}>
          {betItemClosed && <div className={clsx(styles.marketClose)}>盘口关闭</div>}
          <div className={clsx(styles.deleteBtn, betItemClosed ? styles.withMarketClose : '')}>
            <div className={styles.deleteBtnInner} onClick={handleDelete}>
              删除
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(BetItem);

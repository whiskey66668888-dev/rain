import type {
  MatchBaseInfo,
  TBetHistoryOrderItem,
  THistoryBetItem,
} from '@/apis/commonSports/types';
import { SETTLED_RESULT_CONFIG } from '../../../../constants';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { EBetSettleResult } from '@/apis/commonSports/constants';
import { useBetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';
import Timing from '@/common/components/Timing';
import { useMemo } from 'react';
import { LoadingIcon } from '@/sites/op7/components/SvgIcons';
import {
  canGoBetMatchDetail,
  getOrderDisplayOdds,
  getOrderOddsFormatLabel,
} from '@/utils/betHistory';

function LiveStageInfo({ match }: { match: MatchBaseInfo }) {
  const score = useMemo(() => {
    let score = '';
    if (match.sportName === '网球') {
      score = match.scoreAll?.[match.scoreAll?.length - 1] ?? '';
    } else {
      score = `${match.homeScore}-${match.awayScore}`;
    }
    return score;
  }, [match.awayScore, match.homeScore, match.scoreAll, match.sportName]);

  return (
    <span className="shrink-0 flex items-center gap-4px text-[var(--Text-800)]">
      <span>{match.periodName}</span>
      {match.matchTime !== 0 && (
        <Timing
          time={match.matchTime}
          running={match.isCountdown}
          isCountdown={match.clockType === 'DESC'}
        />
      )}
      {!!score && <span>{score}</span>}
    </span>
  );
}

const MatchDetail = ({
  order,
  detail,
  collapsed,
}: {
  order: TBetHistoryOrderItem;
  detail: THistoryBetItem;
  collapsed: boolean;
}) => {
  const { activeVenue, liveMatchMap, tryGoMatchDetail, checkingMatchId } = useBetHistoryContext();

  // #region 派生计算
  const canShowLive = !order.isSettledOrder && detail.isLive && !detail.isChampion;
  const liveMatch = canShowLive ? liveMatchMap[detail.matchId] : undefined;
  const canGoMatchDetail = canGoBetMatchDetail({ order, detail, venue: activeVenue });
  // #endregion

  const handleMatchDetailClick = () => {
    tryGoMatchDetail(detail);
  };

  const matchDetailBody = (
    <>
      {/* 串关 - 主客队 + 投注结果 */}
      {order.isParlayOrder && (
        <div className="flex items-center gap-16px">
          <p className="flex-1 _tf[14] leading-[1.43] font-medium text-[var(--Text-Main-10)] truncate">
            {detail.homeName} vs {detail.awayName}
          </p>
          {detail.orderSettleResult !== EBetSettleResult.NoResulted && (
            <p
              className="shrink-0 font-medium"
              style={{ color: SETTLED_RESULT_CONFIG[detail.orderSettleResult].color }}
            >
              {SETTLED_RESULT_CONFIG[detail.orderSettleResult].label}
            </p>
          )}
        </div>
      )}
      {/* 联赛名称和开赛时间 */}
      <div className="flex items-center justify-between _tf[13] leading-[1.38] text-[var(--Text-800)]">
        <p className="truncate">{detail.leagueName}</p>
        <p className="shrink-0 ml-8px">{dayjs(detail.matchStartTime).format('MM-DD HH:mm')}</p>
      </div>
      {/* 投注项 赔率 / 玩法 赛果/赛况 */}
      <div className="bg-[var(--Background-gradient-50)] px-10px py-8px flex flex-col gap-4px -mx-10px">
        <div className="flex gap-8px items-center justify-between">
          <p className="_tf[14] leading-[1.43] font-medium text-[var(--Text-Main-10)] truncate">
            {detail.betItemFullName}
          </p>
          <p
            className={clsx(
              'shrink-0 _tf[14] leading-[1.43] font-medium',
              !order.isParlayOrder ? 'text-[var(--ThemeColor-Main)]' : 'text-[var(--Text-Main-10)]',
            )}
          >
            @{getOrderDisplayOdds(detail.baseOdds, detail)}
          </p>
        </div>
        <div className="flex items-center justify-between _tf[12] leading-[1.33] text-[var(--Text-800)]">
          <p className="truncate">
            {detail.playName} {getOrderOddsFormatLabel(detail)}
            {detail.scoreWhileBetting && <span>[{detail.scoreWhileBetting}]</span>}
          </p>
          {order.isSettledOrder && <p>赛果 {detail.resultScore ?? '- -'}</p>}
          {(order.isUnsettledOrder || order.isPreBetOrder) && (
            <>
              {liveMatch ? (
                <LiveStageInfo match={liveMatch} />
              ) : (
                <p className="flex items-center gap-2px">
                  赛果&nbsp;
                  {checkingMatchId === detail.matchId ? (
                    <LoadingIcon className="animate-spin w-12px h-12px" />
                  ) : detail.resultScore ? (
                    detail.resultScore
                  ) : (
                    '- -'
                  )}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );

  if (collapsed) {
    return (
      <div
        className={clsx(
          'pt-10px pb-6px px-10px flex flex-col gap-2px _tf[12] leading-[1.43] text-[var(--Text-800)]',
          canGoMatchDetail && 'cursor-pointer',
        )}
        onClick={canGoMatchDetail ? handleMatchDetailClick : undefined}
        role={canGoMatchDetail ? 'button' : undefined}
        tabIndex={canGoMatchDetail ? 0 : undefined}
      >
        <p className="truncate">
          {detail.homeName} vs {detail.awayName}
        </p>
        <div className="flex items-center">
          <p className="truncate">{detail.betItemFullName}&nbsp;&nbsp;</p>
          <p>
            @<span className="din-pro">{getOrderDisplayOdds(detail.baseOdds, detail)}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'pt-10px pb-6px px-10px flex flex-col gap-2px',
        canGoMatchDetail && 'cursor-pointer',
      )}
      onClick={canGoMatchDetail ? handleMatchDetailClick : undefined}
      onKeyDown={
        canGoMatchDetail
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleMatchDetailClick();
              }
            }
          : undefined
      }
      role={canGoMatchDetail ? 'button' : undefined}
      tabIndex={canGoMatchDetail ? 0 : undefined}
    >
      {matchDetailBody}
    </div>
  );
};

export default MatchDetail;

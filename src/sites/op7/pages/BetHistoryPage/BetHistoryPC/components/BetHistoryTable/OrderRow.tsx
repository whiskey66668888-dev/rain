import { cn } from '@/utils';
import dayjs from 'dayjs';
import { Fragment, useMemo, useState } from 'react';
import { EBetSettleResult } from '@/apis/commonSports/constants';
import type {
  MatchBaseInfo,
  TBetHistoryOrderItem,
  THistoryBetItem,
} from '@/apis/commonSports/types';
import { SETTLED_RESULT_CONFIG } from '../../../BetHistoryH5/constants';
import { bigNB } from '@/utils/bet/bigMath';
import CopyButton from '@/sites/op7/components/CopyButton';
import { ArrowRightSvg, CopySvg, LoadingIcon } from '@/sites/op7/components/SvgIcons';
import { Icon } from '@/common/components/Icon';
import { useAppSelector } from '@/core/store/hooks';
import { openBetShare } from '@/sites/op7/pages/SportsDetailsPage/components/share/betShareStore';
import { EColTitle, type ColDef, PER_LEG_COL_SET } from './colDefs';
import { UnsettledStatusCell, SettledResultCell, ReserveStatusCell } from './StatusCells';
import { useBetHistoryContext } from '@/common/hooks/betHistory/context/BetHistoryContext';
import Timing from '@/common/components/Timing';
import clsx from 'clsx';
import { calcEarlySettleStats, getEarlySettleDetailItems } from '@/utils/betHistory';

const tdClass = 'px-12px py-12px align-middle';

const LiveStageInfo = ({ match }: { match: MatchBaseInfo }) => {
  const score = useMemo(() => {
    if (match.sportName === '网球') return match.scoreAll?.[match.scoreAll.length - 1] ?? '';
    return `${match.homeScore}-${match.awayScore}`;
  }, [match.sportName, match.scoreAll, match.homeScore, match.awayScore]);

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
      {!!score && <span>({score})</span>}
    </span>
  );
};

const MatchCell = ({ detail, order }: { detail: THistoryBetItem; order: TBetHistoryOrderItem }) => {
  const { liveMatchMap, tryGoMatchDetail, checkingMatchId } = useBetHistoryContext();
  const canShowLive = !order.isSettledOrder && detail.isLive && !detail.isChampion;
  const liveMatch = canShowLive ? liveMatchMap[detail.matchId] : undefined;
  const canGoMatchDetail =
    (order.isPreBetOrder || order.isUnsettledOrder) && Number(detail.matchId) > 0;
  const isChecking = checkingMatchId === detail.matchId;

  const handleMatchDetailClick = () => {
    tryGoMatchDetail(detail);
  };

  return (
    <div
      className={cn('flex flex-col gap-8px', canGoMatchDetail && 'cursor-pointer')}
      onClick={canGoMatchDetail ? handleMatchDetailClick : undefined}
      role={canGoMatchDetail ? 'button' : undefined}
      tabIndex={canGoMatchDetail ? 0 : undefined}
    >
      <span className="flex items-center gap-4px">
        {detail.leagueName}
        {isChecking && <LoadingIcon className="animate-spin w-12px h-12px" />}
      </span>
      {!detail.isChampion && <span>{`${detail.homeName} vs ${detail.awayName}`}</span>}
      {!!detail.matchStartTime && (
        <span className="text-[var(--Text-800)]">
          {dayjs(detail.matchStartTime).format('YYYY/MM/DD HH:mm')}
        </span>
      )}
      {liveMatch && <LiveStageInfo match={liveMatch} />}
    </div>
  );
};

const OrderIdCell = ({ order }: { order: TBetHistoryOrderItem }) => {
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const { activeVenue } = useBetHistoryContext();
  const time =
    order.isSettledOrder && order.orderSettleTime ? order.orderSettleTime : order.orderConfirmTime;
  return (
    <div className="flex flex-col gap-4px">
      <div className="flex items-center gap-4px">
        <span className="din-pro font-medium">{order.orderId}</span>
        <CopyButton text={order.orderId} className="flex items-center">
          <CopySvg className="w-12px h-12px" />
        </CopyButton>
        {isLogin && (
          <button
            type="button"
            aria-label="分享"
            className="flex items-center"
            onClick={() => openBetShare(order, activeVenue)}
          >
            <Icon
              src="/images/common/sportDetail/nav_share.png"
              size={12}
              color="var(--Text-800)"
            />
          </button>
        )}
      </div>
      <span className="din-pro font-medium">{dayjs(time).format('YYYY-MM-DD HH:mm:ss')}</span>
    </div>
  );
};

interface SpanOpts {
  hasPartialEarlySettle: boolean;
  remainingStake: number;
  remainingPayable: number;
}

const renderSpanContent = (
  col: ColDef,
  order: TBetHistoryOrderItem,
  rowIndex: number,
  opts: SpanOpts,
) => {
  switch (col.value) {
    case EColTitle.NO:
      return <span className="font-medium din-pro">{rowIndex + 1}</span>;
    case EColTitle.ORDER_INFO:
      return <OrderIdCell order={order} />;
    case EColTitle.BET_TYPE:
      return (
        <>
          <p>
            {order.isParlayOrder ? `串关 ${order.orderLabel}×${order.orderSum}` : order.orderLabel}
          </p>
          <p>欧洲盘</p>
        </>
      );
    case EColTitle.BET_AMOUNT:
      if (opts.hasPartialEarlySettle) {
        return (
          <div className="flex flex-col gap-2px">
            <span className="din-pro font-medium">{bigNB(opts.remainingStake).toFixed(2)}</span>
            <span className="din-pro text-[var(--Text-800)]">
              {bigNB(order.orderBetAmount).toFixed(2)}
            </span>
          </div>
        );
      }
      return <span className="din-pro font-medium">{bigNB(order.orderBetAmount).toFixed(2)}</span>;
    case EColTitle.MAX_WIN:
      return (
        <span className="din-pro font-medium">
          {bigNB(
            opts.hasPartialEarlySettle ? opts.remainingPayable : order.orderMaxWinAmount,
          ).toFixed(2)}
        </span>
      );
    case EColTitle.AMOUNT: {
      const amount = order.orderWinLossAmount ?? 0;
      const color = amount > 0 ? 'var(--Red-400)' : amount < 0 ? 'var(--Green-400)' : '';
      return (
        <span className="din-pro font-medium" style={{ color }}>
          {amount > 0 ? '+' : ''}
          {bigNB(amount).toFixed(2)}
        </span>
      );
    }
    case EColTitle.STATUS_UNSETTLED:
      return <UnsettledStatusCell order={order} />;
    case EColTitle.STATUS_SETTLED:
      return <SettledResultCell order={order} />;
    case EColTitle.STATUS_RESERVE:
      return <ReserveStatusCell order={order} />;
    default:
      return null;
  }
};

const renderPerLegContent = (col: ColDef, detail: THistoryBetItem, order: TBetHistoryOrderItem) => {
  switch (col.value) {
    case EColTitle.MATCH:
      return <MatchCell detail={detail} order={order} />;
    case EColTitle.BET_ITEM:
      return (
        <div className="flex flex-col gap-10px">
          <div className="font-medium">
            <span>{detail.playName}</span>
            {detail.scoreWhileBetting && <span>[{detail.scoreWhileBetting}]</span>}
          </div>
          <div>
            <span>{detail.betItemFullName}</span>

            <p className="inline ml-8px text-[var(--ThemeColor-Main)]">
              @<span className="din-pro font-medium">{bigNB(detail.baseOdds).toFixed(2)}</span>
            </p>
          </div>
        </div>
      );
    case EColTitle.RESULT: {
      const cfg =
        SETTLED_RESULT_CONFIG[detail.orderSettleResult] ??
        SETTLED_RESULT_CONFIG[EBetSettleResult.NoResulted];
      return (
        <div className="flex flex-col gap-8px">
          {detail.resultScore && <span className="din-pro font-medium">{detail.resultScore}</span>}
          {order.isParlayOrder && <span style={{ color: cfg.color }}>{cfg.label}</span>}
        </div>
      );
    }
    default:
      return null;
  }
};

export const OrderRow = ({
  order,
  rowIndex,
  cols,
  isOdd,
}: {
  order: TBetHistoryOrderItem;
  rowIndex: number;
  cols: ColDef[];
  isOdd: boolean;
}) => {
  const [showEarlySettleDetail, setShowEarlySettleDetail] = useState(true);
  const { earlySettleMaxCount } = useBetHistoryContext();

  const rowBg = isOdd ? 'bg-[var(--Background-500)]' : '';

  const earlyStats = calcEarlySettleStats(order, earlySettleMaxCount);
  const { hasPartialEarlySettle, remainingStake, remainingPayable } = earlyStats;

  const spanOpts: SpanOpts = { hasPartialEarlySettle, remainingStake, remainingPayable };

  const firstPerLegIdx = cols.findIndex((c) => PER_LEG_COL_SET.has(c.value));
  const beforeCols = cols.slice(0, firstPerLegIdx);
  const perLegCols = cols.filter((c) => PER_LEG_COL_SET.has(c.value));
  const afterCols = cols.filter((c, i) => !PER_LEG_COL_SET.has(c.value) && i > firstPerLegIdx);

  const details = order.orderDetails;
  const rowSpan = details.length || 1;

  const tdAlign = (col: ColDef) =>
    cn(tdClass, col.align === 'right' && 'text-right', col.align === 'center' && 'text-center');

  const spanTdBefore = (span: number) =>
    beforeCols.map((col) => (
      <td key={col.value} className={tdAlign(col)} rowSpan={span}>
        {renderSpanContent(col, order, rowIndex, spanOpts)}
      </td>
    ));

  const spanTdAfter = (span: number) =>
    afterCols.map((col) => (
      <td key={col.value} className={tdAlign(col)} rowSpan={span}>
        {renderSpanContent(col, order, rowIndex, spanOpts)}
      </td>
    ));

  const perLegTds = (detail: THistoryBetItem) =>
    perLegCols.map((col) => (
      <td key={col.value} className={tdAlign(col)}>
        {renderPerLegContent(col, detail, order)}
      </td>
    ));

  const detailItems = getEarlySettleDetailItems(order, earlyStats);

  const earlySettleDetailRows =
    earlyStats.history.length > 0 ? (
      <>
        <tr className={rowBg}>
          <td colSpan={cols.length} className="px-12px pt-0 pb-6px">
            <button
              type="button"
              className="flex items-center gap-4px text-[var(--Text-800)] hover:text-[var(--Text-Main-10)] transition-colors"
              onClick={() => setShowEarlySettleDetail((p) => !p)}
            >
              <span>提前结算详情</span>
              <ArrowRightSvg
                className={clsx(
                  'w-10px h-10px transition-transform duration-200',
                  showEarlySettleDetail ? 'rotate-[-90deg]' : 'rotate-90',
                )}
              />
            </button>
          </td>
        </tr>
        {showEarlySettleDetail && (
          <tr className={rowBg}>
            <td colSpan={cols.length} className="px-12px pt-0 pb-10px">
              <div className="flex gap-24px text-[var(--Text-800)]">
                {detailItems.map(({ label, value }) => (
                  <span key={label}>
                    • {label}:
                    <span className="din-pro font-medium text-[var(--Text-Main-10)] ml-4px">
                      {value}
                    </span>
                  </span>
                ))}
              </div>
            </td>
          </tr>
        )}
      </>
    ) : null;

  if (!order.isParlayOrder || details.length <= 1) {
    const detail = details[0];
    if (!detail) return null;
    return (
      <Fragment>
        <tr className={rowBg}>
          {spanTdBefore(1)}
          {perLegTds(detail)}
          {spanTdAfter(1)}
        </tr>
        {earlySettleDetailRows}
      </Fragment>
    );
  }

  return (
    <Fragment>
      {details.map((detail, i) => (
        <tr key={detail.betItemId + i} className={rowBg}>
          {i === 0 ? spanTdBefore(rowSpan) : null}
          {perLegTds(detail)}
          {i === 0 ? spanTdAfter(rowSpan) : null}
        </tr>
      ))}
      {earlySettleDetailRows}
    </Fragment>
  );
};

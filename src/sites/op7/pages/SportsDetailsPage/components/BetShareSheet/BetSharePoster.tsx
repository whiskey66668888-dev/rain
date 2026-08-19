import React from 'react';
import dayjs from 'dayjs';

import type { TBetHistoryOrderItem, THistoryBetItem } from '@/apis/commonSports/types';
import { EBetOrderStatus, EBetSettleResult } from '@/apis/commonSports/constants';
import { bigNB } from '@/utils/bet/bigMath';
import { BetConfirmingSvg, BetFailedSvg, BetSuccessSvg } from '@/sites/op7/components/SvgIcons';

import SharePosterUserRow from '../share/SharePosterUserRow';
import SharePosterInviteRow from '../share/SharePosterInviteRow';
import { getOrderDisplayOdds, getOrderOddsFormatLabel } from '@/utils/betHistory';

/**
 * 与 H5 注单列表 BetRecordCard 共用同一套主题变量，深色模式自动跟随
 * （对齐 emc _buildPoster 用 context.colors.*）。
 * html2canvas 读 getComputedStyle，var() 在此之前已由浏览器解析，可正常截图。
 */
const C = {
  main: 'var(--Text-Main-10)',
  sub: 'var(--Text-800)',
  text500: 'var(--Text-500)',
  theme: 'var(--ThemeColor-Main)',
  theme300: 'var(--ThemeColor-300)',
  line: 'var(--Line-100)',
  optionBg: 'var(--Background-gradient-50)',
  cardBg: 'var(--Background-300)',
  circle: 'var(--Circle-Image-Color)',
  green: 'var(--Green-300)',
  warning: 'var(--Warning-100)',
  warning200: 'var(--Warning-200)',
  red400: 'var(--Red-400)',
};

/** 圆点分隔/底部齿边（对齐 H5 --circle-image） */
const CIRCLE_IMAGE = `radial-gradient(circle, ${C.circle} 3.5px, ${C.cardBg} 3.5px)`;
const circleStrip = (offsetY: string): React.CSSProperties => ({
  backgroundImage: CIRCLE_IMAGE,
  backgroundSize: '10px 10px',
  backgroundRepeat: 'repeat-x',
  backgroundPosition: `center ${offsetY}`,
});

/** 已结算结果标签配色（对齐 SETTLED_RESULT_CONFIG） */
const SETTLED_STYLE: Record<EBetSettleResult, { label: string; color: string }> = {
  [EBetSettleResult.Won]: { label: '赢', color: C.red400 },
  [EBetSettleResult.WinReturn]: { label: '赢半', color: C.red400 },
  [EBetSettleResult.Lost]: { label: '输', color: C.text500 },
  [EBetSettleResult.LooseReturn]: { label: '输半', color: C.green },
  [EBetSettleResult.Return]: { label: '走水', color: C.warning200 },
  [EBetSettleResult.Cancel]: { label: '取消', color: C.text500 },
  [EBetSettleResult.BetFail]: { label: '投注失败', color: C.red400 },
  [EBetSettleResult.NoResulted]: { label: '未结算', color: C.theme300 },
  [EBetSettleResult.EarlySettled]: { label: '提前结算', color: C.theme300 },
};

/** 未结算状态（对齐 UNSETTLED_STATUS_CONFIG：图标着色、文案用次要色） */
const UNSETTLED_STYLE: Record<
  EBetOrderStatus,
  { label: string; color: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  [EBetOrderStatus.Success]: { label: '成功', color: C.green, Icon: BetSuccessSvg },
  [EBetOrderStatus.Confirming]: { label: '确认中', color: C.warning, Icon: BetConfirmingSvg },
  [EBetOrderStatus.Fail]: { label: '失败', color: C.red400, Icon: BetFailedSvg },
};

export interface BetSharePosterProps {
  posterRef: React.RefObject<HTMLDivElement>;
  order: TBetHistoryOrderItem;
  nickName: string;
  avatarSrc: string;
  timeText: string;
  hasInvite: boolean;
  inviteCode: string;
  inviteUrl: string;
}

const fmt = (v: unknown) => bigNB((v as number) || 0).toFixed(2);

/** 左侧主题色竖条（等价 LeftLine2x16Svg，避免依赖 currentColor 继承） */
const LeftBar: React.FC = () => (
  <svg width="2" height="16" viewBox="0 0 2 16" fill="none" className="shrink-0">
    <path
      d="M0 0L1.44721 0.723607C1.786 0.892999 2 1.23926 2 1.61803V14.382C2 14.7607 1.786 15.107 1.44721 15.2764L0 16V0Z"
      style={{ fill: C.theme }}
    />
  </svg>
);

/** 顶部右侧状态（未结算=图标+文案，已结算/预约=纯文案） */
const StatusTag: React.FC<{ order: TBetHistoryOrderItem }> = ({ order }) => {
  if (order.isUnsettledOrder) {
    const { label, color, Icon } = UNSETTLED_STYLE[order.orderStatus];
    return (
      <div className="flex shrink-0 items-center gap-4px">
        <span style={{ color }} className="flex">
          <Icon className="h-16px w-16px" />
        </span>
        <span className="text-[14px] leading-[1.43]" style={{ color: C.sub }}>
          {label}
        </span>
      </div>
    );
  }
  if (order.isSettledOrder) {
    const cfg =
      SETTLED_STYLE[order.orderSettleResult] ?? SETTLED_STYLE[EBetSettleResult.NoResulted];
    return (
      <span className="shrink-0 text-[14px] font-500 leading-[1.43]" style={{ color: cfg.color }}>
        {cfg.label}
      </span>
    );
  }
  if (order.isPreBetOrder) {
    const reserving = order.orderStatus === EBetOrderStatus.Confirming;
    return (
      <span
        className="shrink-0 text-[14px] leading-[1.43]"
        style={{ color: reserving ? C.theme : C.red400 }}
      >
        {reserving ? '预约中' : order.isManualCancel ? '取消' : '预约失败'}
      </span>
    );
  }
  return null;
};

/** 单腿明细（静态快照：无跳转、无实时计时，赛果取 resultScore） */
const Leg: React.FC<{ order: TBetHistoryOrderItem; detail: THistoryBetItem }> = ({
  order,
  detail,
}) => {
  const isParlay = !!order.isParlayOrder;
  const legSettled = isParlay && detail.orderSettleResult !== EBetSettleResult.NoResulted;

  return (
    <div className="flex flex-col gap-2px px-10px pb-6px pt-10px">
      {/* 串关：主客队 + 该腿结算结果 */}
      {isParlay && (
        <div className="flex items-center gap-16px">
          <p
            className="min-w-0 flex-1 truncate text-[14px] font-500 leading-[1.43]"
            style={{ color: C.main }}
          >
            {detail.isChampion ? '冠军' : `${detail.homeName} vs ${detail.awayName}`}
          </p>
          {legSettled && (
            <p
              className="shrink-0 font-500"
              style={{ color: SETTLED_STYLE[detail.orderSettleResult]?.color ?? C.main }}
            >
              {SETTLED_STYLE[detail.orderSettleResult]?.label}
            </p>
          )}
        </div>
      )}

      {/* 联赛名 + 开赛时间 */}
      <div
        className="flex items-center justify-between text-[13px] leading-[1.38]"
        style={{ color: C.sub }}
      >
        <p className="truncate">{detail.leagueName}</p>
        <p className="ml-8px shrink-0">{dayjs(detail.matchStartTime).format('MM-DD HH:mm')}</p>
      </div>

      {/* 投注项 + 赔率 / 玩法 + 赛果（通栏底色，对齐 H5 的 -mx-10px） */}
      <div
        className="-mx-10px flex flex-col gap-4px px-10px py-8px"
        style={{ background: C.optionBg }}
      >
        <div className="flex items-center justify-between gap-8px">
          <p
            className="min-w-0 truncate text-[14px] font-500 leading-[1.43]"
            style={{ color: C.main }}
          >
            {detail.betItemFullName}
          </p>
          <p
            className="shrink-0 text-[14px] font-500 leading-[1.43]"
            style={{ color: isParlay ? C.main : C.theme }}
          >
            @{getOrderDisplayOdds(detail.baseOdds, detail)}
          </p>
        </div>
        <div
          className="flex items-center justify-between text-[12px] leading-[1.33]"
          style={{ color: C.sub }}
        >
          <p className="min-w-0 truncate">
            {/* 注单下单时的盘口（欧洲盘/香港盘/…），未下发按欧洲盘兜底 */}
            {detail.playName} {getOrderOddsFormatLabel(detail)}
            {detail.scoreWhileBetting ? <span>[{detail.scoreWhileBetting}]</span> : null}
          </p>
          <p className="ml-8px shrink-0">赛果 {detail.resultScore || '- -'}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * 注单分享海报卡（只读快照）：结构对齐 H5 注单列表 BetRecordCard，
 * 去掉分享/折叠/复制单号/提前结算等交互，串关强制展开所有腿。
 */
const BetSharePoster: React.FC<BetSharePosterProps> = ({
  posterRef,
  order,
  nickName,
  avatarSrc,
  timeText,
  hasInvite,
  inviteCode,
  inviteUrl,
}) => {
  const first = order.orderDetails[0];
  const isParlay = !!order.isParlayOrder;

  const payableLabel = order.isPreBetOrder ? '预约返还' : order.isSettledOrder ? '返还' : '可返还';
  const payableAmount = order.isSettledOrder
    ? bigNB(order.orderSettledBackAmount)
        .plus(order.earlySettleTotalPayout ?? 0)
        .toString()
    : order.orderMaxWinAmount;

  return (
    <div ref={posterRef} className="rounded-[10px] bg-[var(--Background-500)] p-12px">
      <SharePosterUserRow nickName={nickName} avatarSrc={avatarSrc} timeText={timeText} />

      <div
        className="mt-8px rounded-t-6px"
        style={{ background: C.cardBg, boxShadow: '0 1px 4px 0 var(--Shadow-300)' }}
      >
        {/* 头部：左竖条 + 标题 + 串关信息 + 状态 */}
        <div
          className="flex items-center gap-8px py-8px pr-10px"
          style={{ boxShadow: `0 -0.5px 0 0 ${C.line} inset` }}
        >
          <div className="flex min-w-0 flex-1 items-center gap-8px overflow-hidden">
            <LeftBar />
            <p className="truncate text-[14px] font-600 leading-[1.43]" style={{ color: C.main }}>
              {isParlay
                ? '串关投注'
                : first?.isChampion
                  ? '冠军'
                  : `${first?.homeName} vs ${first?.awayName}`}
            </p>
            {isParlay && (
              <>
                <p className="shrink-0 text-[12px]" style={{ color: C.sub }}>
                  {order.orderLabel}*{order.orderSum}
                </p>
                <p className="shrink-0 text-[16px]" style={{ color: C.theme }}>
                  @{getOrderDisplayOdds(order.orderOdds, order)}
                </p>
              </>
            )}
          </div>
          <StatusTag order={order} />
        </div>

        {/* 明细腿（串关腿间圆点分隔） */}
        {order.orderDetails.map((detail, i) => (
          <React.Fragment key={detail.betItemId + i}>
            <Leg order={order} detail={detail} />
            {isParlay && i < order.orderDetails.length - 1 && (
              <div className="mx-4px h-17px" style={circleStrip('8px')} />
            )}
          </React.Fragment>
        ))}

        {/* 金额 */}
        <div
          className="flex items-center justify-between p-10px"
          style={{ boxShadow: `0 -0.5px 0 0 ${C.line} inset` }}
        >
          <p className="text-[14px] font-500 leading-[1.43]" style={{ color: C.main }}>
            本金: <span>{fmt(order.orderBetAmount)}</span>
          </p>
          <p className="text-[14px] leading-[1.43]">
            <span style={{ color: C.sub }}>{payableLabel}：</span>
            <span className="font-500" style={{ color: C.theme }}>
              {fmt(payableAmount)}
            </span>
          </p>
        </div>

        {/* 确认时间 + 单号（去掉复制按钮） */}
        <div className="px-10px pb-6px pt-10px text-[12px] leading-[1.33]" style={{ color: C.sub }}>
          <p>
            确认: <span>{dayjs(order.orderConfirmTime).format('MM-DD HH:mm:ss')}</span>
          </p>
          <p>
            单号: <span>{order.orderId}</span>
          </p>
        </div>

        {/* 底部齿边 */}
        <div className="h-5px w-full" style={circleStrip('1px')} />
      </div>

      {hasInvite && <SharePosterInviteRow inviteCode={inviteCode} inviteUrl={inviteUrl} />}
    </div>
  );
};

export default BetSharePoster;

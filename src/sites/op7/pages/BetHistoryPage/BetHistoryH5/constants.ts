import { EBetOrderStatus, EBetSettleResult } from '@/apis/commonSports/constants';
import { BetSuccessSvg, BetConfirmingSvg, BetFailedSvg } from '@/sites/op7/components/SvgIcons';
import settledWinSvg from '@/sites/op7/images/common/betHistory/settled_win.svg';
import settledLoseSvg from '@/sites/op7/images/common/betHistory/settled_lose.svg';
import settledDrawSvg from '@/sites/op7/images/common/betHistory/settled_draw.svg';
import settledWinHalfSvg from '@/sites/op7/images/common/betHistory/settled_win_half.svg';
import settledLoseHalfSvg from '@/sites/op7/images/common/betHistory/settled_lose_half.svg';
import settledCancelSvg from '@/sites/op7/images/common/betHistory/settled_cancel.svg';
import settledUnsettledSvg from '@/sites/op7/images/common/betHistory/settled_unsettled.svg';
import settledBetFailSvg from '@/sites/op7/images/common/betHistory/settled_bet_fail.svg';
import settledEarlySvg from '@/sites/op7/images/common/betHistory/settled_early.svg';

export { settledUnsettledSvg };

/** 未结算订单状态 → icon + label */
export const UNSETTLED_STATUS_CONFIG: Record<
  EBetOrderStatus,
  {
    label: string;
    iconColor: string;
    iconColorH5?: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  [EBetOrderStatus.Success]: {
    label: '成功',
    iconColor: 'text-[var(--Green-300)]',
    icon: BetSuccessSvg,
  },
  [EBetOrderStatus.Confirming]: {
    label: '确认中',
    iconColor: 'text-[var(--ThemeColor-Main)]',
    iconColorH5: 'text-[var(--Warning-100)]',
    icon: BetConfirmingSvg,
  },
  [EBetOrderStatus.Fail]: {
    label: '失败',
    iconColor: 'text-[var(--Red-300)]',
    icon: BetFailedSvg,
  },
};

/** 已结算结果 → 结算图标 */
export const SETTLED_RESULT_CONFIG: Record<
  EBetSettleResult,
  { color: string; label: string; icon: string }
> = {
  [EBetSettleResult.Won]: { color: 'var(--Red-400)', label: '赢', icon: settledWinSvg },
  [EBetSettleResult.WinReturn]: { color: 'var(--Red-400)', label: '赢半', icon: settledWinHalfSvg },
  [EBetSettleResult.Lost]: { color: 'var(--Text-500)', label: '输', icon: settledLoseSvg },
  [EBetSettleResult.LooseReturn]: {
    color: 'var(--Green-300)',
    label: '输半',
    icon: settledLoseHalfSvg,
  },
  [EBetSettleResult.Return]: { color: 'var(--Warning-200)', label: '走水', icon: settledDrawSvg },
  [EBetSettleResult.Cancel]: { color: 'var(--Text-500)', label: '取消', icon: settledCancelSvg },
  [EBetSettleResult.BetFail]: {
    color: 'var(--Red-400)',
    label: '投注失败',
    icon: settledBetFailSvg,
  },
  [EBetSettleResult.NoResulted]: {
    color: 'var(--ThemeColor-300)',
    label: '未结算',
    icon: settledUnsettledSvg,
  },
  [EBetSettleResult.EarlySettled]: {
    color: 'var(--ThemeColor-300)',
    label: '提前结算',
    icon: settledEarlySvg,
  },
};

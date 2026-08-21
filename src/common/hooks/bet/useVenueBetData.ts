import { useMemo } from 'react';
import {
  EAcceptOddsPrefer,
  EBetOrderStatus,
  EBetStep,
  EBetType,
  EOddsStatus,
  EVenue,
} from '@/apis/commonSports/constants';
import type { TBetItem, TBetOrderItem, TParlayItem } from '@/apis/commonSports/types';
import { useAppSelector } from '@/core/store/hooks';
import {
  selectAllSingleBetItems,
  selectSingleBetItemById,
  selectVenueBetState,
} from '@/core/store/selectors/betSelectors';
import type { TVenueBetState } from '@/core/store/slices/betSlice';
import { selectSportVenue, selectSyncSingleParlay } from '@/core/store/selectors/sportSelectors';
import { selectAcceptOddsPrefer, selectVenueBalance } from '@/core/store/selectors/userSelectors';
import bigMath, { bigNB } from '@/utils/bet/bigMath';
import _ from 'lodash';

export type TUseVenueBetData = TVenueBetState & {
  allBetItemIds: string[];
  venue: EVenue;
  acceptOddsPrefer: EAcceptOddsPrefer;
  isParlay: boolean;
  currParlayBetItem: TParlayItem | undefined;
  currSingleId: string;
  currSingleBetItem: TBetItem | undefined;
  totalBalance: string;
  currStep: {
    normal: boolean;
    fetching: boolean;
    polling: boolean;
    confirmed: boolean;
  };
  floatingBetCount: number;
  showBetPanel: boolean;
  showOrdersPanel: boolean;
  preBetItem: TBetItem | undefined;
  totalBetAmount: string;
  totalCanWinAmount: string;
  betBtnDisabled: boolean;
  totalBetAmountH5: string;
  totalCanWinAmountH5: string;
  betBtnDisabledH5: boolean;
  totalOrdersStatus: {
    text: string;
    status: EBetOrderStatus;
    statusColor: string;
  };
  onlyOneSingleBetItem: TBetItem | undefined;
  syncSingleParlay: boolean;
  currPreBetOrder: TBetOrderItem | undefined;
};

export function useVenueBetData(): TUseVenueBetData {
  const venue = useAppSelector(selectSportVenue);
  const syncSingleParlay = useAppSelector(selectSyncSingleParlay);
  const venueBetStore = useAppSelector(selectVenueBetState);
  const totalBalance = useAppSelector(selectVenueBalance);
  const acceptOddsPrefer = useAppSelector(selectAcceptOddsPrefer);

  const isParlay = useMemo(
    () => venueBetStore.betType === EBetType.Parlay,
    [venueBetStore.betType],
  );

  const allBetItemIds = useMemo(
    () => [...venueBetStore.singleBetData.ids, ...venueBetStore.parlayBetData.ids],
    [venueBetStore.singleBetData.ids, venueBetStore.parlayBetData.ids],
  );

  const floatingBetCount = useMemo(() => {
    return isParlay
      ? venueBetStore.parlayBetData.ids.length
      : venueBetStore.singleBetData.ids.length;
    // return Math.max(venueBetStore.singleBetData.ids.length, venueBetStore.parlayBetData.ids.length);
  }, [venueBetStore.singleBetData.ids.length, venueBetStore.parlayBetData.ids.length, isParlay]);

  const currParlayBetItem = useMemo(
    () => venueBetStore.parlayList.find((i) => i.parlayCode === venueBetStore.parlayFocusId),
    [venueBetStore.parlayList, venueBetStore.parlayFocusId],
  );

  const currSingleId = useMemo(() => {
    return venueBetStore.singleBetData.ids[venueBetStore.singleIndex] ?? '';
  }, [venueBetStore.singleBetData.ids, venueBetStore.singleIndex]);

  const currSingleBetItem = useMemo((): TBetItem | undefined => {
    return selectSingleBetItemById(venueBetStore.singleBetData, currSingleId);
  }, [venueBetStore.singleBetData, currSingleId]);

  const currStep = useMemo(() => {
    return {
      /** 普通状态 */
      normal: venueBetStore.betStep === EBetStep.Normal,
      /** 下注接口及下注前置接口请求中 */
      fetching: venueBetStore.betStep === EBetStep.Fetching,
      /** 下注接口请求完成，开始轮询下注结果 */
      polling: venueBetStore.betStep === EBetStep.Polling,
      /** 轮询下注结果，所有注单结果确认 */
      confirmed: venueBetStore.betStep === EBetStep.Confirmed,
    };
  }, [venueBetStore.betStep]);

  const showBetPanel = useMemo(
    () => currStep.normal || currStep.fetching,
    [currStep.normal, currStep.fetching],
  );

  const showOrdersPanel = useMemo(
    () => currStep.polling || currStep.confirmed,
    [currStep.polling, currStep.confirmed],
  );

  const preBetItem = useMemo((): TBetItem | undefined => {
    if (isParlay) {
      return undefined;
    }
    let _preBetItem: TBetItem | undefined = _.find(
      venueBetStore.singleBetData.entities,
      (item) => !!item.preBetInfo?.preBetEnabled,
    );
    if (venue === EVenue.FB && _preBetItem && _preBetItem?.preBetInfo) {
      const fbPreBetLimit = _.find(
        venueBetStore.fbPreBetLimitMap,
        (_item, key) => _preBetItem?.betItemId === key || _.includes(_preBetItem?.relatedIds, key),
      );
      if (fbPreBetLimit) {
        // FB体育提供预约投注功能，此接口提供预约下单时对应玩法的投注限额控制范围，预约最大本金控制在接口返回的限额范围内；计算方式为：先计算mly/(欧赔-1)，判断计算出的值是否> mly ，如果是，则取mly，否则取计算出的值。最后再将此值与mms相比取小值(如mms无值则取mly判断出的逻辑值即可)。
        // 计算出来的预约金额可按照这个规则美化： 大于0小于50，保留整数 大于等于50小于1000，保留十位数整数 大于等于1000小于10000，向下取整保留百位数 大于等于10000向下取整保留千位数

        // 计算最大可投注金额；preBetOdds 为 1 时分母为 0，用 0 作为 calcMax 避免除零，后续会与 mis 取 max
        const oddsMinusOne = bigNB(_preBetItem.preBetInfo.preBetOdds).minus(1);
        const calcMax = oddsMinusOne.lte(0)
          ? 0
          : +bigNB(fbPreBetLimit.mly).div(oddsMinusOne).toFixed(2);

        // 计算最大可投注金额，取最小值
        const _maxAmount = Math.min(
          calcMax,
          fbPreBetLimit.mly,
          fbPreBetLimit.mms || fbPreBetLimit.mly,
        );

        // 计算最大可投注金额，取最大值
        const maxAmount = Math.max(_maxAmount, fbPreBetLimit.mis);

        _preBetItem = {
          ..._preBetItem,
          preBetInfo: {
            ..._preBetItem.preBetInfo,
            preBetMaxAmount: maxAmount,
            preBetMinAmount: fbPreBetLimit.mis,
          },
        };
      }
    }

    if (venue === EVenue.OB && _preBetItem && _preBetItem.preBetInfo) {
      const obPreBetLimit = venueBetStore.obPreBetLimit;
      // 限额是跟着投注项走的，切换投注项后旧限额作废
      if (obPreBetLimit && obPreBetLimit.betItemId === _preBetItem.betItemId) {
        // 对齐 Flutter：接口的 orderMaxPay 是最大可赢金额，最大本金 = orderMaxPay / 预约赔率，向下取整
        const preBetOdds = bigNB(_preBetItem.preBetInfo.preBetOdds);
        const maxAmount = preBetOdds.lte(1)
          ? Math.floor(obPreBetLimit.orderMaxPay)
          : Math.floor(+bigNB(obPreBetLimit.orderMaxPay).div(preBetOdds).toFixed(2));

        _preBetItem = {
          ..._preBetItem,
          preBetInfo: {
            ..._preBetItem.preBetInfo,
            preBetMaxAmount: Math.max(maxAmount, 0),
            preBetMinAmount: obPreBetLimit.minBet,
          },
        };
      }
    }
    return _preBetItem;
  }, [
    isParlay,
    venueBetStore.singleBetData.entities,
    venueBetStore.fbPreBetLimitMap,
    venueBetStore.obPreBetLimit,
    venue,
  ]);

  const [
    totalBetAmount,
    totalCanWinAmount,
    betBtnDisabled,
    totalBetAmountH5,
    totalCanWinAmountH5,
    betBtnDisabledH5,
  ] = useMemo(() => {
    let _totalBetAmount = bigNB(0);
    let _totalCanWinAmount = bigNB(0);
    let hasInvalidInput = false;
    let hasInput = false;

    if (isParlay) {
      for (const item of venueBetStore.parlayList) {
        if (+item.betAmount > 0) {
          hasInput = true;
          _totalBetAmount = _totalBetAmount.add(bigMath.multiply(item.betAmount, item.parlaySum));
          _totalCanWinAmount = _totalCanWinAmount.add(
            bigMath.multiply(item.betAmount, item.parlayOdds),
          );
          if (bigNB(item.betAmount).lt(item.minBet) || bigNB(item.betAmount).gt(item.maxBet)) {
            hasInvalidInput = true;
          }
        }
      }
    } else if (preBetItem?.preBetInfo?.preBetEnabled) {
      _totalBetAmount = bigNB(preBetItem?.betAmount || 0);
      _totalCanWinAmount = bigNB(preBetItem?.preBetInfo?.preBetOdds || 0).times(
        preBetItem?.betAmount || 0,
      );

      hasInput = !!preBetItem.betAmount;
      hasInvalidInput =
        bigNB(preBetItem.betAmount).lt(preBetItem?.preBetInfo?.preBetMinAmount || 0) ||
        bigNB(preBetItem.betAmount).gt(preBetItem?.preBetInfo?.preBetMaxAmount || 0);
    } else {
      const singleItems: TBetItem[] = selectAllSingleBetItems(venueBetStore.singleBetData);
      for (const item of singleItems) {
        if (item.oddsStatus === EOddsStatus.Open && +item.betAmount > 0) {
          hasInput = true;
          _totalBetAmount = _totalBetAmount.add(item.betAmount || 0);
          _totalCanWinAmount = _totalCanWinAmount.add(
            bigMath.multiply(item.betAmount || 0, item.baseOdds || 0),
          );
          if (bigNB(item.betAmount).lt(item.minBet) || bigNB(item.betAmount).gt(item.maxBet)) {
            hasInvalidInput = true;
          }
        }
      }
    }

    // H5 单关：只计算 swiper 当前激活项（currSingleBetItem），串关和预约与通用逻辑相同
    let _totalBetAmountH5 = _totalBetAmount;
    let _totalCanWinAmountH5 = _totalCanWinAmount;
    let hasInvalidInputH5 = hasInvalidInput;

    let hasInputH5 = hasInput;

    if (!isParlay && !preBetItem?.preBetInfo?.preBetEnabled) {
      _totalBetAmountH5 = bigNB(0);
      _totalCanWinAmountH5 = bigNB(0);
      hasInvalidInputH5 = false;
      hasInputH5 = false;
      if (
        currSingleBetItem &&
        currSingleBetItem.oddsStatus === EOddsStatus.Open &&
        +currSingleBetItem.betAmount > 0
      ) {
        hasInputH5 = true;
        _totalBetAmountH5 = bigNB(currSingleBetItem.betAmount || 0);
        _totalCanWinAmountH5 = bigNB(
          bigMath.multiply(currSingleBetItem.betAmount || 0, currSingleBetItem.baseOdds || 0),
        );
        if (
          bigNB(currSingleBetItem.betAmount).lt(currSingleBetItem.minBet) ||
          bigNB(currSingleBetItem.betAmount).gt(currSingleBetItem.maxBet)
        ) {
          hasInvalidInputH5 = true;
        }
      }
    }

    return [
      _totalBetAmount.toFixed(2),
      _totalCanWinAmount.toFixed(2),
      !hasInput || hasInvalidInput,
      _totalBetAmountH5.toFixed(2),
      _totalCanWinAmountH5.toFixed(2),
      !hasInputH5 || hasInvalidInputH5,
    ];
  }, [
    isParlay,
    preBetItem,
    venueBetStore.parlayList,
    venueBetStore.singleBetData,
    currSingleBetItem,
  ]);

  const currPreBetOrder = useMemo(
    () => (venueBetStore.betOrders[0]?.isPreBetOrder ? venueBetStore.betOrders[0] : undefined),
    [venueBetStore.betOrders],
  );

  const totalOrdersStatus = useMemo(() => {
    let text = ' ';
    let status = EBetOrderStatus.Fail;
    let statusColor = '';
    if (venueBetStore.betOrders.some((i) => i.orderStatus === EBetOrderStatus.Confirming)) {
      text = '投注确认中';
      status = EBetOrderStatus.Confirming;
      statusColor = 'var(--Warning-100)';
    } else if (venueBetStore.betOrders.every((i) => i.orderStatus === EBetOrderStatus.Success)) {
      text = '投注成功';
      status = EBetOrderStatus.Success;
      statusColor = 'var(--Green-300)';
    } else if (venueBetStore.betOrders.every((i) => i.orderStatus === EBetOrderStatus.Fail)) {
      text = '投注失败';
      status = EBetOrderStatus.Fail;
      statusColor = 'var(--Red-300)';
    } else if (venueBetStore.betOrders.some((i) => i.orderStatus === EBetOrderStatus.Fail)) {
      text = '部分投注成功';
      status = EBetOrderStatus.Success;
      statusColor = 'var(--Green-300)';
    }
    return { text, status, statusColor };
  }, [venueBetStore.betOrders]);

  /** 单关模式，并且只存在一个投注项 */
  const onlyOneSingleBetItem: TBetItem | undefined = useMemo((): TBetItem | undefined => {
    return !isParlay && venueBetStore.singleBetData.ids.length === 1
      ? selectSingleBetItemById(venueBetStore.singleBetData, venueBetStore.singleBetData.ids[0]!)
      : undefined;
  }, [isParlay, venueBetStore.singleBetData]);

  return {
    ...venueBetStore,
    allBetItemIds,
    venue,
    acceptOddsPrefer,
    isParlay,
    currParlayBetItem,
    currSingleId,
    currSingleBetItem,
    totalBalance,
    currStep,
    floatingBetCount,
    showBetPanel,
    showOrdersPanel,
    preBetItem,
    totalBetAmount,
    totalCanWinAmount,
    betBtnDisabled,
    totalBetAmountH5,
    totalCanWinAmountH5,
    betBtnDisabledH5,
    totalOrdersStatus,
    onlyOneSingleBetItem,
    syncSingleParlay,
    currPreBetOrder,
  };
}

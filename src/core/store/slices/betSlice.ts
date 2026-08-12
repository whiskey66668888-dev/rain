import { createEntityAdapter, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit';

import { EBetOrderStatus, EBetStep, EBetType, EVenue } from '@/apis/commonSports/constants';
import {
  TBetOrderItem,
  TBetResultTip,
  TParlayItem,
  TBetItem,
  TbetData,
  TFbPreBetLimitMap,
} from '@/apis/commonSports/types';
import { BET_DATA_KEY } from '@/utils/constants/cacheKey';

// 创建单关投注项 EntityAdapter
const singleBetAdapter = createEntityAdapter<TBetItem, string>({
  selectId: (betItem) => betItem.betItemId,
  // sortComparer: (a, b) => {
  //   // 按某个字段排序，例如添加时间升序
  //   return a.matchStartTime - b.matchStartTime;
  // },
});

// 创建串关投注项 EntityAdapter
const parlayBetAdapter = createEntityAdapter<TBetItem, string>({
  selectId: (betItem) => betItem.betItemId,
});

/**
 * 投注 State
 */
export type TVenueBetState = {
  /** 单关 or 串关 */
  betType: EBetType;
  /** 当前下注步骤 */
  betStep: EBetStep;
  /** 是否展示投注抽屉（H5=底部抽屉，PC=右侧抽屉） */
  showBetDrawer: boolean;
  /** 聊天跟单会话：隐藏串关 tab（对齐 Flutter isChatBet） */
  isChatBet: boolean;
  /** 单关投注数据 */
  singleBetData: EntityState<TBetItem, string>;
  /** 串关投注数据 */
  parlayBetData: EntityState<TBetItem, string>;
  /** 串关投注列表 */
  parlayList: TParlayItem[];
  /** 默认金额, 为空表示不开启默认金额功能 */
  defaultAmount: string;
  /** h5单关选中投注项index */
  singleIndex: number;
  /** PC 单关多项投注，输入框金额 */
  singleBatchAmount: string;
  /** 单关当前输入框聚焦id */
  singleFocusId: string;
  /** 串关当前输入框聚焦id */
  parlayFocusId: string;
  /** 串关是否展示键盘 */
  parlayShowKeyboard: boolean;
  /** 单/串 展示快捷金额input框id */
  quickAmountInputId: string;
  /** 下注后订单列表（本次投注结果） */
  betOrders: TBetOrderItem[];
  /** 确认中的订单列表，与 betOrders 区分；每次投注完成后，结果中状态为确认中的会追加到此队列 */
  confirmingOrders: TBetOrderItem[];
  queryCount: number;
  betResultTips: TBetResultTip[];
  /** 展开的订单id列表 */
  expandedOrderIds: string[];
  /** fb 预约投注限额配置 */
  fbPreBetLimitMap: TFbPreBetLimitMap;
};

export type TBetStore = Record<EVenue, TVenueBetState>;

/** 场馆状态中需要持久化到 localStorage 的 key，只改此处即可增删缓存字段 */
const VENUE_PERSIST_KEYS = [
  // 'showBetDrawer',
  // 'betType',
  'defaultAmount',
  // 'singleBetData',
  // 'parlayBetData',
] as const satisfies ReadonlyArray<keyof TVenueBetState>;

type TStorageVenueBetState = Pick<TVenueBetState, (typeof VENUE_PERSIST_KEYS)[number]>;

/** 持久化字段的默认值（单场馆），仅此一处维护，避免与 venueInitialState 重复 */
const defaultStorageVenueState: TStorageVenueBetState = {
  // showBetDrawer: false,
  // betType: EBetType.Single,
  // singleBetData: singleBetAdapter.getInitialState(),
  // parlayBetData: parlayBetAdapter.getInitialState(),
  defaultAmount: '',
};

const venueInitialState: TVenueBetState = {
  ...defaultStorageVenueState,
  betType: EBetType.Single,
  showBetDrawer: false,
  isChatBet: false,
  singleBetData: singleBetAdapter.getInitialState(),
  parlayBetData: parlayBetAdapter.getInitialState(),
  betStep: EBetStep.Normal,
  parlayList: [],
  singleIndex: 0,
  singleBatchAmount: '',
  singleFocusId: '',
  parlayFocusId: '',
  parlayShowKeyboard: false,
  quickAmountInputId: '',
  betOrders: [],
  confirmingOrders: [],
  queryCount: 0,
  betResultTips: [],
  expandedOrderIds: [],
  fbPreBetLimitMap: {},
};

type TStorageBetStore = Record<EVenue, TStorageVenueBetState>;

const defaultStorageBetStore: TStorageBetStore = {
  [EVenue.OB]: defaultStorageVenueState,
  [EVenue.FB]: defaultStorageVenueState,
};

/** 从 localStorage 读取已持久化的投注状态，SSR 或解析失败时返回默认值 */
const getStorageBetStore = (): TStorageBetStore => {
  try {
    const raw = localStorage.getItem(BET_DATA_KEY);
    return raw ? (JSON.parse(raw) as TStorageBetStore) : defaultStorageBetStore;
  } catch {
    return defaultStorageBetStore;
  }
};

const storageBetStore = getStorageBetStore();

const initialState: TBetStore = {
  [EVenue.OB]: { ...venueInitialState, ...storageBetStore[EVenue.OB] },
  [EVenue.FB]: { ...venueInitialState, ...storageBetStore[EVenue.FB] },
};

export const persistBetState = _.debounce((state: TBetStore) => {
  if (typeof localStorage === 'undefined') return;
  const saveData: TStorageBetStore = _.mapValues(state, (venueState) => {
    return _.pick(venueState, VENUE_PERSIST_KEYS);
  });
  localStorage.setItem(BET_DATA_KEY, JSON.stringify(saveData));
}, 300);

const betSlice = createSlice({
  name: 'bet',
  initialState,
  reducers: {
    // #region 设置下注步骤
    /** 设置下注步骤 */
    setBetStep: (state, action: PayloadAction<{ venue: EVenue; betStep: EBetStep }>) => {
      const { venue, betStep } = action.payload;
      state[venue].betStep = betStep;
    },
    // #endregion

    // #region 切换投注类型
    /** 切换投注类型 */
    setBetType: (state, action: PayloadAction<{ venue: EVenue; betType: EBetType }>) => {
      const { venue, betType } = action.payload;
      state[venue].betType = betType;
    },
    // #endregion

    // #region 聊天跟单会话
    /** 设置聊天跟单会话（隐藏串关 tab） */
    setIsChatBet: (state, action: PayloadAction<{ venue: EVenue; isChatBet: boolean }>) => {
      const { venue, isChatBet } = action.payload;
      state[venue].isChatBet = isChatBet;
    },
    // #endregion

    // #region 单关添加投注项
    /** 单关添加投注项 */
    addToSingle: (state, action: PayloadAction<{ venue: EVenue; betItem: TBetItem }>) => {
      const { venue, betItem } = action.payload;
      const data = state[venue];
      if (data.singleBetData.ids.includes(betItem.betItemId)) return;
      singleBetAdapter.addOne(data.singleBetData, betItem);
      data.singleIndex = data.singleBetData.ids.length - 1;
      data.singleBatchAmount = '';
    },
    // #endregion

    // #region 单关移除投注项
    /** 单关移除投注项 */
    removeFromSingle: (
      state,
      action: PayloadAction<{ venue: EVenue; betItemId: string; syncSingleParlay: boolean }>,
    ) => {
      const { venue, betItemId, syncSingleParlay } = action.payload;
      const data = state[venue];
      if (data.singleBetData.entities[betItemId]) {
        singleBetAdapter.removeOne(data.singleBetData, betItemId);
        data.singleIndex = data.singleBetData.ids.length - 1;
      }
      if (syncSingleParlay && data.parlayBetData.entities[betItemId]) {
        parlayBetAdapter.removeOne(data.parlayBetData, betItemId);
        data.parlayList = [];
      }
    },
    /** 单关批量移除投注项 */
    removeMultipleFromSingle: (
      state,
      action: PayloadAction<{ venue: EVenue; betItemIds: string[] }>,
    ) => {
      const { venue, betItemIds } = action.payload;
      const data = state[venue];
      singleBetAdapter.removeMany(data.singleBetData, betItemIds);
      data.singleIndex = data.singleBetData.ids.length - 1;
    },
    // #endregion

    // #region 单关修改投注项
    /** 单关修改投注项 */
    updateSingle: (state, action: PayloadAction<{ venue: EVenue; betItem: TBetItem }>) => {
      const { venue, betItem } = action.payload;
      const data = state[venue];
      if (data.singleBetData.ids.includes(betItem.betItemId)) {
        singleBetAdapter.updateOne(data.singleBetData, {
          id: betItem.betItemId,
          changes: betItem,
        });
      }
    },
    // #endregion

    // #region 修改单关投注金额
    /** 修改单关投注金额 */
    setSingleBetAmount: (
      state,
      action: PayloadAction<{ venue: EVenue; betItemId: string; betAmount: string }>,
    ) => {
      const { venue, betItemId, betAmount } = action.payload;
      const data = state[venue];
      if (!data.singleBetData.ids.includes(betItemId)) return;
      singleBetAdapter.updateOne(data.singleBetData, {
        id: betItemId,
        changes: { betAmount },
      });
      data.singleBatchAmount = '';
    },
    // #endregion

    // #region 批量修改单关投注金额
    /** 批量修改单关投注金额 */
    // batchSetSingleBetAmount: (
    //   state,
    //   action: PayloadAction<{ venue: EVenue; betAmount: string }>,
    // ) => {
    //   const { venue, betAmount } = action.payload;
    //   const data = state[venue];
    //   singleBetAdapter.updateMany(
    //     data.singleBetData,
    //     data.singleBetData.ids.map((id) => ({
    //       id,
    //       changes: { betAmount },
    //     })),
    //   );
    //   data.singleBetData.entities = _.mapValues(data.singleBetData.entities, (entity) => ({
    //     ...entity,
    //     betAmount,
    //   }));
    // },
    // #endregion

    // #region 修改单关多项投注金额
    /** 修改单关多项投注金额 */
    setSingleBatchAmount: (
      state,
      action: PayloadAction<{ venue: EVenue; batchAmount: string }>,
    ) => {
      const { venue, batchAmount } = action.payload;
      const data = state[venue];
      data.singleBatchAmount = batchAmount;
      singleBetAdapter.updateMany(
        data.singleBetData,
        data.singleBetData.ids.map((id) => ({
          id,
          changes: { betAmount: batchAmount },
        })),
      );
    },
    // #endregion

    // #region 切换预约投注状态
    /** 切换预约投注状态：之前是开启则关闭，否则设置为初始值 */
    setPreBetStatus: (
      state,
      action: PayloadAction<{ venue: EVenue; betItemId: string; enabled: boolean }>,
    ) => {
      const { venue, betItemId, enabled } = action.payload;
      const data = state[venue];
      const betItem = data.singleBetData.entities[betItemId];
      if (!betItem) return;
      singleBetAdapter.updateOne(data.singleBetData, {
        id: betItemId,
        changes: {
          preBetInfo: enabled
            ? {
                preBetEnabled: enabled,
                preBetOdds: String(betItem.baseOdds),
                preBetMinAmount: betItem.minBet,
                preBetMaxAmount: betItem.maxBet,
              }
            : undefined,
        },
      });
    },
    // #endregion

    // #region 设置预约注单赔率
    /** 设置预约注单赔率 */
    setPreBetOdds: (
      state,
      action: PayloadAction<{ venue: EVenue; betItemId: string; preBetOdds: string }>,
    ) => {
      const { venue, betItemId, preBetOdds } = action.payload;
      const data = state[venue];
      const betItem = data.singleBetData.entities[betItemId];
      if (!betItem || !betItem.preBetInfo?.preBetEnabled) return;
      singleBetAdapter.updateOne(data.singleBetData, {
        id: betItemId,
        changes: {
          preBetInfo: {
            ...betItem.preBetInfo,
            preBetOdds,
          },
        },
      });
    },
    // #endregion

    // #region 设置预约注单赔率

    /** 设置FB预约投注限额配置 */
    setFbPreBetLimitMap: (
      state,
      action: PayloadAction<{ venue: EVenue; preBetLimitMap: TFbPreBetLimitMap }>,
    ) => {
      const { venue, preBetLimitMap } = action.payload;
      const data = state[venue];
      data.fbPreBetLimitMap = preBetLimitMap;
    },
    // #endregion

    // #region 单关批量修改投注项
    /** 单关批量修改投注项 */
    batchUpdateSingle: (state, action: PayloadAction<{ venue: EVenue; betData: TbetData }>) => {
      const { venue, betData } = action.payload;
      const data = state[venue];
      const prevIds = data.singleBetData.ids;
      const newIds: TbetData['ids'] = [];
      const newEntities: TbetData['entities'] = {};
      prevIds.forEach((prevBetItemId) => {
        const prevBetItem = data.singleBetData.entities[prevBetItemId];
        if (!prevBetItem) return;
        const findBetItem = _.find(
          betData.entities,
          (currBetItem) =>
            currBetItem.betItemId === prevBetItemId ||
            (currBetItem.relatedIds ?? []).includes(prevBetItemId),
        );
        if (findBetItem) {
          newIds.push(findBetItem.betItemId);
          newEntities[findBetItem.betItemId] = {
            ...findBetItem,
            // 投注金额暂不使用接口返回值覆盖
            betAmount: prevBetItem.betAmount,
            // 预约投注信息暂不使用接口返回值覆盖
            preBetInfo: prevBetItem.preBetInfo,
          };
        } else {
          newIds.push(prevBetItemId);
          newEntities[prevBetItemId] = prevBetItem;
        }
      });
      data.singleBetData = { ids: newIds, entities: newEntities };
    },
    // #endregion

    // #region 设置单关当前index
    /** 设置单关当前index */
    setSingleIndex: (state, action: PayloadAction<{ venue: EVenue; singleIndex: number }>) => {
      const { venue, singleIndex } = action.payload;
      state[venue].singleIndex = singleIndex;
    },
    // #endregion

    // #region 设置单关输入框聚焦id
    /** 设置单关输入框聚焦id */
    setSingleFocusId: (state, action: PayloadAction<{ venue: EVenue; singleFocusId: string }>) => {
      const { venue, singleFocusId } = action.payload;
      state[venue].singleFocusId = singleFocusId;
    },
    // #endregion

    // #region 单关清空投注项
    /** 单关清空投注项 */
    clearSingle: (state, action: PayloadAction<{ venue: EVenue }>) => {
      const { venue } = action.payload;
      const data = state[venue];
      singleBetAdapter.removeAll(data.singleBetData);
    },
    // #endregion

    // // #region 设置单关列表
    // /** 设置单关列表 */
    // setSingleBetData: (
    //   state,
    //   action: PayloadAction<{
    //     venue: EVenue;
    //     singleBetData: TVenueBetState['singleBetData'];
    //     triggerQuery?: boolean;
    //   }>,
    // ) => {
    //   const { venue, singleBetData, triggerQuery } = action.payload;
    //   const data = state[venue];
    //   data.singleBetData = singleBetData;
    //   if (triggerQuery) {
    //     data.queryCount += 1;
    //   }
    // },
    // // #endregion

    // #region 串关添加投注项
    /** 串关添加投注项 */
    addToParlay: (state, action: PayloadAction<{ venue: EVenue; betItem: TBetItem }>) => {
      const { venue, betItem } = action.payload;
      const data = state[venue];
      if (data.parlayBetData.ids.includes(betItem.betItemId)) return;
      parlayBetAdapter.addOne(data.parlayBetData, betItem);
      data.parlayList = [];
    },
    // #endregion

    // #region 串关移除投注项
    /** 串关移除投注项 */
    removeFromParlay: (
      state,
      action: PayloadAction<{ venue: EVenue; betItemId: string; syncSingleParlay: boolean }>,
    ) => {
      const { venue, betItemId, syncSingleParlay } = action.payload;
      const data = state[venue];
      if (data.parlayBetData.entities[betItemId]) {
        parlayBetAdapter.removeOne(data.parlayBetData, betItemId);
        data.parlayList = [];
      }
      if (syncSingleParlay && data.singleBetData.entities[betItemId]) {
        singleBetAdapter.removeOne(data.singleBetData, betItemId);
        data.singleIndex = data.singleBetData.ids.length - 1;
      }
    },
    /** 串关批量移除投注项 */
    removeMultipleFromParlay: (
      state,
      action: PayloadAction<{ venue: EVenue; betItemIds: string[] }>,
    ) => {
      const { venue, betItemIds } = action.payload;
      const data = state[venue];
      parlayBetAdapter.removeMany(data.parlayBetData, betItemIds);
      data.parlayList = [];
    },
    // #endregion

    // // #region 串关修改投注项
    // /** 串关修改投注项 */
    // updateParlay: (state, action: PayloadAction<{ venue: EVenue; betItem: TBetItem }>) => {
    //   const { venue, betItem } = action.payload;
    //   const data = state[venue];
    //   if (data.parlayBetData.betItemIds.includes(betItem.betItemId)) {
    //     data.parlayBetData.betItemMap[betItem.betItemId] = betItem;
    //   }
    // },
    // // #endregion

    // #region 串关批量修改投注项
    /** 串关批量修改投注项：与单关一致，按 prevIds 顺序、relatedIds 匹配，保留金额与预约状态；parlayList 按 parlayCode 保留 isFocus、betAmount */
    batchUpdateParlay: (
      state,
      action: PayloadAction<{
        venue: EVenue;
        betData: TbetData;
        parlayList: TParlayItem[];
      }>,
    ) => {
      const { venue, betData, parlayList } = action.payload;
      const data = state[venue];
      const prevIds = data.parlayBetData.ids;
      const newIds: TbetData['ids'] = [];
      const newEntities: TbetData['entities'] = {};
      prevIds.forEach((prevBetItemId) => {
        const prevBetItem = data.parlayBetData.entities[prevBetItemId];
        if (!prevBetItem) return;
        const findBetItem = _.find(
          betData.entities,
          (currBetItem) =>
            currBetItem.betItemId === prevBetItemId ||
            (currBetItem.relatedIds ?? []).includes(prevBetItemId),
        );
        if (findBetItem) {
          newIds.push(findBetItem.betItemId);
          newEntities[findBetItem.betItemId] = {
            ...findBetItem,
            betAmount: prevBetItem.betAmount,
            preBetInfo: prevBetItem.preBetInfo,
          };
        } else {
          newIds.push(prevBetItemId);
          newEntities[prevBetItemId] = prevBetItem;
        }
      });
      data.parlayBetData = { ids: newIds, entities: newEntities };

      const newParlayList = parlayList.map((pItem) => {
        const exitItem = data.parlayList.find((item) => item.parlayCode === pItem.parlayCode);
        if (exitItem) {
          return {
            ...pItem,
            isFocus: exitItem.isFocus,
            betAmount: exitItem.betAmount,
          };
        }
        return pItem;
      });
      data.parlayList = newParlayList;
    },
    // #endregion

    // #region 串关清空投注项
    /** 串关清空投注项 */
    clearParlay: (state, action: PayloadAction<{ venue: EVenue }>) => {
      const { venue } = action.payload;
      const data = state[venue];
      parlayBetAdapter.removeAll(data.parlayBetData);
      data.parlayList = [];
    },
    // #endregion

    // #region 设置串关输入框聚焦id
    /** 设置串关输入框聚焦id */
    setParlayFocusId: (state, action: PayloadAction<{ venue: EVenue; parlayFocusId: string }>) => {
      const { venue, parlayFocusId } = action.payload;
      state[venue].parlayFocusId = parlayFocusId;
    },
    // #endregion

    // #region 设置串关是否展示键盘
    /** 设置串关是否展示键盘 */
    setParlayShowKeyboard: (state, action: PayloadAction<{ venue: EVenue; show: boolean }>) => {
      const { venue, show } = action.payload;
      state[venue].parlayShowKeyboard = show;
    },
    // #endregion

    // #region 快捷金额input框id
    /** 单/串 展示快捷金额input框id */
    setQuickAmountInputId: (state, action: PayloadAction<{ venue: EVenue; id: string }>) => {
      const { venue, id } = action.payload;
      state[venue].quickAmountInputId = id;
    },
    // #endregion

    // #region 修改串关投注项金额
    /** 修改串关投注项金额 */
    setParlayBetAmount: (
      state,
      action: PayloadAction<{ venue: EVenue; id: string; betAmount: string }>,
    ) => {
      const { venue, id, betAmount } = action.payload;
      const data = state[venue];
      data.parlayList = data.parlayList.map((pItem) => {
        if (pItem.parlayCode === id) {
          return {
            ...pItem,
            betAmount,
          };
        }
        return pItem;
      });
    },
    // #endregion

    // #region 设置投注面板展示
    /** 设置投注面板展示 */
    setShowBetDrawer: (state, action: PayloadAction<{ venue: EVenue; showBetDrawer: boolean }>) => {
      const { venue, showBetDrawer } = action.payload;
      state[venue].showBetDrawer = showBetDrawer;
      // 关闭抽屉时退出聊天跟单会话，恢复串关 tab
      if (!showBetDrawer) {
        state[venue].isChatBet = false;
      }
    },
    // #endregion

    // // #region 设置串关列表
    // /** 设置串关列表 */
    // setParlayBetData: (
    //   state,
    //   action: PayloadAction<{
    //     venue: EVenue;
    //     parlayBetData: TVenueBetState['parlayBetData'];
    //   }>,
    // ) => {
    //   const { venue, parlayBetData } = action.payload;
    //   state[venue].parlayBetData = parlayBetData;
    // },
    // // #endregion

    // #region 清空投注列表
    /** 清空投注列表（保留投注类型、结果提示、最小最大下注积分、确认中订单队列） */
    clearBetData: (state, action: PayloadAction<{ venue: EVenue }>) => {
      const { venue } = action.payload;
      const data = state[venue];
      state[venue] = {
        ...venueInitialState,
        betType: data.betType,
        betResultTips: data.betResultTips,
        confirmingOrders: data.confirmingOrders,
        defaultAmount: data.defaultAmount,
        showBetDrawer: data.showBetDrawer,
        isChatBet: data.isChatBet,
      };
    },
    // #endregion

    // #region 设置已下注订单
    /** 设置已下注订单 */
    setBetOrders: (
      state,
      action: PayloadAction<{
        venue: EVenue;
        betOrders: TBetOrderItem[];
      }>,
    ) => {
      const { venue, betOrders } = action.payload;
      const data = state[venue];
      data.betOrders = betOrders;
      data.expandedOrderIds = [];
    },
    // #endregion

    // #region 更新已下注订单
    /** 更新已下注订单 */
    updateBetOrders: (
      state,
      action: PayloadAction<{
        venue: EVenue;
        newOrders: TBetOrderItem[];
      }>,
    ) => {
      const { venue, newOrders } = action.payload;
      const data = state[venue];
      const newBetOrders = data.betOrders.map((prevOrder) => {
        const findOrder = newOrders.find((o) => o.orderId === prevOrder.orderId);
        if (findOrder) {
          return {
            ...findOrder,
            // 投注金额暂不使用接口返回值覆盖
            orderBetAmount: prevOrder.orderBetAmount,
            // 可赢金额也不要
            orderMaxWinAmount: prevOrder.orderMaxWinAmount,
            orderOdds: prevOrder.orderOdds,
          };
        }
        return prevOrder;
      });
      data.betOrders = newBetOrders;
      if (
        newBetOrders.length &&
        newBetOrders.every((o) => o.orderStatus !== EBetOrderStatus.Confirming)
      ) {
        data.betStep = EBetStep.Confirmed;
      }
    },
    // #endregion

    // #region 确认中订单队列
    /** 将确认中的订单追加到确认中队列（每次投注完成后，结果中状态为确认中的会由此追加） */
    addConfirmingOrders: (
      state,
      action: PayloadAction<{ venue: EVenue; orders: TBetOrderItem[] }>,
    ) => {
      const { venue, orders } = action.payload;
      if (orders.length === 0) return;
      const data = state[venue];
      data.confirmingOrders = [...data.confirmingOrders, ...orders];
    },
    // #endregion

    // #region 移除确认中订单队列
    /** 移除确认中订单队列 */
    removeConfirmingOrderByIds: (
      state,
      action: PayloadAction<{ venue: EVenue; orderIds: string[] }>,
    ) => {
      const { venue, orderIds } = action.payload;
      const data = state[venue];
      data.confirmingOrders = data.confirmingOrders.filter((o) => !orderIds.includes(o.orderId));
    },
    // #endregion

    // #region 折叠/展开订单
    /** 折叠/展开订单 */
    toggleOrderExpanded: (state, action: PayloadAction<{ venue: EVenue; orderId: string }>) => {
      const { venue, orderId } = action.payload;
      const data = state[venue];
      const ids = data.expandedOrderIds.includes(orderId)
        ? data.expandedOrderIds.filter((id) => id !== orderId)
        : [...data.expandedOrderIds, orderId];
      data.expandedOrderIds = ids;
    },
    // #endregion

    // #region 投注结果toast队列
    /** 添加投注结果提示到队列 */
    addBetResultTips: (
      state,
      action: PayloadAction<{ venue: EVenue; tipsArray: TBetResultTip[] }>,
    ) => {
      const { venue, tipsArray } = action.payload;
      const data = state[venue];
      data.betResultTips = [...data.betResultTips, ...tipsArray];
    },

    /** 移除队列中第一条提示 */
    popBetResultTip: (state, action: PayloadAction<{ venue: EVenue }>) => {
      const { venue } = action.payload;
      const data = state[venue];
      data.betResultTips = data.betResultTips.slice(1);
    },
    // #endregion

    // #region 设置默认金额
    /** 设置默认金额 */
    setDefaultAmount: (state, action: PayloadAction<{ venue: EVenue; defaultAmount: string }>) => {
      const { venue, defaultAmount } = action.payload;
      state[venue].defaultAmount = defaultAmount;
    },
    // #endregion
  },
});

export const {
  setBetStep,
  setBetType,
  setIsChatBet,
  addToSingle,
  removeFromSingle,
  removeMultipleFromSingle,
  updateSingle,
  setSingleBetAmount,
  setSingleBatchAmount,
  batchUpdateSingle,
  clearSingle,
  addToParlay,
  removeFromParlay,
  removeMultipleFromParlay,
  batchUpdateParlay,
  clearParlay,
  setParlayFocusId,
  setParlayShowKeyboard,
  setQuickAmountInputId,
  setParlayBetAmount,
  setShowBetDrawer,
  clearBetData,
  setBetOrders,
  addConfirmingOrders,
  removeConfirmingOrderByIds,
  updateBetOrders,
  toggleOrderExpanded,
  addBetResultTips,
  popBetResultTip,
  setPreBetStatus,
  setPreBetOdds,
  setFbPreBetLimitMap,
  setSingleFocusId,
  setSingleIndex,
  setDefaultAmount,
} = betSlice.actions;

// 导出 adapter selectors
export const singleBetSelectors = singleBetAdapter.getSelectors();
export const parlayBetSelectors = parlayBetAdapter.getSelectors();

export default betSlice.reducer;

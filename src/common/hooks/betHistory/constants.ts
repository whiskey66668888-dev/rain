import { EBetHistoryQueryType, EBetHistoryTab, EVenue } from '@/apis/commonSports/constants';

export enum EBetHistoryType {
  H5 = 'h5',
  PC_PAGE = 'pc_page',
  PC_SIDEBAR = 'pc_sidebar',
}

export const BET_HISTORY_PAGE_SIZE = 50;

export const MAX_EARLY_SETTLE_COUNT = 5;

export const BET_HISTORY_VENUE_TAB_LIST = [
  {
    key: EVenue.FB,
    venue: EVenue.FB,
    label: '体育',
  },
  //   {
  //     key: EVenue.OB,
  //     venue: EVenue.OB,
  //     label: 'OB',
  //   },
  {
    key: 'entertainment',
    label: '娱乐',
  },
];

const tabItemUnsettled = {
  label: '未结算注单',
  label_s: '未结算',
  value: EBetHistoryTab.UNSETTLED,
  initailParams: { queryType: EBetHistoryQueryType.UNSETTLED },
};

const tabItemSettled = {
  label: '已结算注单',
  label_s: '已结算',
  value: EBetHistoryTab.SETTLED,
  initailParams: { queryType: EBetHistoryQueryType.SETTLED },
};

const tabItemReserve = {
  label: '预约注单',
  label_s: '预约投注',
  value: EBetHistoryTab.RESERVE,
  initailParams: { queryType: EBetHistoryQueryType.RESERVE_IN_PROGRESS },
};

const tabItemResults = {
  label: '赛果',
  label_s: '赛果',
  value: EBetHistoryTab.RESULTS,
  initailParams: { queryType: EBetHistoryQueryType.RESULTS },
};

export const queryTypeToTabMap: Record<EBetHistoryQueryType, EBetHistoryTab> = {
  [EBetHistoryQueryType.UNSETTLED]: EBetHistoryTab.UNSETTLED,
  [EBetHistoryQueryType.UNSETTLED_CHAMPION]: EBetHistoryTab.UNSETTLED,
  [EBetHistoryQueryType.UNSETTLED_EARLY_SETTLEMENT]: EBetHistoryTab.UNSETTLED,
  [EBetHistoryQueryType.SETTLED]: EBetHistoryTab.SETTLED,
  [EBetHistoryQueryType.SETTLED_CHAMPION]: EBetHistoryTab.SETTLED,
  [EBetHistoryQueryType.SETTLED_EARLY_SETTLEMENT]: EBetHistoryTab.SETTLED,
  [EBetHistoryQueryType.RESERVE_IN_PROGRESS]: EBetHistoryTab.RESERVE,
  [EBetHistoryQueryType.RESERVE_FAIL]: EBetHistoryTab.RESERVE,
  [EBetHistoryQueryType.RESULTS]: EBetHistoryTab.RESULTS,
};

// h5
export const tabListH5 = [tabItemUnsettled, tabItemSettled, tabItemReserve, tabItemResults];
// pc左侧菜单二级页面模式
export const tabListSidebar = [tabItemUnsettled, tabItemReserve];
// pc 单独页面模式
export const tabListPC = [tabItemUnsettled, tabItemSettled, tabItemReserve];

export const unsettledTabs = [
  {
    label: '提前结算',
    value: EBetHistoryQueryType.UNSETTLED_EARLY_SETTLEMENT,
  },
  {
    label: '冠军',
    value: EBetHistoryQueryType.UNSETTLED_CHAMPION,
  },
];

export const reserveTabs = [
  {
    label: '进行中',
    value: EBetHistoryQueryType.RESERVE_IN_PROGRESS,
  },
  {
    label: '已失效',
    value: EBetHistoryQueryType.RESERVE_FAIL,
  },
];

export const settledTabs = [
  {
    label: '提前结算',
    value: EBetHistoryQueryType.SETTLED_EARLY_SETTLEMENT,
  },
  {
    label: '冠军',
    value: EBetHistoryQueryType.SETTLED_CHAMPION,
  },
];

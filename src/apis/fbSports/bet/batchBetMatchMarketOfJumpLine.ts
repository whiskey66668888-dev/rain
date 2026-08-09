import requestFB from '@/core/sdk/requestFB';
import { FB_LANGUAGE_TYPE } from '@/utils/constants/local';
import { EFbSelectionType } from '../common/constants/selectionType';
import {
  EFbAllUpEnum,
  EFbInPlayEnum,
  EFbMarketCurtSaleStatusEnum,
  EFbOddsFormatType,
  EFbOutcome,
} from '../common/constants/enum';
import { getGlobalStoreForApiRequest } from '@/core/store/util';

/** 赛事盘口项（请求体中的单项） */
export interface TBetDataMatchMarketItem {
  /** 玩法ID */
  marketId: number;
  /** 赛事ID */
  matchId: number;
  /** 投注项类型，see enum: selection_type */
  type: EFbSelectionType;
  /** 赔率类型，see enum: odds_format_type_enum */
  oddsType?: EFbOddsFormatType;
}

/** 获取最新投注数据请求参数 */
export interface LatestBetDataParams {
  /** 国际化语言类型，see enum: language_type */
  languageType?: FB_LANGUAGE_TYPE;
  /** 赛事盘口数据列表 */
  betMatchMarketList: TBetDataMatchMarketItem[];
  /** 是否查询串关 */
  isSelectSeries: boolean;
  /** 币种id，免转钱包必传 */
  currencyId?: number;
}

/** 玩法选项赔率（data.bms.op） */
export interface TBmsOp {
  /** 选项全称，投注框一般用全称展示 */
  na: string;
  /** 选项简称(全名or简名，订单相关为全名，否则为简名)，赔率列表一般都用简称展示 */
  nm: string;
  /** 球员玩法球队ID */
  tid?: number;
  /** 选项类型，主、客、大、小等，投注时需要提交该字段作为选中的选项参数，see enum: selection_type */
  ty: EFbSelectionType;
  /** 欧盘赔率，目前我们只提供欧洲盘赔率，投注时请提交该字段赔率值作为选项赔率，赔率小于0代表锁盘 */
  od: number;
  /** 赔率，根据请求参数返回对应类型赔率 */
  bod?: number;
  /** 赔率类型，see enum: odds_format_type_enum */
  odt?: EFbOddsFormatType;
  /** 选项结算结果，仅虚拟体育展示，see enum: outcome */
  otcm?: EFbOutcome;
  /** 带线玩法的线，老版本兼容字段，可忽略。如大小球 大 2.5 中的 2.5 */
  li?: string;
}

// "data": {
//         "bms": [
//             {
//                 "mid": 243405369,
//                 "ss": -1
//             }
//         ],
//         "mon": 30,
//         "msl": 30
//     },

/** 玩法选项实时赔率及限额（data.bms 单项） */
export interface TBmsBase {
  /** 玩法id */
  mid: number;
  /** 玩法选项赔率 */
  op: TBmsOp;
  /** 单关，最小投注额限制 */
  smin: number;
  /** 单关，最大投注额限制 */
  smax: number;
  /** 是否支持串关，0 不支持，1 支持，see enum: all_up_enum */
  au: EFbAllUpEnum;
  /**
   *  玩法销售状态，0暂停，1开售，-1未开售（未开售状态一般是不展示的），see enum: market_curt_sale_status_enum
   *  @notice 如果ss为 -1，就只有mid和ss两个返回字段
   */
  // ss: EFbMarketCurtSaleStatusEnum;
  /** 足球让球当前比分，如1-1 */
  re?: string;
  /** 失效玩法id，主要用于带线（球头）玩法变线后，替换原来失效的玩法id，用omid查询到对应玩法，然后替换成 mid */
  omid?: number;
  /** 是否为滚球 1滚球 0非滚球，see enum: in_play_enum */
  ip?: EFbInPlayEnum;
  /** 当前比分 */
  scs?: number[];
}

export type TBmsNotAvailable = Partial<TBmsBase> & {
  ss: EFbMarketCurtSaleStatusEnum.Closed;
  mid: number;
};
export type TBmsAvailable = TBmsBase & {
  ss: EFbMarketCurtSaleStatusEnum.Closed | EFbMarketCurtSaleStatusEnum.Suspended;
};
export type TBms = TBmsNotAvailable | TBmsAvailable;

/** 串关组合赔率及限额（data.sos 单项） */
export interface TSos {
  /** 串关子单选项个数，如：投注4场比赛的3串1，此字段为3，如果是全串关（4串11×11），则为0 */
  sn: number;
  /** 串关子单个数，如 投注4场比赛的3串1*4，此字段为4，全串关（4串11×11），则为11 */
  in: number;
  /** 串关对应的赔率 */
  sodd: number;
  /** 串关，最小投注额 */
  mi: number;
  /** 串关，最大投注额 */
  mx: number;
}

/** 最新投注数据 data 结构 */
export interface TLatestBetDataResponse {
  /** 玩法选项实时赔率及限额 */
  bms: TBms[];
  /** 串关组合赔率及限额 */
  sos?: TSos[];
  /** 单关，批量允许最大订单个数 */
  mon: number;
  /** 串关，订单最大选项个数（关数） */
  msl: number;
}

/**
 * 批量获取跳线盘口最新投注数据
 */
export const getBatchBetMatchMarketOfJumpLineFb = (params: LatestBetDataParams) => {
  const state = getGlobalStoreForApiRequest().getState();
  const isLogin = state.user.userInfo.isLogin;
  const token = state.thirdApiConfig.fb.config?.token ?? '';
  return requestFB.post<TLatestBetDataResponse, LatestBetDataParams>(
    '/v1/order/batchBetMatchMarketOfJumpLine',
    { body: params, ...(!isLogin && token && { headers: { Authorization: token } }) },
  );
};

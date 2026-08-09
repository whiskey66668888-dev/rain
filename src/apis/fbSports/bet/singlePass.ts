import requestFB from '@/core/sdk/requestFB';
import { FB_LANGUAGE_TYPE } from '@/utils/constants/local';
import { EFbSelectionType } from '@/apis/fbSports/common/constants/selectionType';
import { EFbOddsChangeEnum, EFbOddsFormatType } from '@/apis/fbSports/common/constants/enum';
import { EFbOrderStatus } from '../common/constants/enum';

/** 单关投注项：玩法选项，数组大小为 1，对应 data.records.mg.mks / mks.op */
export interface TSingleBetOptionItem {
  /** 玩法ID，对应 data.records.mg.mks.id */
  marketId: number;
  /** 投注选项类型，对应 data.records.mg.mks.op.ty，see enum: selection_type */
  optionType: EFbSelectionType;
  /** 下注赔率（传欧洲盘），对应 data.records.mg.mks.op.od */
  odds: number;
  /** 下注时展示的赔率类型，如港盘、欧盘，see enum: odds_format_type_enum */
  oddsFormat: EFbOddsFormatType;
}

/** 单关一条：支持批量，最多 10 个订单 */
export interface TSingleBetItem {
  /** 每单的投注金额 */
  unitStake: number;
  /** 是否接受赔率变更，see enum: odds_change_enum */
  oddsChange: EFbOddsChangeEnum;
  /** 投注玩法选项，数组大小为 1 */
  betOptionList: TSingleBetOptionItem[];
  /** 三方数据关联ID，可为空 */
  relatedId?: string;
  /** 第三方备注 */
  thirdRemark?: string;
}

/** 单关下注请求参数，对应 /v1/order/bet/singlePass */
export interface TSingleBetParams {
  /** 设备ID，长度 0～64 */
  deviceId?: string;
  /** 单关投注数组，批量最多 10 个订单 */
  singleBetList: TSingleBetItem[];
  /** 币种id，免转钱包必传，see enum: currency */
  currencyId?: number;
  /** 语言类型，see enum: language_type */
  languageType?: FB_LANGUAGE_TYPE;
}

/** 单关下单响应：订单选项，对应 data.ops[] */
export interface TSingleBetOrderOption {
  /** 盘口id */
  mid: string;
  /** 欧式赔率 */
  od: string;
  /** 赔率类型，see enum: odds_format_type_enum */
  of: number;
  /** 下注赔率 */
  bod: string;
  /** 第三方备注 */
  tr: string;
  /** 下单时三方带的订单ID */
  rid: string;
}

/** 单关下单响应：单条数据，对应 data[] */
export interface TSingleBetOrderItem {
  /** 订单ID，返回为字符串 */
  id: string;
  /** 下单后订单状态，异步处理未确认，see enum: order_status */
  st: EFbOrderStatus;
  /** 订单选项集合 */
  ops: TSingleBetOrderOption[];
}

/** 单关下注接口 /v1/order/bet/singlePass */
export const singlePassFb = (params: TSingleBetParams) => {
  return requestFB.post<TSingleBetOrderItem[], TSingleBetParams>('/v1/order/bet/singlePass', {
    body: params,
    isErrorToast: true,
  });
};

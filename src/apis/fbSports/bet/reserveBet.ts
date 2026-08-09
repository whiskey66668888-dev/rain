import requestFB from '@/core/sdk/requestFB';
import { FB_LANGUAGE_TYPE } from '@/utils/constants/local';
import { EFbSelectionType } from '@/apis/fbSports/common/constants/selectionType';
import { EFbOddsFormatType, EFbReserveOrderStatus } from '@/apis/fbSports/common/constants/enum';

/** 预约投注：盘口玩法项，对应 betOptionList[]，结构同单关/串关 */
export interface TReserveBetOptionItem {
  /** 玩法ID，对应 data.records.mg.mks.id */
  marketId: number;
  /** 投注选项类型，对应 mks.op.ty，see enum: selection_type */
  optionType: EFbSelectionType;
  /** 下注赔率（传欧洲盘），对应 mks.op.od */
  odds: number;
  /** 下注时展示的赔率类型，see enum: odds_format_type_enum */
  oddsFormat: EFbOddsFormatType;
}

/** 预约投注请求参数，对应 /v1/order/reserve/bet（同一用户最多 10 个预约订单） */
export interface TReserveBetParams {
  /** 设备ID，长度 0～64 */
  deviceId?: string;
  /** 投注本金 */
  unitStake: number;
  /** 投注的盘口玩法项数据集合 */
  betOptionList: TReserveBetOptionItem[];
  /** 币种id，免转钱包必传，see enum: currency */
  currencyId?: number;
  /** 语言类型，see enum: language_type */
  languageType?: FB_LANGUAGE_TYPE;
  /** 预约支付信息，免转渠道不支持预约扣款，see enum: reserve_pay_enum */
  pay?: number;
  /** 第三方关联ID */
  relatedId?: string;
}

/** 预约投注响应：单条数据，对应 data[] */
export interface TReserveBetOrderItem {
  /** 预约订单ID，返回为字符串 */
  id: string;
  /** 预约订单状态，see enum: reserve_order_status */
  st: EFbReserveOrderStatus;
}

/** 预约投注接口 /v1/order/reserve/bet */
export const reserveBetFb = (params: TReserveBetParams) => {
  return requestFB.post<TReserveBetOrderItem, TReserveBetParams>('/v1/order/reserve/bet', {
    body: params,
  });
};

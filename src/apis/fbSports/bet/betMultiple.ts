import requestFB from '@/core/sdk/requestFB';
import { FB_LANGUAGE_TYPE } from '@/utils/constants/local';
import { EFbSelectionType } from '@/apis/fbSports/common/constants/selectionType';
import { EFbOddsChangeEnum, EFbOddsFormatType } from '@/apis/fbSports/common/constants/enum';
import type { TSingleBetOrderItem } from './singlePass';

/** 串关投注项：盘口玩法项，对应 betOptionList[]，个数 2～N */
export interface TBetMultipleOptionItem {
  /** 玩法ID，对应 data.records.mg.mks.id */
  marketId: number;
  /** 投注选项类型，对应 mks.op.ty，see enum: selection_type */
  optionType: EFbSelectionType;
  /** 下注赔率（传欧洲盘），对应 mks.op.od */
  odds: number;
  /** 下注时展示的赔率类型，see enum: odds_format_type_enum */
  oddsFormat: EFbOddsFormatType;
}

/** 串关关次一条：几串几的关次等，对应 betMultipleData[] */
export interface TBetMultipleDataItem {
  /** 是否接受赔率变更，see enum: odds_change_enum */
  oddsChange: EFbOddsChangeEnum;
  /** 串关子单选项个数，如 3串1 为 3，全串关（4串11）为 0，对应 batchBetMatchMarketOfJumpLine 的 data.sos.sn */
  seriesValue: number;
  /** 每个子单投注金额，如 3串1*4 每子单 10 元则传 10 */
  unitStake: number;
  /** 第三方备注 */
  thirdRemark?: string;
  /** 三方数据关联ID，为空则用外层 relatedId */
  relatedId?: string;
}

/** 串关下注请求参数，对应 /v1/order/betMultiple */
export interface TBetMultipleParams {
  /** 设备ID，长度 0～64 */
  deviceId?: string;
  /** 串关投注关次数据，几串几的关次等 */
  betMultipleData: TBetMultipleDataItem[];
  /** 投注的盘口玩法项集合，个数至少 2 */
  betOptionList: TBetMultipleOptionItem[];
  /** 币种id，免转钱包必传，see enum: currency */
  currencyId?: number;
  /** 语言类型，see enum: language_type */
  languageType?: FB_LANGUAGE_TYPE;
  /** 三方数据关联ID，可为空 */
  relatedId?: string;
}

/** 串关下注接口 /v1/order/betMultiple */
export const betMultipleFb = (params: TBetMultipleParams) => {
  return requestFB.post<TSingleBetOrderItem[], TBetMultipleParams>('/v1/order/betMultiple', {
    body: params,
  });
};

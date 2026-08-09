import requestFB from '@/core/sdk/requestFB';
import { FB_LANGUAGE_TYPE } from '@/utils/constants/local';
import { EFbSelectionType } from '@/apis/fbSports/common/constants/selectionType';
import { TFbPreBetLimitItem } from '@/apis/commonSports/types';

/**
 * DESCRIPTION
 * FB体育提供预约投注功能，此接口提供预约下单时对应玩法的投注限额控制范围，预约最大本金控制在接口返回的限额范围内；
 * 计算方式为：先计算mly/(欧赔-1)，判断计算出的值是否> mly ，如果是，则取mly，否则取计算出的值。
 * 最后再将此值与mms相比取小值(如mms无值则取mly判断出的逻辑值即可)。
 * 计算出来的预约金额可按照这个规则美化： 大于0小于50，保留整数 大于等于50小于1000，保留十位数整数 大于等于1000小于10000，向下取整保留百位数 大于等于10000向下取整保留千位数
 */

export interface TGetBetParameterParams {
  /** 赛事ID */
  matchId: number;
  /** 玩法ID */
  marketId: number;
  /** 选项类型，see enum: selection_type */
  optionType?: EFbSelectionType;
  /** 币种ID，see enum: currency */
  currencyId?: number;
  /** 语言类型，see enum: language_type */
  languageType?: FB_LANGUAGE_TYPE;
}

/** 获取预约投注限额配置 /v1/order/reserve/getBetParameter */
export const getBetParameterFb = (params: TGetBetParameterParams) => {
  return requestFB.post<TFbPreBetLimitItem, TGetBetParameterParams>(
    '/v1/order/reserve/getBetParameter',
    {
      body: params,
    },
  );
};

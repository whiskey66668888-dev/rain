import { useMemoizedFn } from 'ahooks';

import { EOddsType, ODDS_TYPE_LABEL } from '@/apis/commonSports/constants';
import { useAppSelector } from '@/core/store/hooks';
import { getDisplayOddsByType, getEffectiveOddsType } from '@/utils/bet';

/**
 * 投注单 / 注单结果里的赔率展示。
 *
 * 存储层的 `baseOdds` 恒为欧洲盘，展示时才按当前盘口换算；串关只支持欧洲盘，
 * 调用方把所在面板的 `isParlay` 透传进来，赔率与「[欧洲盘]/[香港盘]」标签就会一起对齐。
 */
export const useOddsDisplay = () => {
  const currentOddsType = useAppSelector((state) => state.sport.currentOddsType);

  const getOddsDisplay = useMemoizedFn(
    ({
      baseOdds,
      isSupportHK,
      isParlay,
    }: {
      baseOdds?: number | string;
      isSupportHK?: boolean;
      isParlay?: boolean;
    }) => {
      const oddsType = getEffectiveOddsType({ isSupportHK, currentOddsType, isParlay });
      return {
        oddsType,
        /** 换算后的展示赔率，已截断两位 */
        odds: getDisplayOddsByType(Number(baseOdds) || 0, oddsType),
        /** 盘口文案，如「欧洲盘」 */
        label: ODDS_TYPE_LABEL[oddsType],
      };
    },
  );

  return { currentOddsType, isHKOdds: currentOddsType === EOddsType.HK, getOddsDisplay };
};

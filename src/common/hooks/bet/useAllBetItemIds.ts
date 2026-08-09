import { EBetType } from '@/apis/commonSports/constants';
import { useAppSelector } from '@/core/store/hooks';
import { useMemo } from 'react';

/**
 * 当前 tab 下用于赔率按钮高亮的 betItemId 列表。
 * @param matchId 传入时仅返回该场比赛的选项（列表/详情单场）；不传则返回全部（如侧栏数量）
 */
export const useAllBetItemIds = (matchId?: string | number) => {
  const venue = useAppSelector((state) => state.sport.venue);
  const betType = useAppSelector((state) => state.bet[venue].betType);
  const singleBetData = useAppSelector((state) => state.bet[venue].singleBetData);
  const parlayBetData = useAppSelector((state) => state.bet[venue].parlayBetData);

  const allBetItemIds = useMemo(() => {
    const isParlay = betType === EBetType.Parlay;
    const data = isParlay ? parlayBetData : singleBetData;
    const ids = data?.ids ?? [];

    if (matchId == null || matchId === '') {
      return ids;
    }

    const matchIdStr = String(matchId);
    return ids.filter((id) => {
      const entity = data?.entities[id];
      return entity != null && String(entity.matchId) === matchIdStr;
    });
  }, [betType, singleBetData, parlayBetData, matchId]);

  return allBetItemIds;
};

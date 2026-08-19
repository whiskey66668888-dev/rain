import { useAppSelector } from '@/core/store/hooks';
import { selectBetItemIdsForMatch } from '@/core/store/selectors/betSelectors';

/**
 * 当前 tab 下用于赔率按钮高亮的 betItemId 列表。
 * @param matchId 传入时仅返回该场比赛的选项（列表/详情单场）；不传则返回全部（如侧栏数量）
 *
 * 引用稳定性由 selectBetItemIdsForMatch 的 resultEqualityCheck 保证，无需再传 equalityFn。
 */
export const useAllBetItemIds = (matchId?: string | number): string[] => {
  return useAppSelector((state) => selectBetItemIdsForMatch(state, matchId));
};

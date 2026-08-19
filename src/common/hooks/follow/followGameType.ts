/**
 * 关注（v2）场馆编码：对齐 Flutter FavoriteRepository / FavRx
 * - FB → gameType `FB`
 * - OB → gameType `EB`（服务端桶名，不是 `OB`）
 */
import { EVenue } from '@/apis/commonSports/constants';
import { FOLLOW_MATCH_IDS_EB_KEY, FOLLOW_MATCH_IDS_FB_KEY } from '@/utils/constants/cacheKey';

export type FollowGameType = 'FB' | 'EB';

/** 当前体育场馆 → follow v2 gameType */
export function getFollowGameType(venue: EVenue): FollowGameType {
  return venue === EVenue.OB ? 'EB' : 'FB';
}

/** 本地收藏分桶 key（FB / EB 各自维护，对齐 Flutter Hive venue 桶） */
export function getFollowMatchStorageKey(gameType: FollowGameType): string {
  return gameType === 'EB' ? FOLLOW_MATCH_IDS_EB_KEY : FOLLOW_MATCH_IDS_FB_KEY;
}

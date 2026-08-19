/**
 * 关注（v2）三端同步编排 Hook（对标 App 端各场馆 FavRx 的加载/同步逻辑）。
 *
 * 职责（仅登录态；游客态收藏继续走 redux + localStorage，不碰服务器）：
 *  1. 登录后 / 进入关注 tab 时，从服务器拉取关注列表回填 redux（服务器为权威来源）。
 *  2. 游客→登录的瞬间，把本地游客收藏（带 matchData 快照）一次性 sync 到服务器，再以合并结果为准。
 *  3. 场馆切换（gameType FB↔EB）时重新对账，互不覆盖对方桶。
 *
 * 写操作（收藏/取消、投注自动关注）在各自的交互处直接调 add/del 接口镜像到服务器，
 * 这里只负责「读 + 登录同步」。参考：
 * emc/lib/pages/home_sport/home_components/storage/fb/fb_fav_store_rx.dart
 * emc/lib/pages/home_sport/home_components/storage/ob/ob_fav_store_rx.dart
 */
import { useEffect, useRef } from 'react';

import { PlayType } from '@/apis/commonSports/constants';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { setFollowMatchIds } from '@/core/store/slices/sportSlice';

import { getFollowListReq, syncFollowReq } from '@/apis/origin/follow';

import { guestFollowMatchToSyncItem, serverListToFollowMatches } from './favoriteMapper';
import type { FollowGameType } from './followGameType';

interface UseFavoritesOptions {
  /** 体育平台编码：`FB` | `EB`（OB 场馆） */
  gameType: FollowGameType;
}

export function useFavorites({ gameType }: UseFavoritesOptions) {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const playType = useAppSelector((state) => state.sport.mainList.settings.playType);
  const followMatch = useAppSelector((state) => state.sport.mainList.settings.followMatch);

  // 用 ref 拿到「同步那一刻」的游客收藏，避免把它放进 effect 依赖导致重复触发
  const followMatchRef = useRef(followMatch);
  followMatchRef.current = followMatch;

  // 当前请求对应的 gameType：切场馆后丢弃过期响应，避免 FB list 写进 OB 桶
  const gameTypeRef = useRef(gameType);
  gameTypeRef.current = gameType;

  // 服务器交互并发锁：同一 gameType 内防重入；切场馆后允许新一轮
  const inFlightGameTypeRef = useRef<FollowGameType | null>(null);

  /** 从服务器拉取关注列表并回填 redux（覆盖当前场馆本地列表） */
  const loadFromServer = async (requested: FollowGameType) => {
    const res = await getFollowListReq({ gameType: requested });
    if (gameTypeRef.current !== requested) return;
    const list = serverListToFollowMatches(res.data ?? [], requested);
    dispatch(setFollowMatchIds({ type: 'set', allMatchInfos: list }));
  };

  /**
   * 把游客本地收藏 sync 到服务器，成功后以返回的合并列表为准；无本地数据时退化为直接拉取。
   *
   * sync 失败时任由异常抛给上层 catch —— 保留 redux/localStorage 里的游客收藏（下次登录可重试），
   * 刻意不回退 loadFromServer：web 的关注是 redux + localStorage 单一存储，回填服务器列表会以
   * 'set' 覆盖掉尚未同步的游客收藏并永久丢失，故与 App（guest 桶与登录列表分离，失败可回退拉取）
   * 此处策略不同。
   */
  const syncGuestThenLoad = async (requested: FollowGameType) => {
    // 只上报游客态收藏（source==='tourist'）：登录态项已在服务器，无需再 sync
    const localItems = followMatchRef.current
      .filter((m) => m.source === 'tourist' && !!m.matchData)
      .map(guestFollowMatchToSyncItem);

    if (localItems.length === 0) {
      await loadFromServer(requested);
      return;
    }

    const res = await syncFollowReq({ gameType: requested, list: localItems });
    if (gameTypeRef.current !== requested) return;
    const list = serverListToFollowMatches(res.data?.list ?? [], requested);
    dispatch(setFollowMatchIds({ type: 'set', allMatchInfos: list }));
  };

  /**
   * 登录态下与服务器对账：本地若还有未同步的游客收藏（source==='tourist'）→ 先 sync 合并，
   * 否则直接 loadFromServer。
   */
  const reconcileWithServer = async (requested: FollowGameType) => {
    if (inFlightGameTypeRef.current === requested) return;
    inFlightGameTypeRef.current = requested;
    try {
      const hasGuestData = followMatchRef.current.some(
        (m) => m.source === 'tourist' && !!m.matchData,
      );
      if (hasGuestData) {
        await syncGuestThenLoad(requested);
      } else {
        await loadFromServer(requested);
      }
    } catch {
      // 失败静默：保留本地 tourist 数据，下次挂载/进 tab 再重试
    } finally {
      if (inFlightGameTypeRef.current === requested) {
        inFlightGameTypeRef.current = null;
      }
    }
  };

  // 挂载即已登录、登录翻转、或切换场馆 gameType：都走 reconcile
  useEffect(() => {
    if (!isLogin) return;
    void reconcileWithServer(gameType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogin, gameType]);

  // 登录态下进入关注 tab：刷新服务器最新列表（仍先 reconcile，避免残留 tourist 数据被 load 冲掉）
  useEffect(() => {
    if (!isLogin) return;
    if (playType !== PlayType.Follow) return;
    void reconcileWithServer(gameType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playType, gameType]);

  return {
    loadFromServer: () => loadFromServer(gameType),
    syncGuestThenLoad: () => syncGuestThenLoad(gameType),
  };
}

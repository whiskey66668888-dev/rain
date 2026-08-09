/**
 * 关注（v2）三端同步编排 Hook（对标 App 端各场馆 FavRx 的加载/同步逻辑）。
 *
 * 职责（仅登录态；游客态收藏继续走 redux + localStorage，不碰服务器）：
 *  1. 登录后 / 进入关注 tab 时，从服务器拉取关注列表回填 redux（服务器为权威来源）。
 *  2. 游客→登录的瞬间，把本地游客收藏（带 matchData 快照）一次性 sync 到服务器，再以合并结果为准。
 *
 * 写操作（收藏/取消、投注自动关注）在各自的交互处直接调 add/del 接口镜像到服务器，
 * 这里只负责「读 + 登录同步」。参考：
 * emc/lib/pages/home_sport/home_components/storage/fb/fb_fav_store_rx.dart
 */
import { useEffect, useRef } from 'react';

import { PlayType } from '@/apis/commonSports/constants';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { setFollowMatchIds } from '@/core/store/slices/sportSlice';

import { getFollowListReq, syncFollowReq } from '@/apis/origin/follow';

import { guestFollowMatchToSyncItem, serverListToFollowMatches } from './favoriteMapper';

interface UseFavoritesOptions {
  /** 体育平台编码，如 `FB`（web 体育关注 tab 目前为 FB） */
  gameType: string;
}

export function useFavorites({ gameType }: UseFavoritesOptions) {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const playType = useAppSelector((state) => state.sport.mainList.settings.playType);
  const followMatch = useAppSelector((state) => state.sport.mainList.settings.followMatch);

  // 用 ref 拿到「同步那一刻」的游客收藏，避免把它放进 effect 依赖导致重复触发
  const followMatchRef = useRef(followMatch);
  followMatchRef.current = followMatch;

  // 服务器交互并发锁：挂载时 isLogin 与 playType 两个 effect 可能同帧触发，
  // 用同步置位的 ref 保证只跑一次，避免 loadFromServer 与 sync 竞态互相覆盖。
  const inFlightRef = useRef(false);

  /** 从服务器拉取关注列表并回填 redux（覆盖本地列表） */
  const loadFromServer = async () => {
    const res = await getFollowListReq({ gameType });
    const list = serverListToFollowMatches(res.data ?? []);
    console.log('js---loadFromServer---list', list);
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
  const syncGuestThenLoad = async () => {
    // 只上报游客态收藏（source==='tourist'）：登录态项已在服务器，无需再 sync
    const localItems = followMatchRef.current
      .filter((m) => m.source === 'tourist' && !!m.matchData)
      .map(guestFollowMatchToSyncItem);

    if (localItems.length === 0) {
      await loadFromServer();
      return;
    }

    const res = await syncFollowReq({ gameType, list: localItems });
    const list = serverListToFollowMatches(res.data?.list ?? []);
    console.log('js---syncGuestThenLoad---list', list);
    dispatch(setFollowMatchIds({ type: 'set', allMatchInfos: list }));
  };

  /**
   * 登录态下与服务器对账：本地若还有未同步的游客收藏（source==='tourist'）→ 先 sync 合并，
   * 否则直接 loadFromServer。
   *
   * 关键：登录成功会 navigate 跳离体育页，useFavorites 卸载；等用户回到体育页时是「已登录」的全新挂载，
   * 观测不到 isLogin 的翻转。因此不再靠 prevIsLogin 判跃迁，而是以「本地是否残留 tourist 数据」为准——
   * sync 成功后服务器列表以 'set' 回填（source 变 normal/bet），tourist 项消失，后续挂载自然只 loadFromServer。
   */
  const reconcileWithServer = async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      const hasGuestData = followMatchRef.current.some(
        (m) => m.source === 'tourist' && !!m.matchData,
      );
      if (hasGuestData) {
        await syncGuestThenLoad();
      } else {
        await loadFromServer();
      }
    } catch {
      // 失败静默：保留本地 tourist 数据，下次挂载/进 tab 再重试
    } finally {
      inFlightRef.current = false;
    }
  };

  // 挂载即已登录、或游客→登录翻转（同一挂载内）：都走 reconcile（有游客数据先 sync 再合并，否则拉列表）
  useEffect(() => {
    if (!isLogin) return;
    void reconcileWithServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogin]);

  // 登录态下进入关注 tab：刷新服务器最新列表（仍先 reconcile，避免残留 tourist 数据被 load 冲掉）
  useEffect(() => {
    if (!isLogin) return;
    if (playType !== PlayType.Follow) return;
    void reconcileWithServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playType]);

  return { loadFromServer, syncGuestThenLoad };
}

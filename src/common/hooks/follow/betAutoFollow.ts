/**
 * 投注成功「自动关注」的服务器镜像（source=2）。
 *
 * 登录态：把投注成功的赛事以 source=2 上报服务器（三端同步）。
 * 游客态：不落服务器，由 redux + localStorage 承接，登录时再由 useFavorites 的 sync 一次性上报。
 *
 * 用非 hook 的 Cookie 判断登录态，方便在各投注流程里直接 fire-and-forget 调用，
 * 无需在每个投注 hook 里额外注入 isLogin。与旧接口自动关注的开关（automaticFollow）无关，
 * 由调用方在 params.autoFollowMatch 为真时才触发，这里不再重复判断。
 */
import Cookies from 'js-cookie';
import _ from 'lodash';

import type { TBetItem, TBetOrderItem } from '@/apis/commonSports/types';

import { addFollowReq } from '@/apis/origin/follow';

import { betItemToAddParams } from './favoriteMapper';
import type { FollowGameType } from './followGameType';

const isLoggedIn = (): boolean => Cookies.get('isLogin') === '1';

/** 把一组投注项以 source=2 镜像到服务器（按 matchId 去重，仅登录态；冠军项不关注） */
export const mirrorBetAutoFollowToServer = (
  details: TBetItem[],
  gameType: FollowGameType = 'FB',
): void => {
  if (!isLoggedIn()) return;
  // 冠军（Outright）投注项不自动关注（后端对 champion+source=2 亦静默跳过，这里前置过滤省一次请求）
  _.uniqBy(
    details.filter((d) => !d.isChampion),
    'matchId',
  ).forEach((detail) => {
    void addFollowReq(betItemToAddParams(gameType, detail));
  });
};

/** 把投注订单里的赛事以 source=2 镜像到服务器（仅登录态） */
export const mirrorOrdersAutoFollowToServer = (
  orders: TBetOrderItem[],
  gameType: FollowGameType = 'FB',
): void =>
  mirrorBetAutoFollowToServer(
    orders.flatMap((order) => order.orderDetails),
    gameType,
  );

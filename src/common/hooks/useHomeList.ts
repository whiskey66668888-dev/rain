import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { HomeListResponse, useHomeListQuery } from '@/apis/origin/homeList';
import { useInfoSlideQuery } from '@/apis/origin/system';
import { HomeListId, TRY_PLAY_VENUE_ID } from '@/utils/constants/entertainment';
import { useAppSelector } from '@/core/store/hooks';
/**
 * 娱乐页菜单栏以及主列表场馆入口相关导航卡片数据
 */
interface BaseList {
  label: string;
  shortLabel: string;
  icon: string;
  homeId: HomeListId | number;
  promotion: string;
  promotionList?: string[];
  children: Array<{
    name: string;
    label: string;
    gameId: number;
    path?: string;
    cardImage: string;
    icon: string;
    isTryPlay?: boolean;
  }>;
}

/**
 * 合并后的列表项类型（BaseList 的 children 合并了 HomeListResponse 的 childList 属性）
 */
export type MergedBaseList = Omit<BaseList, 'children'> & {
  children: Array<BaseList['children'][number] & Partial<HomeListResponse['childList'][number]>>;
};
export const useHomeList = (
  config: { enabled?: boolean } = {},
): { homeList: Array<MergedBaseList> } => {
  const enabled = config.enabled ?? true;
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const { data: homeList = [], refetch } = useHomeListQuery({ enabled });
  const { data: infoSlideList = [] } = useInfoSlideQuery(enabled);
  const { t } = useTranslation();

  useEffect(() => {
    if (isLogin && enabled) {
      refetch();
    }
  }, [enabled, isLogin, refetch]);

  const baseList: Array<BaseList> = useMemo(
    () => [
      {
        label: t('common.sports'),
        shortLabel: t('common.sportsShort'),
        icon: '/images/common/menu/sports/sports.svg',
        homeId: HomeListId.SPORTS,
        promotion: '',
        children: [
          {
            name: t('common.ybSports'),
            label: 'OP SPORTS',
            gameId: 89,
            path: '/sports/op',
            cardImage: '/images/common/menu/sports/op_1.png',
            icon: '/images/common/menu/sports/op.svg',
          },
          {
            name: t('common.ebSports'),
            label: 'EB SPORTS',
            gameId: 79,
            path: '/sports/eb',
            cardImage: '/images/common/menu/sports/eb_1.png',
            icon: '/images/common/menu/sports/eb.svg',
          },
          {
            name: t('common.cmeSports'),
            label: 'CME SPORTS',
            gameId: 30,
            path: '/sports/cme',
            cardImage: '/images/common/menu/sports/cme_1.png',
            icon: '/images/common/menu/sports/cme.svg',
          },

          {
            name: t('common.imSports'),
            label: 'IM SPORTS',
            gameId: 78,
            path: '/sports/im',
            cardImage: '/images/common/menu/sports/im_1.png',
            icon: '/images/common/menu/sports/im.svg',
          },
          {
            name: t('common.aiSports'),
            label: 'AI SPORTS',
            gameId: 60,
            path: '/sports/ai',
            cardImage: '/images/common/menu/sports/ai_1.png',
            icon: '/images/common/menu/sports/ai.svg',
          },
        ],
      },
      {
        label: t('common.esports'),
        shortLabel: t('common.esportsShort'),
        icon: '/images/common/menu/esports/esports.svg',
        homeId: HomeListId.ESPORTS,
        promotion: '',
        children: [
          {
            name: t('common.ybEsports'),
            label: 'OP E-SPORTS',
            gameId: 81,
            path: '/esports/op',
            cardImage: '/images/common/menu/esports/op.png',
            icon: '/images/common/menu/esports/op.svg',
          },
          {
            name: t('common.cmeEsports'),
            label: 'CME E-SPORTS',
            gameId: 84,
            path: '/esports/cme',
            cardImage: '/images/common/menu/esports/cme.png',
            icon: '/images/common/menu/esports/cme.svg',
          },
          {
            name: t('common.skEsports'),
            label: 'SK E-SPORTS',
            gameId: 88,
            path: '/esports/sk',
            cardImage: '/images/common/menu/esports/sk.png',
            icon: '/images/common/menu/esports/sk.svg',
          },
        ],
      },
      {
        label: t('common.live'),
        shortLabel: t('common.liveShort'),
        icon: '/images/common/menu/live/live.svg',
        homeId: HomeListId.LIVE,
        promotion: '',
        children: [
          {
            name: t('common.ebLive'),
            label: 'EB LIVE',
            gameId: 43,
            cardImage: '/images/common/menu/live/eb.png',
            icon: '/images/common/menu/live/eb.svg',
            path: '/live/eb',
          },
          {
            name: t('common.paLive'),
            label: 'PA LIVE',
            gameId: 5,
            cardImage: '/images/common/menu/live/pa1.png',
            icon: '/images/common/menu/live/pa1.svg',
            path: '/live/pa',
          },
          {
            name: t('common.evoLive'),
            label: 'EVO LIVE',
            gameId: 31,
            cardImage: '/images/common/menu/live/evo.png',
            icon: '/images/common/menu/live/evo.svg',
            path: '/live/evo',
          },

          {
            name: t('common.bgLive'),
            label: 'BG LIVE',
            gameId: 20,
            cardImage: '/images/common/menu/live/bg.png',
            icon: '/images/common/menu/live/bg.svg',
            path: '/live/bg',
          },
          // {
          //   name: t('common.ppLive'),
          //   label: 'PP LIVE',
          //   gameId: 91,
          //   cardImage: '/images/common/menu/live/pp.png',
          //   icon: '/images/common/menu/live/pp.svg',
          //   path: '/live/pp',
          // },
        ],
      },

      {
        label: t('common.slots'),
        shortLabel: t('common.slotsShort'),
        icon: '/images/common/menu/slots/slots.svg',
        homeId: HomeListId.SLOTS,
        promotion: '',
        children: [
          {
            name: t('common.pgSlots'),
            label: 'PG SOFT',
            gameId: 68,
            cardImage: '/images/common/menu/slots/pg.png',
            icon: '/images/common/menu/slots/pg.svg',
          },
          {
            name: t('common.dayunSlots'),
            label: 'DAYUN SOFT',
            gameId: 70,
            cardImage: '/images/common/menu/slots/dy.png',
            icon: '/images/common/menu/slots/dy.svg',
          },
          {
            name: t('common.ppSlots'),
            label: 'PP SOFT',
            gameId: 72,
            cardImage: '/images/common/menu/slots/pp.png',
            icon: '/images/common/menu/slots/pp.svg',
          },
          {
            name: t('common.vectorSlots'),
            label: 'VECTOR FISH',
            gameId: 77,
            cardImage: '/images/common/menu/slots/vector_1.png',
            icon: '/images/common/menu/slots/vector.svg',
          },
          {
            name: t('common.paSlots'),
            label: 'PA SOFT',
            gameId: 9,
            cardImage: '/images/common/menu/slots/ygg.png',
            icon: '/images/common/menu/slots/ygg.svg',
          },
          {
            name: t('common.ebSlots'),
            label: 'EB SOFT',
            gameId: 113,
            cardImage: '/images/common/menu/slots/eb.png',
            icon: '/images/common/menu/slots/eb.svg',
          },
          {
            name: 'MG电子',
            label: 'MG SOFT',
            gameId: 117,
            cardImage: '/images/common/menu/slots/mg.png',
            icon: '/images/common/menu/slots/mg.svg',
          },
          {
            name: 'JDB电子',
            label: 'JDB SOFT',
            gameId: 116,
            cardImage: '/images/common/menu/slots/jdb.png',
            icon: '/images/common/menu/slots/jdb.svg',
          },
          {
            name: 'MW电子',
            label: 'MW SOFT',
            gameId: 120,
            cardImage: '/images/common/menu/slots/mw.png',
            icon: '/images/common/menu/slots/mw.svg',
          },
          {
            name: t('common.tryPlaySlots'),
            label: 'TRY PLAY',
            gameId: TRY_PLAY_VENUE_ID,
            cardImage: '/images/common/menu/slots/eb.png',
            icon: '/images/common/menu/slots/tryplay1.svg',
            isTryPlay: true,
          },
        ],
      },

      {
        label: t('common.poker'),
        shortLabel: t('common.pokerShort'),
        icon: '/images/common/menu/poker/poker.svg',
        homeId: HomeListId.POKER,
        promotion: '',
        children: [
          {
            name: t('common.ybPoker'),
            label: 'OP GAMES',
            gameId: 38,
            cardImage: '/images/common/menu/poker/op.png',
            icon: '/images/common/menu/poker/op.svg',
          },
          {
            name: t('common.dayunPoker'),
            label: 'DY GAMES',
            gameId: 55,
            cardImage: '/images/common/menu/poker/dy.png',
            icon: '/images/common/menu/poker/dy.svg',
          },
          {
            name: t('common.kyPoker'),
            label: 'KY GAMES',
            gameId: 18,
            cardImage: '/images/common/menu/poker/ky.png',
            icon: '/images/common/menu/poker/ky.svg',
          },
          {
            name: t('common.byPoker'),
            label: 'BY GAMES',
            gameId: 74,
            cardImage: '/images/common/menu/poker/by.png',
            icon: '/images/common/menu/poker/by.svg',
          },
          {
            name: t('common.yyPoker'),
            label: 'YY GAMES',
            gameId: 118,
            cardImage: '/images/common/menu/poker/yy.png',
            icon: '/images/common/menu/poker/yy.svg',
          },
        ],
      },

      {
        label: t('common.lottery'),
        shortLabel: t('common.lotteryShort'),
        icon: '/images/common/menu/lottery/lottery.svg',
        homeId: HomeListId.LOTTERY,
        promotion: '',
        children: [
          {
            name: t('common.ybLottery'),
            label: 'OP LOTTERY',
            gameId: 83,
            cardImage: '/images/common/menu/lottery/op.png',
            icon: '/images/common/menu/lottery/op.svg',
          },
          {
            name: t('common.btcLottery'),
            label: 'BTC INDEX',
            gameId: 110,
            cardImage: '/images/common/menu/lottery/btc.png',
            icon: '/images/common/menu/lottery/btc.svg',
          },
          {
            name: t('common.syLottery'),
            label: 'SY LOTTERY',
            gameId: 71,
            cardImage: '/images/common/menu/lottery/sy.png',
            icon: '/images/common/menu/lottery/sy.svg',
          },
          // {
          //   name: t('common.vrLottery'),
          //   label: 'VR LOTTERY',
          //   gameId: 16,
          //   cardImage: '/images/common/menu/lottery/vr.png',
          //   icon: '/images/common/menu/lottery/vr.svg',
          // },
          {
            name: t('common.tcLottery'),
            label: 'TC LOTTERY',
            gameId: 63,
            cardImage: '/images/common/menu/lottery/tc.png',
            icon: '/images/common/menu/lottery/tc.svg',
          },
        ],
      },
    ],
    [t],
  );
  const filteredList = useMemo(() => {
    const baseMerged = filterListData(homeList, baseList);

    if (!infoSlideList.length) return baseMerged;

    // 接口 infoType 与首页分类映射（来自接口返回结构）
    const infoTypeByHomeId: Record<number, string> = {
      [HomeListId.LIVE]: '1',
      [HomeListId.SPORTS]: '2',
      [HomeListId.SLOTS]: '3',
      [HomeListId.LOTTERY]: '4',
      [HomeListId.POKER]: '5',
      [HomeListId.ESPORTS]: '6',
    };

    const groupedByInfoType = infoSlideList.reduce<Record<string, typeof infoSlideList>>(
      (acc, item) => {
        const key = String(item.infoType ?? '').trim();
        if (!key) return acc;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      },
      {},
    );

    const textListByInfoType = Object.entries(groupedByInfoType).reduce<Record<string, string[]>>(
      (acc, [infoType, list]) => {
        const sorted = [...list].sort((a, b) => Number(a.sort ?? 999) - Number(b.sort ?? 999));
        const textList = sorted
          .map((item) => String(item.content ?? item.title ?? '').trim())
          .filter(Boolean)
          .map((text) => text.replace(/<[^>]+>/g, ''));
        if (textList.length > 0) acc[infoType] = textList;
        return acc;
      },
      {},
    );

    if (Object.keys(textListByInfoType).length === 0) return baseMerged;

    return baseMerged.map((item) => {
      const infoKey = infoTypeByHomeId[item.homeId] ?? String(item.homeId);
      const promotionList = textListByInfoType[infoKey] ?? [];
      return {
        ...item,
        promotion: promotionList[0] ?? item.promotion,
        promotionList:
          promotionList.length > 0 ? promotionList : item.promotion ? [item.promotion] : [],
      };
    });
  }, [homeList, baseList, infoSlideList]);
  return { homeList: filteredList };
};
/**
 * 过滤并合并数据
 * - 以接口 `/api/website/home/list` 的 childList 为准：接口未返回的场馆不展示
 * - 本地 baseList 仅补充展示用字段（icon / cardImage / path / 文案名）
 * @param data 原始数据（HomeListResponse[]）
 * @param data1 需要过滤的数据（BaseList[]）
 * @returns 合并后的 BaseList 数组（children 中包含了 HomeListResponse 的 childList 属性）
 */
const filterListData = (
  data: HomeListResponse[],
  data1: Array<BaseList>,
): Array<MergedBaseList> => {
  const arr: Array<MergedBaseList> = [];
  const resDataMap: Record<number, HomeListResponse['childList']> = {};

  data.map((item: HomeListResponse) => {
    resDataMap[item.homeId] = item.childList;
  });

  data1.map((i: BaseList) => {
    if (!!resDataMap[i.homeId]) {
      const apiChildren = resDataMap[i.homeId] ?? [];
      const newList = i.children
        .map((k: BaseList['children'][number]) => {
          const mat = apiChildren.find(
            (k2: HomeListResponse['childList'][number]) => k.gameId === k2.gameId,
          );
          // 接口未返回该场馆 → 不展示
          if (!mat) return null;
          mat.name = k.name;
          return Object.assign({}, k, mat);
        })
        .filter((item): item is NonNullable<typeof item> => item != null);

      arr.push({
        ...i,
        children: newList,
      });
    }
  });

  return arr;
};

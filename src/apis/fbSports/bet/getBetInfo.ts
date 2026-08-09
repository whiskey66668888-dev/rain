import { TbetData, TParlayItem } from '@/apis/commonSports/types';
import { EFbSelectionType } from '../common/constants/selectionType';
import {
  EFbInPlayEnum,
  EFbMarketCurtSaleStatusEnum,
  EFbOddsFormatType,
} from '../common/constants/enum';
import { buildParlayList } from '@/utils/bet/parlay';
import { EOddsChange, EOddsStatus } from '@/apis/commonSports/constants';
import {
  getBatchBetMatchMarketOfJumpLineFb,
  type LatestBetDataParams,
  type TBetDataMatchMarketItem,
} from './batchBetMatchMarketOfJumpLine';

interface TFormatResponse {
  newBetData: TbetData;
  newParlayList: TParlayItem[] | null;
}

// 批量获取跳线盘口最新投注数据
export const getBetInfoFb = async (params: {
  isParlay: boolean;
  betData: TbetData;
}): Promise<TFormatResponse | null> => {
  const { isParlay, betData } = params;
  const params1: LatestBetDataParams = {
    betMatchMarketList: Object.values(betData.entities).map((item) => {
      const newItem: TBetDataMatchMarketItem = {
        marketId: +item.marketId,
        matchId: +item.matchId,
        oddsType: EFbOddsFormatType.Europe,
        type: item.fb?.ty as EFbSelectionType,
      };
      return newItem;
    }),
    isSelectSeries: isParlay,
    // currencyId: 1,
  };

  const [res1] = await Promise.allSettled([getBatchBetMatchMarketOfJumpLineFb(params1)]);

  let newBetData: TbetData | null = null;
  let newParlayList: TParlayItem[] | null = null;

  if (res1.status === 'fulfilled' && res1.value.success && res1.value.data) {
    const newIds = [...betData.ids];
    const newEntities: TbetData['entities'] = {};
    const { bms, sos } = res1.value.data;
    Object.values(betData.entities).forEach((bItem) => {
      const findItem = bms.find((bm) => {
        if (bm.ss === EFbMarketCurtSaleStatusEnum.Closed) {
          return `${bm.mid}` === bItem.marketId;
        }
        return `${bm.omid ?? bm.mid}_${bm.op.ty}` === bItem.betItemId;
      });
      if (findItem) {
        if (findItem.ss === EFbMarketCurtSaleStatusEnum.Closed) {
          newEntities[bItem.betItemId] = {
            ...bItem,
            oddsStatus: EOddsStatus.Closed,
          };
          return;
        }

        let oddsChange = EOddsChange.None;
        if (findItem.op.od > 0 && bItem.baseOdds > 0) {
          if (findItem.op.od > bItem.baseOdds) {
            oddsChange = EOddsChange.Up;
          } else if (findItem.op.od < bItem.baseOdds) {
            oddsChange = EOddsChange.Down;
          }
        }

        let marketValueChange = false;
        let newBetItemId = bItem.betItemId;
        // 如果新的投注项信息中包含 omid ，说明经历了一次 marketId 变更
        if (`${findItem.omid}` === bItem.marketId) {
          marketValueChange = true;
          newBetItemId = `${findItem.mid}_${findItem.op.ty}`;
          // 在 ids 数组中找到旧 ID 的位置，替换为新 ID，保持顺序不变
          const oldIndex = newIds.indexOf(bItem.betItemId);
          if (oldIndex !== -1) {
            newIds[oldIndex] = newBetItemId;
          }
        }

        let score = '';
        if (findItem.re) {
          score = findItem.re;
        } else if (findItem.scs) {
          const [h, a] = findItem.scs;
          if (h !== undefined && a !== undefined) {
            score = `${h}-${a}`;
          }
        }

        newEntities[newBetItemId] = {
          ...bItem,
          betItemId: newBetItemId,
          oddsStatus: findItem.ss === EFbMarketCurtSaleStatusEnum.Suspended ? 2 : 1,
          marketId: `${findItem.mid}`,
          baseOdds: findItem.op.od,
          marketValue: findItem.op.li ?? '',
          minBet: findItem.smin,
          maxBet: findItem.smax,
          oddsChange,
          betItemFullName: findItem.op.nm,
          isLive: findItem.ip === EFbInPlayEnum.Yes,
          score,
          marketValueChange,
          isNewlyAdded: false,
          ...(!!findItem.omid && {
            relatedIds: _.uniq([...(bItem.relatedIds ?? []), `${findItem.omid}_${findItem.op.ty}`]),
          }),
        };
      } else {
        newEntities[bItem.betItemId] = bItem;
      }
    });
    newBetData = {
      ids: newIds,
      entities: newEntities,
    };
    if (isParlay && sos && sos.length > 0) {
      newParlayList = buildParlayList(Object.values(newBetData.entities));
      const minMaxMap: Record<string, { min: number; max: number }> = {};
      for (const sosItem of sos) {
        const key = sosItem.sn ? `${sosItem.sn}001` : `${bms.length}00${sosItem.in}`;
        minMaxMap[key] = {
          min: sosItem.mi,
          max: sosItem.mx,
        };
      }
      newParlayList = newParlayList?.map((item) => {
        return {
          ...item,
          minBet: minMaxMap[item.parlayCode]?.min ?? 0,
          maxBet: minMaxMap[item.parlayCode]?.max ?? 0,
        };
      });
    }
  }

  return newBetData
    ? {
        newBetData,
        newParlayList,
      }
    : null;
};

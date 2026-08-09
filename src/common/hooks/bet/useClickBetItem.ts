import { MatchBaseInfo, TBetItem, TBaseBetItem } from '@/apis/commonSports/types';
import { useAppDispatch } from '@/core/store/hooks';
import { EBetStep, EBetType, ESportsLeftPanelType } from '@/apis/commonSports/constants';
import { useCallback } from 'react';
import {
  addToParlay,
  addToSingle,
  clearBetData,
  removeFromParlay,
  removeFromSingle,
  setBetType,
  setShowBetDrawer,
} from '@/core/store/slices/betSlice';
import { toast } from '@/common/components/Toast';
import { getGlobalStoreForApiRequest } from '@/core/store/util';
import { setSportsLeftPanelType } from '@/core/store/slices/sportSlice';
import { blockAgentVenueAccess } from '@/common/utils/openAgentVenueBlockedModal';

type TBaseMatch = Pick<
  MatchBaseInfo,
  | 'matchId'
  | 'sportId'
  | 'leagueId'
  | 'leagueName'
  | 'homeName'
  | 'awayName'
  | 'isLive'
  | 'isChampion'
  | 'bt'
>;

export type TClickBetItemPayload = {
  baseMatch: TBaseMatch;
  baseBetItem: TBaseBetItem;
};

export const useClickBetItem = () => {
  const dispatch = useAppDispatch();

  const clickBetItem = useCallback(
    ({ baseMatch, baseBetItem }: TClickBetItemPayload) => {
      if (!baseMatch || !baseBetItem) return;

      const store = getGlobalStoreForApiRequest().getState();
      if (!blockAgentVenueAccess(store.user.memberInfo, '当前账号暂不支持进行投注')) {
        return;
      }
      const venue = store.sport.venue;
      const venueBetStore = store.bet[venue];
      const singleBetData = venueBetStore.singleBetData;
      const parlayBetData = venueBetStore.parlayBetData;
      const defaultAmount = venueBetStore.defaultAmount;
      const isParlay = venueBetStore.betType === EBetType.Parlay;
      const showBetDrawer = venueBetStore.showBetDrawer;
      const betStep = venueBetStore.betStep;
      const syncSingleParlay = !!store.sport.syncSingleParlay;
      const isMobile = store.config.isMobile;

      if (betStep === EBetStep.Fetching) {
        toast({ description: '请勿频繁下注', type: 'warning' });
        return;
      }

      // 轮询或确认中状态，清空投注数据，添加新投注项
      const isShowOrdersPanel = [EBetStep.Polling, EBetStep.Confirmed].includes(betStep);
      if (isShowOrdersPanel) {
        dispatch(clearBetData({ venue }));
      }

      let betAmount = '';
      if (isMobile && !!defaultAmount && !isParlay) {
        betAmount = defaultAmount;
      }

      const { sportId, matchId, leagueId, leagueName, homeName, awayName, isLive, isChampion, bt } =
        baseMatch;
      const newBet: TBetItem = {
        sportId: sportId + '',
        matchId: matchId + '',
        leagueId,
        leagueName,
        homeName,
        awayName,
        isLive,
        isChampion,
        matchStartTime: bt,
        ...baseBetItem,
        score: '',
        minBet: 0,
        maxBet: 0,
        betAmount,
        isNewlyAdded: true,
      };

      // 1=添加, -1=移除, 10=达上限, 0=未操作
      let singleStatus = 0;
      // 1=添加, -1=移除, 10=达上限, 2=不支持串关, 0=未操作
      let parlayStatus = 0;

      // 特殊情况（case 17 / case 15）：
      // 串关 tab 且串关列表为空，点击不支持串关的投注项 → 自动切换单关 tab，按单关逻辑处理
      let finallyIsParlay = isParlay;
      if (
        !isShowOrdersPanel &&
        finallyIsParlay &&
        singleBetData.ids.length === 0 &&
        parlayBetData.ids.length === 0 &&
        !newBet.canParlay
      ) {
        dispatch(setBetType({ venue, betType: EBetType.Single }));
        parlayStatus = 2;
        finallyIsParlay = false;
      }

      if (isShowOrdersPanel) {
        // #region 当前为投注结果界面
        // 清空后直接添加（不需要判断已存在 / 替换逻辑）
        // 单关：非串关 tab，或 同步开启且支持串关
        if (!finallyIsParlay || (syncSingleParlay && newBet.canParlay)) {
          dispatch(addToSingle({ venue, betItem: newBet }));
          singleStatus = 1;
        }
        // 串关：串关 tab，或 同步开启且支持串关
        if (newBet.canParlay && (finallyIsParlay || syncSingleParlay)) {
          dispatch(addToParlay({ venue, betItem: newBet }));
          parlayStatus = 1;
        } else if (finallyIsParlay && !newBet.canParlay) {
          parlayStatus = 2;
        }
        // #endregion
      } else {
        if (finallyIsParlay) {
          // #region 当前为串关tab
          // 如果是串关，先尝试添加串关
          if (newBet.canParlay) {
            // 支持串关

            // 是否已存在
            const isExistParlay = parlayBetData.ids.includes(newBet.betItemId);
            if (isExistParlay) {
              // 已存在则执行删除
              dispatch(removeFromParlay({ venue, betItemId: newBet.betItemId, syncSingleParlay }));
              parlayStatus = -1;
            } else {
              // 是否存在同比赛投注项
              const sameMatchParlayItem = _.find(
                parlayBetData.entities,
                (b) => b && b.matchId === newBet.matchId,
              );
              if (sameMatchParlayItem) {
                // 若存在，则替换掉
                dispatch(
                  removeFromParlay({
                    venue,
                    betItemId: sameMatchParlayItem.betItemId,
                    syncSingleParlay,
                  }),
                );
                dispatch(addToParlay({ venue, betItem: newBet }));
                parlayStatus = 1;
              } else if (parlayBetData.ids.length > 9) {
                // 串关已满
                parlayStatus = 10;
              } else {
                // 正常添加
                dispatch(addToParlay({ venue, betItem: newBet }));
                parlayStatus = 1;
              }
            }

            // 判断是否开启单串同步
            if (syncSingleParlay) {
              // 若开启单串同步，并且串关添加结果为成功
              if (parlayStatus === 1) {
                // 尝试添加单关
                // 是否已存在
                const isExistSingle = singleBetData.ids.includes(newBet.betItemId);
                if (isExistSingle) {
                  // 如果已存在，不执行任何操作
                } else {
                  const samePlaySingleItem = _.find(
                    singleBetData.entities,
                    (b) => b && b.matchId === newBet.matchId && b.playId === newBet.playId,
                  );
                  if (samePlaySingleItem) {
                    // 如果存在同玩法投注项，进行替换
                    dispatch(
                      removeFromSingle({
                        venue,
                        betItemId: samePlaySingleItem.betItemId,
                        syncSingleParlay: false,
                      }),
                    );
                    dispatch(addToSingle({ venue, betItem: newBet }));
                    singleStatus = 1;
                  } else if (singleBetData.ids.length > 9) {
                    // 这里是顺带添加，如果单关满了。也不做提示，直接跳过
                  } else {
                    // 正常添加
                    dispatch(addToSingle({ venue, betItem: newBet }));
                    singleStatus = 1;
                  }
                }
              }
            }
          } else {
            // 不支持串关
            parlayStatus = 2;
          }
          // #endregion
        } else {
          // #region 当前为单关tab
          // 如果是单关，先尝试添加单关
          // 单关操作
          const isExistSingle = singleBetData.ids.includes(newBet.betItemId);
          if (isExistSingle) {
            dispatch(removeFromSingle({ venue, betItemId: newBet.betItemId, syncSingleParlay }));
            singleStatus = -1;
          } else {
            const samePlaySingleItem = _.find(
              singleBetData.entities,
              (b) => b && b.matchId === newBet.matchId && b.playId === newBet.playId,
            );
            if (samePlaySingleItem) {
              dispatch(
                removeFromSingle({
                  venue,
                  betItemId: samePlaySingleItem.betItemId,
                  syncSingleParlay,
                }),
              );
              dispatch(addToSingle({ venue, betItem: newBet }));
              singleStatus = 1;
            } else if (singleBetData.ids.length > 9) {
              singleStatus = 10;
            } else {
              dispatch(addToSingle({ venue, betItem: newBet }));
              singleStatus = 1;
            }
          }

          // 若开启单串同步
          if (syncSingleParlay) {
            if (newBet.canParlay) {
              // 若单关添加成功，才考虑串关添加的动作
              if (singleStatus === 1) {
                const isExistParlay = parlayBetData.ids.includes(newBet.betItemId);
                if (isExistParlay) {
                  // 这里虽存在，但因为是顺带添加，不做任何处理
                } else {
                  const sameMatchParlayItem = _.find(
                    parlayBetData.entities,
                    (b) => b && b.matchId === newBet.matchId,
                  );
                  if (sameMatchParlayItem) {
                    // 若存在同比赛的投注项，进行替换
                    dispatch(
                      removeFromParlay({
                        venue,
                        betItemId: sameMatchParlayItem.betItemId,
                        syncSingleParlay: false,
                      }),
                    );
                    dispatch(addToParlay({ venue, betItem: newBet }));
                    parlayStatus = 1;
                  } else if (parlayBetData.ids.length > 9) {
                    // 串关已满，静默跳过（case 00：单关+1，串关不变，无 toast）
                  } else {
                    dispatch(addToParlay({ venue, betItem: newBet }));
                    parlayStatus = 1;
                  }
                }
              }
            } else {
              // 如果不支持串关，因为这里是顺带添加，也不做记录和提示了
            }
          }
          // #endregion
        }
      }

      // ---- 不论是否开启单串：toast 提示 ----
      // 只在当前 tab 的主动作出现问题时提示，同步副动作失败静默跳过
      if (parlayStatus === 2) {
        toast({ description: '该场不支持串关', type: 'warning' });
      } else if (finallyIsParlay && parlayStatus === 10) {
        toast({ description: '串关已达上限', type: 'warning' });
      } else if (!finallyIsParlay && singleStatus === 10) {
        toast({ description: '单关已达上限', type: 'warning' });
      }

      // ---- 不论是否开启单串：投注面板展示 ----
      if (isMobile) {
        // H5：非串关 tab 且单关添加成功时弹起投注面板
        if (!showBetDrawer && !finallyIsParlay && singleStatus === 1) {
          dispatch(setShowBetDrawer({ venue, showBetDrawer: true }));
        }
      } else {
        if ((finallyIsParlay && parlayStatus === 1) || (!finallyIsParlay && singleStatus === 1)) {
          dispatch(setShowBetDrawer({ venue, showBetDrawer: true }));
          dispatch(setSportsLeftPanelType(ESportsLeftPanelType.ORDER_CART));
        }
      }
    },
    [dispatch],
  );

  return { clickBetItem };
};

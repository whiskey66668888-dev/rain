import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PATHS } from '@/sites/op7/routes/paths';
import {
  EPopupMessageType,
  EPopupWindowKey,
  getPopupChannelName,
  windowManager,
  type PopupMessage,
} from '@/common/hooks/popupWindows/windowManager';
import { EBetHistoryQueryType } from '@/apis/commonSports/constants';
import { useGoMatchDetail } from '@/sites/op7/hooks/useGoMatchDetail';
import { useAppSelector } from '@/core/store/hooks';

export function usePopupWindowConnect() {
  useEffect(() => {
    windowManager.reconnectAll();
  }, []);
}

/**
 * 主窗口侧的注单弹窗桥接（双向），在 App 根组件挂载一次即可：
 * - 收：弹窗点击赛事 → 在主窗口跳转赛事详情；
 * - 发：主窗口切换场馆 → 通知弹窗同步场馆（弹窗是独立窗口、独立 redux，收不到 store 变更）。
 * 仅在主窗口（无 opener）生效；子窗口自身也会收到自己的广播，但不处理，避免回环与误跳转。
 */
export function useBetHistoryPopupBridge() {
  const goMatchDetail = useGoMatchDetail();
  const venue = useAppSelector((state) => state.sport.venue);

  useEffect(() => {
    if (window.opener !== null) return;

    const channel = new BroadcastChannel(getPopupChannelName(EPopupWindowKey.BetHistory));
    channel.onmessage = (event) => {
      const msg = event.data as PopupMessage | string;
      if (typeof msg !== 'object' || msg === null) return; // 忽略心跳 ping/pong 字符串
      if (msg.type === EPopupMessageType.GoMatchDetail) {
        goMatchDetail(msg.matchId, { isChampion: msg.isChampion });
      }
    };

    return () => channel.close();
  }, [goMatchDetail]);

  // 场馆变化广播给弹窗；弹窗未打开时无人接收，广播本身无副作用，故不额外判存活
  useEffect(() => {
    if (window.opener !== null) return;
    windowManager.send<PopupMessage>(EPopupWindowKey.BetHistory, {
      type: EPopupMessageType.SwitchVenue,
      venue,
    });
  }, [venue]);
}

/**
 * 封装所有需要以弹出窗口打开的页面入口。
 * 新增窗口类型时，在这里补一个 open 方法即可。
 */
export function usePopupWindows() {
  const { i18n } = useTranslation();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const lang = i18n.language;
  const venue = useAppSelector((state) => state.sport.venue);

  /**
   * 弹窗是独立窗口、独立 redux（默认场馆 FB），必须由 URL 告知当前场馆，
   * 否则在 EB 场馆点开注单历史会展示 OP 的注单。之后主窗口切场馆走 SwitchVenue 广播。
   */
  const openBetHistoryWindow = useCallback(
    (queryType?: EBetHistoryQueryType) => {
      const search = new URLSearchParams({ venue });
      if (queryType) {
        search.set('queryType', String(queryType));
      }
      const url = `${origin}/${lang}${PATHS.betHistoryPc}?${search.toString()}`;
      windowManager.open(EPopupWindowKey.BetHistory, url);
    },
    [origin, lang, venue],
  );

  const openSportsPageWindow = useCallback(
    (path: string, extraSearchParams?: URLSearchParams) => {
      const queryString = extraSearchParams?.toString();
      const url = `${origin}/${lang}${path}${queryString ? `?${queryString}` : ''}`;
      windowManager.open(EPopupWindowKey.SportsPopup, url);
    },
    [origin, lang],
  );

  const openResultWindow = useCallback(() => {
    openSportsPageWindow(PATHS.result);
  }, [openSportsPageWindow]);

  const openSportsRulesWindow = useCallback(
    (questionId: number) => {
      openSportsPageWindow(
        PATHS.sportsRulesPc,
        new URLSearchParams({ questionId: String(questionId) }),
      );
    },
    [openSportsPageWindow],
  );

  const openBettingTutorialWindow = useCallback(
    (questionId: number) => {
      openSportsPageWindow(
        PATHS.bettingTutorialPc,
        new URLSearchParams({ questionId: String(questionId) }),
      );
    },
    [openSportsPageWindow],
  );

  return {
    openBetHistoryWindow,
    openResultWindow,
    openSportsRulesWindow,
    openBettingTutorialWindow,
  };
}

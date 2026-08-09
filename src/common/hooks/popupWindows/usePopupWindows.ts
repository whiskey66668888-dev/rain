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

export function usePopupWindowConnect() {
  useEffect(() => {
    windowManager.reconnectAll();
  }, []);
}

/**
 * 主窗口侧：监听注单弹窗（子窗口）发来的业务消息并执行跳转。
 * 仅在主窗口（无 opener）生效；子窗口自身也会收到广播，但不处理，避免在弹窗内误跳转。
 * 在 App 根组件挂载一次即可。
 */
export function useBetHistoryPopupBridge() {
  const goMatchDetail = useGoMatchDetail();

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
}

/**
 * 封装所有需要以弹出窗口打开的页面入口。
 * 新增窗口类型时，在这里补一个 open 方法即可。
 */
export function usePopupWindows() {
  const { i18n } = useTranslation();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const lang = i18n.language;

  const openBetHistoryWindow = useCallback(
    (queryType?: EBetHistoryQueryType) => {
      let url = `${origin}/${lang}${PATHS.betHistoryPc}`;
      if (queryType) {
        url += `?queryType=${queryType}`;
      }
      windowManager.open(EPopupWindowKey.BetHistory, url);
    },
    [origin, lang],
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

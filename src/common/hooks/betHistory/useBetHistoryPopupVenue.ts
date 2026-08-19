import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EVenue } from '@/apis/commonSports/constants';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { setVenue } from '@/core/store/slices/sportSlice';
import { usePopupChannel } from '@/common/hooks/popupWindows/usePopupChannel';
import {
  EPopupMessageType,
  EPopupWindowKey,
  getPopupChannelName,
  type PopupMessage,
} from '@/common/hooks/popupWindows/windowManager';

/** URL 上的 venue 参数，非法值按「未指定」处理 */
export const parseVenueParam = (raw: string | null): EVenue | null => {
  return raw === EVenue.FB || raw === EVenue.OB ? raw : null;
};

/**
 * 注单历史弹窗（PC 独立窗口）的场馆同步。
 *
 * 弹窗有自己的 redux，默认场馆是 FB，主窗口的 store 变更传不过来，
 * 因此场馆靠 URL + BroadcastChannel 两条路维持一致：
 * - 打开/刷新：用 URL 上的 venue 还原场馆（主窗口打开弹窗时已带上）；
 * - 运行中：主窗口切场馆广播 SwitchVenue，弹窗跟着切并回写 URL，刷新后仍是同一场馆。
 *
 * 顺带承担弹窗侧的心跳应答（usePopupChannel 内部处理 ping/pong），
 * 故弹窗页面不需要再单独调 usePopupChannel。
 */
export const useBetHistoryPopupVenue = () => {
  const dispatch = useAppDispatch();
  const activeVenue = useAppSelector((state) => state.sport.venue);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleMessage = useCallback(
    (msg: PopupMessage | string) => {
      if (typeof msg !== 'object' || msg === null) return;
      if (msg.type !== EPopupMessageType.SwitchVenue) return;
      dispatch(setVenue(msg.venue));
    },
    [dispatch],
  );

  usePopupChannel<PopupMessage | string>(
    getPopupChannelName(EPopupWindowKey.BetHistory),
    handleMessage,
  );

  /** 首帧只做「URL → store」的还原，避免用默认场馆把 URL 覆写掉 */
  const restoredRef = useRef(false);

  useEffect(() => {
    const urlVenue = parseVenueParam(searchParams.get('venue'));

    if (!restoredRef.current) {
      restoredRef.current = true;
      if (urlVenue && urlVenue !== activeVenue) {
        dispatch(setVenue(urlVenue));
        return;
      }
    }

    if (urlVenue === activeVenue) return;
    const next = new URLSearchParams(searchParams);
    next.set('venue', activeVenue);
    setSearchParams(next, { replace: true });
  }, [activeVenue, dispatch, searchParams, setSearchParams]);
};

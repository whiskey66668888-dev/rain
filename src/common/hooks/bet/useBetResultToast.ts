import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { useEffect, useRef } from 'react';
import { useNavigateWithLanguage } from '../useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import { popBetResultTip } from '@/core/store/slices/betSlice';
import { toast } from '@/common/components/Toast';
import { EBetHistoryQueryType } from '@/apis/commonSports/constants';
import { usePopupWindows } from '../popupWindows/usePopupWindows';

const DISPLAY_TIME = 5000;

export const useBetResultToast = () => {
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const betResultTips = useAppSelector((state) => state.bet[state.sport.venue].betResultTips);
  const venue = useAppSelector((state) => state.sport.venue);
  const dispatch = useAppDispatch();
  const navigate = useNavigateWithLanguage();
  const { openBetHistoryWindow } = usePopupWindows();
  const displayedTipIdRef = useRef<string | null>(null);

  const currentTip = betResultTips.length > 0 ? betResultTips[0] : null;

  useEffect(() => {
    if (!currentTip) {
      displayedTipIdRef.current = null;
      return;
    }
    if (displayedTipIdRef.current === currentTip.id) return;
    displayedTipIdRef.current = currentTip.id;

    toast({
      type: currentTip.success ? 'success' : 'error',
      title: currentTip.success ? '投注成功' : '投注失败',
      description: currentTip.message,
      action: () => {
        if (isMobile) {
          navigate(
            `${PATHS.betHistoryH5}?queryType=${currentTip.success ? EBetHistoryQueryType.UNSETTLED : EBetHistoryQueryType.SETTLED}`,
          );
        } else {
          openBetHistoryWindow();
        }
      },
      actionLabel: '查看详情',
      showProgress: true,
      duration: DISPLAY_TIME - 300,
    });
    const timer = setTimeout(() => {
      dispatch(popBetResultTip({ venue }));
    }, DISPLAY_TIME);
    return () => clearTimeout(timer);
  }, [currentTip, venue, dispatch, navigate, isMobile, openBetHistoryWindow]);
};

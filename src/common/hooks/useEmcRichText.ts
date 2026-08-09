import { useCallback, useMemo, type MouseEvent } from 'react';

import { useOpenDiscountActivity } from '@/common/hooks/useOpenDiscountActivity';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { setMessageCenterVisible, setMsgEditorData } from '@/core/store/slices/messageCenterSlice';
import type { FormatMessageRichTextOptions } from '@/utils';

/** EMC 富文本：识别活动链接 + 处理点击（H5 内跳并关弹窗，PC 新标签打开） */
export const useEmcRichText = (onClose?: () => void) => {
  const dispatch = useAppDispatch();
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const { openDiscountDetail } = useOpenDiscountActivity();

  const richTextOptions = useMemo<FormatMessageRichTextOptions>(
    () => ({
      isMobile,
    }),
    [isMobile],
  );

  const onRichTextClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const anchor = (event.target as HTMLElement).closest('a[data-emc-link]');
      if (!anchor) return;

      event.preventDefault();
      event.stopPropagation();

      const activityId = anchor.getAttribute('data-activity-id');
      if (!activityId) return;

      if (isMobile) {
        dispatch(setMessageCenterVisible({ visible: false }));
        dispatch(setMsgEditorData({ visible: false }));
        onClose?.();
      }

      openDiscountDetail(activityId);
    },
    [dispatch, isMobile, onClose, openDiscountDetail],
  );

  return { richTextOptions, onRichTextClick };
};

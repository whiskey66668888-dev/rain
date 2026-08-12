import { useEffect } from 'react';

import { useAppDispatch } from '@/core/store/hooks';
import { setScreenBreakpoint } from '@/core/store/slices/configSlice';
import { BREAKPOINT_MEDIA_QUERIES } from '@/utils/constants/breakpoints';

/**
 * 监听屏幕断点（媒体查询），与 uno.config breakpoints 一致
 * 只在跨越断点时更新 Redux，不监听 resize 像素变化
 */
export function useScreenBreakpoint(): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const mediaQueryLists = BREAKPOINT_MEDIA_QUERIES.map(({ query }) => window.matchMedia(query));

    const updateBreakpoint = () => {
      // 从大到小找第一个匹配的断点
      for (let i = 0; i < BREAKPOINT_MEDIA_QUERIES.length; i++) {
        const entry = BREAKPOINT_MEDIA_QUERIES[i];
        const mql = mediaQueryLists[i];
        if (entry != null && mql?.matches) {
          dispatch(setScreenBreakpoint(entry.bp));
          return;
        }
      }
      dispatch(setScreenBreakpoint('md'));
    };

    updateBreakpoint();

    const handleChange = () => updateBreakpoint();

    mediaQueryLists.forEach((mql) => {
      if (mql.addEventListener) {
        mql.addEventListener('change', handleChange);
      } else {
        (mql as MediaQueryList & { addListener: (cb: () => void) => void }).addListener(
          handleChange,
        );
      }
    });

    return () => {
      mediaQueryLists.forEach((mql) => {
        if (mql.removeEventListener) {
          mql.removeEventListener('change', handleChange);
        } else {
          (mql as MediaQueryList & { removeListener: (cb: () => void) => void }).removeListener(
            handleChange,
          );
        }
      });
    };
  }, [dispatch]);
}

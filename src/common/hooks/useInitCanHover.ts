import { useEffect } from 'react';

import { useAppDispatch } from '@/core/store/hooks';
import { setCanHover } from '@/core/store/slices/configSlice';
import { checkCanHover } from '@/utils';

/**
 * 初始化 canHover 检测
 * 在应用入口处调用一次，检测设备是否支持 hover 并存储到 Redux
 *
 * 此 hook 会自动监听输入设备的变化（如连接/断开鼠标），并更新 Redux 状态
 *
 * @example
 * ```tsx
 * const App: React.FC = () => {
 *   useInitCanHover();
 *   // ... 其他逻辑
 *   return <div>...</div>;
 * };
 * ```
 */
export function useInitCanHover(): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // 更新 canHover 状态和 HTML 属性的辅助函数
    const updateCanHover = (canHover: boolean) => {
      dispatch(setCanHover(canHover));
      // 设置 HTML 元素的 data-can-hover 属性
      document.documentElement.setAttribute('data-can-hover', canHover ? 'true' : 'false');
    };

    // 初始化时设置一次
    updateCanHover(checkCanHover());

    // 检测媒体查询：设备是否支持 hover 和精确指针（鼠标/触摸板）
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

    // 更新状态的回调函数
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      updateCanHover(event.matches);
    };

    // 监听媒体查询变化（例如：连接/断开鼠标）
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    } else {
      // 兼容旧版浏览器（使用 addListener/removeListener）
      mediaQuery.addListener(handleChange);
      return () => {
        mediaQuery.removeListener(handleChange);
      };
    }
  }, [dispatch]);
}

import { AnimatePresence, motion } from 'framer-motion';
import React, { useMemo } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';

/**
 * 动画变体类型
 */
export type TransitionVariant = 'slide' | 'fade';

/**
 * 动画配置类型
 */
interface TransitionConfig {
  initial: { opacity: number; x?: string };
  animate: { opacity: number; x?: number };
  exit: { opacity: number; x?: string };
  transition: {
    duration: number;
    ease: number[] | string;
  };
}

/**
 * 动画配置
 */
const transitionConfigs: Record<TransitionVariant, TransitionConfig> = {
  slide: {
    initial: { opacity: 0, x: '100%' },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: '-100%' },
    transition: {
      duration: 0.3,
      ease: [0.3, 0.6, 0.8, 1],
    },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
};

/**
 * 页面切换动画组件
 * @param variant - 动画类型：'slide' 滑动效果，'fade' 淡入淡出效果
 * @param level - 路由层级，用于只响应对应层级的变化。例如：RootPage 使用 2（语言+二级路由），UserPage 使用 3（语言+user+三级路由）
 */
export const PageTransition: React.FC<{
  variant?: TransitionVariant;
  level?: number;
  className?: string;
}> = ({ variant = 'slide', level, className }) => {
  const location = useLocation();
  const outlet = useOutlet();
  const config = transitionConfigs[variant];

  // 根据 level 计算 key，只取前 level 个路径段
  const routeKey = useMemo(() => {
    if (!level) {
      // 如果没有指定 level，使用完整路径
      return location.pathname;
    }

    const segments = location.pathname.split('/').filter(Boolean);
    // 只取前 level 个路径段
    const keySegments = segments.slice(0, level);
    return `/${keySegments.join('/')}`;
  }, [location.pathname, level]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={routeKey}
        initial={config.initial}
        animate={config.animate}
        exit={config.exit}
        transition={config.transition}
        className={className}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
};

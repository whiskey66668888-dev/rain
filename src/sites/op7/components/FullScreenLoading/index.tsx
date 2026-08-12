import React, { useEffect } from 'react';
import Lottie from 'lottie-react';

import Overlay from '@/common/components/Overlay';
import { useAppSelector } from '@/core/store/hooks';
import loadingData from '@/sites/op7/images/common/lottie/blue_loading_op7.json';
import { zIndexMap } from '@/utils/constants/zIndex';

/** 动画画布 97×96，按宽度等比推高度 */
const ASPECT = 96 / 97;
/** 不传 width 时的默认动画宽度：h5 偏小，PC 适度收敛 */
const DEFAULT_WIDTH_MOBILE = 72;
const DEFAULT_WIDTH_PC = 72;

export interface FullScreenLoadingProps {
  show: boolean;
  /** 动画下方文案，不传则不占位 */
  text?: string;
  /** 动画宽度（px），高度按 97:96 等比；不传按端自适应 */
  width?: number;
}

/**
 * 全屏 Loading：品牌 lottie 动画 + 蒙层，拦截全部交互（蒙层无 close 回调，点不掉）。
 * 动画白天黑夜共用同一个 loading.json（主题蓝），不再按主题区分。
 *
 * 直接用 `<FullScreenLoading show />`；或用 loadingStore 的 showLoading/withLoading
 * 走全局单例（宿主已挂在 App，覆盖所有路由）。
 */
const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({ show, text, width }) => {
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const resolvedWidth = width ?? (isMobile ? DEFAULT_WIDTH_MOBILE : DEFAULT_WIDTH_PC);

  // Overlay 不锁滚动，但 loading 期间页面不该还能被滚走
  useEffect(() => {
    if (!show) return;
    const { body } = document;
    const prev = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      // 值仍是自己设的才还原，避免覆盖 loading 期间别处新加的锁
      if (body.style.overflow === 'hidden') body.style.overflow = prev;
    };
  }, [show]);

  return (
    <Overlay
      show={show}
      background="rgba(0, 0, 0, 0.1)"
      position="center"
      zIndex={zIndexMap.globalLoading}
      maskClickClose={false}
      bodyClassname="flex flex-col items-center"
    >
      <Lottie
        animationData={loadingData}
        autoplay
        loop
        rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
        style={{ width: resolvedWidth, height: Math.round(resolvedWidth * ASPECT) }}
      />
      {!!text && (
        <p className="mt-8px max-w-[70vw] text-center text-[13px] leading-[18px] text-white">
          {text}
        </p>
      )}
    </Overlay>
  );
};

export default FullScreenLoading;

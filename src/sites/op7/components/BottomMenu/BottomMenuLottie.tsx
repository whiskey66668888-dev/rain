import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

import Icon from '@/common/components/Icon';

const LOTTIE_LOADERS: Record<string, () => Promise<{ default: unknown }>> = {
  promotion: () => import('@/sites/op7/images/common/lottie/faxian.json'),
  entertainment: () => import('@/sites/op7/images/common/lottie/yule.json'),
  sports: () => import('@/sites/op7/images/common/lottie/tiyu.json'),
  betting: () => import('@/sites/op7/images/common/lottie/zhudan.json'),
  mine: () => import('@/sites/op7/images/common/lottie/wode.json'),
};

interface BottomMenuLottieProps {
  itemId: string;
  fallbackIcon?: string;
}

const BottomMenuLottie: React.FC<BottomMenuLottieProps> = ({ itemId, fallbackIcon }) => {
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    const load = LOTTIE_LOADERS[itemId];
    if (!load) return;
    let cancelled = false;
    void load().then((mod) => {
      if (!cancelled) setData(mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, [itemId]);

  if (!data) {
    return fallbackIcon ? (
      <Icon
        src={fallbackIcon}
        color="var(--Text-700)"
        style={{ width: '100%', height: '100%' }}
        draggable={false}
      />
    ) : null;
  }
  return (
    <Lottie animationData={data} autoplay loop={false} style={{ width: '100%', height: '100%' }} />
  );
};

export default BottomMenuLottie;

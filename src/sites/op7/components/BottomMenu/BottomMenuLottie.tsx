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

const lottieDataCache = new Map<string, Promise<unknown>>();

const loadBottomMenuLottieData = (itemId: string): Promise<unknown> | null => {
  const load = LOTTIE_LOADERS[itemId];
  if (!load) return null;

  let promise = lottieDataCache.get(itemId);
  if (!promise) {
    promise = load().then((mod) => mod.default);
    lottieDataCache.set(itemId, promise);
  }

  return promise;
};

export const prefetchBottomMenuLotties = (): Promise<void> => {
  const loaders = Object.keys(LOTTIE_LOADERS).reduce<Promise<unknown>[]>((list, itemId) => {
    const promise = loadBottomMenuLottieData(itemId);
    if (promise) list.push(promise);
    return list;
  }, []);

  return Promise.all(loaders).then(() => undefined);
};

interface BottomMenuLottieProps {
  itemId: string;
  fallbackIcon?: string;
}

const BottomMenuLottie: React.FC<BottomMenuLottieProps> = ({ itemId, fallbackIcon }) => {
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    const promise = loadBottomMenuLottieData(itemId);
    if (!promise) return;

    let cancelled = false;
    void promise.then((nextData) => {
      if (!cancelled) setData(nextData);
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

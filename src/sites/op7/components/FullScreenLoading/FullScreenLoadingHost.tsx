import React from 'react';

import FullScreenLoading from '.';
import { useFullScreenLoadingState } from './loadingStore';

/**
 * 全屏 Loading 宿主：全局挂载一次，由 loadingStore 驱动。
 * 任意位置调 showLoading / withLoading 即可弹出。
 */
const FullScreenLoadingHost: React.FC = () => {
  const { open, text, width } = useFullScreenLoadingState();
  return <FullScreenLoading show={open} text={text} width={width} />;
};

export default FullScreenLoadingHost;

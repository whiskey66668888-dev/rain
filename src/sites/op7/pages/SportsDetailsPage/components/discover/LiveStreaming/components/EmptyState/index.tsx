import React from 'react';

import Empty from '@/common/components/Empty';

/**
 * 篮球直播统一空态，复用全站 Empty 组件并控制在赛况面板高度内。
 */
const EmptyState: React.FC = () => (
  <Empty
    type="data"
    variant="card"
    className="h-[160px]"
    imgWrapClassName="w-[64px] h-[64px]"
    iconClassName="w-[30px] h-[30px]"
    textClassName="_tf[13]"
  />
);

export default EmptyState;

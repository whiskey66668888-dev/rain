/**
 * 空状态组件
 */

import React from 'react';
import { cn } from '@/utils';
import {
  EmptyDataSvg,
  EmptyActivitySvg,
  EmptyCollectionSvg,
  EmptyOddsSvg,
  EmptySearchResultSvg,
} from '@/sites/op7/components/SvgIcons';

type EmptyType = 'data' | 'activity' | 'save' | 'betting' | 'search';

const TYPE_CONFIG: Record<EmptyType, { icon: React.FC<{ className?: string }>; text: string }> = {
  data: { icon: EmptyDataSvg, text: '暂无数据' },
  activity: { icon: EmptyActivitySvg, text: '暂无活动' },
  save: { icon: EmptyCollectionSvg, text: '暂无收藏' },
  betting: { icon: EmptyOddsSvg, text: '盘口关闭' },
  search: { icon: EmptySearchResultSvg, text: '暂无搜索结果' },
};

const Empty: React.FC<{
  type?: EmptyType;
  /**
   *  - default → 放在页面主背景（--Background-700）上
   *  - card → 放在卡片/面板背景（--Background-300）上
   */
  variant?: 'default' | 'card';
  className?: string;
  text?: string;
  imgWrapClassName?: string;
  iconClassName?: string;
  textClassName?: string;
}> = ({
  className,
  text,
  imgWrapClassName,
  iconClassName,
  textClassName,
  type = 'data',
  variant = 'default',
}) => {
  const { icon: Icon, text: defaultText } = TYPE_CONFIG[type];
  const bgColor =
    variant === 'default' ? 'bg-[var(--Background-300)]' : 'bg-[var(--Background-500)]';
  const iconColor =
    variant === 'default' ? 'text-[var(--Background-900)]' : 'text-[var(--Text-700)]';

  return (
    <div
      className={cn(
        'w-full h-[500px] flex items-center justify-center flex-col gap-[12px]',
        className,
      )}
    >
      <div
        className={cn(
          'rounded-full p-[8px] w-[80px] h-[80px] flex items-center justify-center',
          bgColor,
          imgWrapClassName,
        )}
      >
        <Icon className={cn('w-[36px] h-[36px]', iconColor, iconClassName)} />
      </div>
      <div className={cn('text-center _tf[16] text-[var(--Text-700)]', textClassName)}>
        {text ?? defaultText}
      </div>
    </div>
  );
};

export default Empty;

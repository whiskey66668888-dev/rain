import React from 'react';

import { copyToClipboard } from '@/utils';
import { CopySvg } from '@/sites/op7/components/SvgIcons';
import { toast } from '@/common/components/Toast';
import { useMemoizedFn } from 'ahooks';
export interface CopyButtonProps {
  /** 要复制的文本 */
  text: string;
  /** 自定义内容，不传则默认展示 CopySvg */
  children?: React.ReactNode;
  className?: string;
  resultToast?: boolean;
  onCopySuccess?: () => void;
  onCopyError?: () => void;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  children,
  className = 'shrink-0 flex',
  resultToast = true,
  onCopySuccess,
  onCopyError,
}) => {
  const handleClick = useMemoizedFn(() => {
    copyToClipboard(text).then((ok) => {
      if (ok) {
        onCopySuccess?.();
        if (resultToast) {
          toast({
            title: '复制成功',
            type: 'success',
          });
        }
      } else {
        onCopyError?.();
        if (resultToast) {
          toast({
            title: '复制失败',
            type: 'error',
          });
        }
      }
    });
  });

  return (
    <button type="button" className={className} onClick={handleClick}>
      {children === undefined ? (
        <CopySvg className="h-14px w-14px text-[var(--ThemeColor-Main)]" />
      ) : (
        children
      )}
    </button>
  );
};

export default CopyButton;

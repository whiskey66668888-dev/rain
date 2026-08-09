import { type FC, type ReactNode } from 'react';
import clsx from 'clsx';

import LazyImage from '@/common/components/LazyImage';

import styles from './ListInfiniteFooter.module.scss';

export type ListInfiniteFooterProps = {
  /** 首屏加载或加载更多请求中 */
  loading: boolean;
  /** 是否还有下一页（loading 为 true 时不展示「加载更多」） */
  hasNextPage: boolean;
  /** 点击加载更多 */
  onLoadMore?: () => void | Promise<void>;
  /** 列表已有数据且没有更多时展示底线提示 */
  loadMoreText?: string;
  endHintText?: string;
  loadingIconSrc?: string;
  loadingIconWidth?: number;
};

type DividerRowProps = {
  children: ReactNode;
  variant: 'accent' | 'muted';
  interactive?: boolean;
  onClick?: () => void;
};

const DividerRow: FC<DividerRowProps> = ({ children, variant, interactive, onClick }) => (
  <div
    className={clsx(styles.dividerRow, interactive && styles.dividerRowInteractive)}
    onClick={interactive ? onClick : undefined}
    role={interactive ? 'button' : undefined}
    tabIndex={interactive ? 0 : undefined}
    onKeyDown={
      interactive
        ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick?.();
            }
          }
        : undefined
    }
  >
    <span
      className={clsx(
        styles.dividerLabel,
        variant === 'accent' ? styles.dividerLabelAccent : styles.dividerLabelMuted,
      )}
    >
      {children}
    </span>
  </div>
);

const DEFAULT_LOAD_MORE = '加载更多';

/**
 * 无限列表底部：loading / 加载更多 / 底线提示 三态封装，供多页面复用。
 * 展示优先级：loading > 加载更多 > 底线提示 > 不展示
 */
const ListInfiniteFooter: FC<ListInfiniteFooterProps> = ({
  loading,
  hasNextPage,
  onLoadMore,
  loadMoreText = DEFAULT_LOAD_MORE,
  loadingIconSrc = '/images/common/loading.png',
  loadingIconWidth = 16,
}) => {
  if (loading) {
    return (
      <div className={styles.loading}>
        <LazyImage src={loadingIconSrc} width={loadingIconWidth} />
      </div>
    );
  }
  if (hasNextPage) {
    return (
      <DividerRow variant="accent" interactive onClick={() => void onLoadMore?.()}>
        {loadMoreText}
      </DividerRow>
    );
  }
  return null;
};

export default ListInfiniteFooter;

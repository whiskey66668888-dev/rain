import React from 'react';
import { InfiniteScroll } from 'antd-mobile';
import styles from './index.module.scss';

interface MyInfiniteScrollProps {
  loadMore: () => Promise<void>;
  hasMore: boolean;
  threshold?: number;
  loadingText?: string;
  noMoreText?: string;
}

const MyInfiniteScroll: React.FC<MyInfiniteScrollProps> = ({
  loadMore,
  hasMore,
  threshold = 0,
  loadingText = '正在努力加载中...',
  noMoreText = '- 到底啦 -',
}) => {
  const InfiniteScrollContent = ({ hasMore }: { hasMore?: boolean }) => {
    return (
      <>
        {hasMore ? (
          <div className={styles.statusWrap}>
            <div className={styles.loadingImg}></div> {loadingText}
          </div>
        ) : (
          <span className={styles.text}>{noMoreText}</span>
        )}
      </>
    );
  };

  return (
    <InfiniteScroll loadMore={loadMore} hasMore={hasMore} threshold={threshold}>
      <InfiniteScrollContent hasMore={hasMore} />
    </InfiniteScroll>
  );
};

export default MyInfiniteScroll;
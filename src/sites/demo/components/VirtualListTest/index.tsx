import React from 'react';

import LazyImage from '@/common/components/LazyImage';
import { VirtualList } from '@/common/components/VirtualList';

import styles from './VirtualListTest.module.scss';

/**
 * 虚拟滚动测试组件
 */
const VirtualListTest: React.FC = () => {
  const items = Array.from({ length: 1000 }, (_, index) => ({
    id: index,
    data: {
      url: `https://mediumrare.imgix.net/1cab3479be96a3bb59020b9c135a4756807f8bdbd9f0d8f56009d064fc9cee5e?w=180&h=236&fit=min&auto=format`,
      title: `Item ${index + 1}`,
    },
  }));

  return (
    <div className={styles.container}>
      <p className={styles.title}>
        虚拟滚动 + 懒加载图片测试(SSR静态渲染前几条，客户端启用虚拟滚动和图片懒加载)
      </p>
      <div>
        <VirtualList
          data={items}
          itemSize={300}
          height={600}
          width="100%"
          renderItem={(item) => (
            <div className={styles.item}>
              <LazyImage
                src={item.data.url}
                alt={item.data.title}
                className={styles.image}
                style={{ height: '200px' }}
                lazy={false}
                rootMargin="200px"
              />
              <div className={styles.itemTitle}>{item.data.title}</div>
            </div>
          )}
          onEndReach={() => {
            console.log('到达底部');
          }}
        />
      </div>
    </div>
  );
};

export default VirtualListTest;

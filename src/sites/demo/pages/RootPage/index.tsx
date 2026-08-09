import React from 'react';

import { PageTransition } from '@/common/components/animations/PageTransition';
import LazyImage from '@/common/components/LazyImage';
import Header from '@/sites/demo/components/Header';

import styles from './RootPage.module.scss';
import BottomMenu from '../../components/BottomMenu';
import SidebarMenu from '../../components/SidebarMenu';

/**
 * 根页面组件
 */
const RootPage: React.FC = () => {
  return (
    <div className={styles.rootPage}>
      {/* 侧边栏菜单（宽屏和中屏） */}
      <SidebarMenu key="sidebar" />
      {/* 主体内容 */}
      <main className={styles.mainContent}>
        <Header />

        <div className={styles.content}>
          <section>
            <h2>
              Demo页Demo页Demo页Demo页Demo页Demo页Demo页Demo页Demo页Demo页Demo页Demo页Demo页Demo页Demo页Demo页Demo页
            </h2>
            <div>
              <LazyImage
                src="https://mediumrare.imgix.net/stake-casino-home-18-jul-25-zh.png?w=350&h=230&fit=min&auto=format"
                alt="demo"
                lazy={false}
              />
              <LazyImage
                src="https://mediumrare.imgix.net/stake-casino-home-18-jul-25-zh.png?w=350&h=230&fit=min&auto=format"
                alt="demo"
                lazy={false}
              />
            </div>
          </section>
          <PageTransition variant="slide" level={2} />
        </div>
      </main>
      {/* 底部菜单（窄屏） */}
      <BottomMenu key="bottom" />
    </div>
  );
};

export default RootPage;

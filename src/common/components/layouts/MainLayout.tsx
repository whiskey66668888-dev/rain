import React from 'react';

import { ToastViewport } from '@/common/components/Toast';

import styles from './MainLayout.module.scss';

/**
 * 主布局组件
 * 最外层的布局容器,之后根据设计稿确定
 */
export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <div className={styles.mainLayout}>{children}</div>
      <ToastViewport />
    </>
  );
};

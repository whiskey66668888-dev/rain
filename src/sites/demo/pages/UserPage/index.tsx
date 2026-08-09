import React from 'react';

import { PageTransition } from '@/common/components/animations/PageTransition';

import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';

import styles from './UserPage.module.scss';

/**
 * 用户页面（二级路由）
 */
const UserPage: React.FC = () => {
  const navigate = useNavigateWithLanguage();

  return (
    <div className={styles.userPage}>
      {/* 三级路由导航 */}
      <h2>三级路由懒加载</h2>
      <nav>
        <button onClick={() => navigate('/user/profile')}>Profile</button>
        <button onClick={() => navigate('/user/settings')}>Settings</button>
      </nav>

      {/* 三级路由内容区域 - 使用淡入淡出切换效果 */}
      <PageTransition variant="fade" level={3} />
      <button onClick={() => {}}>测试接口</button>
    </div>
  );
};

export default UserPage;

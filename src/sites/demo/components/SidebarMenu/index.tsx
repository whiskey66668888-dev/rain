import React, { useState } from 'react';

import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';

import styles from './SidebarMenu.module.scss';

interface SidebarMenuProps {
  asd?: string;
}

/**
 * 侧边栏菜单组件
 */
const SidebarMenu: React.FC<SidebarMenuProps> = () => {
  const navigate = useNavigateWithLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    { icon: '🏠', text: '首页', url: '' },
    { icon: '⚽', text: '体育', url: '/sports' },
    { icon: '👤', text: '用户', url: '/user' },
    { icon: '⚙️', text: '设置', url: '/system' },
    { icon: '📊', text: '数据', url: '/asd' },
  ];
  const toggleMenu = (url?: string): void => {
    if (url !== undefined) {
      navigate(url);
      setIsExpanded(false);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={`${styles.sidebarBox} ${isExpanded ? styles.expanded : ''}`}>
      <div className={styles.shadow} onClick={() => toggleMenu()}></div>
      <div className={styles.sidebar}>
        <button className={styles.toggleButton} onClick={() => toggleMenu()} type="button">
          <span className={styles.icon}>☰</span>
        </button>

        {/* 菜单项 */}
        <nav className={styles.menu}>
          {menuItems.map((item, index) => (
            <button key={index} className={styles.menuItem} onClick={() => toggleMenu(item.url)}>
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.text}>{item.text}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default SidebarMenu;

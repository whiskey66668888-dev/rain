import React from 'react';

import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';

import styles from './BottomMenu.module.scss';

interface BottomMenuProps {
  items?: string;
}

/**
 * 底部固定菜单组件
 * 仅在窄屏（<768px）显示
 */
const BottomMenu: React.FC<BottomMenuProps> = () => {
  const navigate = useNavigateWithLanguage();

  const menuItems = [
    { icon: '🏠', text: '首页', onClick: () => navigate('') },
    { icon: '⚽', text: '体育', onClick: () => navigate('/sports') },
    { icon: '👤', text: '用户', onClick: () => navigate('/user') },
    { icon: '⚙️', text: '设置', onClick: () => navigate('/system') },
    { icon: '📊', text: '数据', onClick: () => {} },
  ];
  return (
    <nav className={styles.bottomMenu}>
      {menuItems.map((item, index) => (
        <button key={index} className={styles.menuItem} onClick={item.onClick}>
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.text}>{item.text}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomMenu;

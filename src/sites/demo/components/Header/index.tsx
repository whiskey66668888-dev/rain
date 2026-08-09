import React from 'react';

import { ClientOnly } from '@/common/components/ClientOnly';
import LazyImage from '@/common/components/LazyImage';

import { useAppSelector } from '@/core/store/hooks';

import { useLogin } from '@/common/hooks/useLogin';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';

import styles from './Header.module.scss';

interface HeaderProps {
  className?: string;
}

/**
 * 头部组件
 */
const Header: React.FC<HeaderProps> = ({ className }) => {
  const navigate = useNavigateWithLanguage();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const { logout } = useLogin();
  const handleLogoClick = (): void => {
    navigate('');
  };

  return (
    <header className={`${styles.header} ${className || ''}`}>
      <div className={styles.container}>
        {/* Logo */}
        <button className={styles.logoButton} onClick={handleLogoClick} type="button">
          <LazyImage
            src={'/images/common/logo.png'}
            alt="Logo"
            className={styles.logo}
            lazy={false}
          />
        </button>

        {/* 右侧按钮组 */}
        <div className={styles.actions}>
          <ClientOnly>
            <button
              className={styles.loginButton}
              onClick={isLogin ? logout : () => navigate('/login')}
              type="button"
            >
              {isLogin ? '退出' : '登录'}
            </button>
          </ClientOnly>
        </div>
      </div>
    </header>
  );
};

export default Header;

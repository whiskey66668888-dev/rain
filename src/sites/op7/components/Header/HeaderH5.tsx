import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';

import { ClientOnly } from '@/common/components/ClientOnly';
import Icon from '@/common/components/Icon';
import LazyImage from '@/common/components/LazyImage';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { useHeaderBalanceData } from '@/common/hooks/useHeaderBalance';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { openLoginModal, openRegisterModal } from '@/core/store/slices/authUISlice';
import { PATHS } from '@/sites/op7/routes/paths';

import FastSettingsModal from '../../pages/FastSettingsPage';

import LogoLottie from './LogoLottie';
import styles from './Header.module.scss';
import { bigNB } from '@/utils/bet/bigMath';

interface HeaderH5Props {
  theme: 'light' | 'dark';
}

const HeaderH5: React.FC<HeaderH5Props> = ({ theme }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigateWithLanguage();
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const { balance, balanceLoading, refreshBalance } = useHeaderBalanceData();

  const [fastSettingsModalShow, setFastSettingsModalShow] = useState(false);

  const pathWithoutLang = useMemo(
    () => location.pathname.replace(/^\/[a-z]{2}/, '') || PATHS.home,
    [location.pathname],
  );
  const isSportsPage = pathWithoutLang === PATHS.sports;
  const isSportsPath = pathWithoutLang.startsWith(PATHS.sports);

  const handleLoginClick = (): void => {
    dispatch(openLoginModal());
  };

  const handleRegisterClick = (): void => {
    dispatch(openRegisterModal());
  };

  const handleDeposit = (): void => {
    navigate(PATHS.mineDeposit);
  };

  const handleLogoClick = (): void => {
    if (isSportsPath) {
      setFastSettingsModalShow(true);
      return;
    }

    navigate(PATHS.home);
  };

  return (
    <>
      <div className="flex h-28px items-center justify-between max-w-1300px w-full mx-auto">
        {/* 左侧：体育显示动画 Logo，其他页面显示静态 Logo */}
        <section className="flex items-center gap-12px">
          {isSportsPage ? (
            <LogoLottie
              className={styles.logoLottie}
              isDark={theme === 'dark'}
              playKey={isSportsPath ? pathWithoutLang : 'default'}
              onClick={handleLogoClick}
            />
          ) : (
            <LazyImage
              className="w-52px h-20px cursor-pointer"
              src={`/images/${theme}/logo.png`}
              alt="OP7"
              lazy={false}
              onClick={handleLogoClick}
            />
          )}
        </section>
        <section>
          <ClientOnly fallback={<div className="flex items-center gap-12px">{/* SSR 占位 */}</div>}>
            {/* 右侧：未登录显示登录/注册，已登录显示余额、刷新和充值入口 */}
            {isLogin ? (
              <div className={styles.mobileBalancePanel}>
                <div className={styles.mobileBalanceContent}>
                  <button
                    type="button"
                    className={clsx(
                      styles.mobileBalanceIconButton,
                      balanceLoading && styles.refreshing,
                    )}
                    onClick={refreshBalance}
                  >
                    <Icon src="/images/common/refresh.svg" size="14px" color="var(--Text-700)" />
                  </button>
                  <button
                    type="button"
                    className={styles.mobileBalanceAmountButton}
                    onClick={handleDeposit}
                  >
                    <span className={styles.mobileBalanceAmount}>{bigNB(balance).toFixed(2)}</span>
                  </button>
                  <button
                    type="button"
                    className={styles.mobileBalanceIconButton}
                    onClick={handleDeposit}
                  >
                    <LazyImage
                      className="block size-[14px]"
                      src="/images/common/header/add-money.png"
                      alt=""
                      lazy={false}
                    />
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.mobileAuthSwitch}>
                <button
                  type="button"
                  className={clsx(styles.mobileAuthButton, styles.mobileAuthButtonSecondary)}
                  onClick={handleLoginClick}
                >
                  {t('header.login')}
                </button>
                <button
                  type="button"
                  className={clsx(styles.mobileAuthButton, styles.mobileAuthButtonPrimary)}
                  onClick={handleRegisterClick}
                >
                  {t('header.register')}
                </button>
              </div>
            )}
          </ClientOnly>
        </section>
      </div>
      {/* H5 体育页快捷设置弹窗 */}
      <FastSettingsModal
        handleClose={() => setFastSettingsModalShow(false)}
        show={fastSettingsModalShow}
      />
    </>
  );
};

export default React.memo(HeaderH5);

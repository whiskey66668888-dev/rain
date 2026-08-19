import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';

import Button from '@/common/components/Button';
import { ClientOnly } from '@/common/components/ClientOnly';
import LazyImage from '@/common/components/LazyImage';
import { useLogin } from '@/common/hooks/useLogin';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { useToggleMessageCenter } from '@/common/hooks/messageCenter/useToggleMessageCenter';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { openLoginModal, openRegisterModal } from '@/core/store/slices/authUISlice';
import { toggleRightSidebarVisible } from '@/core/store/slices/configSlice';
import { prefetchAuthModals } from '@/sites/op7/pages/prefetchAuthModals';
import { PATHS } from '@/sites/op7/routes/paths';

import WalletModal from '../../pages/Finance/wallet/walletModal';
import { WalletType } from '../../pages/Finance/constants';
import AvatarDropdown from './AvatarDropdown';
import styles from './Header.module.scss';
import { useHeaderBalanceData } from '@/common/hooks/useHeaderBalance';
import { bigNB } from '@/utils/bet/bigMath';
import { DEFAULT_AVATAR_SRC } from '@/common/utils/emcAvatar';
import SegmentedControl from '@/common/components/SegmentedControl';
import { SPORT_VENUE_OPTIONS } from '@/utils/constants/system';
import { setVenue } from '@/core/store/slices/sportSlice';

interface HeaderPCProps {
  theme: 'light' | 'dark';
  rightSidebarVisible: boolean;
}

const HeaderPC: React.FC<HeaderPCProps> = ({ theme, rightSidebarVisible }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigateWithLanguage();
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const userAvatar = useAppSelector((state) => state.user.userAvatar);
  const unreadInboxCount = useAppSelector((state) => state.messageCenter.unreadInboxCount);
  const { toggleMessageCenter } = useToggleMessageCenter();
  const { logout } = useLogin();

  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [walletModalType, setWalletModalType] = useState(WalletType.Deposit);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const [isAvatarDropdownPinned, setIsAvatarDropdownPinned] = useState(false);
  const avatarDropdownContainerRef = useRef<HTMLDivElement>(null);
  const isGamePlaying = useAppSelector((state) => state.entertainment.isGamePlaying);
  const venue = useAppSelector((state) => state.sport.venue);
  const { balance } = useHeaderBalanceData();
  const pathWithoutLang = useMemo(
    () => location.pathname.replace(/^\/[a-z]{2}/, '') || PATHS.home,
    [location.pathname],
  );
  // 与 HeaderH5 一致：场馆切换仅在体育列表页 /sports 展示
  const isSportsPage = pathWithoutLang === PATHS.sports;
  const handleLoginClick = (): void => {
    dispatch(openLoginModal());
  };

  const handleRegisterClick = (): void => {
    dispatch(openRegisterModal());
  };

  const handleAuthPointerEnter = (): void => {
    void prefetchAuthModals();
  };

  const handleLogoutClick = (): void => {
    logout();
  };

  const handleLogoClick = (): void => {
    navigate(PATHS.home);
  };

  const openWalletModal = (type: WalletType): void => {
    setWalletModalType(type);
    setWalletModalVisible(true);
  };

  const handleDeposit = (): void => {
    openWalletModal(WalletType.Deposit);
  };

  const handleTransfer = (): void => {
    openWalletModal(WalletType.Transfer);
  };

  const handleAvatarDropdownClose = (): void => {
    setIsAvatarDropdownOpen(false);
    setIsAvatarDropdownPinned(false);
  };

  const handleAvatarClick = (): void => {
    if (isAvatarDropdownPinned) {
      handleAvatarDropdownClose();
      return;
    }
    setIsAvatarDropdownPinned(true);
    setIsAvatarDropdownOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between max-w-1300px w-full mx-auto">
        {/* 左侧：PC Logo，侧边栏展开时复用现有小 Logo 样式 */}
        <section className="flex items-center gap-12px">
          <div
            className={clsx(styles.logo, {
              [styles.logoSmall as string]: rightSidebarVisible,
            })}
            onClick={handleLogoClick}
          />
          {isSportsPage ? (
            <SegmentedControl
              options={SPORT_VENUE_OPTIONS}
              className="bg-[var(--Background-500)]"
              height={28}
              value={venue}
              onChange={(value) => dispatch(setVenue(value))}
            />
          ) : null}
        </section>
        <section>
          <ClientOnly fallback={<div className="flex items-center gap-12px">{/* SSR 占位 */}</div>}>
            <div className="flex items-center gap-12px">
              {/* 右侧主操作区：未登录显示登录/注册，已登录显示钱包余额 */}
              {isLogin ? (
                <div className={styles.pcBalancePanel}>
                  <div
                    className={clsx(
                      styles.pcBalanceClickable,
                      isGamePlaying && styles.pcBalanceClickableDisabled,
                    )}
                    role="presentation"
                    onClick={isGamePlaying ? undefined : handleTransfer}
                  >
                    <LazyImage
                      className={styles.pcBalanceIcon}
                      src={`/images/${theme}/header/money2.png`}
                      alt="Money"
                      lazy={false}
                    />
                    {isGamePlaying ? (
                      <span className="text-[var(--ThemeColor-Main)]">游戏使用中</span>
                    ) : (
                      <span className={styles.pcBalanceAmount}>{bigNB(balance).toFixed(2)}</span>
                    )}
                  </div>
                  <Button
                    type="primary"
                    size="small"
                    className={clsx(styles.headerActionButton, styles.pcDepositButton)}
                    onClick={handleDeposit}
                  >
                    充值
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4px">
                  <Button
                    type="third"
                    size="middle"
                    className={clsx(
                      '_tf[12] font-medium min-w-[56px]',
                      'bg-[var(--Background-600)]',
                      styles.headerActionButton,
                    )}
                    onPointerEnter={handleAuthPointerEnter}
                    onClick={handleLoginClick}
                  >
                    {t('header.login')}
                  </Button>
                  <Button
                    type="primary"
                    size="middle"
                    className={clsx(
                      '_tf[12] font-medium min-w-[56px]',
                      styles.headerActionButton,
                      styles.headerRegisterButton,
                    )}
                    onPointerEnter={handleAuthPointerEnter}
                    onClick={handleRegisterClick}
                  >
                    {t('header.register')}
                  </Button>
                </div>
              )}
              {/* 通用快捷入口；头像下拉只在已登录时展示 */}
              <div className={clsx('flex items-center gap-12px', styles.buttonAnimate)}>
                {isLogin && (
                  <>
                    <div
                      className="relative"
                      ref={avatarDropdownContainerRef}
                      onMouseEnter={() => setIsAvatarDropdownOpen(true)}
                      onMouseLeave={() => {
                        if (!isAvatarDropdownPinned) {
                          setIsAvatarDropdownOpen(false);
                        }
                      }}
                    >
                      <LazyImage
                        className="w-26px h-26px cursor-pointer rounded-full"
                        src={userAvatar || DEFAULT_AVATAR_SRC}
                        fallback={DEFAULT_AVATAR_SRC}
                        alt="Avatar"
                        lazy={false}
                        onClick={handleAvatarClick}
                      />
                      {isAvatarDropdownOpen && (
                        <AvatarDropdown
                          onClose={handleAvatarDropdownClose}
                          onLogout={handleLogoutClick}
                          containerRef={avatarDropdownContainerRef}
                        />
                      )}
                    </div>
                    <div className="relative">
                      <LazyImage
                        className="w-26px h-26px cursor-pointer rounded-full"
                        src={`/images/${theme}/header/message.png`}
                        alt="Message"
                        lazy={false}
                        onClick={toggleMessageCenter}
                      />
                      {unreadInboxCount > 0 ? (
                        <span className="pointer-events-none absolute right-[2px] top-[2px] h-6px w-6px rounded-full bg-[var(--Red-300)]" />
                      ) : null}
                    </div>
                    <LazyImage
                      className="w-26px h-26px cursor-pointer rounded-full"
                      src={`/images/${theme}/header/discount.png`}
                      alt="Promotion"
                      lazy={false}
                      onClick={() => {
                        navigate(PATHS.promotion);
                      }}
                    />
                  </>
                )}
                <LazyImage
                  className="w-26px h-26px cursor-pointer rounded-full"
                  src={`/images/${theme}/header/sidebar_switch.png`}
                  alt="Sidebar Switch"
                  lazy={false}
                  onClick={() => dispatch(toggleRightSidebarVisible())}
                />
              </div>
            </div>
          </ClientOnly>
        </section>
      </div>
      <WalletModal
        visible={walletModalVisible}
        type={walletModalType}
        onClose={() => {
          setWalletModalVisible(false);
        }}
      />
    </>
  );
};

export default React.memo(HeaderPC);

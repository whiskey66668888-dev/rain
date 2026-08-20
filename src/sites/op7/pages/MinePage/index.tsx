import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PageTransition } from '@/common/components/animations/PageTransition';

import { useAuthNavigate } from '@/common/hooks/useAuthNavigate';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { useAppSelector } from '@/core/store/hooks';
import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import Icon from '@/common/components/Icon';
import { AppPath, PATHS } from '@/sites/op7/routes/paths';
import SecurityTipModal from '@/sites/op7/components/security/SecurityTipModal';
import { useMineRebateAndWelfareDots } from './hooks/useMineRebateAndWelfareDots';
import { getSecurityCenterReq } from '@/apis/origin/login';
import {
  hasAnySecurityVerification,
  hasCashPassword,
} from '@/sites/op7/pages/MinePage/utils/securityStatus';
import VersionChangeModal from '@/sites/op7/pages/Finance/deposit/components/versionChange';
import {
  getInitialDepositVersion,
  setSessionDepositVersion,
} from '@/sites/op7/pages/Finance/deposit/version';

const ICON_BASE = '/images/common/mine/icon_pc';
const DEPOSIT_VERSION_CLICK_WINDOW = 1200;

type TNavItem = { label: string; path: AppPath; icon: string; requiresAuth?: boolean };

type TMineNavSection = {
  title: string;
  items: TNavItem[];
};

const MINE_NAV_SECTIONS: TMineNavSection[] = [
  {
    title: '我的钱包',
    items: [
      { label: '充值', path: PATHS.mineDeposit, icon: 'deposit2' },
      { label: '提现', path: PATHS.mineWithdrawal, icon: 'withdrawal' },
      { label: '转账', path: PATHS.mineTransfer, icon: 'transfer' },
      { label: '会员互转', path: PATHS.mineMemberTransfer, icon: 'member_transfer' },
      { label: '交易记录', path: PATHS.mineTransactionRecord, icon: 'transaction_record' },
    ],
  },
  {
    title: '福利中心',
    items: [
      { label: '福利中心', path: PATHS.mineWelfareCenter, icon: 'welfare_center' },
      { label: '实时返水', path: PATHS.mineRealtimeRebate, icon: 'realtime_rebate' },
    ],
  },
  {
    title: '联盟推广',
    items: [
      { label: '呼朋唤友', path: PATHS.mineInviteFriends, icon: 'invite_friends' },
      { label: '加入合营', path: PATHS.minePartnership, icon: 'partnership' },
    ],
  },
  {
    title: '个人资料',
    items: [
      { label: '个人资料', path: PATHS.mineProfile, icon: 'profile' },
      { label: '安全中心', path: PATHS.mineSecurity, icon: 'security', requiresAuth: true },
    ],
  },
];

/**
 * 用户页面（二级路由）
 */
const MinePage: React.FC = () => {
  const navigate = useNavigateWithLanguage();
  const authNavigate = useAuthNavigate();
  const { pathname } = useLocation();
  const [securityTipMode, setSecurityTipMode] = useState<'cashPassword' | 'securityVerify' | null>(
    null,
  );
  const [depositVersionModalVisible, setDepositVersionModalVisible] = useState(false);
  const [depositVersion, setDepositVersion] = useState(getInitialDepositVersion);
  const depositClickRef = useRef({ count: 0, lastAt: 0 });
  const isMineH5Route = pathname === PATHS.mine || pathname.includes(PATHS.mineH5);
  const haveCashPass = useAppSelector((state) => state.user.memberInfo.haveCashPass);
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const { t } = useTranslation();
  const { hasWelfareCenterDot } = useMineRebateAndWelfareDots();

  const [activeNav, navList] = useMemo(() => {
    let activeNav: TNavItem = { label: '', path: '/', icon: '' };
    let navListTitle = '';
    let navList: TNavItem[] = [];
    for (const section of MINE_NAV_SECTIONS) {
      for (const item of section.items) {
        if (pathname.includes(item.path)) {
          activeNav = item;
          navList = section.items;
          navListTitle = section.title;
          return [activeNav, navList, navListTitle];
        }
      }
    }
    return [activeNav, navList, navListTitle];
  }, [pathname]);

  /** Web 我的钱包横向入口不展示「交易记录」（仍保留路由与 H5 入口） */
  const walletNavListForDisplay = useMemo(() => {
    const walletSection = MINE_NAV_SECTIONS[0];
    const isWalletSection = Boolean(walletSection && navList === walletSection.items);
    if (!isMobile && isWalletSection) {
      return navList.filter((item) => item.path !== PATHS.mineTransactionRecord);
    }
    return navList;
  }, [isMobile, navList]);

  /** Web 交易记录页：去掉顶部横向导航（避免两层 tab 叠加） */
  const showWebTopNav = useMemo(() => {
    if (isMobile) return false;
    return !pathname.includes(PATHS.mineTransactionRecord);
  }, [isMobile, pathname]);

  const handleNavClick = async (item: TNavItem) => {
    if (item.path === PATHS.mineDeposit) {
      const now = Date.now();
      const nextCount =
        now - depositClickRef.current.lastAt <= DEPOSIT_VERSION_CLICK_WINDOW
          ? depositClickRef.current.count + 1
          : 1;
      depositClickRef.current = { count: nextCount, lastAt: now };

      if (nextCount >= 3) {
        depositClickRef.current = { count: 0, lastAt: 0 };
        setDepositVersion(getInitialDepositVersion());
        setDepositVersionModalVisible(true);
        return;
      }
    } else {
      depositClickRef.current = { count: 0, lastAt: 0 };
    }

    if (item.requiresAuth) {
      authNavigate(item.path);
      return;
    }

    if (item.path === PATHS.mineWithdrawal) {
      try {
        const res = await getSecurityCenterReq();
        const securityData = res?.data;

        if (!hasCashPassword(securityData)) {
          setSecurityTipMode('cashPassword');
          return;
        }

        if (!hasAnySecurityVerification(securityData)) {
          setSecurityTipMode('securityVerify');
          return;
        }
      } catch (_error) {
        if (!haveCashPass) {
          setSecurityTipMode('cashPassword');
          return;
        }
      }
    }

    navigate(item.path);
  };
  useEffect(() => {
    if (!isMineH5Route) return;
    // 骚操作，临时解决 iOS 橡皮筋回弹问题
    if (typeof document === 'undefined') return;
    const className = 'mine-h5-rubberband';
    const html = document.documentElement;
    const body = document.body;

    html.classList.add(className);
    body.classList.add(className);

    return () => {
      html.classList.remove(className);
      body.classList.remove(className);
    };
  }, [isMineH5Route]);

  return (
    <>
      <div
        data-desc="mine-page"
        className={clsx(
          'self-center flex-1 flex flex-col gap-12px w-full overflow-hidden',
          'lg:p-12px',
          'xl:max-w-[1220px]',
        )}
      >
        {/* {!!navListTitle && (
          <div
            className={clsx(
              'hidden lg:block shrink-0 _tf[20] font-500 leading-[1.4] text-[var(--Text-Main-10)]',
            )}
          >
            {navListTitle}
          </div>
        )} */}

        <div className={clsx('flex-1 flex flex-col gap-12px overflow-hidden')}>
          {showWebTopNav && walletNavListForDisplay.length > 0 && (
            <nav
              className={clsx(
                'hidden lg:flex lg:flex-row lg:w-full lg:self-stretch max-w-full',
                'items-center gap-4px overflow-x-auto overflow-y-hidden',
                'bg-[var(--Background-300)] rounded-full p-2px',
              )}
            >
              {walletNavListForDisplay.map((item) => {
                const isActive = item.path === activeNav.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => void handleNavClick(item)}
                    className={clsx(
                      'shrink-0 h-36px min-w-0 flex-1 px-12px flex items-center justify-center rounded-full transition-colors',
                      isActive && 'bg-[var(--ThemeColor-Main)]',
                      !isActive &&
                        'can-hover:hover:bg-[var(--Background-300)] text-[var(--Text-800)]',
                    )}
                  >
                    <span className="inline-flex items-center justify-center gap-8px">
                      <span className="relative flex h-16px w-16px flex-shrink-0 items-center justify-center">
                        <Icon
                          src={`${ICON_BASE}/${item.icon}.svg`}
                          size={16}
                          color={isActive ? 'var(--White-100)' : 'var(--Text-800)'}
                          className="block flex-shrink-0"
                        />
                        {item.path === PATHS.mineWelfareCenter && hasWelfareCenterDot ? (
                          <span className="absolute right-[-2px] top-[-2px] h-6px w-6px rounded-full" />
                        ) : null}
                      </span>
                      <p
                        className={clsx(
                          'm-0 _tf[14] font-500 leading-none whitespace-nowrap',
                          isActive ? 'text-[var(--White-100)]' : 'text-[var(--Text-800)]',
                        )}
                      >
                        {item.label}
                      </p>
                    </span>
                  </button>
                );
              })}
            </nav>
          )}

          <PageTransition
            variant="fade"
            level={3}
            className={clsx(
              'flex-1 flex flex-col overflow-y-auto lg:overflow-initial',
              isMineH5Route && '[overscroll-behavior-y:auto!important]',
            )}
          />
        </div>
      </div>
      <SecurityTipModal
        show={securityTipMode !== null}
        content={
          securityTipMode === 'securityVerify' ? (
            <div className="text-center text-[var(--Text-800)] text-sm leading-relaxed">
              <div>{t('securityCenter.securityVerifyTipContent')}</div>
              <div className="mt-12px">• {t('securityCenter.recommendMicrosoft')}</div>
              <div>• {t('securityCenter.recommendEmail')}</div>
            </div>
          ) : undefined
        }
        cancelText={
          securityTipMode === 'securityVerify'
            ? t('securityCenter.gestureModal.notToday')
            : undefined
        }
        onCancel={() => setSecurityTipMode(null)}
        onClose={() => setSecurityTipMode(null)}
        onGo={() => {
          setSecurityTipMode(null);
          navigate(PATHS.mineSecurity);
        }}
      />
      <VersionChangeModal
        visible={depositVersionModalVisible}
        value={depositVersion}
        onClose={() => setDepositVersionModalVisible(false)}
        onChange={(version) => {
          setSessionDepositVersion(version);
          setDepositVersion(version);
        }}
      />
    </>
  );
};

export default MinePage;

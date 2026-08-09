import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '@/common/components/Icon';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { useAppSelector, useAppDispatch } from '@/core/store/hooks';
import { useGetMemberInfo } from '@/common/hooks/useMemberInfo';
import { openLoginModal } from '@/core/store/slices/authUISlice';
import SecurityTipModal from '@/sites/op7/components/security/SecurityTipModal';
import { getSecurityCenterReq } from '@/apis/origin/login';
import {
  hasAnySecurityVerification,
  hasCashPassword,
} from '@/sites/op7/pages/MinePage/utils/securityStatus';

import { AppPath, PATHS } from '@/sites/op7/routes/paths';
import styles from '../MinePageH5.module.scss';

const QUICK_ACTIONS: {
  label: string;
  icon: string;
  path: AppPath;
  iconColor: string;
}[] = [
  {
    label: '充值',
    icon: 'mine_deposit_icon',
    path: PATHS.mineDeposit,
    iconColor: 'var(--ThemeColor-Main)',
  },
  { label: '转账', icon: 'mine_transfer_icon', path: PATHS.mineTransfer, iconColor: '#22c55e' },
  { label: '提现', icon: 'mine_withdraw_icon', path: PATHS.mineWithdrawal, iconColor: '#eab308' },
  {
    label: '会员互转',
    icon: 'mine_memberTransfer_icon',
    path: PATHS.mineMemberTransfer,
    iconColor: 'var(--ThemeColor-Main)',
  },
];

export function BalanceTransferCard() {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [securityTipMode, setSecurityTipMode] = useState<'cashPassword' | 'securityVerify' | null>(
    null,
  );
  const { isLogin } = useAppSelector((state) => state.user.userInfo);
  const { money, extendMoney, haveCashPass } = useAppSelector((state) => state.user.memberInfo);
  const navigate = useNavigateWithLanguage();
  const dispatch = useAppDispatch();
  const { getMemberInfo } = useGetMemberInfo();
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  const refreshMoney = async () => {
    if (!isLogin) {
      dispatch(openLoginModal());
      return;
    }

    try {
      setLoading(true);
      await getMemberInfo();
    } finally {
      setLoading(false);
    }
  };

  const handleLockMoney = () => {
    if (!isLogin) {
      dispatch(openLoginModal());
      return;
    }

    navigate(PATHS.mineTransactionRecord + '?id=1');
  };

  const toGameBalance = () => {
    if (!isLogin) {
      dispatch(openLoginModal());
      return;
    }

    navigate(PATHS.mineGameBalance);
  };

  const renderValue = (value: string) => {
    if (!mounted) return '--';

    if (!isLogin) return '--';

    if (!isBalanceVisible) return '******';

    if (loading)
      return (
        <Icon
          src="/images/common/loading.svg"
          className="inline-block rounded-full animate-spin"
          size={20}
          color="var(--White-100)"
        />
      );

    return value;
  };

  const handleQuickAction = async (path: AppPath) => {
    if (!isLogin) {
      dispatch(openLoginModal());
      return;
    }

    if (path !== PATHS.mineWithdrawal) {
      navigate(path);
      return;
    }

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

      navigate(path);
    } catch (_error) {
      if (!haveCashPass) {
        setSecurityTipMode('cashPassword');
        return;
      }

      navigate(path);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-16px mt-16px">
        {/* 参考稿：蓝色钱包卡 */}
        <div className={styles.balanceTransferCard}>
          <button
            type="button"
            className="absolute right-[12px] top-[12px] z-2  p-0"
            onClick={() => setIsBalanceVisible((prev) => !prev)}
            aria-label={isBalanceVisible ? '隐藏金额' : '显示金额'}
          >
            <Icon
              src={
                isBalanceVisible
                  ? '/images/common/login/eye.svg'
                  : '/images/common/login/close-eye.svg'
              }
              color="var(--White-100)"
              size={18}
            />
          </button>
          <div className="flex py-[18px]">
            <div className="flex flex-1 flex-col items-start justify-center gap-8px pl-[24px]">
              <div
                className="_tf[22] din-pro font-bold leading-[1] text-[var(--White-100)]"
                onClick={() => void refreshMoney()}
              >
                {renderValue(money)}
              </div>
              <button
                type="button"
                className="_tf[12] flex items-center gap-2px font-medium leading-[1.33] text-[var(--White-100)]/95"
                onClick={toGameBalance}
              >
                中心钱包
                <Icon src="/images/common/arrow.svg" size={12} color="var(--White-100)" />
              </button>
            </div>
            <div className="h-52px w-[0.5px] shrink-0 self-center bg-[var(--White-40)]" />
            <button
              type="button"
              className="flex flex-1 flex-col items-start justify-center gap-8px pl-[24px]"
              onClick={handleLockMoney}
            >
              <div className="_tf[22] din-pro font-bold leading-[1] text-[var(--White-100)]">
                {renderValue(extendMoney)}
              </div>
              <div className="_tf[12] font-medium leading-[1.33] text-[var(--White-100)]/95">
                锁定钱包
              </div>
            </button>
          </div>
        </div>

        {/* 快捷入口：独立浅底条 */}
        <div className="rounded-16px  px-4px">
          <div className="grid grid-cols-4">
            {QUICK_ACTIONS.map((item) => (
              <button
                key={item.label}
                type="button"
                className="flex flex-col items-center gap-6px"
                onClick={() => void handleQuickAction(item.path)}
              >
                <img
                  src={`/images/common/mine/${item.icon}.png`}
                  alt="level"
                  className="h-24px w-24px shrink-0"
                />
                <span className="_tf[12] leading-[1.33] text-[var(--Text-900)]">{item.label}</span>
              </button>
            ))}
          </div>
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
    </>
  );
}

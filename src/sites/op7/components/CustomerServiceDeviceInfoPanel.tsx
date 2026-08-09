import React, { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

import { useGetMemberInfo } from '@/common/hooks/useMemberInfo';
import { useAppSelector } from '@/core/store/hooks';
import type { CustomerServiceDeviceInfoState } from '@/sites/op7/hooks/useCustomerServiceDeviceInfo';
import bigMath from '@/utils/bet/bigMath';
import LazyImage from '@/common/components/LazyImage';
import { getSystemTheme } from '@/utils';

const ALL_ROWS: { key: keyof CustomerServiceDeviceInfoState; label: string }[] = [
  { key: 'phoneModel', label: '手机型号' },
  { key: 'phoneOs', label: '手机系统' },
  { key: 'loginIp', label: '登录IP' },
  { key: 'loginPort', label: '登录端口' },
  { key: 'osName', label: '操作系统' },
  { key: 'browser', label: '浏览器名称' },
  { key: 'currentTime', label: '当前时间' },
];

export interface CustomerServiceDeviceInfoPanelProps {
  data: CustomerServiceDeviceInfoState;
  className?: string;
  /** H5（true）展示手机型号与手机系统；PC（false）不展示 */
  isMobile?: boolean;
  onBettingRecordClick?: () => void;
  onTransactionRecordClick?: () => void;
}

const CustomerServiceDeviceInfoPanel: React.FC<CustomerServiceDeviceInfoPanelProps> = ({
  data,
  className,
  isMobile = true,
  onBettingRecordClick,
  onTransactionRecordClick,
}) => {
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const account = useAppSelector(
    (state) => state.user.memberInfo.loginName || state.user.userInfo.loginName,
  );
  const centerWallet = useAppSelector((state) => state.user.memberInfo.money);
  const memberInfoLoading = useAppSelector((state) => state.user.memberInfoLoading);
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const { getMemberInfo } = useGetMemberInfo();
  const [refreshing, setRefreshing] = useState(false);
  const isDark = themeMode === 'dark' || (themeMode === 'system' && getSystemTheme() === 'dark');
  const themeImagePath = `/images/${isDark ? 'dark' : 'light'}`;

  const rows = useMemo(() => {
    if (isMobile) return ALL_ROWS;
    return ALL_ROWS.filter((r) => r.key !== 'phoneModel' && r.key !== 'phoneOs');
  }, [isMobile]);

  useEffect(() => {
    if (!isLogin) return;
    void getMemberInfo({ isLoading: false }).catch(() => undefined);
  }, [getMemberInfo, isLogin]);

  const refreshWallet = useCallback(async () => {
    if (refreshing || memberInfoLoading) return;
    setRefreshing(true);
    try {
      await getMemberInfo({ isLoading: false });
    } catch {
      // 保留当前余额；刷新失败不影响设备信息面板使用。
    } finally {
      setRefreshing(false);
    }
  }, [getMemberInfo, memberInfoLoading, refreshing]);

  const walletAmount = bigMath.decimals(centerWallet || '0', { padZero: true });

  return (
    <div
      className={clsx(
        'flex min-h-0 flex-1 flex-col gap-16px overflow-y-auto rounded-16px bg-[var(--Background-700)] p-0',
        className,
      )}
    >
      {isLogin && (
        <div
          className={clsx(
            'flex w-full max-w-[376px] flex-col self-center overflow-hidden rounded-12px',
            'bg-[var(--Background-300)]',
          )}
        >
          <InfoRow label="会员账号" value={account || '—'} />
          <Divider />
          <InfoRow
            label="中心钱包"
            value={
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-[10px] rounded-md border border-solid border-[var(--Line-200)] px-[6px] py-[4px]">
                  <LazyImage src="/images/common/ic_wallet.png" className="w-[20px]" />
                  <span className="din-pro min-w-0 truncate">{walletAmount}</span>
                  <button
                    type="button"
                    disabled={refreshing || memberInfoLoading}
                    onClick={() => void refreshWallet()}
                    className="ml-10px flex size-16px shrink-0 items-center justify-center disabled:opacity-50"
                    aria-label="刷新中心钱包"
                  >
                    <img
                      src={`${themeImagePath}/ic_shuaxin.png`}
                      alt=""
                      className={clsx(
                        'size-16px',
                        (refreshing || memberInfoLoading) && 'animate-spin',
                      )}
                    />
                  </button>
                </div>
              </div>
            }
          />
          <Divider />
          <InfoRow
            label="投注记录"
            onClick={onBettingRecordClick}
            arrowIconSrc={`${themeImagePath}/ic_right.png`}
          />
          <Divider />
          <InfoRow
            label="交易记录"
            onClick={onTransactionRecordClick}
            arrowIconSrc={`${themeImagePath}/ic_right.png`}
          />
        </div>
      )}
      <div
        className={clsx(
          'flex w-full max-w-[376px] flex-col self-center overflow-hidden rounded-12px',
          'bg-[var(--Background-300)]',
        )}
      >
        {rows.map((row, index) => (
          <React.Fragment key={row.key}>
            <InfoRow label={row.label} value={data[row.key]} valueTitle={String(data[row.key])} />
            {index < rows.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

interface InfoRowProps {
  label: string;
  value?: React.ReactNode;
  valueTitle?: string;
  onClick?: () => void;
  arrowIconSrc?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, valueTitle, onClick, arrowIconSrc }) => {
  const content = (
    <>
      <span className="shrink-0 font-400 text-[var(--Text-Main-10)]">{label}</span>
      <span
        className="min-w-0 flex-1 whitespace-normal text-right font-400 text-[var(--Text-700)]"
        title={valueTitle}
      >
        {arrowIconSrc ? (
          <img src={arrowIconSrc} alt="" className="ml-auto w-[6px]" aria-hidden="true" />
        ) : (
          value
        )}
      </span>
    </>
  );

  const className = clsx(
    'flex h-40px w-full items-center justify-between px-16px py-10px',
    'text-14px leading-20px whitespace-nowrap',
  );

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
};

const Divider = () => <div className="mx-16px h-[0.5px] bg-[var(--Line-100)]" />;

export default CustomerServiceDeviceInfoPanel;

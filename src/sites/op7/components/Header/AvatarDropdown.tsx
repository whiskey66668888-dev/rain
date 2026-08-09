import React, { useEffect } from 'react';
import clsx from 'clsx';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { useLocation } from 'react-router-dom';
import Icon from '@/common/components/Icon';
import { useAppSelector } from '@/core/store/hooks';
import bigMath from '@/utils/bet/bigMath';
import { AppPath, PATHS } from '@/sites/op7/routes/paths';

export type AvatarMenuItem = { label: string; icon: string; path: AppPath | 'handleLogout' };

const ICON_BASE = '/images/common/mine/icon_pc';

/** 头像点击后的下拉菜单配置 */
export const AVATAR_DROPDOWN_MENU: AvatarMenuItem[] = [
  { label: '我的钱包', icon: 'common_icon', path: PATHS.mineTransfer },
  { label: '交易记录', icon: 'transaction_record', path: PATHS.mineTransactionRecord },
  { label: '投注记录', icon: 'betting_record', path: PATHS.allBettingRecord },
  { label: 'VIP中心', icon: 'vip', path: PATHS.vipCenter },
  { label: '福利中心', icon: 'welfare_center', path: PATHS.mineWelfareCenter },
  { label: '联盟推广', icon: 'tg', path: PATHS.mineInviteFriends },
  { label: '个人资料', icon: 'profile', path: PATHS.mineProfile },
  { label: '系统设置', icon: 'settings', path: PATHS.systemSettings },
  { label: '帮助中心', icon: 'help', path: PATHS.helpCenter },
  { label: '退出登录', icon: 'logout', path: 'handleLogout' },
];

export interface AvatarDropdownProps {
  onClose: () => void;
  onLogout: () => void;
  /** 包含头像与下拉的容器 ref，用于点击外部关闭 */
  containerRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

/**
 * 头像下拉菜单
 */
const AvatarDropdown: React.FC<AvatarDropdownProps> = ({
  onClose,
  onLogout,
  containerRef,
  className,
}) => {
  const navigate = useNavigateWithLanguage();
  const location = useLocation();
  const extendMoney = useAppSelector((state) => state.user.memberInfo.extendMoney);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef?.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, containerRef]);

  const handleItemClick = (item: AvatarMenuItem) => {
    if (item.path === 'handleLogout') {
      onLogout();
    } else if (item.path) {
      navigate(item.path);
    }
    onClose();
  };

  return (
    <div
      className={clsx('absolute right-0 top-full w-160px pt-20px', 'hidden lg:block', className)}
    >
      <div
        className={clsx(
          'rounded-10px bg-[var(--Background-300)] p-10px',
          'max-h-[calc(100vh-100px)] flex flex-col gap-8px overflow-y-auto',
          'shadow-[0_0_20px_0_var(--Shadow-400)]',
        )}
      >
        <div
          className={clsx(
            'h-40px shrink-0 flex items-center justify-between',
            'bg-[var(--ThemeColor-Main)] rounded-6px p-8px',
          )}
        >
          <div className="_tf[12] font-500 text-[var(--White-100)]">锁定钱包</div>
          <div className="_tf[12] font-500 text-[var(--White-100)] din-pro">
            {bigMath.decimals(extendMoney, { padZero: true })}
          </div>
        </div>
        {AVATAR_DROPDOWN_MENU.map((item) => {
          const active = item.path && location.pathname.includes(item.path);
          return (
            <button
              key={item.label}
              type="button"
              className={clsx(
                'flex h-36px shrink-0 items-center gap-10px px-7px text-left',
                {
                  'bg-[var(--ThemeColor-20)] rounded-6px': active,
                },
                'can-hover:hover:bg-[var(--ThemeColor-20)] can-hover:hover:rounded-6px',
              )}
              onClick={() => handleItemClick(item)}
            >
              <Icon
                src={`${ICON_BASE}/${item.icon}.svg`}
                size={16}
                color={active ? 'var(--ThemeColor-Main)' : 'var(--Text-800)'}
              />
              <span
                className={clsx(
                  'text-12px font-500',
                  active ? 'text-[var(--ThemeColor-Main)]' : 'text-[var(--Text-Main-10)]',
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AvatarDropdown;

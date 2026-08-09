import React, { useMemo } from 'react';
import styles from './SystemSettingsPage.module.scss';
import clsx from 'clsx';
import Switch from '@/common/components/Switch';
import SegmentedControl from '@/common/components/SegmentedControl';
import Button from '@/common/components/Button';
import { useLogin } from '@/common/hooks/useLogin';
import Icon from '@/common/components/Icon';
import { useSystem } from '@/common/hooks/useSystem';
import { FontScaleType } from '@/utils/constants/system';
import { useAppSelector } from '@/core/store/hooks';
import { ClientOnly } from '@/common/components/ClientOnly';
import { ConfigState, ThemeMode } from '@/core/store/slices/configSlice';
import H5Header from '@/sites/op7/components/H5Header';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';
import { useMemberSettingActions } from '@/common/hooks/memberSettingsBridge';

const FONT_SIZE_OPTIONS = [
  { value: FontScaleType.NORMAL, label: '常规' },
  { value: FontScaleType.MEDIUM, label: '中' },
  { value: FontScaleType.LARGE, label: '大' },
];

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: '自动' },
  { value: 'light', label: '白天' },
  { value: 'dark', label: '黑夜' },
];

// const ENTERTAINMENT_CARD_STYLE_OPTIONS: { value: EntertainmentCardStyle; label: string }[] = [
//   { value: 'color', label: '彩色' },
//   { value: 'mono', label: '纯色' },
// ];

/**
 * 系统设置（三级路由）
 */
const SystemSettingsPage: React.FC = () => {
  const { logout } = useLogin();
  const { fontScaleType, themeMode } = useAppSelector((state) => state.config.system);
  const { smsNotification, appNotification, emailNotification, trialInterface } = useAppSelector(
    (state) => state.config.system,
  );
  const userName = useAppSelector((state) => state.user.userInfo.loginName);
  const { setFontScaleType, setTheme } = useSystem();
  const { updateManagedSetting } = useMemberSettingActions();
  const openCustomerService = useOpenCustomerService();

  const SWITCH_SYSTEM_CONFIG_OPTIONS: {
    value: keyof ConfigState['system'];
    checked: boolean;
    label: string;
  }[] = useMemo(
    () => [
      { value: 'smsNotification', checked: smsNotification ?? true, label: '短信通知' },
      { value: 'appNotification', checked: appNotification ?? true, label: '应用内通知' },
      { value: 'emailNotification', checked: emailNotification ?? true, label: '邮件通知' },
      { value: 'trialInterface', checked: trialInterface ?? true, label: '试玩接口' },
    ],
    [smsNotification, appNotification, emailNotification, trialInterface],
  );
  return (
    <div
      className={clsx(
        styles.systemSettingsPage,
        'font-400 _tf[14]',
        'self-center w-full ',
        'flex-1 flex flex-col ',
        'overflow-y-auto lg:overflow-initial',
        'lg:max-w-[1220px]',
      )}
    >
      <H5Header title="系统设置" />
      <ul className={styles.btnBox}>
        <li>
          <span>会员账号</span>
          <ClientOnly>
            <div className="text-[var(--Text-700)]">{userName}</div>
          </ClientOnly>
        </li>
      </ul>
      <ul className={styles.btnBox}>
        {SWITCH_SYSTEM_CONFIG_OPTIONS.map((item) => (
          <li key={item.value}>
            <span>{item.label}</span>
            <ClientOnly>
              <Switch
                checked={item.checked}
                onChange={(v) => {
                  if (item.value === 'smsNotification') {
                    void updateManagedSetting('smsStatus', v);
                    return;
                  }
                  if (item.value === 'appNotification') {
                    void updateManagedSetting('appNotice', v);
                    return;
                  }
                  if (item.value === 'emailNotification') {
                    void updateManagedSetting('emailNotice', v);
                    return;
                  }
                  if (item.value === 'trialInterface') {
                    void updateManagedSetting('testPlay', v);
                    return;
                  }
                }}
              />
            </ClientOnly>
          </li>
        ))}
        <li>
          <span>字体大小</span>
          <ClientOnly>
            <SegmentedControl
              options={FONT_SIZE_OPTIONS}
              value={fontScaleType ?? FontScaleType.NORMAL}
              onChange={(v) => setFontScaleType(v)}
            />
          </ClientOnly>
        </li>
        <li>
          <span>外观样式</span>
          <ClientOnly>
            <SegmentedControl
              options={THEME_OPTIONS}
              value={themeMode ?? 'system'}
              onChange={(v) => setTheme(v)}
            />
          </ClientOnly>
        </li>
        {/* <li>
          <span>体育图卡彩蛋</span>
          <div>
            <Switch checked={sportsCardEgg ?? true} onChange={(v) => updateSystemConfig({ sportsCardEgg: v })} />
          </div>
        </li> */}
        {/* <li>
          <span>娱乐图卡样式</span>
          <ClientOnly>
            <SegmentedControl
              options={ENTERTAINMENT_CARD_STYLE_OPTIONS}
              value={entertainmentCardStyle ?? 'color'}
              onChange={(v) => {
                updateSystemConfig({ entertainmentCardStyle: v });
                void updateManagedSetting(
                  'pictureCardStyle',
                  mapEntertainmentCardStyleToPictureCardStyle(v),
                );
              }}
            />
          </ClientOnly>
        </li> */}
      </ul>
      <Button
        type="primary"
        className={clsx(styles.logoutButton, '_tf[16]')}
        onClick={() => void logout()}
      >
        退出登录
      </Button>
      <button
        type="button"
        className="text-[var(--ThemeColor-Main)] _tf[12] flex items-center gap-4px w-full justify-center cursor-pointer lg:hidden border-none bg-transparent"
        onClick={openCustomerService}
      >
        <Icon src="/images/common/CustomerService.svg" size={16} color="var(--ThemeColor-Main)" />
        <span className="text-[var(--ThemeColor-Main)]">在线客服</span>
      </button>
    </div>
  );
};

export default SystemSettingsPage;

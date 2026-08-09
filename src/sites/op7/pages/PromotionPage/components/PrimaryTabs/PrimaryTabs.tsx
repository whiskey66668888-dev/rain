import clsx from 'clsx';
import { Fragment, useRef } from 'react';
import styles from './PrimaryTabs.module.scss';
import { PrimaryTabType } from '../../constants';
import { postMomentsGoTopMessage } from '@/sites/op7/pages/MomentsPage/momentsIframeBridge';
import { useSocialUnreadCount } from '@/apis/origin/social/getSocialUnreadCount';

const MOMENTS_TAB_VALUES: PrimaryTabType[] = ['momentsPublic', 'momentsOfficial'];
/** 两次点击间隔小于该值视为双击（H5 触摸端无 dblclick 事件） */
const DOUBLE_TAP_DELAY_MS = 300;

interface PrimaryTabsProps {
  tabs: {
    label: string;
    value: PrimaryTabType;
    path: string;
  }[];
  active: PrimaryTabType;
  onChange: (val: { label: string; value: PrimaryTabType; path: string }) => void;
}

const PrimaryTabs = ({ tabs, active, onChange }: PrimaryTabsProps) => {
  const lastTapRef = useRef<{ tabValue: PrimaryTabType; time: number } | null>(null);

  const handleTabClick = (
    tab: { label: string; value: PrimaryTabType; path: string },
    isActive: boolean,
  ) => {
    const now = Date.now();
    const isMomentsTab = MOMENTS_TAB_VALUES.includes(tab.value);

    if (isActive && isMomentsTab) {
      const lastTap = lastTapRef.current;
      if (lastTap?.tabValue === tab.value && now - lastTap.time <= DOUBLE_TAP_DELAY_MS) {
        lastTapRef.current = null;
        postMomentsGoTopMessage();
        return;
      }
      lastTapRef.current = { tabValue: tab.value, time: now };
      return;
    }

    lastTapRef.current = null;
    onChange(tab);
  };

  const socialUnreadCount = useSocialUnreadCount();
  const showMomentsRedDot = socialUnreadCount > 0;

  return (
    <div className={styles.primaryTabs}>
      {tabs.map((tab, index) => {
        const isActive = tab.value === active;

        return (
          <Fragment key={tab.path}>
            <div
              className={clsx(`${styles.tabItem} ${isActive ? styles.active : ''}`, '_tf[14]')}
              onClick={() => handleTabClick(tab, isActive)}
            >
              {tab.label}
              {tab.value === 'momentsPublic' && showMomentsRedDot && (
                <section className={styles.redDot} />
              )}
            </div>
            {/* 最后一个 tab 不显示竖杠 */}
            {index < tabs.length - 1 && (
              <div className={'w-[0.5px] h-[14px] bg-[var(--Line-200)] ml-[16px] mr-[16px]'}></div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
};

export default PrimaryTabs;

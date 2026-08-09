import React from 'react';
import clsx from 'clsx';
import styles from '../Skeleton.module.scss';

/**
 * 系统设置页骨架屏
 * 对应 mine/system_settings 路由
 */
const SystemSettingsPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-full w-full bg-[var(--Background-700)]">
      {/* H5 顶栏占位 */}
      <div className="flex h-[44px] items-center justify-between px-[16px] lg:hidden">
        <div className={clsx(styles.skeletonBase, 'h-[24px] w-[24px] rounded-[12px]')} />
        <div className={clsx(styles.skeletonBase, 'h-[20px] w-[80px] rounded-[12px]')} />
        <div className="h-[24px] w-[24px]" />
      </div>

      <div className="flex flex-col gap-[12px] p-[12px] lg:p-0">
        {/* 账号信息块 */}
        <div className="overflow-hidden rounded-[12px] bg-[var(--Background-300)]">
          <div className="flex items-center justify-between gap-[12px] px-[12px] py-[14px]">
            <div className={clsx(styles.skeletonBase, 'h-[20px] w-[72px] rounded-[8px]')} />
            <div className={clsx(styles.skeletonBase, 'h-[20px] w-[120px] rounded-[8px]')} />
          </div>
        </div>

        {/* 系统设置项 */}
        <div className="overflow-hidden rounded-[12px] bg-[var(--Background-300)]">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-[12px] px-[12px] py-[14px] shadow-[0_-0.5px_0_0_var(--Line-100)_inset] first:shadow-none"
            >
              <div className={clsx(styles.skeletonBase, 'h-[20px] w-[84px] rounded-[8px]')} />
              <div className={clsx(styles.skeletonBase, 'h-[24px] w-[44px] rounded-full')} />
            </div>
          ))}

          {[1, 2].map((i) => (
            <div
              key={`segmented-${i}`}
              className="flex items-center justify-between gap-[12px] px-[12px] py-[14px] shadow-[0_-0.5px_0_0_var(--Line-100)_inset]"
            >
              <div className={clsx(styles.skeletonBase, 'h-[20px] w-[84px] rounded-[8px]')} />
              <div className={clsx(styles.skeletonBase, 'h-[32px] w-[144px] rounded-full')} />
            </div>
          ))}
        </div>

        {/* 退出登录按钮 */}
        <div className={clsx(styles.skeletonBase, 'mt-[20px] h-[44px] w-full rounded-[12px]')} />

        {/* 在线客服 */}
        <div className="flex items-center justify-center gap-[8px] py-[8px]">
          <div className={clsx(styles.skeletonBase, 'h-[16px] w-[16px] rounded-[6px]')} />
          <div className={clsx(styles.skeletonBase, 'h-[14px] w-[64px] rounded-[8px]')} />
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPageSkeleton;

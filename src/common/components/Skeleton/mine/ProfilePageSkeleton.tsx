import React from 'react';
import clsx from 'clsx';
import styles from '../Skeleton.module.scss';

/**
 * 个人资料页骨架屏
 * 对应 mine/profile 路由
 */
const ProfilePageSkeleton: React.FC = () => {
  return (
    <div className="min-h-full w-full bg-[var(--Background-700)]">
      {/* H5 顶栏占位 */}
      <div className="flex h-[44px] items-center justify-between px-[16px] lg:hidden">
        <div className={clsx(styles.skeletonBase, 'h-[24px] w-[24px] rounded-[12px]')} />
        <div className={clsx(styles.skeletonBase, 'h-[20px] w-[80px] rounded-[12px]')} />
        <div className="h-[24px] w-[24px]" />
      </div>

      <div className="flex flex-col gap-[12px] p-[12px] lg:p-0">
        {/* 头像行 */}
        <div className="flex items-center justify-between rounded-[12px] bg-[var(--Background-300)] px-[12px] py-[8px]">
          <div className={clsx(styles.skeletonBase, 'h-[20px] w-[40px] rounded-[8px]')} />
          <div className="flex items-center gap-[4px]">
            <div className={clsx(styles.skeletonBase, 'h-[40px] w-[40px] shrink-0 rounded-full')} />
            <div className={clsx(styles.skeletonBase, 'h-[12px] w-[12px] rounded-[4px]')} />
          </div>
        </div>

        {/* 信息列表块：用户名 / 性别 / 真实姓名 / 生日 / 收货地址 */}
        <div className="overflow-hidden rounded-[12px] bg-[var(--Background-300)]">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-[12px] px-[12px] py-[14px] shadow-[0_-0.5px_0_0_var(--Line-100)_inset] first:shadow-none"
            >
              <div className={clsx(styles.skeletonBase, 'h-[20px] w-[64px] rounded-[8px]')} />
              <div className={clsx(styles.skeletonBase, 'h-[20px] w-[100px] rounded-[8px]')} />
            </div>
          ))}
        </div>

        {/* 邀请码行 */}
        <div className="flex items-center justify-between rounded-[12px] bg-[var(--Background-300)] px-[12px] py-[14px]">
          <div className={clsx(styles.skeletonBase, 'h-[20px] w-[80px] rounded-[8px]')} />
          <div className="flex items-center gap-[4px]">
            <div className={clsx(styles.skeletonBase, 'h-[20px] w-[100px] rounded-[8px]')} />
            <div className={clsx(styles.skeletonBase, 'h-[16px] w-[16px] rounded-[4px]')} />
          </div>
        </div>

        {/* 退出登录按钮 */}
        <div className={clsx(styles.skeletonBase, 'h-[44px] w-full rounded-[12px]')} />
      </div>
    </div>
  );
};

export default ProfilePageSkeleton;

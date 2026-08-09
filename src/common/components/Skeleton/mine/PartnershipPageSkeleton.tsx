import React from 'react';
import clsx from 'clsx';
import styles from '../Skeleton.module.scss';

const PartnershipPageSkeleton: React.FC = () => {
  return (
    <div className="self-center w-full flex-1 flex flex-col overflow-y-auto lg:overflow-initial lg:max-w-[1220px]">
      {/* H5 顶栏 */}
      <div className="flex h-[44px] shrink-0 items-center justify-between px-[16px] lg:hidden">
        <div className={clsx(styles.skeletonBase, 'h-[24px] w-[24px] rounded-[12px]')} />
        <div className={clsx(styles.skeletonBase, 'h-[20px] w-[80px] rounded-[12px]')} />
        <div className="h-[24px] w-[24px]" />
      </div>

      <div className="flex flex-col gap-[24px] p-[12px] lg:gap-[40px] lg:p-[24px]">
        {/* Logo 占位 */}
        <div className="self-center py-[12px]">
          <div className={clsx(styles.skeletonBase, 'h-[24px] w-[64px] rounded-[6px]')} />
        </div>

        {/* 联盟合营 section */}
        <div className="flex flex-col gap-[16px]">
          <div className="flex items-center justify-center gap-[16px]">
            <div className={clsx(styles.skeletonBase, 'h-[21px] w-[40px] rounded-[6px]')} />
            <div className={clsx(styles.skeletonBase, 'h-[20px] w-[80px] rounded-[6px]')} />
            <div className={clsx(styles.skeletonBase, 'h-[21px] w-[40px] rounded-[6px]')} />
          </div>
          <div className="grid grid-cols-2 gap-[10px] lg:gap-[24px]">
            {[...Array(4).keys()].map((i) => (
              <div
                key={i}
                className={clsx(styles.skeletonBase, 'h-[148px] w-full rounded-[12px]')}
              />
            ))}
          </div>
        </div>

        {/* 联络我们 section */}
        <div className="flex flex-col gap-[16px]">
          <div className="flex items-center justify-center gap-[16px]">
            <div className={clsx(styles.skeletonBase, 'h-[21px] w-[40px] rounded-[6px]')} />
            <div className={clsx(styles.skeletonBase, 'h-[20px] w-[80px] rounded-[6px]')} />
            <div className={clsx(styles.skeletonBase, 'h-[21px] w-[40px] rounded-[6px]')} />
          </div>
          <div className="flex flex-col gap-[10px]">
            {[...Array(3).keys()].map((i) => (
              <div
                key={i}
                className={clsx(styles.skeletonBase, 'h-[56px] w-full rounded-[12px]')}
              />
            ))}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className={clsx(styles.skeletonBase, 'h-[44px] w-full rounded-[8px]')} />
      </div>
    </div>
  );
};

export default PartnershipPageSkeleton;

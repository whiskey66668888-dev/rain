import React from 'react';
import clsx from 'clsx';
import styles from './Skeleton.module.scss';

const DELAY_CLASSES = [
  styles.delay1,
  styles.delay2,
  styles.delay3,
  styles.delay4,
  styles.delay5,
] as const;

/**
 * 呼朋唤友-邀请总人数（好友邀请记录）骨架屏
 * 对齐 InvitationReportPage：H5Header -> 标题 -> TabList -> 搜索 -> ListTable -> InfiniteScroll
 */
const InviteFriendsInvitationReportSkeleton: React.FC = () => {
  return (
    <div className="self-center w-full flex-1 flex flex-col overflow-y-auto lg:overflow-initial lg:max-w-[1220px]">
      {/* H5 顶栏 */}
      <div className="flex h-[44px] shrink-0 items-center justify-between px-[16px] lg:hidden">
        <div className={clsx(styles.skeletonBase, 'h-[24px] w-[24px] rounded-[12px]')} />
        <div className={clsx(styles.skeletonBase, 'h-[20px] w-[108px] rounded-[12px]')} />
        <div className={clsx(styles.skeletonBase, 'h-[20px] w-[32px] rounded-[10px]')} />
      </div>

      <div className="w-full px-[12px] pb-[20px]">
        {/* 标题 */}
        <div className="my-[12px] flex h-[20px] items-center gap-[4px]">
          <div className={clsx(styles.skeletonBase, 'h-[16px] w-[2px] rounded-[1px]')} />
          <div className={clsx(styles.skeletonBase, 'h-[16px] w-[96px] rounded-[8px]')} />
        </div>

        {/* TabList（3个） */}
        <div className="mb-[12px] flex items-center gap-[6px] rounded-[20px] bg-[var(--Background-700)] p-[2px]">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={clsx(
                styles.skeletonBase,
                DELAY_CLASSES[(i - 1) % 5],
                'h-[32px] flex-1 rounded-[16px]',
              )}
            />
          ))}
        </div>

        {/* 搜索栏 */}
        <div className="mb-[17px] flex h-[40px] items-center gap-[8px] rounded-[20px] bg-[var(--Background-700)] px-[12px]">
          <div className={clsx(styles.skeletonBase, 'h-[14px] w-[28px] rounded-[6px]')} />
          <div className={clsx(styles.skeletonBase, 'h-[14px] flex-1 rounded-[6px]')} />
          <div className={clsx(styles.skeletonBase, 'h-[14px] w-[28px] rounded-[6px]')} />
        </div>

        {/* 数据时间 */}
        <div className="mb-[10px] flex items-center gap-[8px]">
          <div className={clsx(styles.skeletonBase, 'h-[12px] w-[56px] rounded-[6px]')} />
          <div className={clsx(styles.skeletonBase, 'h-[12px] w-[170px] rounded-[6px]')} />
          <div className={clsx(styles.skeletonBase, 'h-[14px] w-[14px] rounded-full')} />
        </div>

        {/* 三列表格：账号(等级) / 注册时间 / 状态 */}
        <div className="overflow-hidden rounded-[12px] border border-[var(--Line-100)]">
          <div className="flex bg-[var(--Line-100)]">
            <div className="flex flex-[1.2] items-center justify-center px-[6px] py-[12px]">
              <div className={clsx(styles.skeletonBase, 'h-[14px] w-[72px] rounded-[6px]')} />
            </div>
            <div className="flex flex-[1.5] items-center justify-center px-[6px] py-[12px]">
              <div className={clsx(styles.skeletonBase, 'h-[14px] w-[72px] rounded-[6px]')} />
            </div>
            <div className="flex flex-1 items-center justify-center px-[6px] py-[12px]">
              <div className={clsx(styles.skeletonBase, 'h-[14px] w-[36px] rounded-[6px]')} />
            </div>
          </div>

          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={clsx(
                'flex border-t border-[var(--Line-100)]',
                i % 2 === 0 && 'bg-[var(--Background-700)]',
              )}
            >
              <div className="flex flex-[1.2] items-center justify-center px-[6px] py-[14px]">
                <div
                  className={clsx(
                    styles.skeletonBase,
                    DELAY_CLASSES[(i + 1) % 5],
                    'h-[12px] w-[78px] rounded-[6px]',
                  )}
                />
              </div>
              <div className="flex flex-[1.5] items-center justify-center px-[6px] py-[14px]">
                <div className={clsx(styles.skeletonBase, 'h-[12px] w-[120px] rounded-[6px]')} />
              </div>
              <div className="flex flex-1 items-center justify-center px-[6px] py-[14px]">
                <div className={clsx(styles.skeletonBase, 'h-[12px] w-[44px] rounded-[6px]')} />
              </div>
            </div>
          ))}
        </div>

        {/* 底部加载文案 */}
        <div className="py-[12px] text-center">
          <div className="inline-flex items-center gap-[6px]">
            <div className={clsx(styles.skeletonBase, 'h-[12px] w-[44px] rounded-[6px]')} />
            <div className={clsx(styles.skeletonBase, 'h-[12px] w-[12px] rounded-full')} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteFriendsInvitationReportSkeleton;

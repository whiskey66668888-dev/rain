import React from 'react';
import clsx from 'clsx';
import styles from '../Skeleton.module.scss';

const DELAY = [styles.delay1, styles.delay2, styles.delay3, styles.delay4, styles.delay5] as const;

/**
 * 呼朋唤友 / 邀请好友首页骨架屏
 */
const InviteFriendsSkeleton: React.FC = () => {
  return (
    <div className="w-full pb-[20px]">
      {/* H5Header（与 H5Header pcHidden 一致，大屏隐藏） */}
      <div className="flex h-[44px] shrink-0 items-center justify-between px-[16px] lg:hidden">
        <div className={clsx(styles.skeletonBase, 'h-[24px] w-[24px] rounded-[12px]')} />
        <div
          className={clsx(styles.skeletonBase, 'h-[20px] w-[140px] max-w-[55%] rounded-[12px]')}
        />
        <div className={clsx(styles.skeletonBase, 'h-[24px] w-[24px] rounded-[12px]')} />
      </div>

      {/* topBannerWrap */}
      <div className="w-full overflow-hidden">
        <div className={clsx(styles.skeletonBase, 'h-[min(42vw,200px)] w-full rounded-none')} />
      </div>

      {/* main + mainH5 */}
      <div className="px-[12px] lg:px-0">
        {/* mainTop：navBox + navBottomBox */}
        <div className="mt-[12px] rounded-[12px] bg-[var(--background-100)] p-[12px]">
          <div className="flex items-center gap-[4px]">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={clsx(
                  styles.skeletonBase,
                  DELAY[(i - 1) % 5],
                  'h-[36px] min-w-0 flex-1 rounded-[18px]',
                )}
              />
            ))}
          </div>
          <div className="mt-[12px] flex items-center justify-center gap-[6px] rounded-[10px] bg-[var(--theme-main)] px-[12px] py-[12px]">
            <div
              className={clsx(styles.skeletonBase, 'h-[16px] w-[16px] shrink-0 rounded-[4px]')}
            />
            <div className={clsx(styles.skeletonBase, 'h-[16px] w-[100px] rounded-[8px]')} />
          </div>
        </div>

        {/* MyTitle：嘉奖明细 + 右侧「点击领取」占位（首 Tab） */}
        <div className="mb-[12px] mt-[12px] flex h-[20px] items-center justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-[4px]">
            <div className={clsx(styles.skeletonBase, 'h-[16px] w-[2px] shrink-0 rounded-[1px]')} />
            <div className={clsx(styles.skeletonBase, 'h-[16px] w-[72px] rounded-[8px]')} />
          </div>
          <div className="flex flex-1 justify-end">
            <div className="flex items-center gap-[5px]">
              <div className={clsx(styles.skeletonBase, 'h-[16px] w-[16px] rounded-[4px]')} />
              <div className={clsx(styles.skeletonBase, 'h-[12px] w-[56px] rounded-[6px]')} />
            </div>
          </div>
        </div>

        {/* MyTable 容器 + 表头 + 3 行 + 展开条 */}
        <div className="w-full rounded-[12px] bg-[var(--background-100)] p-[12px]">
          <div className="overflow-hidden rounded-[12px] border border-[var(--line-300)]">
            <div className="flex w-full bg-[var(--background-700)]">
              <div className="flex h-[44px] flex-1 items-center justify-center px-[4px] py-[8px]">
                <div
                  className={clsx(
                    styles.skeletonBase,
                    'h-[14px] w-[min(100%,120px)] rounded-[6px]',
                  )}
                />
              </div>
              <div className="flex h-[44px] flex-1 items-center justify-center px-[4px] py-[8px]">
                <div
                  className={clsx(
                    styles.skeletonBase,
                    'h-[14px] w-[min(100%,100px)] rounded-[6px]',
                  )}
                />
              </div>
            </div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={clsx(
                  'flex w-full',
                  i % 2 === 0 ? 'bg-[var(--background-700)]' : 'bg-transparent',
                )}
              >
                <div className="flex min-h-[50px] flex-1 items-center justify-center px-[4px] py-[8px]">
                  <div
                    className={clsx(
                      styles.skeletonBase,
                      DELAY[(i + 1) % 5],
                      'h-[12px] w-[40px] rounded-[6px]',
                    )}
                  />
                </div>
                <div className="flex min-h-[50px] flex-1 items-center justify-center px-[4px] py-[8px]">
                  <div className={clsx(styles.skeletonBase, 'h-[14px] w-[48px] rounded-[6px]')} />
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center gap-[4px] border-t border-[var(--line-300)] py-[10px]">
              <div className={clsx(styles.skeletonBase, 'h-[12px] w-[64px] rounded-[6px]')} />
              <div className={clsx(styles.skeletonBase, 'h-[12px] w-[12px] rounded-[4px]')} />
            </div>
          </div>
        </div>

        {/* tips */}
        <div className="mt-[8px]">
          <div
            className={clsx(styles.skeletonBase, 'h-[11px] w-[220px] max-w-[90%] rounded-[6px]')}
          />
        </div>

        {/* 最新领奖记录 */}
        <div className="mb-[12px] mt-[12px] flex h-[20px] items-center justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-[4px]">
            <div className={clsx(styles.skeletonBase, 'h-[16px] w-[2px] shrink-0 rounded-[1px]')} />
            <div className={clsx(styles.skeletonBase, 'h-[16px] w-[96px] rounded-[8px]')} />
          </div>
        </div>
        <div
          className={clsx(
            'mt-[8px] box-border h-[124px] overflow-hidden rounded-[12px] bg-[var(--background-100)] p-[10px]',
          )}
        >
          <div className="flex h-full flex-col justify-center gap-[6px] py-[4px]">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex w-full items-center justify-center gap-[8px]">
                <div
                  className={clsx(
                    styles.skeletonBase,
                    DELAY[(i + 2) % 5],
                    'h-[10px] w-[72px] rounded-[4px]',
                  )}
                />
                <div className={clsx(styles.skeletonBase, 'h-[10px] w-[80px] rounded-[4px]')} />
                <div className={clsx(styles.skeletonBase, 'h-[10px] w-[48px] rounded-[4px]')} />
              </div>
            ))}
          </div>
        </div>

        {/* 活动说明 */}
        <div className="mb-[12px] mt-[12px] flex h-[20px] items-center justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-[4px]">
            <div className={clsx(styles.skeletonBase, 'h-[16px] w-[2px] shrink-0 rounded-[1px]')} />
            <div className={clsx(styles.skeletonBase, 'h-[16px] w-[72px] rounded-[8px]')} />
          </div>
          <div className="flex flex-1 justify-end">
            <div className="flex items-center gap-[4px]">
              <div className={clsx(styles.skeletonBase, 'h-[16px] w-[16px] rounded-[4px]')} />
              <div className={clsx(styles.skeletonBase, 'h-[12px] w-[56px] rounded-[6px]')} />
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-[12px] bg-[var(--background-100)] p-[12px]">
          {[1, 2, 3].map((block) => (
            <div key={block} className={clsx(block > 1 && 'mt-[16px]')}>
              <div className="mb-[8px] flex items-center gap-[8px]">
                <div className={clsx(styles.skeletonBase, 'h-[6px] w-[6px] rounded-full')} />
                <div className={clsx(styles.skeletonBase, 'h-[14px] w-[64px] rounded-[6px]')} />
              </div>
              <div className="flex flex-col gap-[8px] pl-[14px]">
                <div
                  className={clsx(
                    styles.skeletonBase,
                    'h-[12px] w-full max-w-[100%] rounded-[6px]',
                  )}
                />
                <div className={clsx(styles.skeletonBase, 'h-[12px] w-[88%] rounded-[6px]')} />
                <div className={clsx(styles.skeletonBase, 'h-[12px] w-[72%] rounded-[6px]')} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InviteFriendsSkeleton;

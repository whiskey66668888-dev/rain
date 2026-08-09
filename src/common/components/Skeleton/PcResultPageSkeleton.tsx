import React from 'react';

import clsx from 'clsx';

import styles from './Skeleton.module.scss';

const PcResultPageSkeleton: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-[var(--Background-700)]">
      <div className="flex items-center gap-5 h-12 px-6 bg-[var(--Background-300)] border-b border-[var(--Line-100)] rounded-t-[12px]">
        <div className={`${styles.skeletonBase} w-13 h-5`} />
        <div className={`${styles.skeletonBase} w-10 h-4`} />
      </div>

      <div className="flex flex-col gap-3 py-2">
        <div className="flex gap-3">
          <div className={`${styles.skeletonBase} w-20 h-8 rounded-[16px]`} />
        </div>
        <div className="flex gap-3">
          <div className={`${styles.skeletonBase} w-25 h-8 rounded-[16px]`} />
          <div className={`${styles.skeletonBase} w-36 h-8 rounded-[16px]`} />
          <div className={`${styles.skeletonBase} w-25 h-8 rounded-[16px]`} />
          <div className={`${styles.skeletonBase} w-44 h-8 rounded-[16px]`} />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 p-3 bg-[var(--Background-300)] rounded-t-[12px] overflow-hidden">
        <div className={`${styles.skeletonBase} w-24 h-5`} />

        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex flex-col rounded-md overflow-hidden">
              <div className={`${styles.skeletonBase} h-9 px-3`} />
              <div className="flex flex-col">
                {Array.from({ length: 2 }).map((__, m) => (
                  <div
                    key={m}
                    className={clsx(
                      'flex items-center h-[54px] px-5 gap-3',
                      m % 2 === 1 ? 'bg-[var(--Background-500)]' : 'bg-[var(--Background-300)]',
                    )}
                  >
                    <div className={`${styles.skeletonBase} w-20 h-3`} />
                    <div className={`${styles.skeletonBase} flex-1 h-3`} />
                    <div className={`${styles.skeletonBase} w-8 h-3`} />
                    <div className={`${styles.skeletonBase} flex-1 h-3`} />
                    <div className={`${styles.skeletonBase} w-16 h-3`} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <div className={`${styles.skeletonBase} w-28 h-7`} />
      </div>
    </div>
  );
};

export default PcResultPageSkeleton;

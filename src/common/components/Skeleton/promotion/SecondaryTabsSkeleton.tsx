import clsx from 'clsx';
import styles from '../Skeleton.module.scss';

/**
 * SecondaryTabs 骨架屏
 * 对齐真实组件：外层 54px，内部圆角胶囊背景，若干胶囊 tab 占位
 */
const SecondaryTabsSkeleton = () => {
  return (
    <div
      className="px-[14px] h-[54px] flex items-center justify-center max-w-[1200px] mx-auto w-full"
      style={{ background: 'var(--Background-300, #fff)' }}
    >
      <div
        className="h-[38px] flex items-center justify-center gap-2 px-1 rounded-[30px] overflow-hidden lg:w-full"
        style={{ background: 'var(--Background-700, #f5f7fa)' }}
      >
        {[46, 46, 46, 46, 46, 46, 46].map((w, i) => (
          <div
            key={i}
            className={clsx(styles.skeletonBase, 'h-[32px] rounded-[30px] flex-shrink-0 lg:flex-1')}
            style={{ width: w }}
          />
        ))}
      </div>
    </div>
  );
};

export default SecondaryTabsSkeleton;

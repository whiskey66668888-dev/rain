import clsx from 'clsx';
import type { ReactNode } from 'react';
import styles from './index.module.scss';

interface MyTitleProps {
  leftContent?: ReactNode;
  centerContent?: ReactNode;
  rightContent?: ReactNode;
  className?: string;
  onClick?: () => void;
}

const MyTitle: React.FC<MyTitleProps> = ({
  leftContent,
  centerContent,
  rightContent,
  className = '',
  onClick,
}) => {
  return (
    <div className={clsx(styles.titleContainer, className)} onClick={onClick}>
      <div className={clsx(styles.leftContent, '_tf[14]')}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="2"
          height="16"
          viewBox="0 0 2 16"
          fill="none"
        >
          <path d="M0 0L2 1V15L0 16V0Z" fill="var(--ThemeColor-Main)" />
        </svg>
        {leftContent}
      </div>
      {centerContent && (
        <div className={clsx(styles.centerContent, '_tf[10]')}>{centerContent}</div>
      )}
      <div className={styles.rightContent}>{rightContent}</div>
    </div>
  );
};

export default MyTitle;

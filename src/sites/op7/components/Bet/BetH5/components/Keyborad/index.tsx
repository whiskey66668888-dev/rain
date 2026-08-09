import { cn } from '@/utils';
import styles from './Keyborad.module.scss';
import React from 'react';

const singleNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'DELETE'] as const;
const parlayNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '00'] as const;
const others = ['MAX', 'DELETE', 'CLOSE'] as const;
const quicks = ['100', '200', '500'];

export type TKeyboardItem =
  | (typeof singleNumbers)[number]
  | (typeof parlayNumbers)[number]
  | (typeof others)[number];

export type TKeyBoardChange = {
  (p: { key: TKeyboardItem; value?: undefined }): void;
  (p: { key: 'QUICK'; value: string }): void;
};

interface TKeyboradProps {
  onChange: TKeyBoardChange;
  open?: boolean;
  isParlay?: boolean;
  containerClassName?: string;
  className?: string;
}

const DeleteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-20px h-20px text-[var(--Text-Main-10)]"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M6.91992 4H18.5C18.7761 4 19 4.22386 19 4.5V15.5C19 15.7761 18.7761 16 18.5 16H6.91992C6.628 16 6.35014 15.872 6.16016 15.6504L1.5957 10.3252C1.4355 10.138 1.4355 9.86196 1.5957 9.6748L6.16016 4.34961C6.32646 4.15559 6.56016 4.03324 6.81152 4.00586L6.91992 4Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.5 8.125L13.25 11.875"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.25 8.125L9.5 11.875"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Simplified keyboard hide icon
const KeyboardHideIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-20px h-20px text-[var(--Text-Main-10)]"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M17 13V6C17 4.89543 16.1046 4 15 4H5C3.89543 4 3 4.89543 3 6V13"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M6 14L9.4 16.55C9.75556 16.8167 10.2444 16.8167 10.6 16.55L14 14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M5.75 10C6.16421 10 6.5 10.3358 6.5 10.75C6.5 11.1642 6.16421 11.5 5.75 11.5H5.25C4.83579 11.5 4.5 11.1642 4.5 10.75C4.5 10.3358 4.83579 10 5.25 10H5.75ZM11.75 10C12.1642 10 12.5 10.3358 12.5 10.75C12.5 11.1642 12.1642 11.5 11.75 11.5H8.25C7.83579 11.5 7.5 11.1642 7.5 10.75C7.5 10.3358 7.83579 10 8.25 10H11.75ZM14.75 10C15.1642 10 15.5 10.3358 15.5 10.75C15.5 11.1642 15.1642 11.5 14.75 11.5H14.25C13.8358 11.5 13.5 11.1642 13.5 10.75C13.5 10.3358 13.8358 10 14.25 10H14.75ZM5.75 7C6.16421 7 6.5 7.33579 6.5 7.75C6.5 8.16421 6.16421 8.5 5.75 8.5H5.25C4.83579 8.5 4.5 8.16421 4.5 7.75C4.5 7.33579 4.83579 7 5.25 7H5.75ZM8.75 7C9.16421 7 9.5 7.33579 9.5 7.75C9.5 8.16421 9.16421 8.5 8.75 8.5H8.25C7.83579 8.5 7.5 8.16421 7.5 7.75C7.5 7.33579 7.83579 7 8.25 7H8.75ZM11.75 7C12.1642 7 12.5 7.33579 12.5 7.75C12.5 8.16421 12.1642 8.5 11.75 8.5H11.25C10.8358 8.5 10.5 8.16421 10.5 7.75C10.5 7.33579 10.8358 7 11.25 7H11.75ZM14.75 7C15.1642 7 15.5 7.33579 15.5 7.75C15.5 8.16421 15.1642 8.5 14.75 8.5H14.25C13.8358 8.5 13.5 8.16421 13.5 7.75C13.5 7.33579 13.8358 7 14.25 7H14.75Z"
      fill="currentColor"
    />
  </svg>
);

const Keyborad = ({ onChange, open, isParlay, containerClassName, className }: TKeyboradProps) => {
  const renderLeftGrid = () => {
    const keys = isParlay ? parlayNumbers : singleNumbers;
    return (
      <div className={styles.leftConfig}>
        {keys.map((key) => (
          <div key={key} className={styles.key} onClick={() => onChange({ key })}>
            {key === 'DELETE' ? <DeleteIcon /> : key}
          </div>
        ))}
      </div>
    );
  };

  const renderRightColumn = () => {
    if (isParlay) {
      return (
        <div className={cn(styles.rightConfig, styles.parlayRight)}>
          {others.map((key) => (
            <div key={key} className={styles.key} onClick={() => onChange({ key })}>
              {key === 'DELETE' && <DeleteIcon />}
              {key === 'MAX' && 'MAX'}
              {key === 'CLOSE' && <KeyboardHideIcon />}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={styles.rightConfig}>
        {quicks.map((num) => (
          <div
            key={num}
            className={styles.key}
            onClick={() => onChange({ key: 'QUICK', value: num })}
          >
            {num}
          </div>
        ))}
        <div className={styles.key} onClick={() => onChange({ key: 'MAX' })}>
          MAX
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        styles.keyboardContainer,
        containerClassName,
        open ? styles.open : '',
        'din-pro',
      )}
    >
      <div className={cn(styles.keyboard, className)}>
        {renderLeftGrid()}
        {renderRightColumn()}
      </div>
    </div>
  );
};

export default React.memo(Keyborad);

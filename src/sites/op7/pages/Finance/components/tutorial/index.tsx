import React from 'react';
import WalletChannelIcon, {
  type WalletChannelIconType,
} from '@/sites/op7/components/WalletChannelIcon';
// styles
import styles from './index.module.scss';
/**
 * 钱包 教程
 */
const Tutorial: React.FC<{
  iconType: WalletChannelIconType;
  iconColor?: string;
  name: string;
  onClick: () => void;
}> = ({ iconType, iconColor = 'var(--ThemeColor-Main)', name, onClick }) => {
  return (
    <div
      className={styles.tutorial}
      onClick={() => {
        onClick();
      }}
    >
      <WalletChannelIcon type={iconType} color={iconColor} size={20} />
      <span>{name}</span>
    </div>
  );
};

export default Tutorial;

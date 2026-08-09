import React from 'react';
import { getVipBadgeSrc, maskNickname } from '@/core/sdk/IMManager';
import styles from './VipCelebration.module.scss';

interface VipCelebrationProps {
  vipLevel: number;
  nickname: string;
}

/**
 * VIP 进场横幅（对齐 emc VipCelebration）
 * 展示 2 秒后由上层清空
 */
const VipCelebration: React.FC<VipCelebrationProps> = ({ vipLevel, nickname }) => {
  return (
    <div className={styles.banner}>
      <img
        className={styles.badge}
        src={getVipBadgeSrc(vipLevel)}
        alt={`VIP${vipLevel}`}
        width={52}
        height={28}
      />
      <span className={styles.text}>{maskNickname(nickname)} 进入聊天室,热烈欢迎!</span>
    </div>
  );
};

export default VipCelebration;

import React, { useMemo } from 'react';
import { getMuteRemainMinutes, type ChatMessage, type ChatMuteInfo } from '@/core/sdk/IMManager';
import styles from './MuteNoticeMessageItem.module.scss';

interface MuteNoticeMessageItemProps {
  message: ChatMessage;
  /** 当前生效的禁言态（仅与本条 snapshot 一致时做倒计时） */
  liveMuteInfo?: ChatMuteInfo | null;
  onContactService?: () => void;
}

/**
 * 单用户禁言/解禁 inline 通知（对齐 emc MuteNoticeMessageItem）
 * - 历史通知用创建时定格的 message.content
 * - 当前生效的禁言通知可读 liveMuteInfo 做倒计时
 */
const MuteNoticeMessageItem: React.FC<MuteNoticeMessageItemProps> = ({
  message,
  liveMuteInfo,
  onContactService,
}) => {
  const snapshot = message.muteSnapshot;

  const isActive = useMemo(() => {
    if (!snapshot?.isMuted || !liveMuteInfo?.isMuted) return false;
    return (
      liveMuteInfo.muteType === snapshot.muteType &&
      liveMuteInfo.muteEndTime === snapshot.muteEndTime
    );
  }, [liveMuteInfo, snapshot]);

  // 解禁 / 未禁言
  if (!snapshot?.isMuted) {
    const text = message.content || '你已被解除禁言，你可以继续发言畅聊比赛～';
    return <div className={styles.notice}>{text}</div>;
  }

  let prefix = message.content;
  if (isActive && liveMuteInfo) {
    prefix =
      liveMuteInfo.muteType === 'permanent'
        ? '你已被永久禁言，暂无法在本聊天室发言。'
        : `你已被禁言，剩余 ${getMuteRemainMinutes(liveMuteInfo)} 分钟后可继续发言。`;
  }

  return (
    <div className={styles.notice}>
      <span>{prefix}</span>
      <button type="button" className={styles.link} onClick={onContactService}>
        联系客服
      </button>
    </div>
  );
};

export default MuteNoticeMessageItem;

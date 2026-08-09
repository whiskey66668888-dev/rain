import React from 'react';
import { getMatchScoreText, type ChatMessage, type MatchShareInfo } from '@/core/sdk/IMManager';
import quoteIcon from '@/sites/op7/images/common/chat/ic_quote.svg';
import teamDefaultIcon from '@/sites/op7/images/common/chat/team_default.png';
import MessageHeader from '../MessageHeader';
import styles from './MatchShareMessageItem.module.scss';

interface MatchShareMessageItemProps {
  message: ChatMessage;
  showHeader?: boolean;
  /** 引用回调（他人消息右上角「引用」） */
  onQuote?: (message: ChatMessage) => void;
  /** 作为引用预览时的紧凑样式 */
  isQuote?: boolean;
}

const TEAM_DEFAULT = teamDefaultIcon;

const MatchStageCard: React.FC<{
  info: MatchShareInfo;
  isMine: boolean;
  isQuote?: boolean;
}> = ({ info, isMine, isQuote }) => {
  const score = getMatchScoreText(info);
  const homeName = info.homeTeamName || info.homeTeam || '主队';
  const awayName = info.awayTeamName || info.awayTeam || '客队';
  const homeIcon = info.homeTeamIcon || TEAM_DEFAULT;
  const awayIcon = info.awayTeamIcon || TEAM_DEFAULT;

  return (
    <div
      className={`${styles.stage} ${isMine ? styles.stageMine : ''} ${isQuote ? styles.stageQuote : ''}`}
    >
      <div className={styles.stageInner}>
        {info.leagueName ? <div className={styles.league}>{info.leagueName}</div> : null}
        {/* 布局对齐 Figma / Flutter：主队「名+徽」｜比分｜客队「徽+名」 */}
        <div className={styles.teams}>
          <div className={styles.team}>
            <span className={styles.teamName}>{homeName}</span>
            <img className={styles.logo} src={homeIcon} alt="" width={20} height={20} />
          </div>
          <span className={styles.score}>{score}</span>
          <div className={`${styles.team} ${styles.teamAway}`}>
            <img className={styles.logo} src={awayIcon} alt="" width={20} height={20} />
            <span className={styles.teamName}>{awayName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/** 本场比赛分享卡片（对齐 Figma 46549:1152625 + emc MatchShareMessageItem） */
const MatchShareMessageItem: React.FC<MatchShareMessageItemProps> = ({
  message,
  showHeader = true,
  onQuote,
  isQuote,
}) => {
  const info = message.matchShareInfo;
  if (!info) return null;

  if (isQuote) {
    return <MatchStageCard info={info} isMine={message.isMine} isQuote />;
  }

  return (
    <article className={`${styles.wrap} ${message.isMine ? styles.mine : ''}`}>
      <MessageHeader message={message} showHeader={showHeader} />
      <div className={styles.cardWrap}>
        <MatchStageCard info={info} isMine={message.isMine} />
        {!message.isMine && onQuote ? (
          <button type="button" className={styles.quoteBtn} onClick={() => onQuote(message)}>
            <img className={styles.quoteIcon} src={quoteIcon} alt="" width={12} height={12} />
            引用
          </button>
        ) : null}
      </div>
    </article>
  );
};

export default MatchShareMessageItem;
export { MatchStageCard };

import React from 'react';

import teamDefaultIcon from '@/sites/op7/images/common/chat/team_default.png';

import SharePosterUserRow from '../share/SharePosterUserRow';
import SharePosterInviteRow from '../share/SharePosterInviteRow';
import { SHARE_ASSET } from '../share/constants';

const DEFAULT_TEAM_LOGO = teamDefaultIcon;

export interface MatchSharePosterData {
  leagueName: string;
  /** 开赛时间文案（仅未开赛展示） */
  matchTimeText: string;
  homeName: string;
  awayName: string;
  homeLogo: string;
  awayLogo: string;
  /** 比分文案，如「1 - 1」 */
  scoreText: string;
  /** 滚球中或已完场：展示真实比分，否则展示 VS */
  hasStarted: boolean;
  /** 状态文案：滚球「上半场 40:05」/ 完场「已结束」/ 未开赛「未开赛」 */
  statusText: string;
}

export interface MatchSharePosterProps {
  /** 截图边界 */
  posterRef: React.RefObject<HTMLDivElement>;
  data: MatchSharePosterData;
  /** 会员昵称（不打码，无昵称留空） */
  nickName: string;
  avatarSrc: string;
  /** 打开面板时刻文案 yyyy/MM/dd HH:mm:ss */
  timeText: string;
  /** 邀请码与邀请链接齐全才展示邀请区块 */
  hasInvite: boolean;
  inviteCode: string;
  inviteUrl: string;
}

const onImgError = (e: React.SyntheticEvent<HTMLImageElement>, fallback: string) => {
  const img = e.currentTarget;
  if (img.src.endsWith(fallback)) return;
  img.src = fallback;
};

/** 队名超 6 字截断（对齐 emc _buildTeam：截图渲染稳定，不依赖容器宽度） */
const truncateTeamName = (name: string): string =>
  name.length > 6 ? `${name.slice(0, 6)}...` : name;

const Team: React.FC<{ name: string; logo: string }> = ({ name, logo }) => (
  // min-w-0：flex 子项默认 min-width:auto，长队名会撑开列宽挤歪比分并溢出卡片
  <div className="flex min-w-0 flex-1 flex-col items-center">
    <img
      src={logo || DEFAULT_TEAM_LOGO}
      crossOrigin="anonymous"
      width={32}
      height={32}
      className="h-32px w-32px object-contain"
      onError={(e) => onImgError(e, DEFAULT_TEAM_LOGO)}
      alt=""
    />
    <span className="mt-8px max-w-full truncate text-[12px] font-500 text-white">
      {truncateTeamName(name)}
    </span>
  </div>
);

/**
 * 赛事分享海报（截图区）：用户信息 + 赛事卡片 + 邀请码二维码。
 * 外框与文字跟随主题（对齐 emc _buildPoster）；赛事卡是品牌背景图，
 * 其上的文字固定白色，明暗主题下观感一致。
 */
const MatchSharePoster: React.FC<MatchSharePosterProps> = ({
  posterRef,
  data,
  nickName,
  avatarSrc,
  timeText,
  hasInvite,
  inviteCode,
  inviteUrl,
}) => {
  return (
    <div ref={posterRef} className="rounded-[10px] bg-[var(--Background-500)] p-12px">
      <SharePosterUserRow nickName={nickName} avatarSrc={avatarSrc} timeText={timeText} />

      {/* 赛事卡片 */}
      <div className="relative mt-8px h-[146px] w-full overflow-hidden rounded-[10px]">
        <img
          src={`${SHARE_ASSET}/share_card_bg.png`}
          className="absolute inset-0 h-full w-full object-cover"
          alt=""
        />
        <div className="relative flex h-full flex-col items-center px-6px py-16px">
          <div className="flex h-40px flex-col items-center justify-center">
            <span className="max-w-[300px] truncate text-center text-[14px] font-500 text-white">
              {data.leagueName}
            </span>
            {!data.hasStarted && !!data.matchTimeText && (
              <span className="mt-4px text-center text-[12px] text-[rgba(255,255,255,0.6)]">
                {data.matchTimeText}
              </span>
            )}
          </div>
          <div className="mt-10px flex w-full flex-1 items-start">
            <Team name={data.homeName} logo={data.homeLogo} />
            <div className="flex w-[99px] flex-col items-center">
              <span className="max-w-full truncate text-[12px] text-[rgba(255,255,255,0.6)]">
                {data.statusText}
              </span>
              <span className="mt-2px text-[24px] font-500 leading-[1.2] text-white">
                {data.hasStarted ? data.scoreText : 'VS'}
              </span>
            </div>
            <Team name={data.awayName} logo={data.awayLogo} />
          </div>
        </div>
      </div>

      {hasInvite && <SharePosterInviteRow inviteCode={inviteCode} inviteUrl={inviteUrl} />}
    </div>
  );
};

export default MatchSharePoster;

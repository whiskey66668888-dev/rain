import React, { useEffect, useMemo, useRef, useState } from 'react';

import Overlay from '@/common/components/Overlay';
import { toast } from '@/common/components/Toast';
import { useAppSelector } from '@/core/store/hooks';
import { DEFAULT_AVATAR_SRC, resolveEmcAvatarSrc } from '@/common/utils/emcAvatar';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import type { MatchBaseInfo } from '@/apis/commonSports/types';

import MatchSharePoster, { type MatchSharePosterData } from './MatchSharePoster';
import ShareActionButton from '../share/ShareActionButton';
import { useShareInvite } from '../share/useShareInvite';
import { useSharePosterSave } from '../share/useSharePosterSave';
import { prewarmChatShare } from '../share/prepareChatShare';
// import { SAVED_TOAST } from '../share/constants';
import clsx from 'clsx';
import ModalHeader from '@/sites/op7/components/ModalHeader';

export interface MatchShareSheetProps {
  show: boolean;
  onClose: () => void;
  /**
   * 已格式化的统一赛事信息（FB 走 formatFBSportItem，OB 走 formatOBSportItem）。
   * 与 Flutter SportShareSheet 收 SportItemInfo 同口径——分享面板与场馆无关。
   */
  match: MatchBaseInfo;
  /** 触发「聊天室」分享（切到发现-聊天并发送本场比赛），仅 H5 提供 */
  onShareToChat?: () => void;
}

const two = (v: number) => String(v).padStart(2, '0');

/**
 * 赛事详情「分享至」弹窗：海报（用户信息 + 赛事卡片 + 邀请码二维码）
 * + 操作行。H5 底部弹出（保存图片/复制链接/朋友圈/聊天室），PC 居中弹出（保存图片/复制链接）。
 */
const MatchShareSheet: React.FC<MatchShareSheetProps> = ({
  show,
  onClose,
  match,
  onShareToChat,
}) => {
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const navigate = useNavigateWithLanguage();
  const savePosterEl = useSharePosterSave();

  const nickName = useAppSelector((state) => state.user.memberInfo.nickName)?.trim() ?? '';
  const memberAvatarId = useAppSelector((state) => state.user.memberInfo.userAvatar);
  const avatarAddress = useAppSelector((state) => state.user.memberInfo.avatarAddress);
  const avatarSrc =
    (memberAvatarId ? resolveEmcAvatarSrc(memberAvatarId) : avatarAddress) || DEFAULT_AVATAR_SRC;

  const posterRef = useRef<HTMLDivElement>(null);
  /** 截图/发送进行中：禁用相关按钮防连点 */
  const [busy, setBusy] = useState(false);

  // 弹窗打开就开始建 IM 连接：用户看海报的这几秒抵掉冷启动（首次要下 34MB wasm）
  useEffect(() => {
    if (show) prewarmChatShare();
  }, [show]);

  // 打开面板时刻（海报上的分享时间）：show 打开的那一刻固定
  const openTimeText = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}/${two(t.getMonth() + 1)}/${two(t.getDate())} ${two(t.getHours())}:${two(t.getMinutes())}:${two(t.getSeconds())}`;
    // 每次打开重新计算
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const posterData = useMemo<MatchSharePosterData>(() => {
    const period = match.periodName ?? match.matchPeriod ?? '';
    let liveTime = '';
    const mt = Number(match.matchTime ?? 0);
    if (match.isLive && mt > 0) {
      const totalSec = Math.floor(mt);
      liveTime = `${two(Math.floor(totalSec / 60))}:${two(totalSec % 60)}`;
    }
    // 完场优先判断：FB 完场后 ms 翻 0（isLive=false，不能回退成「未开赛」），
    // OB 完场后 mmp 不翻 0（isLive 仍为 true，不能再跟走表时间）
    const isEnded = !!match.isEnded;
    const statusText = isEnded
      ? period || '已结束'
      : match.isLive
        ? [period, liveTime].filter(Boolean).join(' ')
        : '未开赛';
    return {
      leagueName: match.leagueName ?? '',
      matchTimeText: match.matchDate ?? '',
      homeName: match.homeName ?? '',
      awayName: match.awayName ?? '',
      homeLogo: match.homeLogo ?? '',
      awayLogo: match.awayLogo ?? '',
      scoreText: `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`,
      hasStarted: !!match.isLive || isEnded,
      statusText,
    };
  }, [match]);

  const { inviteCode, inviteUrl, hasInvite } = useShareInvite(show);

  const savePoster = () =>
    savePosterEl(posterRef.current, `赛事分享-${posterData.homeName || 'share'}.png`);

  const handleSaveImage = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await savePoster();
      // web 端交给浏览器自身的下载流程（可能弹保存框、也可能静默下载到下载目录），
      // 是否真的落盘不可知，提示「已保存到相册」会误导，故暂时不提示。
      // const ok = await savePoster();
      // if (ok) toast({ type: 'success', description: SAVED_TOAST });
    } finally {
      setBusy(false);
    }
  };

  const handleCopyLink = () => {
    if (!inviteUrl) {
      toast({ type: 'info', description: '暂无可复制的链接' });
      return;
    }
    void navigator.clipboard.writeText(inviteUrl);
    toast({ type: 'success', description: '复制成功' });
  };

  // 朋友圈：先保存海报到相册，再跳转朋友圈并唤起发布器
  const handleShareMoments = async () => {
    // 截图耗时，连点会重复下载 + push 多条历史记录
    if (busy) return;
    setBusy(true);
    try {
      await savePoster();
      // 同上，不再提示保存结果
      // if (ok) toast({ type: 'success', description: SAVED_TOAST });
      onClose();
      navigate(`${PATHS.moments}?openPublish=1`);
    } finally {
      setBusy(false);
    }
  };

  const handleShareChat = () => {
    onClose();
    onShareToChat?.();
  };

  const actions: {
    key: string;
    asset: string;
    label: string;
    onClick: () => void;
    disabled?: boolean;
  }[] = [
    {
      key: 'save',
      asset: 'share_ic_save',
      label: '保存图片',
      onClick: () => void handleSaveImage(),
      disabled: busy,
    },
  ];
  if (inviteUrl) {
    actions.push({
      key: 'link',
      asset: 'share_ic_link',
      label: '复制链接',
      onClick: handleCopyLink,
    });
  }
  // 朋友圈需要「保存海报到相册 → 发布器」的移动端链路，PC 不提供
  if (isMobile) {
    actions.push({
      key: 'moments',
      asset: 'share_ic_moments',
      label: '朋友圈',
      onClick: () => void handleShareMoments(),
      disabled: busy,
    });
  }
  // 聊天室走 IM SDK 直发，PC/H5 均可
  if (onShareToChat) {
    actions.push({
      key: 'chat',
      asset: 'share_ic_chat',
      label: '聊天室',
      onClick: handleShareChat,
    });
  }

  return (
    <Overlay
      show={show}
      close={onClose}
      position={isMobile ? 'bottom' : 'center'}
      maskClickClose
      destroyOnClose
      bodyClassname={
        isMobile
          ? 'rounded-t-[12px] bg-[var(--Background-300)] safe-b'
          : 'w-[400px] rounded-[12px] bg-[var(--Background-300)]'
      }
    >
      <div className={isMobile ? 'pb-12px' : 'pb-20px'}>
        {/* 标题栏 */}
        <ModalHeader title="分享至" onClose={onClose} />

        {/* 海报 */}
        <div className="px-12px">
          <MatchSharePoster
            posterRef={posterRef}
            data={posterData}
            nickName={nickName}
            avatarSrc={avatarSrc}
            timeText={openTimeText}
            hasInvite={hasInvite}
            inviteCode={inviteCode}
            inviteUrl={inviteUrl}
          />
        </div>

        {/* 操作行 */}
        <div
          className={clsx(
            isMobile
              ? 'px-12px mt-20px flex items-start justify-around'
              : 'px-24px mt-20px flex items-start justify-around',
          )}
        >
          {actions.map((action) => (
            <ShareActionButton
              key={action.key}
              asset={action.asset}
              label={action.label}
              onClick={action.onClick}
              disabled={action.disabled}
            />
          ))}
        </div>
      </div>
    </Overlay>
  );
};

export default MatchShareSheet;

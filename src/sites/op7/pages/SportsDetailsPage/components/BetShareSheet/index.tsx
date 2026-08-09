import React, { useEffect, useMemo, useRef, useState } from 'react';

import Overlay from '@/common/components/Overlay';
import { toast } from '@/common/components/Toast';
import { useAppSelector } from '@/core/store/hooks';
import { EVenue } from '@/apis/commonSports/constants';
import { DEFAULT_AVATAR_SRC, resolveEmcAvatarSrc } from '@/common/utils/emcAvatar';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import ModalHeader from '@/sites/op7/components/ModalHeader';
import type { TBetHistoryOrderItem } from '@/apis/commonSports/types';

import BetSharePoster from './BetSharePoster';
import ShareActionButton from '../share/ShareActionButton';
import { useShareInvite } from '../share/useShareInvite';
import { useSharePosterSave } from '../share/useSharePosterSave';
// import { SAVED_TOAST } from '../share/constants';
import { prewarmChatShare } from '../share/prepareChatShare';
import { shareBetToChatRoom } from '../share/shareBetToChatRoom';

export interface BetShareSheetProps {
  show: boolean;
  onClose: () => void;
  order: TBetHistoryOrderItem | null;
  /** 场馆标识（聊天室晒单的 extension 用，缺省 fb） */
  venueId?: string;
}

const two = (v: number) => String(v).padStart(2, '0');

/**
 * 注单「分享至」弹窗：海报（用户信息 + 注单卡片 + 邀请码二维码）+ 操作行。
 * H5 底部弹出（保存/复制/朋友圈/聊天室），PC 居中弹出（保存/复制）。
 */
const BetShareSheet: React.FC<BetShareSheetProps> = ({
  show,
  onClose,
  order,
  venueId = EVenue.FB,
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

  // 弹窗打开就开始建 IM 连接：注单页没有挂载聊天室，点「聊天室」必走冷启动
  useEffect(() => {
    if (show) prewarmChatShare();
  }, [show]);

  const openTimeText = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}/${two(t.getMonth() + 1)}/${two(t.getDate())} ${two(t.getHours())}:${two(t.getMinutes())}:${two(t.getSeconds())}`;
    // 每次打开重新计算
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const { inviteCode, inviteUrl, hasInvite } = useShareInvite(show);

  const savePoster = () =>
    savePosterEl(posterRef.current, `注单分享-${order?.orderId || 'share'}.png`);

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

  const handleShareChat = async () => {
    if (!order || busy) return;
    setBusy(true);
    try {
      const ok = await shareBetToChatRoom(order, venueId);
      if (ok) onClose();
    } finally {
      setBusy(false);
    }
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
  actions.push({
    key: 'chat',
    asset: 'share_ic_chat',
    label: '聊天室',
    onClick: () => void handleShareChat(),
    disabled: busy,
  });

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
      <div
        className={
          isMobile ? 'flex max-h-[85vh] flex-col pb-12px' : 'flex max-h-[85vh] flex-col pb-20px'
        }
      >
        {/* 标题栏 */}
        <ModalHeader title="分享至" onClose={onClose} />

        {/* 海报（串关可能很长，预览区内滚动，保存输出完整长图） */}
        <div className="min-h-0 flex-1 overflow-y-auto px-12px">
          {order && (
            <BetSharePoster
              posterRef={posterRef}
              order={order}
              nickName={nickName}
              avatarSrc={avatarSrc}
              timeText={openTimeText}
              hasInvite={hasInvite}
              inviteCode={inviteCode}
              inviteUrl={inviteUrl}
            />
          )}
        </div>

        {/* 操作行 */}
        <div
          className={
            isMobile
              ? 'px-12px mt-20px flex shrink-0 items-start justify-around'
              : 'px-24px mt-20px flex shrink-0 items-start justify-around'
          }
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

export default BetShareSheet;

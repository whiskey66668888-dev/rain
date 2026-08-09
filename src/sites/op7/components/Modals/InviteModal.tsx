import Overlay from '@/common/components/Overlay';
import React, { useCallback } from 'react';
import ModalHeader from '@/sites/op7/components/ModalHeader';
import { useAppSelector } from '@/core/store/hooks';
import clsx from 'clsx';
import {
  InviteFriendsSvg,
  Plus888YuanSvg,
  CumulativeRewardSvg,
  FriendUpgradeSvg,
  MaxVip5Svg,
  RebateRewardSvg,
  HundredPeople15WanSvg,
  UnlimitedSvg,
  ActivateInviteButtonTextSvg,
} from '@/sites/op7/components/SvgIcons';
import { useInviteModal } from '@/common/hooks/useInviteModal';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import Button from '@/common/components/Button';

type SvgIconComponent = React.FC<{ className?: string }>;

interface PrivilegeItem {
  icon: SvgIconComponent;
  title: string;
  desc: string;
  reward: SvgIconComponent;
}

const PRIVILEGE_ITEMS: PrivilegeItem[] = [
  {
    icon: InviteFriendsSvg,
    title: '呼朋唤友',
    desc: '成功邀请好友首充最高奖励',
    reward: Plus888YuanSvg,
  },
  {
    icon: CumulativeRewardSvg,
    title: '累计奖励',
    desc: '累计邀请好友奖励上不封顶',
    reward: HundredPeople15WanSvg,
  },
  { icon: FriendUpgradeSvg, title: '好友升级', desc: '邀请好友直升平台会员', reward: MaxVip5Svg },
  {
    icon: RebateRewardSvg,
    title: '返水奖励',
    desc: '成功邀请好友周周返水彩金',
    reward: UnlimitedSvg,
  },
];

const PrivilegeRow: React.FC<PrivilegeItem> = ({ icon: Icon, title, desc, reward: RewardIcon }) => (
  <div className="flex items-center gap-12px rounded-12px bg-[var(--Background-300)] lg:bg-[var(--Line-100)] px-12px py-14px">
    <Icon className="h-24px w-24px shrink-0 text-[var(--ThemeColor-Main)]" />
    <div className="min-w-0 flex-1">
      <div className="_tf[14] font-500 text-[var(--Text-Main-10)]">{title}</div>
      <div className="_tf[12] font-400 text-[var(--Text-700)]">{desc}</div>
    </div>
    <div className="shrink-0 text-[var(--ThemeColor-Main)]">
      <RewardIcon className="h-14px w-auto" />
    </div>
  </div>
);

export const InviteModal: React.FC = () => {
  const { inviteModalVisible, closeInviteModal } = useInviteModal();
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const navigate = useNavigateWithLanguage();

  const handleActivateInvite = useCallback(() => {
    navigate(PATHS.mineDeposit);
    closeInviteModal();
  }, [navigate, closeInviteModal]);

  return (
    <Overlay
      show={inviteModalVisible}
      close={closeInviteModal}
      maskClickClose
      position={isMobile ? 'bottom' : 'center'}
      bodyClassname={clsx(
        'flex flex-col overflow-hidden',
        isMobile
          ? 'max-h-[85vh] w-full bg-[var(--Background-400)] rounded-t-16px'
          : 'w-[450px] max-w-[90vw] bg-[var(--Background-300)] rounded-16px',
      )}
    >
      <ModalHeader title="首充开启邀请特权" onClose={closeInviteModal} />
      <div className="mt-8px flex flex-1 flex-col overflow-y-auto px-12px pb-20px lg:px-24px">
        <div className="flex flex-col gap-12px">
          {PRIVILEGE_ITEMS.map((item) => (
            <PrivilegeRow key={item.title} {...item} />
          ))}
        </div>
        <div className="mt-20px flex flex-col gap-12px">
          <Button
            type="primary"
            className="shrink-0 relative h-[44px]"
            onClick={handleActivateInvite}
          >
            <span className="_tf[16] font-500 text-[var(--White-100)]">激活邀请特权</span>
            <div
              className={clsx(
                'absolute top-0 right-[-0.5px] w-64px h-full flex flex-col gap-2px items-center pt-9px',
                'bg-[url(/images/common/mine/activate_invite_button_bg.png)] bg-no-repeat bg-[length:auto_100%] bg-[position:right_center]',
              )}
            >
              <ActivateInviteButtonTextSvg className="h-14px w-auto" />
              <span className="text-10px font-500 leading-[1.4] text-[var(--Green-300)]">
                完成首充
              </span>
            </div>
          </Button>
          <Button onClick={closeInviteModal} type="second" className="h-[44px]">
            下次再说
          </Button>
        </div>
      </div>
    </Overlay>
  );
};

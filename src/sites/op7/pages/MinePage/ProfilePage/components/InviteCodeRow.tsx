import React from 'react';
import { useInviteModal } from '@/common/hooks/useInviteModal';
import { useAppSelector } from '@/core/store/hooks';
import { useMemoizedFn } from 'ahooks';
import CopyButton from '@/sites/op7/components/CopyButton';
import Button from '@/common/components/Button';

const InviteCodeRow: React.FC = () => {
  const { openInviteModal } = useInviteModal();
  const inviterInfo = useAppSelector((state) => state.user.inviterInfo);

  const renderBtn = useMemoizedFn(() => {
    if (inviterInfo?.advStatus === 9) {
      return (
        <div className="flex items-center gap-4px">
          <span className="_tf[14] text-[var(--Text-Main-10)]">{inviterInfo.advCode}</span>
          <CopyButton text={inviterInfo.advCode} />
        </div>
      );
    }
    return (
      <Button onClick={openInviteModal} size="small">
        激活
      </Button>
    );
  });

  return (
    <>
      <div className="overflow-hidden rounded-12px bg-[var(--Background-300)]">
        <div className="flex items-center justify-between gap-12px px-12px py-14px lg:px-24px ">
          <span className="_tf[14] font-400 text-[var(--Text-Main-10)]">我的邀请码</span>
          {renderBtn()}
        </div>
      </div>
    </>
  );
};

export default InviteCodeRow;

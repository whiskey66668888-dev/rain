import React from 'react';
import QRCode from 'react-qr-code';

export interface SharePosterInviteRowProps {
  inviteCode: string;
  inviteUrl: string;
}

/** 海报底部：二维码 + 邀请码 + 注册引导文案 */
export const SharePosterInviteRow: React.FC<SharePosterInviteRowProps> = ({
  inviteCode,
  inviteUrl,
}) => (
  <div className="mt-12px flex items-center">
    <div className="flex h-40px w-40px items-center justify-center rounded-[4px] bg-white">
      <QRCode value={inviteUrl} size={32} level="H" bgColor="#FFFFFF" fgColor="#000000" />
    </div>
    <div className="ml-8px min-w-0 flex-1">
      <div className="text-[14px] font-500 text-[var(--Text-Main-10)]">邀请码 {inviteCode}</div>
      <div className="mt-2px truncate text-[10px] text-[var(--Text-800)]">
        扫码注册OP7, 立即领取1000元体育首存奖励
      </div>
    </div>
  </div>
);

export default SharePosterInviteRow;

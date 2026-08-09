import { useRequest } from 'ahooks';

import { getInviterInfo } from '@/apis/origin/inviteFriends';

export interface ShareInvite {
  inviteCode: string;
  /** 邀请注册链接（advUrl）：二维码与「复制链接」均用它 */
  inviteUrl: string;
  /** 邀请码与邀请链接齐全才展示海报邀请区块 */
  hasInvite: boolean;
}

/**
 * 分享海报邀请信息（只认 /inviter/info，接口失败或字段缺失时相关 UI 全部隐藏，不做回落）。
 * @param ready 弹窗打开时才请求
 */
export const useShareInvite = (ready: boolean): ShareInvite => {
  const { data: inviter } = useRequest(
    async () => {
      const res = await getInviterInfo();
      return res?.data ?? null;
    },
    { ready, refreshDeps: [ready] },
  );
  const inviteCode = (inviter?.advCode ?? '').trim();
  const inviteUrl = (inviter?.advUrl ?? '').trim();
  return { inviteCode, inviteUrl, hasInvite: !!inviteCode && !!inviteUrl };
};

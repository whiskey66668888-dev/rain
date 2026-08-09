import request from '@/core/sdk/request';
export interface TInviterWebImageUrl {
  id: number;
  imgUrl: string;
  logoUrl: string;
  appUrl: string;
  gameUrl: string;
  ip: string | null;
  mark: string | null;
  logoKey: string;
  addTime: string | null;
  status: boolean;
  del: boolean;
  versionName: string | null;
}

export interface TInviterInfo {
  advCode: string;
  advUrl: string;
  inviterPokerNext: string;
  bonus: number;
  inviterCashNext: number;
  bonusEsport: number;
  inviterCash: number;
  bonusLive: number;
  inviterLive: string;
  inviterSlotNext: string;
  inviterLiveNext: string;
  webImageUrl: TInviterWebImageUrl;
  inviterSport: string;
  bonusSport: number;
  groupNameMax: string;
  inviterValidNum: number;
  inviterTotalNum: number;
  bonusInviter: number;
  inviterEsportNext: string;
  beginTime: string;
  groupLevel: number;
  inviterEsport: string;
  organizerGroupName: string | null;
  groupLevelNext: number;
  inviterSportNext: string;
  tgUrl: string;
  advStatus: number;
  groupName: string;
  hasInviterMe: boolean;
  downUrl: string;
  topImage: string;
  organizer: string | null;
  groupNameNext: string;
  inviterImage: string;
  endTime: string;
  inviterSlot: string;
  inviterPoker: string;
}

// 获取邀请信息
export const getInviterInfoReq = () => {
  return request.post<TInviterInfo, unknown>('/api/inviter/info', {
    body: {},
  });
};

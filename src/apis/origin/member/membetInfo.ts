import request from '@/core/sdk/request';
import { EGender } from '../constants';
import { TAddressMap } from './saveAddress';

export interface TMemberInfoResp {
  addressMap?: TAddressMap;
  advCode: string;
  advUrl: string;
  appNotice: boolean | null;
  appearanceStyle: number | null;
  automaticFollow: number | null;
  gender: EGender;
  extendMoney: string;
  groupId: number;
  fundRate: string;
  fundMoney: string;
  favoriteTeam: string | null;
  hasOtherBank: boolean;
  loginTime: string;
  isAgent: boolean;
  /** 风险账号，与 isAgent 共用场馆/转账/投注拦截逻辑 */
  isRiskAccount: boolean;
  hour: number;
  loginName: string;
  nickName: string;
  loginIp: string;
  haveCashPass: boolean;
  id: number;
  cash: number;
  qq: string | null;
  avatarAddress: string | null;
  alipay: string | null;
  subDay: number;
  level: number;
  birthData: string | null;
  emcail: string;
  advStatus: number;
  realName: string | null;
  groupName: string;
  weixin: string | null;
  money: string;
  createTime: string;
  phone: string;
  jifen: number;
  autoCashMode: boolean | null;
  balanceSwitch: boolean | null;
  bettingOddsSettings: number | null;
  bettingSettings: number | null;
  bettingStyle: number | null;
  emailNotice: boolean | null;
  fontSize: number | null;
  goalBell: number | null;
  nightModel: boolean | null;
  pictureCardStyle: number | null;
  shock: number | null;
  smsStatus: boolean | null;
  sportsProbability: number | null;
  synchronousSingleString: number | null;
  testPlay: boolean | null;
  userAvatar: string | null;
}

// 获取用户信息
export const getMemberInfoReq = () => {
  return request.post<TMemberInfoResp, unknown>('/api/member/info', {
    isErrorToast: true,
    body: {},
  });
};

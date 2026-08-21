import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

import {
  COOKIE_EXPIRES,
  LOGIN_NAME_KEY,
  KEEP_LOGIN_KEY,
  needRemoveCookies,
  needRemoveSession,
  IS_LOGIN_KEY,
  ACCEPT_ODDS_PREFER_KEY,
  USER_AVATAR_KEY,
  AUTO_FOLLOW_MATCH_KEY,
  LOGIN_INFO_KEY,
} from '@/utils/constants/cacheKey';
import { EAcceptOddsPrefer, EVenue } from '@/apis/commonSports/constants';
import {
  getMemberInfoThunk,
  oneClickTransferThunk,
  updateMemberGenderThunk,
  venueBalanceThunk,
  setRealNameThunk,
  setNickNameThunk,
  updateMemberBirthdayThunk,
  saveAddressThunk,
  getInviterInfoThunk,
} from '../thunks/userThunks';
import { TMemberInfoResp } from '@/apis/origin/member/membetInfo';
import { EGender } from '@/apis/origin/constants';
import { TInviterInfo } from '@/apis/origin/inviter/inviterInfo';
import { LoginResponse } from '@/apis/origin/login';
import {
  safeGetLocalJSON,
  safeGetLocalString,
  safeRemoveLocal,
  safeRemoveSession,
  safeSetLocalJSON,
  safeSetLocalString,
} from '@/utils/storage/webStorage';

export interface TVenueUserState {
  balance: string;
  balanceLoading: boolean;
  oneClickTransferLoading: boolean;
}

export interface UserState {
  userInfo: {
    isLogin: boolean;
    loginName: string;
    keepLogin: boolean;
  };
  loginInfo?: LoginResponse;
  memberInfo: TMemberInfoResp;
  memberInfoLoading?: boolean;
  inviterInfo?: TInviterInfo;
  [EVenue.OB]: TVenueUserState;
  [EVenue.FB]: TVenueUserState;
  userAvatar: string;
  showAvatarPopup?: boolean;
  acceptOddsPrefer: EAcceptOddsPrefer;
  autoFollowMatch: boolean;
  genderFetching: boolean;
  birthdayFetching: boolean;
  realNameFetching: boolean;
  nickNameFetching: boolean;
  addressFetching: boolean;
  inviteModalVisible: boolean;
}

type TStorageUserState = Pick<
  UserState,
  'acceptOddsPrefer' | 'userAvatar' | 'autoFollowMatch' | 'loginInfo'
>;

const getInitialState = (): TStorageUserState => {
  const acceptOddsPrefer = safeGetLocalJSON<EAcceptOddsPrefer>(
    ACCEPT_ODDS_PREFER_KEY,
    EAcceptOddsPrefer.Better,
  );
  const userAvatar = safeGetLocalString(USER_AVATAR_KEY);
  const autoFollowMatch = safeGetLocalString(AUTO_FOLLOW_MATCH_KEY);
  const loginInfo = safeGetLocalJSON<LoginResponse | undefined>(LOGIN_INFO_KEY, undefined);
  return {
    acceptOddsPrefer,
    userAvatar: userAvatar || '',
    autoFollowMatch: autoFollowMatch === 'true',
    loginInfo,
  };
};

/** 未登录时的会员信息占位，退出登录时需恢复为此状态 */
const initialMemberInfo: TMemberInfoResp = {
  advCode: '',
  advUrl: '',
  appNotice: null,
  appearanceStyle: null,
  automaticFollow: null,
  gender: EGender.MALE,
  extendMoney: '',
  groupId: 0,
  fundRate: '',
  fundMoney: '',
  favoriteTeam: null,
  hasOtherBank: false,
  loginTime: '',
  isAgent: false,
  isRiskAccount: false,
  hour: 0,
  loginName: '',
  nickName: '',
  loginIp: '',
  haveCashPass: false,
  id: 0,
  cash: 0,
  qq: null,
  avatarAddress: null,
  alipay: null,
  subDay: 0,
  level: 0,
  birthData: null,
  emcail: '',
  advStatus: 0,
  realName: null,
  groupName: '',
  weixin: null,
  money: '',
  createTime: '',
  phone: '',
  jifen: 0,
  autoCashMode: null,
  balanceSwitch: null,
  bettingOddsSettings: null,
  bettingSettings: null,
  bettingStyle: null,
  emailNotice: null,
  fontSize: null,
  goalBell: null,
  nightModel: null,
  pictureCardStyle: null,
  shock: null,
  smsStatus: null,
  sportsProbability: null,
  synchronousSingleString: null,
  testPlay: null,
  userAvatar: null,
};

const initialState: UserState = {
  userInfo: {
    isLogin: !!(Cookies.get('isLogin') === '1'),
    loginName: Cookies.get(LOGIN_NAME_KEY) || '',
    keepLogin: Cookies.get(KEEP_LOGIN_KEY) === '1',
  },
  memberInfo: initialMemberInfo,
  [EVenue.OB]: {
    balance: '0',
    balanceLoading: false,
    oneClickTransferLoading: false,
  },
  [EVenue.FB]: {
    balance: '0',
    balanceLoading: false,
    oneClickTransferLoading: false,
  },
  ...getInitialState(),
  genderFetching: false,
  birthdayFetching: false,
  realNameFetching: false,
  nickNameFetching: false,
  addressFetching: false,
  inviteModalVisible: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<{ loginName: string; keepLogin: boolean }>) => {
      const { loginName, keepLogin } = action.payload;
      Cookies.set(IS_LOGIN_KEY, '1', { expires: COOKIE_EXPIRES });
      Cookies.set('loginName', loginName, { expires: COOKIE_EXPIRES });
      state.userInfo = {
        ...state.userInfo,
        isLogin: true,
        loginName,
        keepLogin,
      };
      if (keepLogin) {
        Cookies.set('userName', loginName, { expires: COOKIE_EXPIRES });
        // Cookies.set('userPwd', password, { expires: COOKIE_EXPIRES });
        // state.userInfo.password = password;
      } else {
        Cookies.remove('userName');
        Cookies.remove('userPwd');
        // state.userInfo.password = '';
      }
    },
    clearUserInfo: (state) => {
      needRemoveCookies.forEach((item) => {
        Cookies.remove(item);
      });
      Cookies.remove('userName');
      Cookies.remove('userPwd');
      Cookies.remove('password');
      needRemoveSession.forEach((item) => {
        safeRemoveSession(item);
      });
      state.userInfo = {
        ...state.userInfo,
        isLogin: false,
        loginName: '',
        keepLogin: false,
      };
      state.memberInfo = { ...initialMemberInfo };
      state.inviterInfo = undefined;
      state.userAvatar = '';
      safeRemoveLocal(USER_AVATAR_KEY);
      state[EVenue.OB] = {
        balance: '0',
        balanceLoading: false,
        oneClickTransferLoading: false,
      };
      state[EVenue.FB] = {
        balance: '0',
        balanceLoading: false,
        oneClickTransferLoading: false,
      };
      state.showAvatarPopup = false;
      state.genderFetching = false;
      state.birthdayFetching = false;
      state.realNameFetching = false;
      state.nickNameFetching = false;
      state.addressFetching = false;
      state.inviteModalVisible = false;
    },
    setLoginInfo: (state, action: PayloadAction<LoginResponse>) => {
      state.loginInfo = action.payload;
      safeSetLocalJSON(LOGIN_INFO_KEY, action.payload);
    },
    clearLoginInfo: (state) => {
      state.loginInfo = undefined;
      safeRemoveLocal(LOGIN_INFO_KEY);
    },
    setVenueBalance: (state, action: PayloadAction<{ venue: EVenue; balance: string }>) => {
      const { venue, balance } = action.payload;
      state[venue].balance = balance;
    },

    // #region 设置接受赔率更改偏好
    setAcceptOddsPreferAction: (state, action: PayloadAction<EAcceptOddsPrefer>) => {
      state.acceptOddsPrefer = action.payload;
      safeSetLocalJSON(ACCEPT_ODDS_PREFER_KEY, action.payload);
    },
    // #endregion

    // #region 设置投注成功后自动关注赛事
    setAutoFollowMatchAction: (state, action: PayloadAction<boolean>) => {
      state.autoFollowMatch = action.payload;
      safeSetLocalString(AUTO_FOLLOW_MATCH_KEY, action.payload ? 'true' : 'false');
    },
    // #endregion

    // #region 设置用户头像
    setUserAvatar: (state, action: PayloadAction<string>) => {
      state.userAvatar = action.payload;
      safeSetLocalString(USER_AVATAR_KEY, action.payload);
    },
    setShowAvatarPopup: (state, action: PayloadAction<boolean>) => {
      state.showAvatarPopup = action.payload;
    },
    // #endregion

    // #region 设置邀请模态框是否显示
    setInviteModalVisible: (state, action: PayloadAction<boolean>) => {
      state.inviteModalVisible = action.payload;
    },
    // #endregion
  },
  extraReducers: (builder) => {
    builder.addCase(venueBalanceThunk.pending, (state, action) => {
      if (action.meta.arg.isLoading) {
        state[action.meta.arg.venue].balanceLoading = true;
      }
    });
    builder.addCase(venueBalanceThunk.fulfilled, (state, action) => {
      if (action.meta.arg.isLoading) {
        state[action.meta.arg.venue].balanceLoading = false;
      }
      state[action.meta.arg.venue].balance = action.payload || '0';
    });
    builder.addCase(venueBalanceThunk.rejected, (state, action) => {
      if (action.meta.arg.isLoading) {
        state[action.meta.arg.venue].balanceLoading = false;
      }
    });
    builder.addCase(oneClickTransferThunk.pending, (state, action) => {
      state[action.meta.arg.venue].oneClickTransferLoading = true;
    });
    builder.addCase(oneClickTransferThunk.fulfilled, (state, action) => {
      state[action.meta.arg.venue].oneClickTransferLoading = false;
    });
    builder.addCase(oneClickTransferThunk.rejected, (state, action) => {
      state[action.meta.arg.venue].oneClickTransferLoading = false;
    });
    builder.addCase(getMemberInfoThunk.pending, (state, action) => {
      if (action.meta.arg.isLoading) {
        state.memberInfoLoading = true;
      }
    });
    builder.addCase(getMemberInfoThunk.fulfilled, (state, action) => {
      state.memberInfo = action.payload;
      if (action.meta.arg.isLoading) {
        state.memberInfoLoading = false;
      }
    });
    builder.addCase(getMemberInfoThunk.rejected, (state, action) => {
      if (action.meta.arg.isLoading) {
        state.memberInfoLoading = false;
      }
    });
    builder.addCase(updateMemberGenderThunk.pending, (state, action) => {
      state.genderFetching = true;
      state.memberInfo.gender = action.meta.arg;
    });
    builder.addCase(updateMemberGenderThunk.fulfilled, (state) => {
      state.genderFetching = false;
    });
    builder.addCase(updateMemberGenderThunk.rejected, (state, action) => {
      state.memberInfo.gender = action.meta.arg === EGender.MALE ? EGender.FEMALE : EGender.MALE;
      state.genderFetching = false;
    });
    builder.addCase(updateMemberBirthdayThunk.pending, (state) => {
      state.birthdayFetching = true;
    });
    builder.addCase(updateMemberBirthdayThunk.fulfilled, (state, action) => {
      state.birthdayFetching = false;
      state.memberInfo.birthData = action.payload;
    });
    builder.addCase(updateMemberBirthdayThunk.rejected, (state) => {
      state.birthdayFetching = false;
    });
    builder.addCase(setRealNameThunk.pending, (state) => {
      state.realNameFetching = true;
    });
    builder.addCase(setRealNameThunk.fulfilled, (state, action) => {
      state.memberInfo.realName = action.payload ? `${action.payload[0]}**` : action.payload;
      state.realNameFetching = false;
    });
    builder.addCase(setRealNameThunk.rejected, (state) => {
      state.realNameFetching = false;
    });
    builder.addCase(setNickNameThunk.pending, (state) => {
      state.nickNameFetching = true;
    });
    builder.addCase(setNickNameThunk.fulfilled, (state, action) => {
      state.nickNameFetching = false;
      state.memberInfo.nickName = action.payload.nickName;
    });
    builder.addCase(setNickNameThunk.rejected, (state) => {
      state.nickNameFetching = false;
    });

    builder.addCase(saveAddressThunk.pending, (state) => {
      state.addressFetching = true;
    });
    builder.addCase(saveAddressThunk.fulfilled, (state, action) => {
      state.addressFetching = false;
      state.memberInfo.addressMap = action.payload;
    });
    builder.addCase(saveAddressThunk.rejected, (state) => {
      state.addressFetching = false;
    });

    builder.addCase(getInviterInfoThunk.fulfilled, (state, action) => {
      state.inviterInfo = action.payload;
    });
  },
});

export const {
  setUserInfo,
  setLoginInfo,
  clearLoginInfo,
  clearUserInfo,
  setVenueBalance,
  setAcceptOddsPreferAction,
  setUserAvatar,
  setShowAvatarPopup,
  setAutoFollowMatchAction,
  setInviteModalVisible,
} = userSlice.actions;

export default userSlice.reducer;

import { createAsyncThunk } from '@reduxjs/toolkit';
import { depositAllReq } from '@/apis/origin/wallet/deposit';
import { withdrawAllReq } from '@/apis/origin/wallet/withdrawAll';
import { checkPlatformStatusReq } from '@/apis/origin/wallet/checkPlatformStatus';
import { API_CODE_ORIGIN_SUCCESS } from '@/utils/constants/apiCodeOrigin';
import { EVenue } from '@/apis/commonSports/constants';
import { getUserBaseFb } from '@/apis/fbSports/userBase';
import { getUserAmountOb } from '@/apis/obSports/userAmount';
import { sleep } from '@/utils';
import { getMemberInfoReq } from '@/apis/origin/member/membetInfo';
import { updateMemberInfoEditReq } from '@/apis/origin/member/membetInfoEdit';
import { EGender } from '@/apis/origin/constants';
import { setRealNameReq } from '@/apis/origin/member/setRealName';
import { setNickNameReq } from '@/apis/origin/member/setNickName';
import { saveAddressReq, TAddressMap } from '@/apis/origin/member/saveAddress';
import { getInviterInfoReq } from '@/apis/origin/inviter/inviterInfo';

const MIN_BALANCE_LOADING_MS = 1000;

export const venueBalanceThunk = createAsyncThunk(
  'user/venueBalance',
  async ({ venue, isLoading }: { venue: EVenue; isLoading?: boolean }, { rejectWithValue }) => {
    const start = Date.now();
    /** 手动刷新时保证 loading 至少展示 MIN_BALANCE_LOADING_MS，避免闪烁 */
    const waitMinLoading = async () => {
      if (!isLoading) return;
      const elapsed = Date.now() - start;
      if (elapsed < MIN_BALANCE_LOADING_MS) {
        await sleep(MIN_BALANCE_LOADING_MS - elapsed);
      }
    };

    try {
      if (venue === EVenue.FB) {
        const res = await getUserBaseFb({});
        const balance = res.data?.bl;
        await waitMinLoading();
        return balance;
      }
      if (venue === EVenue.OB) {
        const res = await getUserAmountOb();
        // OB 返回数字，store 里统一存字符串
        const amount = res.data?.amount;
        const balance = amount === undefined || amount === null ? '' : `${amount}`;
        await waitMinLoading();
        return balance;
      }
      return rejectWithValue('获取场馆余额失败');
    } catch (error: unknown) {
      await waitMinLoading();
      return rejectWithValue(error instanceof Error ? error.message : '获取场馆余额失败');
    }
  },
);

export const oneClickTransferThunk = createAsyncThunk(
  'user/oneClickTransfer',
  async (params: { venue: EVenue; gameId: number }, { rejectWithValue }) => {
    try {
      const res1 = await checkPlatformStatusReq({ gameId: params.gameId });
      if (res1.code !== 1) {
        return rejectWithValue(res1.info);
      }
      const res2 = await withdrawAllReq();
      if (res2.code !== API_CODE_ORIGIN_SUCCESS) {
        return rejectWithValue(res2.info);
      }
      const res3 = await depositAllReq({ gameId: params.gameId });
      if (res3.code !== API_CODE_ORIGIN_SUCCESS) {
        return rejectWithValue(res3.info);
      }
      return { res1, res2, res3 };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '一键转入失败';
      return rejectWithValue(errorMessage);
    }
  },
);

interface TParams {
  isLoading?: boolean;
}

export const getMemberInfoThunk = createAsyncThunk(
  'user/getMemberInfo',
  async (_: TParams, { rejectWithValue }) => {
    try {
      const res = await getMemberInfoReq();
      if (res.code !== API_CODE_ORIGIN_SUCCESS) {
        return rejectWithValue(res.info);
      }
      return res.data;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : '获取用户信息失败');
    }
  },
);

export const updateMemberGenderThunk = createAsyncThunk(
  'user/updateMemberGender',
  async (gender: EGender, { rejectWithValue }) => {
    try {
      const res = await updateMemberInfoEditReq({ gender });
      if (!res || res.code !== API_CODE_ORIGIN_SUCCESS) {
        return rejectWithValue(res?.info || '修改性别失败');
      }
      return gender;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : '修改性别失败');
    }
  },
);

export const updateMemberBirthdayThunk = createAsyncThunk(
  'user/updateMemberBirthday',
  async (birthDate: string, { rejectWithValue }) => {
    try {
      const res = await updateMemberInfoEditReq({ birthDate });
      if (!res || res.code !== API_CODE_ORIGIN_SUCCESS) {
        return rejectWithValue(res?.info || '修改生日失败');
      }
      return birthDate;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : '修改生日失败');
    }
  },
);

export const setRealNameThunk = createAsyncThunk(
  'user/setRealName',
  async (realName: string, { rejectWithValue }) => {
    try {
      const res = await setRealNameReq({ realName });
      if (!res || res.code !== API_CODE_ORIGIN_SUCCESS) {
        return rejectWithValue(res?.info || '设置真实姓名失败');
      }
      return realName;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : '设置真实姓名失败');
    }
  },
);

export const setNickNameThunk = createAsyncThunk(
  'user/setNickName',
  async (nickName: string, { rejectWithValue }) => {
    try {
      const res = await setNickNameReq({ nickName });
      if (!res || res.code !== API_CODE_ORIGIN_SUCCESS) {
        return rejectWithValue(res?.info || '设置昵称失败');
      }
      return {
        nickName,
        message: res.info || '',
      };
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : '设置昵称失败');
    }
  },
);

export const saveAddressThunk = createAsyncThunk(
  'user/saveAddress',
  async (data: TAddressMap, { rejectWithValue }) => {
    try {
      const res = await saveAddressReq(data);
      if (!res || res.code !== API_CODE_ORIGIN_SUCCESS) {
        return rejectWithValue(res?.info || '保存地址失败');
      }
      return data;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : '保存地址失败');
    }
  },
);

export const getInviterInfoThunk = createAsyncThunk(
  'user/getInviterInfo',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getInviterInfoReq();
      if (res.code !== API_CODE_ORIGIN_SUCCESS) {
        return rejectWithValue(res.info);
      }
      return res.data;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : '获取邀请信息失败');
    }
  },
);

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { FBTokenResponse, OBTokenResponse } from '@/apis/origin/system';
import { OB_API_CONFIG_KEY } from '@/utils/constants/cacheKey';
import { FB_API_CONFIG_KEY } from '@/utils/constants/cacheKey';

export interface ThirdApiConfigState {
  ob: {
    isMaintenance: boolean;
    config: OBTokenResponse | null;
  };
  fb: {
    isMaintenance: boolean;
    config: FBTokenResponse | null;
  };
}

const initialState: ThirdApiConfigState = {
  ob: {
    // 是否维护中
    isMaintenance: false,
    // 配置
    config: JSON.parse(localStorage.getItem(OB_API_CONFIG_KEY) ?? 'null') as OBTokenResponse | null,
  },
  fb: {
    isMaintenance: false,
    config: JSON.parse(localStorage.getItem(FB_API_CONFIG_KEY) ?? 'null') as FBTokenResponse | null,
  },
};

const thirdApiConfigSlice = createSlice({
  name: 'thirdApiConfig',
  initialState,
  reducers: {
    setThirdPartyApiConfig: (
      state,
      action: PayloadAction<{
        apiType: 'fb' | 'ob';
        config: ThirdApiConfigState[keyof ThirdApiConfigState];
      }>,
    ) => {
      localStorage.setItem(
        `${action.payload.apiType.toUpperCase()}_API_CONFIG`,
        JSON.stringify(action.payload.config.config),
      );
      return {
        ...state,
        [action.payload.apiType]: {
          ...state[action.payload.apiType],
          ...action.payload.config,
        },
      };
    },
    clearThirdPartyApiConfig: (state) => {
      state.ob.config = null;
      state.fb.config = null;
      localStorage.removeItem(OB_API_CONFIG_KEY);
      localStorage.removeItem(FB_API_CONFIG_KEY);
    },
  },
});

export const { setThirdPartyApiConfig, clearThirdPartyApiConfig } = thirdApiConfigSlice.actions;

export default thirdApiConfigSlice.reducer;

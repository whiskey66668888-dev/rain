import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface OpenCustomerServicePayload {
  /** 为 true 时不跳转帮助中心（对应 emc-h5 Customer.open(true)） */
  mustShowCustomer?: boolean;
}

/**
 * 全局唤起在线客服弹窗（不走路由，避免 PC 主内容区被「客服页」占位）
 */
const customerServiceUISlice = createSlice({
  name: 'customerServiceUI',
  initialState: { openSeq: 0, mustShowCustomer: false },
  reducers: {
    requestOpenCustomerService(
      state,
      action: PayloadAction<OpenCustomerServicePayload | undefined>,
    ) {
      state.openSeq += 1;
      state.mustShowCustomer = action.payload?.mustShowCustomer ?? false;
    },
  },
});

export const { requestOpenCustomerService } = customerServiceUISlice.actions;
export default customerServiceUISlice.reducer;

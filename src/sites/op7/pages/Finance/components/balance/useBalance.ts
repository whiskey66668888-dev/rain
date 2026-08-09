import { useState } from 'react';

import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { withdrawAllReq } from '@/apis/origin/wallet/withdrawAll';
import { useGetMemberInfo } from '@/common/hooks/useMemberInfo';
import { openLoginModal } from '@/core/store/slices/authUISlice';
/**
 * 风险银行管理 一键回收hooks
 */
export function useBalance() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const balance = useAppSelector((state) => state.user.memberInfo.money);
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const { getMemberInfo } = useGetMemberInfo();

  // 一键回收 并更新用户余额
  const doRecycle = async (): Promise<void> => {
    if (!isLogin) {
      dispatch(openLoginModal());
      throw new Error('用户未登录');
    }
    try {
      setLoading(true); // 设置加载状态为 true
      await withdrawAllReq(); // 执行请求
      await getMemberInfo(); // 获取用户信息并更新余额
    } catch (error) {
      // 捕获错误，并类型化为 unknown
      console.error(error);
      throw error; // 抛出错误
    } finally {
      setLoading(false); // 结束加载状态
    }
  };

  return {
    /** 用户余额 */
    balance,

    /** 一键回收 并更新用户余额 */
    doRecycle,

    /** 加载状态 */
    loading,
  };
}

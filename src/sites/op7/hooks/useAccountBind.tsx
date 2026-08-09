import React, { useState, useCallback, useMemo } from 'react';
// components
import BindAccountModal from '@/sites/op7/components/BindAccountModal';
import { BindAccountType, AccountVerifyMap } from '@/utils/constants/account';

// hooks
import useCommonVerify from '@/sites/op7/hooks/useCommonVerify';

export interface UseBindAccountParams {
  bindAccountType: BindAccountType;
  onSuccess: () => void;
}

export interface UseAccountBindResult {
  // 执行添加
  open: (params: UseBindAccountParams) => void;
  BindAccountModals: React.JSX.Element;
}

export const useAccountBind = (): UseAccountBindResult => {
  const [pendingRequest, setPendingRequest] = useState<UseBindAccountParams | null>(null);
  const [visible, setVisible] = useState(false);
  const [token, setToken] = useState('');

  const { verify, VerifyModals } = useCommonVerify();

  const open = useCallback(
    (params: UseBindAccountParams) => {
      setPendingRequest(params);
      if (params.bindAccountType === BindAccountType.bank) {
        // 不需要验证 直接打开绑定银行卡页面
        setVisible(true);
      } else {
        const item = AccountVerifyMap[params.bindAccountType];
        if (!item) return;

        verify({
          title: item.title,
          subtitle: item.info,
          verifyType: item.verifyType,
          onSuccess: (token) => {
            setToken(token);
            setVisible(true);
          },
        });
      }
    },
    [verify],
  );

  const handleClose = useCallback(() => {
    setVisible(false);
    setPendingRequest(null);
  }, []);

  const handleSuccess = useCallback(() => {
    const req = pendingRequest;
    setPendingRequest(null);
    setVisible(false);
    req?.onSuccess();
  }, [pendingRequest]);

  const BindAccountModals = useMemo(
    () => (
      <>
        <BindAccountModal
          visible={visible}
          token={token}
          accountType={pendingRequest?.bindAccountType}
          handleClose={handleClose}
          handleSuccess={handleSuccess}
        />
        {VerifyModals}
      </>
    ),
    [visible, token, handleClose, handleSuccess, pendingRequest, VerifyModals],
  );

  return { open, BindAccountModals };
};

export default useAccountBind;

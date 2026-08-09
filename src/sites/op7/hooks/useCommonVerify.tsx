import React, { useCallback, useMemo, useState } from 'react';

import CommonVerifyModal from '@/sites/op7/components/security/CommonVerifyModal';
// import { getSecurityCenterReq } from '@/apis/origin/login';
// import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
// import SecurityTipModal from '@/sites/op7/components/security/SecurityTipModal';

/**
 * 通用验证 Hook（单例用法）
 *
 * 只调用一次，多处入口通过 verify(params) 传入不同参数即可，避免重复挂载多套弹窗。
 * 自动处理提款密码验证和安全验证流程，支持两种模式：
 * 1. requirePaymentPassword=true（默认）：先验证提款密码，再进行安全验证
 * 2. requirePaymentPassword=false：直接进行安全验证
 *
 * @example
 * // 页面只调一次，渲染一套 VerifyModals；不同入口传不同 params
 * const { verify, VerifyModals } = useCommonVerify();
 *
 * const handleWithdraw = () => verify({
 *   title: '提现验证',
 *   subtitle: '请完成安全验证',
 *   verifyType: 6,
 *   onSuccess: (token) => withdrawalReq({ token, amount: 1000 }),
 * });
 *
 * const handleEmailBind = () => verify({
 *   title: '邮箱绑定',
 *   subtitle: '支付密码验证',
 *   verifyType: 8,
 *   onSuccess: (token) => { setEmailBindInitialToken(token); setShowEmailBindModal(true); },
 * });
 *
 * return (<> ... <button onClick={handleWithdraw}>提现</button> ... {VerifyModals} </>);
 */

export interface UseCommonVerifyParams {
  title: string;
  subtitle?: string;
  onSuccess: (token: string) => void;
  verifyType?: number;
  // requirePaymentPassword?: boolean;
}

export interface UseCommonVerifyResult {
  /** 发起验证，每次调用可传不同 params（标题、verifyType、onSuccess 等） */
  verify: (params: UseCommonVerifyParams) => void;
  VerifyModals: React.JSX.Element;
}

const DEFAULT_VERIFY_TYPE = 6;

// const hasPaymentPassword = (
//   data:
//     | {
//         haveCashPass?: boolean;
//         securityBindList?: Array<{ securityKey?: string; bind?: boolean }>;
//       }
//     | null
//     | undefined,
// ) =>
//   data?.haveCashPass === true ||
//   (Array.isArray(data?.securityBindList) &&
//     data.securityBindList.some(
//       (item) => item.securityKey === 'Pay_Password' && item.bind === true,
//     ));

export const useCommonVerify = (): UseCommonVerifyResult => {
  // const navigate = useNavigateWithLanguage();

  const [pendingRequest, setPendingRequest] = useState<UseCommonVerifyParams | null>(null);
  const [commonVerifyVisible, setCommonVerifyVisible] = useState(false);
  // const [securityTipVisible, setSecurityTipVisible] = useState(false);

  const verify = useCallback((params: UseCommonVerifyParams) => {
    setPendingRequest(params);
    setCommonVerifyVisible(true);
    // setSecurityTipVisible(false);

    // const requirePaymentPassword = params.requirePaymentPassword ?? true;

    // if (!requirePaymentPassword) {
    //   setCommonVerifyVisible(true);
    //   return;
    // }

    // getSecurityCenterReq()
    //   .then((res) => {
    //     if (hasPaymentPassword(res?.data)) {
    //       setCommonVerifyVisible(true);
    //       return;
    //     }
    //     // setSecurityTipVisible(true);
    //   })
    //   .catch(() => {
    //     setCommonVerifyVisible(true);
    //   });
  }, []);

  // const handleGoSecurityCenter = useCallback(() => {
  //   // setSecurityTipVisible(false);
  //   navigate('/mine/security');
  // }, [navigate]);

  const handleCommonVerifyClose = useCallback(() => {
    setCommonVerifyVisible(false);
    setPendingRequest(null);
  }, []);

  const handleCommonVerifySuccess = useCallback(
    (token: string) => {
      const req = pendingRequest;
      setPendingRequest(null);
      setCommonVerifyVisible(false);
      req?.onSuccess(token);
    },
    [pendingRequest],
  );

  const VerifyModals = useMemo(
    () => (
      <>
        <CommonVerifyModal
          title={pendingRequest?.title ?? ''}
          subtitle={pendingRequest?.subtitle}
          show={commonVerifyVisible && !!pendingRequest}
          onClose={handleCommonVerifyClose}
          onSuccess={handleCommonVerifySuccess}
          verifyType={pendingRequest?.verifyType ?? DEFAULT_VERIFY_TYPE}
          hasPaymentPassword
        />

        {/* <SecurityTipModal
          show={securityTipVisible}
          onClose={() => setSecurityTipVisible(false)}
          onGo={handleGoSecurityCenter}
        /> */}
      </>
    ),
    [
      commonVerifyVisible,
      handleCommonVerifyClose,
      handleCommonVerifySuccess,
      pendingRequest,
      // handleGoSecurityCenter,
      // securityTipVisible,
    ],
  );

  return { verify, VerifyModals };
};

export default useCommonVerify;

import React from 'react';
import { useAppSelector } from '@/core/store/hooks';
import { unbindByTypeReq, type SecurityCenterResponse } from '@/apis/origin/login';
import { toast } from '@/common/components/Toast';
import SecurityVerifyModal from '@/sites/op7/components/SecurityVerifyModal';

const UNBIND_EMAIL_TYPE = 9;

export interface SecurityEmailResetModalProps {
  visible: boolean;
  onClose: () => void;
  /** 解绑成功后可回调刷新安全中心数据 */
  onSuccess?: () => void;
  /** 命中至少保留一种动态验证时回传 unbindType */
  onRequireRebind?: (unbindType: string) => void;
  securityData?: SecurityCenterResponse | null;
}

const SecurityEmailResetModal: React.FC<SecurityEmailResetModalProps> = ({
  visible,
  onClose,
  onSuccess,
  onRequireRebind,
  securityData,
}) => {
  const loginName = useAppSelector((state) => state.user.memberInfo?.loginName) ?? '';

  return (
    <SecurityVerifyModal
      visible={visible}
      onClose={onClose}
      title="解绑邮箱"
      tip="请选择一种动态验证进行解绑"
      microsoftStepPageTitle="解绑邮箱"
      microsoftVerifyType={UNBIND_EMAIL_TYPE}
      onVerifySuccess={async (_securityKey, tokenFromVerify) => {
        if (tokenFromVerify) {
          try {
            await unbindByTypeReq({
              type: '9',
              token: tokenFromVerify,
              ...(loginName && { loginName }),
            });
            toast({ type: 'success', description: '解绑成功' });
            onSuccess?.();
            onClose();
          } catch (e: unknown) {
            const err = e as {
              code?: string;
              response?: {
                data?: {
                  unbindType?: string | number;
                };
              };
            };
            const nextUnbindType = err?.response?.data?.unbindType;
            if (nextUnbindType != null && String(nextUnbindType).trim()) {
              onRequireRebind?.(String(nextUnbindType));
              onClose();
              return;
            }
            throw e;
          }
        } else {
          toast({ type: 'success', description: '验证成功' });
          onClose();
        }
      }}
      securityData={securityData}
    />
  );
};

export default SecurityEmailResetModal;

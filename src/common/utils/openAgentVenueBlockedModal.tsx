import React from 'react';

import Modal, { type ModalInstance } from '@/common/components/Modal';
import Button from '@/common/components/Button';
import { getGlobalStoreForApiRequest } from '@/core/store/util';
import { requestOpenCustomerService } from '@/core/store/slices/customerServiceUISlice';

const footerStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  width: '100%',
  justifyContent: 'center',
};

const contentTextStyle: React.CSSProperties = {
  margin: 0,
  textAlign: 'center',
};

type VenueBlockedAccountFlags = {
  isAgent?: boolean;
  isRiskAccount?: boolean;
};

/** 代理账号或风险账号均需拦截场馆/转账/投注 */
export function isVenueBlockedAccount({
  isAgent,
  isRiskAccount,
}: VenueBlockedAccountFlags): boolean {
  return !!isAgent || !!isRiskAccount;
}

/**
 * 代理/风险账号拦截：弹窗并返回 false，否则返回 true
 */
export function blockAgentVenueAccess(
  flags: VenueBlockedAccountFlags,
  content = '当前账号暂不支持进入场馆。',
): boolean {
  if (isVenueBlockedAccount(flags)) {
    openAgentVenueBlockedModal(content);
    return false;
  }
  return true;
}

/**
 * 代理/风险账号拦截提示弹窗
 */
export function openAgentVenueBlockedModal(content = '当前账号暂不支持进入场馆。'): ModalInstance {
  const modal = Modal.open({
    title: '系统提示',
    content: <p style={contentTextStyle}>{content}</p>,
    showCloseButton: true,
    footer: (
      <div style={footerStyle}>
        <Button
          type="second"
          style={{ flex: 1 }}
          onClick={() => {
            modal.close();
            getGlobalStoreForApiRequest().dispatch(requestOpenCustomerService());
          }}
        >
          联系客服
        </Button>
        <Button type="primary" style={{ flex: 1 }} onClick={() => modal.close()}>
          我已知晓
        </Button>
      </div>
    ),
  });

  return modal;
}

'use client';

import React, { useCallback } from 'react';
import clsx from 'clsx';

import Modal from '@/common/components/Modal';
import { navigateTo } from '@/common/hooks/useGlobalNavigate';
import { PATHS } from '@/sites/op7/routes/paths';
import { zIndexMap } from '@/utils/constants/zIndex';
import { getGlobalStoreForApiRequest } from '@/core/store/util';
import { openLoginModal } from '@/core/store/slices/authUISlice';
import { requestOpenCustomerService } from '@/core/store/slices/customerServiceUISlice';

import { resolveKickModalDefaultDesc, resolveKickModalTitle } from './kickModalCopy';
import { parseOtherDeviceKickMessage } from './parseOtherDeviceKickMessage';
import styles from './OtherDeviceLoginModal.module.scss';

export interface OtherDeviceLoginModalBodyProps {
  /** 接口业务码，决定标题与兜底文案 */
  code: string;
  /** 可选：覆盖标题（如后端下发） */
  titleOverride?: string | null;
  /** 接口 info 原文 */
  info?: string | null;
  className?: string;
  /** 与点「重新登录」一致：关闭并回首页打开登录 */
  closeForReLogin: () => void;
  /** 去安全中心改密：关闭但不走重新登录拦截 */
  closeForChangePassword: () => void;
  /** 关闭并打开客服弹窗 */
  closeForContact: () => void;
}

export const OtherDeviceLoginModalBody: React.FC<OtherDeviceLoginModalBodyProps> = ({
  code,
  titleOverride,
  info,
  className,
  closeForReLogin,
  closeForChangePassword,
  closeForContact,
}) => {
  const parsed = parseOtherDeviceKickMessage(info);
  const titleText = resolveKickModalTitle(code, titleOverride);
  const defaultDesc = resolveKickModalDefaultDesc(code);
  const showChangePasswordHint = code === '9019' || code === '90001';

  const handleReLogin = useCallback(() => {
    closeForReLogin();
  }, [closeForReLogin]);

  const handleContact = useCallback(() => {
    closeForContact();
  }, [closeForContact]);

  const handleChangePassword = useCallback(() => {
    closeForChangePassword();
  }, [closeForChangePassword]);

  return (
    <div className={clsx(styles.root, className)}>
      <div className={styles.titleRow}>
        <div className={styles.titleInner}>
          <p className={styles.titleText}>{titleText}</p>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.textBlock}>
          {parsed.plain ? (
            <p className={styles.textFlow}>{parsed.plain}</p>
          ) : parsed.line1 ? (
            <p className={styles.textFlow}>
              <span>{parsed.line1.prefixBeforeTime}账号于</span>
              <span className={styles.timeHighlight}>{parsed.line1.timeStr}</span>
              <span>分{parsed.line1.betweenFenAndPeriod}。</span>
              {parsed.line2 ? (
                <>
                  {parsed.line2.kind === 'link' ? (
                    <>
                      {parsed.line2.beforeLink}
                      <button type="button" className={styles.link} onClick={handleChangePassword}>
                        修改密码
                      </button>
                      {parsed.line2.afterLink}
                    </>
                  ) : (
                    parsed.line2.text
                  )}
                </>
              ) : null}
            </p>
          ) : (
            <p className={styles.textFlow}>
              {defaultDesc ?? '您的账号已在其他设备登录，当前设备已退出登录。'}
              {showChangePasswordHint ? (
                <>
                  <br />
                  如非本人操作，请立即{' '}
                  <button type="button" className={styles.link} onClick={handleChangePassword}>
                    修改密码
                  </button>
                </>
              ) : null}
            </p>
          )}
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.btnSecondary} onClick={handleReLogin}>
            重新登录
          </button>
          <button type="button" className={styles.btnPrimary} onClick={handleContact}>
            联系客服
          </button>
        </div>
      </div>
    </div>
  );
};

let kickModalOpen = false;
type KickModalCloseAction = 'idle' | 'relogin' | 'changePassword' | 'contact';
let kickModalCloseAction: KickModalCloseAction = 'idle';

export function openOtherDeviceLoginModal(
  options: {
    info?: string | null;
    /** 接口业务码，用于标题与兜底文案 */
    code?: string | number;
    /** 可选：覆盖标题 */
    title?: string | null;
  } = {},
): void {
  if (typeof window === 'undefined' || kickModalOpen) {
    return;
  }
  kickModalOpen = true;

  const bizCode = String(options.code ?? '9019');

  Modal.open({
    maskClickClose: false,
    zIndex: zIndexMap.otherDeviceKickModal,
    className: styles.modalShell,
    contentClassName: styles.contentFlush,
    content: (close) => (
      <OtherDeviceLoginModalBody
        code={bizCode}
        titleOverride={options.title}
        info={options.info}
        closeForReLogin={() => {
          kickModalCloseAction = 'relogin';
          close();
        }}
        closeForChangePassword={() => {
          kickModalCloseAction = 'changePassword';
          close();
        }}
        closeForContact={() => {
          kickModalCloseAction = 'contact';
          close();
        }}
      />
    ),
    onClose: () => {
      kickModalOpen = false;
      if (kickModalCloseAction === 'relogin') {
        navigateTo(PATHS.home);
        setTimeout(() => {
          getGlobalStoreForApiRequest().dispatch(openLoginModal());
        }, 100);
      } else if (kickModalCloseAction === 'changePassword') {
        navigateTo(PATHS.mineSecurity);
      } else if (kickModalCloseAction === 'contact') {
        getGlobalStoreForApiRequest().dispatch(requestOpenCustomerService());
      }
      kickModalCloseAction = 'idle';
    },
  });
}

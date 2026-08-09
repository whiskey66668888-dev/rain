import React, { useEffect, useMemo, useState } from 'react';

import { ClientOnly } from '@/common/components/ClientOnly';
import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';
import Modal from '@/common/components/Modal';

import { useAppSelector } from '@/core/store/hooks';

import { ModalBackButton, ModalCloseButton } from '../../components/themeIcon';
// import siteConfig from '../../site.config';
import styles from './AccountManagementModal.module.scss';
import { zIndexMap } from '@/utils/constants/zIndex';
import SegmentedControl from '@/common/components/SegmentedControl';
import { BankAccountType, getAccountBindType } from '@/utils/constants/money';
import {
  getBankListReq,
  getVirtualListReq,
  getDigitalListReq,
  getAlipayListReq,
  unBindBankAccountReq,
  unBindVirtualAddressReq,
  UNBIND_VERIFY_TYPE_MAP,
  CardItemVo,
} from '@/apis/origin/bank';
import { useSecurityDataQuery } from '@/apis/origin/login';
import { ResponseData } from '@/core/sdk/request/model';
import { toast } from '@/common/components/Toast';
import Skeleton from '@/common/components/Skeleton';
import Button from '@/common/components/Button';
import clsx from 'clsx';
import Icon from '@/common/components/Icon';
import LazyImage from '@/common/components/LazyImage';
import CheckPasswordModal from './CheckPasswordModal';
import useAccountBind from '../../hooks/useAccountBind';
import { BindAccountType } from '@/utils/constants/account';
import { PlusIconSvg } from '../SvgIcons';
import RealNameModal from '../../pages/MinePage/ProfilePage/components/RealNameModal';

const ACCOUNT_MANAGEMENT_OPTIONS = [
  {
    apiFun: getBankListReq,
    label: '银行卡',
    value: BankAccountType.BANK_ACCOUNT,
    bindAccountType: BindAccountType.bank,
  },
  {
    apiFun: getVirtualListReq,
    label: '虚拟币',
    value: BankAccountType.VIRTUAL_ACCOUNT,
    bindAccountType: BindAccountType.virtual,
  },
  {
    apiFun: getDigitalListReq,
    label: '数字货币',
    value: BankAccountType.DIGITAL_ACCOUNT,
    bindAccountType: BindAccountType.digital,
  },
  {
    apiFun: getAlipayListReq,
    label: '支付宝',
    value: BankAccountType.ZFB_ACCOUNT,
    bindAccountType: BindAccountType.alipay,
  },
];
interface AccountManagementModalProps {
  showType: BankAccountType | null;
  handleClose: () => void;
  /** 点击「忘记支付密码？」时由 BindBankModal 调用，用于打开忘记支付密码流程 */
  onForgotPaymentPassword?: () => void;
}
const AccountManagementModal: React.FC<AccountManagementModalProps> = ({
  showType,
  handleClose,
  onForgotPaymentPassword,
}) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const [accountManagementType, setAccountManagementType] = useState<BankAccountType>(
    showType ?? BankAccountType.BANK_ACCOUNT,
  );
  const [loading, setLoading] = useState(true);
  /** 支付密码验证通过后要执行的动作：'bind' = 打开添加账户弹窗，{ type: 'unbind', item } = 解绑该卡片 */
  const [pendingAfterCheck, setPendingAfterCheck] = useState<
    'bind' | { type: 'unbind'; item: CardItemVo } | null
  >(null);
  const [showModalType, setShowModalType] = useState<'bind' | 'check' | null>(null);
  const [list, setList] = useState<CardItemVo[]>([]);
  const [realNameVisible, setRealNameVisible] = useState(false);
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const overlayPosition = useMemo<OverlayPosition>(
    () => (isMobile ? 'bottom' : 'center'),
    [isMobile],
  );

  // 用户信息
  const user = useAppSelector((state) => state.user.memberInfo);

  const { data: securityData } = useSecurityDataQuery();

  const { open, BindAccountModals } = useAccountBind();

  const currentOption = useMemo(() => {
    return ACCOUNT_MANAGEMENT_OPTIONS.find((item) => item.value === accountManagementType);
  }, [accountManagementType]);

  useEffect(() => {
    setAccountManagementType(showType ?? BankAccountType.BANK_ACCOUNT);
  }, [showType]);

  useEffect(() => {
    setLoading(true);
    currentOption!
      .apiFun()
      .then((res: ResponseData<CardItemVo[]>) => {
        setList(res?.data ?? []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentOption]);

  const handleAddAccount = (bindAccountType: BindAccountType) => {
    const accountBindType = getAccountBindType(accountManagementType);
    const item = securityData?.accountBindList?.find(
      (obj) => obj.accountBindType === accountBindType,
    );

    const max = item?.max ?? 0;
    if (list.length >= max) {
      toast({ type: 'warning', description: '已超出最大绑定数量' });
      return;
    }

    // 添加本人银行卡：未绑定真实姓名时先提示（对齐充值）
    if (bindAccountType === BindAccountType.bank && !user.realName) {
      const modal = Modal.open({
        title: '安全提示',
        zIndex: zIndexMap.loginModal + 1,
        content: (
          <div>
            <p style={{ marginTop: '12px', color: 'var(--Text-800)', textAlign: 'center' }}>
              为了您的账号安全，请您完成实名认证。
            </p>
          </div>
        ),
        footer: (
          <div className="flex gap-12px w-full">
            <Button
              type="second"
              className="flex-1"
              onClick={() => {
                modal.close();
              }}
            >
              取消
            </Button>
            <Button
              className="flex-1"
              type="primary"
              onClick={() => {
                modal.close();
                setRealNameVisible(true);
              }}
            >
              前往
            </Button>
          </div>
        ),
      });
      return;
    }

    // 打开 添加账户弹框
    open({ bindAccountType: bindAccountType, onSuccess: refreshList });
  };

  const handleUnbindClick = (item: CardItemVo) => {
    setPendingAfterCheck({ type: 'unbind', item });
    setShowModalType('check');
  };

  const refreshList = () => {
    setLoading(true);
    currentOption!
      .apiFun()
      .then((res: ResponseData<CardItemVo[]>) => {
        setList(res?.data ?? []);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  /** 解绑时验证支付密码的 type，与参考项目 emc-h5 一致 */
  const unbindVerifyType = useMemo(() => {
    switch (accountManagementType) {
      case BankAccountType.BANK_ACCOUNT:
        return UNBIND_VERIFY_TYPE_MAP.bank;
      case BankAccountType.VIRTUAL_ACCOUNT:
        return UNBIND_VERIFY_TYPE_MAP.virtual;
      case BankAccountType.DIGITAL_ACCOUNT:
        return UNBIND_VERIFY_TYPE_MAP.digital;
      case BankAccountType.ZFB_ACCOUNT:
        return UNBIND_VERIFY_TYPE_MAP.alipay;
      default:
        return UNBIND_VERIFY_TYPE_MAP.bank;
    }
  }, [accountManagementType]);

  const handleCheckPasswordSuccess = (token?: string) => {
    if (pendingAfterCheck === 'bind') {
      setShowModalType('bind');
    } else if (pendingAfterCheck && pendingAfterCheck.type === 'unbind') {
      const { item } = pendingAfterCheck;
      setShowModalType(null);
      const type = unbindVerifyType;
      const runUnbind = (): Promise<unknown> => {
        if (accountManagementType === BankAccountType.BANK_ACCOUNT) {
          const bankId = item.id;
          return unBindBankAccountReq({ token, bankId, type });
        }
        if (
          accountManagementType === BankAccountType.VIRTUAL_ACCOUNT ||
          accountManagementType === BankAccountType.DIGITAL_ACCOUNT ||
          accountManagementType === BankAccountType.ZFB_ACCOUNT
        ) {
          return unBindVirtualAddressReq({
            token,
            virtualId: item.id,
            type,
          });
        }
        return Promise.resolve();
      };
      void runUnbind()
        .then(() => {
          toast({ type: 'success', description: '删除成功' });
          refreshList();
        })
        .catch(() => {});
    }
    setPendingAfterCheck(null);
  };

  return (
    <ClientOnly>
      <Overlay
        show={!!showType}
        close={handleClose}
        position={overlayPosition}
        maskClickClose
        zIndex={zIndexMap.loginModal}
      >
        <div
          className={`${styles.accountManagementModal} ${isMobile ? styles.mobile : styles.desktop} font-400 _tf[14]`}
        >
          <div className={styles.header}>
            {isMobile && <ModalBackButton className={styles.back} onClick={handleClose} />}
            <p>账户管理</p>
            {!isMobile && <ModalCloseButton className={styles.closeButton} onClick={handleClose} />}
          </div>

          <div className={styles.content}>
            <div className="px-10px py-12px">
              <SegmentedControl
                options={ACCOUNT_MANAGEMENT_OPTIONS}
                value={accountManagementType}
                onChange={(v) => setAccountManagementType(v)}
                className={clsx(
                  styles.segmentedControl,
                  'text-[var(--Text-Main-10)] bg-[var(--Background-300)] w-100% shrink-0',
                )}
                height={36}
                tabButtonClassName="_tf[14] leading-[20px]"
              />
            </div>
            <div className="px-12px py-12px overflow-y-auto">
              {loading ? (
                <Skeleton type="bankCard" />
              ) : (
                <ul className={clsx(styles.bankCardWrapper, '_tf[12px]')}>
                  {list.length === 0 ? (
                    <li className={styles.bankCardEmpty}>
                      <p>您还未绑定{currentOption!.label}</p>
                    </li>
                  ) : (
                    list.map((item) => (
                      <li key={item.id} className={styles.bankCard}>
                        <div className={styles.cardTop}>
                          <div className={styles.cardTopLeft}>
                            <LazyImage src={item.cardLogo} width={36} height={36} lazy={false} />
                            <div className={styles.bankNameBlock}>
                              <span className={styles.bankName}>{item.cardName}</span>
                              <span className={styles.cardType}>{item.cardDesc}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className={styles.cardCloseBtn}
                            aria-label="取消绑定"
                            onClick={() => handleUnbindClick(item)}
                          >
                            <Icon
                              size="9px"
                              src="/images/common/commonCha.svg"
                              color="var(--Text-Main-10)"
                            />
                          </button>
                        </div>
                        {accountManagementType === BankAccountType.BANK_ACCOUNT && (
                          <div className={styles.cardBottom}>
                            <span>姓名: {item.username}</span>
                            <span>尾号: {item.shortCarNumber}</span>
                          </div>
                        )}
                        {accountManagementType === BankAccountType.ZFB_ACCOUNT && (
                          <div className={styles.cardBottom}>
                            <span>姓名: {item.username}</span>
                            <span>账号: {item.cardNumber}</span>
                          </div>
                        )}

                        {accountManagementType === BankAccountType.VIRTUAL_ACCOUNT && (
                          <div className={styles.cardBottom}>
                            <span>{item.shortCarNumber}</span>
                            <span>{item.remark}</span>
                          </div>
                        )}

                        {accountManagementType === BankAccountType.DIGITAL_ACCOUNT && (
                          <div className={styles.cardBottom}>
                            <span>{item.shortCarNumber}</span>
                            <span>{item.remark}</span>
                          </div>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              )}

              <div className="flex flex-col gap-12px shrink-0 mt-24px">
                <Button
                  icon={<PlusIconSvg className="w-16px h-16px" />}
                  onClick={() => {
                    handleAddAccount(currentOption!.bindAccountType);
                  }}
                >
                  添加{currentOption!.label}
                </Button>

                {accountManagementType === BankAccountType.BANK_ACCOUNT && user.hasOtherBank && (
                  <Button
                    icon={<PlusIconSvg className="w-16px h-16px" />}
                    type="third"
                    onClick={() => {
                      handleAddAccount(BindAccountType.otherBank);
                    }}
                  >
                    非本人银行卡添加
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Overlay>

      {BindAccountModals}

      {showModalType === 'check' && (
        <CheckPasswordModal
          handleClose={() => {
            setShowModalType(null);
            setPendingAfterCheck(null);
          }}
          onForgotPassword={onForgotPaymentPassword}
          onSuccess={handleCheckPasswordSuccess}
          verifyType={
            pendingAfterCheck !== null &&
            pendingAfterCheck !== 'bind' &&
            pendingAfterCheck.type === 'unbind'
              ? unbindVerifyType
              : undefined
          }
        />
      )}

      <RealNameModal
        visible={realNameVisible}
        zIndex={zIndexMap.loginModal + 1}
        onClose={() => {
          setRealNameVisible(false);
        }}
      />
    </ClientOnly>
  );
};

export default AccountManagementModal;

import React from 'react';
// components
import Icon from '@/common/components/Icon';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';
// styles
import styles from './index.module.scss';
import clsx from 'clsx';
import { ModalCloseButton } from '@/sites/op7/components/themeIcon';
import { ETransRecordType } from '@/apis/commonSports/constants';

/**
 * 头部 钱包头部
 */
interface HeaderProps {
  title: React.ReactNode;
  showRecord?: boolean;
  recordType?: ETransRecordType; // 记录类型，决定跳转到充值记录还是提现记录页
  showCustomer?: boolean;
  showClose?: boolean;
  autoHide?: boolean; // 桌面端自动隐藏
  onBack?: () => void;
  onClose?: () => void;
  onTitleClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showRecord = true,
  recordType,
  showCustomer = true,
  showClose = false,
  autoHide = true,
  onBack,
  onClose,
  onTitleClick,
}) => {
  const navigate = useNavigateWithLanguage();
  const openCustomerService = useOpenCustomerService();

  return (
    <div className={clsx(styles.header, autoHide ? styles.desktopHide : '')}>
      <div
        className={styles.bnBack}
        onClick={() => {
          if (onBack) {
            onBack();
          } else {
            navigate(-1);
          }
        }}
      >
        <Icon src="/images/common/back.svg" size="18px" color="var(--Text-Main-10)" />
      </div>
      <span className={onTitleClick ? styles.titleClickable : ''} onClick={onTitleClick}>
        {title}
      </span>

      <div className={styles.actions}>
        {showRecord && (
          <div
            className={styles.button}
            onClick={() =>
              navigate(`${PATHS.mineTransactionRecord}${recordType ? `?type=${recordType}` : ''}`)
            }
          >
            <Icon
              src="/images/common/record_withdrawl_1.svg"
              size="20px"
              color="var(--Text-Main-10)"
            />
          </div>
        )}

        {showCustomer && (
          <div className={styles.button} onClick={openCustomerService}>
            <Icon
              src="/images/common/CustomerService.svg"
              size="20px"
              color="var(--Text-Main-10)"
            />
          </div>
        )}

        {showClose && <ModalCloseButton className={styles.closeButton} onClick={onClose} />}
      </div>
    </div>
  );
};

export default Header;

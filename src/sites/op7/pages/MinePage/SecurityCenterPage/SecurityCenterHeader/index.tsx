import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { ModalBackButton } from '@/sites/op7/components/themeIcon';
import styles from './SecurityCenterHeader.module.scss';

interface SecurityCenterHeaderProps {
  title?: string;
  onBack?: () => void;
  variant?: 'default' | 'subPage';
  /** 右侧自定义区域（如绑定动态验证码页客服入口） */
  headerRight?: React.ReactNode;
}

const SecurityCenterHeader: React.FC<SecurityCenterHeaderProps> = ({
  title,
  onBack,
  variant = 'default',
  headerRight,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigateWithLanguage();
  const titlePrefix = t('securityCenter.titlePrefix');
  const highlightToken = t('securityCenter.highlightToken');
  const titleSuffix = t('securityCenter.titleSuffix');
  const displayTitle = useMemo(
    () =>
      title ?? (
        <>
          {titlePrefix}
          <span>{highlightToken}</span>
          {titleSuffix}
        </>
      ),
    [title, titlePrefix, highlightToken, titleSuffix],
  );

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigate(-1);
  };

  return (
    <header
      className={`${styles.header} ${variant === 'subPage' ? styles.subPageHeader : ''}`}
      data-desc="security-center-header"
    >
      <div className={`${styles.bar} ${variant === 'subPage' ? styles.subPageBar : ''}`}>
        <div className={styles.left}>
          <ModalBackButton
            className={styles.backBtn}
            onClick={handleBack}
            ariaLabel={t('securityCenter.back')}
          />
        </div>
        <div className={`${styles.title} ${variant === 'subPage' ? styles.subPageTitle : ''}`}>
          {displayTitle}
        </div>
        <div className={styles.right}>{headerRight}</div>
      </div>
    </header>
  );
};

export default SecurityCenterHeader;

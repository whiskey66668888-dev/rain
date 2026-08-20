import { ReactNode, useMemo } from 'react';
import { Popup, CenterPopup } from 'antd-mobile';
import styles from './RulesDialog.module.scss';
import { useAppSelector } from '@/core/store/hooks';
import { ModalCloseButton } from '@/sites/op7/components/themeIcon';
interface DialogProps {
  visible: boolean;
  onClose: () => void;
  title?: string; // ✅ 可选标题
  children: ReactNode; // ✅ 内容由外部传入
  showCloseButton?: boolean; // ✅ 是否显示关闭按钮
}

const RulesDialog: React.FC<DialogProps> = ({
  visible,
  onClose,
  title = '活动规则',
  children,
  showCloseButton = true,
}) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  // 根据 screenBreakpoint 判断是否为移动端（md 为 H5，其他为 PC）
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);

  // ✅ 内容包装组件（带标题和关闭按钮）
  const ContentWrapper = () => (
    <div className={styles.dialogContent}>
      {(title || showCloseButton) && (
        <div className={styles.header}>
          {title && <div className={styles.title}>{title}</div>}
          {showCloseButton && (
            <div className={styles.closeButton} onClick={onClose}>
              <ModalCloseButton onClick={onClose} className={styles.closeIcon} />
            </div>
          )}
        </div>
      )}
      <div className={styles.body}>{children}</div>
    </div>
  );

  // ✅ 移动端：使用 Popup
  if (isMobile) {
    return (
      <Popup
        visible={visible}
        className={styles.popup}
        onMaskClick={onClose}
        onClose={onClose}
        position="bottom"
        bodyStyle={{
          maxHeight: '80vh',
        }}
      >
        <ContentWrapper />
      </Popup>
    );
  }

  // ✅ 大屏幕：使用 CenterPopup
  return (
    <CenterPopup
      visible={visible}
      className={styles.popup}
      onMaskClick={onClose}
      onClose={onClose}
      bodyStyle={{
        width: '450px',
      }}
    >
      <ContentWrapper />
    </CenterPopup>
  );
};

export default RulesDialog;

import { useMemo, useRef, useEffect } from 'react';
import { CenterPopup } from 'antd-mobile';
import styles from './index.module.scss';
import { useAppSelector } from '@/core/store/hooks';
import penIcon from './images/pen.png';
import sendIcon from './images/send.png';
import LazyImage from '@/common/components/LazyImage';
import { toast } from '@/common/components/Toast';
import Button from '@/common/components/Button';
import ModalCloseButton from '@/sites/op7/components/themeIcon/ModalCloseButton';
interface DialogProps {
  visible: boolean;
  onClose: () => void;
  defaultValue?: string; // ✅ 改为 defaultValue（非受控）
  onSend?: (content: string) => void;
  sendLoading?: boolean; // ✅ 发送状态
}

const SendCommentDialog: React.FC<DialogProps> = ({
  visible,
  onClose,
  defaultValue = '',
  onSend,
  sendLoading,
}) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);

  // ✅ 使用 ref 管理 textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 根据 screenBreakpoint 判断是否为移动端
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);

  // ✅ 弹窗打开时聚焦输入框
  useEffect(() => {
    if (visible && textareaRef.current) {
      // 延迟聚焦，等待动画完成
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  // ✅ 处理发送
  const handleSend = () => {
    const content = textareaRef.current?.value.trim() || '';
    console.log('发送内容:', content);
    if (!content) {
      toast({
        type: 'warning',
        description: '请输入评论',
      });
      return;
    }

    onSend?.(content);

    // ✅ 发送后清空输入框
    if (textareaRef.current) {
      textareaRef.current.value = '';
    }

    onClose();
  };

  // ✅ 处理键盘事件（Ctrl+Enter 或 Cmd+Enter 发送）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // ✅ 内容包装组件
  const ContentWrapper = () => (
    <div className={styles.sendContent}>
      <div className={styles.sendHeader}>
        <div className={styles.sendHeaderLeft}>
          <LazyImage src={penIcon} width={18} height={18} />
          <div className="ml-10px">发表您的评论</div>
        </div>
        <div className={styles.sendHeaderRight}>
          <ModalCloseButton onClick={onClose} className={styles.closeButton} />
        </div>
      </div>

      <div className={styles.sendBody}>
        <textarea
          ref={textareaRef}
          placeholder="发送评论~ 最多支持500字"
          defaultValue={defaultValue}
          maxLength={500}
          onKeyDown={handleKeyDown}
          className={styles.textarea}
        />
      </div>

      <div className={styles.sendFooter}>
        <Button
          icon={<LazyImage src={sendIcon} width={16} height={16} />}
          type={'primary'}
          loading={sendLoading}
          onClick={handleSend}
          className={styles.sendButton}
        >
          发送
        </Button>
      </div>
    </div>
  );

  return (
    <CenterPopup
      visible={visible}
      className={`${styles.popup} ${isMobile ? styles.popupMobile : ''}`}
      onMaskClick={onClose}
      onClose={onClose}
      bodyStyle={{
        width: isMobile ? 'calc(100vw - 24px)' : '500px',
      }}
    >
      <ContentWrapper />
    </CenterPopup>
  );
};

export default SendCommentDialog;

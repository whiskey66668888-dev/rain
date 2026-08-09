import { useThrottleFn } from 'ahooks';
import styles from './index.module.scss';
import useFlutterBridge from '@/sites/op7/hooks/useFlutterBridge';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';
import Button from '@/common/components/Button';

const SupportFooter = () => {
  const { sendToFlutter, isInFlutter } = useFlutterBridge();
  const openCustomerService = useOpenCustomerService(true);
  const { run: handleHelpClick } = useThrottleFn(
    () => {
      if (isInFlutter()) {
        sendToFlutter('goCustomerService');
      } else {
        openCustomerService();
      }
    },
    {
      wait: 1000, // 冷却时间，建议 1000ms，防止用户疯狂连点
      leading: true, // 点击时立即触发
      trailing: false, // 冷却结束后不再次触发（关键配置）
    },
  );
  return (
    <div className={styles.supportFooter}>
      <Button
        type="primary"
        className={styles.supportBtn}
        icon={<span className={styles.icon} />}
        onClick={handleHelpClick}
      >
        <span className={styles.text}>在线客服</span>
      </Button>
    </div>
  );
};

export default SupportFooter;

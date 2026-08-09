import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import useFlutterBridge from '@/sites/op7/hooks/useFlutterBridge';
import { inviteFriendsImg } from '../paths';
import styles from './activationInviteModal.module.scss';
import clsx from 'clsx';
import { useAppSelector } from '@core/store/hooks';

interface ActivationInviteModalProps {
  onClose: () => void;
}

export default function ActivationInviteModal({ onClose }: ActivationInviteModalProps) {
  const navigate = useNavigateWithLanguage();
  const { sendToFlutter, isInFlutter } = useFlutterBridge();
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = screenBreakpoint === 'md';

  const goDeposit = () => {
    if (isInFlutter()) {
      sendToFlutter('toDeposit');
    } else {
      navigate('/mine/deposit');
    }
    onClose();
  };

  return (
    <div className={clsx(styles.wrap, isMobile && styles.wrapH5)}>
      {/*<div className={styles.title}>首充开启邀请特权</div>*/}
      <div className={styles.list}>
        <div className={styles.row}>
          <img src={inviteFriendsImg('activationInvite-icon-1.png')} alt="" />
          <div>
            <div className={styles.rowTitle}>呼朋唤友</div>
            <div className={styles.rowSub}>成功邀请好友首充最高奖励</div>
          </div>
          <img
            src={inviteFriendsImg('activationInvite-text-1.png')}
            alt=""
            className={styles.tag}
          />
        </div>
        <div className={styles.row}>
          <img src={inviteFriendsImg('activationInvite-icon-2.png')} alt="" />
          <div>
            <div className={styles.rowTitle}>累计奖励</div>
            <div className={styles.rowSub}>累计邀请好友奖励上不封顶</div>
          </div>
          <img
            src={inviteFriendsImg('activationInvite-text-2.png')}
            alt=""
            className={styles.tag}
          />
        </div>
        <div className={styles.row}>
          <img src={inviteFriendsImg('activationInvite-icon-3.png')} alt="" />
          <div>
            <div className={styles.rowTitle}>好友升级</div>
            <div className={styles.rowSub}>邀请好友直升平台会员</div>
          </div>
          <img
            src={inviteFriendsImg('activationInvite-text-3.png')}
            alt=""
            className={styles.tag}
          />
        </div>
        <div className={styles.row}>
          <img src={inviteFriendsImg('activationInvite-icon-4.png')} alt="" />
          <div>
            <div className={styles.rowTitle}>返水奖励</div>
            <div className={styles.rowSub}>成功邀请好友周周返水彩金</div>
          </div>
          <img
            src={inviteFriendsImg('activationInvite-text-4.png')}
            alt=""
            className={styles.tag}
          />
        </div>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={goDeposit}>
          激活邀请特权
          <img src={inviteFriendsImg('jian.png')} alt="" className={styles.primaryImg} />
        </button>
        <button type="button" className={styles.secondary} onClick={onClose}>
          下次再说
        </button>
      </div>
    </div>
  );
}

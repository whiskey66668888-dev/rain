import { SpinLoading } from 'antd-mobile';
import fileSaver from 'file-saver';
import QRCode from 'react-qr-code';
import { useRequest } from 'ahooks';
import { useMemo, useRef, useState } from 'react';

import { toast } from '@/common/components/Toast';
import { getInviterInfo } from '@/apis/origin/inviteFriends';
import useFlutterBridge from '@/sites/op7/hooks/useFlutterBridge';
import { inviteFriendsImg } from '../paths';
import styles from './downloadInviteModal.module.scss';
import { toDisplayString } from '../stringUtils';
import { CopyIcon, DownIcon } from '@/sites/op7/pages/MinePage/InviteFriendsPage/components/icons';
import ModalHeader from '@/sites/op7/components/ModalHeader';
import { useAppSelector } from '@core/store/hooks';
import clsx from 'clsx';
import { getSystemTheme } from '@/utils';

interface DownloadInviteModalProps {
  onClose: () => void;
}

function asRecord(d: unknown): Record<string, unknown> {
  return d && typeof d === 'object' ? (d as Record<string, unknown>) : {};
}

export default function DownloadInviteModal({ onClose }: DownloadInviteModalProps) {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = screenBreakpoint === 'md';
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const isDark = useMemo(() => {
    return theme === 'dark';
  }, [theme]);
  const { sendToFlutter, isInFlutter } = useFlutterBridge();
  const inviteImageRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const { data: inviterRaw, loading } = useRequest(async () => {
    const res = await getInviterInfo();
    return asRecord(res?.data);
  });

  const safe = inviterRaw ?? {};
  const inviteCode = toDisplayString(safe.advCode);
  const inviteUrl = toDisplayString(safe.advUrl);

  const copyText = (text: string, emptyHint: string) => {
    if (!text) {
      toast({ type: 'info', description: emptyHint });
      return;
    }
    void navigator.clipboard.writeText(text);
    toast({ type: 'success', description: '复制成功' });
  };

  const handleDownloadImage = async () => {
    if (!inviteImageRef.current) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(inviteImageRef.current, {
        useCORS: true,
        scale: 3,
        backgroundColor: null,
      });
      const base64Image = canvas.toDataURL('image/png');
      if (isInFlutter()) {
        sendToFlutter('downloadFriendPic', { imageBase64: base64Image });
      } else {
        canvas.toBlob((blob) => {
          if (blob) {
            fileSaver.saveAs(blob, `邀请好友-${inviteCode || 'share'}.png`);
            toast({ type: 'success', description: '图片已保存' });
          } else {
            toast({ type: 'warning', description: '保存失败，请重试' });
          }
        }, 'image/png');
      }
    } catch {
      toast({ type: 'warning', description: '操作失败，请重试' });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={styles.downloadPage}>
      {loading ? (
        <div className={styles.loading}>
          <SpinLoading color="primary" />
          <span>加载中...</span>
        </div>
      ) : (
        <div className={clsx(styles.imageWrapper, isMobile && styles.imageWrapperH5)}>
          <div className={styles.inviteImage} ref={inviteImageRef}>
            <div className={styles.imageContent}>
              <img
                src={`/images/${isDark ? 'dark' : 'light'}/inviteFriends/download${isMobile ? '_h5_1' : ''}.webp`}
                alt=""
                className={styles.bigbg}
              />
              <div className={styles.inviteInfo}>
                <img src={inviteFriendsImg('round.png')} alt="" className={styles.round} />
                <div className={styles.codeInfo}>
                  <div className={styles.inviteCode}>邀请码</div>
                  <div className={styles.code}>{inviteCode || '******'}</div>
                </div>
                <div className={styles.qrCode}>
                  {inviteUrl ? (
                    <QRCode
                      value={inviteUrl}
                      size={52}
                      level="H"
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                    />
                  ) : (
                    <div className={styles.noQrCode}>二维码加载中</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={clsx(styles.footer, !isMobile && styles.footerPc)}>
        <ModalHeader title="分享" className="bg-[var(--Background-300)]" onClose={onClose} />
        <div className={styles.inviteCon}>
          <div className={styles.inviteInfoItem}>
            <span className={styles.label}>邀请码</span>
            <span className={styles.value}>{inviteCode || '-'}</span>
            <button
              type="button"
              className={styles.copyBtn}
              aria-label="复制邀请码"
              onClick={() => copyText(inviteCode, '暂无邀请码')}
            >
              <CopyIcon />
            </button>
          </div>
          <div className={styles.inviteInfoItem}>
            <span className={styles.label}>邀请链接</span>
            <span className={styles.value}>{inviteUrl || '-'}</span>
            <button
              type="button"
              className={styles.copyBtn}
              aria-label="复制邀请链接"
              onClick={() => copyText(inviteUrl, '暂无链接')}
            >
              <CopyIcon />
            </button>
          </div>
        </div>
        <div className={styles.btnGroup}>
          {/*<button type="button" className={styles.cancelBtn} onClick={onClose}>
            取消
          </button>*/}
          <button
            type="button"
            className={styles.saveButton}
            disabled={downloading || !inviteUrl}
            onClick={() => void handleDownloadImage()}
          >
            <DownIcon /> 保存图片
          </button>
        </div>
      </div>
    </div>
  );
}

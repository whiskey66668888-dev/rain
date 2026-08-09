import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import html2canvas from 'html2canvas';
import fileSaver from 'file-saver';

import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';
import { toast } from '@/common/components/Toast';
import { zIndexMap } from '@/utils/constants/zIndex';
import { ModalBackButton } from '@/sites/op7/components/themeIcon';
import CustomerServiceDeviceInfoPanel from '@/sites/op7/components/CustomerServiceDeviceInfoPanel';
import CustomerServiceRecordModal from '@/sites/op7/components/CustomerServiceRecordModal';
import type { CustomerServiceRecordModalType } from '@/sites/op7/components/CustomerServiceRecordModal';
import { useCustomerServiceDeviceInfo } from '@/sites/op7/hooks/useCustomerServiceDeviceInfo';

const { saveAs } = fileSaver;

async function waitForImages(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map((image) => {
      if (image.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        image.addEventListener('load', () => resolve(), { once: true });
        image.addEventListener('error', () => resolve(), { once: true });
      });
    }),
  );
}

/** 与设备信息展示同一时间基准；时间用下划线避免 Windows 文件名非法字符 */
function getDeviceInfoScreenshotFilename(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  const offsetMinutes = date.getTimezoneOffset();
  const offsetHours = -offsetMinutes / 60;
  const sign = offsetHours >= 0 ? '+' : '-';
  const tz = `UTC${sign}${Math.abs(offsetHours)}`;
  return `${y}年${m}月${d}日 ${h}_${min}_${s} (${tz}).png`;
}

export interface CustomerServiceModalProps {
  show: boolean;
  onClose: () => void;
  /** 客服 iframe 地址，为空时显示占位/加载 */
  kefuUrl: string | null;
  /** 人工客服 orderId，存在时关闭前二次确认 */
  orderId?: string | null;
  /** H5 为 true：全屏/底部弹出；PC 为 false：固定右下角 */
  isMobile: boolean;
}

const CustomerServiceModal: React.FC<CustomerServiceModalProps> = ({
  show,
  onClose,
  kefuUrl,
  orderId,
  isMobile,
}) => {
  const { t } = useTranslation();
  const [deviceInfoOpen, setDeviceInfoOpen] = useState(false);
  const [recordModal, setRecordModal] = useState<CustomerServiceRecordModalType | null>(null);
  const [screenshotBusy, setScreenshotBusy] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const deviceInfo = useCustomerServiceDeviceInfo(show && deviceInfoOpen);

  useEffect(() => {
    if (!show) {
      setDeviceInfoOpen(false);
      setRecordModal(null);
    }
  }, [show]);

  const closeWholeModal = useCallback(() => {
    if (orderId) {
      const msg = t('modals.customerService.confirmEndSession');
      if (window.confirm(msg)) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [orderId, onClose, t]);

  const handleHeaderBack = () => {
    if (deviceInfoOpen) {
      setDeviceInfoOpen(false);
      return;
    }
    closeWholeModal();
  };

  const handleScreenshot = useCallback(async () => {
    const el = captureRef.current;
    if (!el || screenshotBusy) return;
    setScreenshotBusy(true);
    try {
      await waitForImages(el);
      const computed = getComputedStyle(el);
      const bg =
        computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)'
          ? computed.backgroundColor
          : '#ecf2ff';

      const canvas = await html2canvas(el, {
        useCORS: true,
        scale: Math.min(3, window.devicePixelRatio || 2),
        backgroundColor: bg,
      });

      const filename = getDeviceInfoScreenshotFilename();

      await new Promise<void>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            saveAs(blob, filename);
            toast({ description: t('modals.customerService.screenshotSaved'), type: 'success' });
            resolve();
          } else {
            reject(new Error('toBlob failed'));
          }
        }, 'image/png');
      });
    } catch (e) {
      console.error(e);
      toast({ description: t('modals.customerService.screenshotFailed'), type: 'error' });
    } finally {
      setScreenshotBusy(false);
    }
  }, [screenshotBusy, t]);

  const position: OverlayPosition = isMobile ? 'bottom' : 'center';
  const bodyClassname = useMemo(() => {
    return isMobile
      ? 'h-full flex flex-col bg-[var(--Background-300)]'
      : '!fixed !right-4 !bottom-4 !top-auto !left-auto !translate-x-0 !translate-y-0 w-[801px] h-[600px] max-h-[90vh] rounded-2xl shadow-lg flex flex-col bg-[var(--Background-300)] overflow-hidden';
  }, [isMobile]);

  const headerTitle = deviceInfoOpen
    ? t('modals.customerService.deviceInfoTitle')
    : t('modals.customerService.modalTitle');

  return (
    <>
      <Overlay
        show={show}
        close={closeWholeModal}
        position={position}
        maskClickClose
        zIndex={zIndexMap.customerServiceModal}
        bodyClassname={bodyClassname}
      >
        <div
          className={clsx(
            'flex h-full min-h-0 flex-col',
            deviceInfoOpen && 'bg-[var(--Background-700)]',
          )}
        >
          <header
            className={clsx(
              'flex shrink-0 items-center justify-between gap-3 border-b border-[var(--Line-100)] px-12px py-0',
              'h-48px bg-[var(--Background-300)]',
            )}
          >
            <div className="flex min-w-0 w-56px flex-1 items-center">
              <div className={clsx('flex size-24px items-center justify-center rounded-full')}>
                <ModalBackButton
                  onClick={handleHeaderBack}
                  ariaLabel={t('modals.customerService.backAria')}
                />
              </div>
            </div>
            <h1 className="flex flex-1 justify-center truncate text-16px font-500 leading-24px text-[var(--Text-Main-10)]">
              {headerTitle}
            </h1>
            <div className="flex min-w-[72px] flex-1 justify-end">
              {deviceInfoOpen ? (
                <button
                  type="button"
                  disabled={screenshotBusy}
                  onClick={() => void handleScreenshot()}
                  className="shrink-0 text-14px font-500 text-[var(--ThemeColor-Main)] disabled:opacity-50"
                  aria-label={t('modals.customerService.screenshot')}
                >
                  {t('modals.customerService.screenshot')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setDeviceInfoOpen(true)}
                  className="text-14px font-500 text-[var(--ThemeColor-Main)]"
                >
                  {t('modals.customerService.myInfo')}
                </button>
              )}
            </div>
          </header>
          {deviceInfoOpen ? (
            <div ref={captureRef} className="flex-1">
              <CustomerServiceDeviceInfoPanel
                data={deviceInfo}
                isMobile={isMobile}
                onBettingRecordClick={() => setRecordModal('betting')}
                onTransactionRecordClick={() => setRecordModal('transaction')}
                className="flex-1 px-12px pb-12px pt-12px"
              />
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-hidden bg-[var(--Background-200)]">
              {kefuUrl ? (
                <iframe
                  key={String(isMobile)}
                  src={kefuUrl}
                  title={t('modals.customerService.modalTitle')}
                  className="h-full w-full border-0"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[var(--Text-700)]">
                  {t('modals.customerService.loading')}
                </div>
              )}
            </div>
          )}
        </div>
      </Overlay>

      {recordModal && (
        <CustomerServiceRecordModal
          type={recordModal}
          show
          isMobile={isMobile}
          onClose={() => setRecordModal(null)}
        />
      )}
    </>
  );
};

export default CustomerServiceModal;

import React, { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/common/components/Toast';

import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';
import { zIndexMap } from '@/utils/constants/zIndex';
import { usePreInfoQuery } from '@/apis/origin/setting';
import {
  getServiceInfoReq,
  SERVICE_INFO_QUERY_KEY,
  useServiceInfoQuery,
  type CustomerServiceChannelItem,
  type CustomerServiceHotlineItem,
} from '@/apis/origin/customerService';
import { copyToClipboard } from '@/utils';
import {
  hasAvailableServiceData,
  isInHotlineWorkTime,
} from '@/sites/op7/utils/customerServiceTime';
import ModalCloseButton from '../themeIcon/ModalCloseButton';

import styles from './OnlineCustomerService.module.scss';

const DEFAULT_CHANNEL_LOGO = '/images/common/login/customer-%20service1.png';

export interface OnlineCustomerServiceProps {
  show: boolean;
  onClose: () => void;
  isMobile?: boolean;
  onSelectChannel?: (url: string) => void;
  /** 直达前需先展示公告，确认后回调 onNoticeConfirmed */
  pendingNoticeUrl?: string | null;
  onNoticeConfirmed?: (url: string) => void;
}

const PhoneIcon: React.FC = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5.305 6.40167C6.08695 7.7754 7.2246 8.91305 8.59833 9.695L9.335 8.66333C9.45346 8.49745 9.62862 8.38073 9.82734 8.33528C10.026 8.28982 10.2345 8.31878 10.4133 8.41667C11.5919 9.06077 12.8935 9.44815 14.2325 9.55333C14.4415 9.56989 14.6365 9.66461 14.7788 9.8186C14.921 9.97259 15 10.1745 15 10.3842V14.1025C15 14.3088 14.9235 14.5078 14.7853 14.661C14.6471 14.8142 14.4569 14.9106 14.2517 14.9317C13.81 14.9775 13.365 15 12.9167 15C5.78333 15 0 9.21667 0 2.08333C0 1.635 0.0225 1.19 0.0683333 0.748333C0.0893788 0.543081 0.18582 0.352934 0.338991 0.214695C0.492163 0.076456 0.691172 -4.44648e-05 0.8975 1.93894e-08H4.61583C4.82547 -2.62654e-05 5.02741 0.0789596 5.1814 0.221209C5.33539 0.363458 5.43011 0.55852 5.44667 0.7675C5.55185 2.10649 5.93923 3.40807 6.58333 4.58667C6.68122 4.76547 6.71018 4.97395 6.66472 5.17266C6.61927 5.37137 6.50255 5.54654 6.33667 5.665L5.305 6.40167ZM3.20333 5.85417L4.78667 4.72333C4.33732 3.75341 4.02946 2.72403 3.8725 1.66667H1.675C1.67 1.805 1.6675 1.94417 1.6675 2.08333C1.66667 8.29667 6.70333 13.3333 12.9167 13.3333C13.0558 13.3333 13.195 13.3308 13.3333 13.325V11.1275C12.276 10.9705 11.2466 10.6627 10.2767 10.2133L9.14583 11.7967C8.69055 11.6198 8.24834 11.4109 7.8225 11.1717L7.77417 11.1442C6.13965 10.2139 4.78607 8.86035 3.85583 7.22583L3.82833 7.1775C3.58909 6.75166 3.38024 6.30945 3.20333 5.85417Z"
      fill="white"
    />
  </svg>
);

const OnlineCustomerService: React.FC<OnlineCustomerServiceProps> = ({
  show,
  onClose,
  isMobile = false,
  onSelectChannel,
  pendingNoticeUrl,
  onNoticeConfirmed,
}) => {
  const { t } = useTranslation();
  const position: OverlayPosition = isMobile ? 'bottom' : 'center';
  const queryClient = useQueryClient();
  const { data: preInfo } = usePreInfoQuery();
  const { data: cachedServiceInfo } = useServiceInfoQuery(1);
  const [serviceInfo, setServiceInfo] = useState(cachedServiceInfo);
  const hasShownEmptyToastRef = useRef(false);

  const [showTipModal, setShowTipModal] = useState(false);
  const [pendingChannelUrl, setPendingChannelUrl] = useState('');

  const noticeContent = (preInfo?.windowContent as string | null)?.trim() || '';
  /** 与直达客服一致：仅根据 windowStatus 决定是否先展示公告 */
  const hasNotice = preInfo?.windowStatus;
  const noticeHtml = useMemo(
    () => noticeContent.replace(/\\n/g, '<br>').replace(/\n/g, '<br>'),
    [noticeContent],
  );

  const useNewService = Boolean(serviceInfo?.isOpen);
  console.log(serviceInfo?.isOpen);
  // const kefu1 = (preInfo?.kefu1 as string)?.trim() || '';
  // const kefu2 = (preInfo?.kefu2 as string)?.trim() || '';

  useEffect(() => {
    if (!show) {
      hasShownEmptyToastRef.current = false;
      setShowTipModal(false);
      setPendingChannelUrl('');
      return;
    }
    getServiceInfoReq(1)
      .then((res) => {
        const data = res.data ?? {};
        setServiceInfo(data);
        queryClient.setQueryData([...SERVICE_INFO_QUERY_KEY, 1], data);
      })
      .catch(() => {});
  }, [show, queryClient]);

  useEffect(() => {
    if (pendingNoticeUrl && show) {
      setPendingChannelUrl(pendingNoticeUrl);
      setShowTipModal(true);
    }
  }, [pendingNoticeUrl, show]);

  useEffect(() => {
    if (!show || pendingNoticeUrl || !useNewService || !serviceInfo) return undefined;
    if (!hasAvailableServiceData(serviceInfo) && !hasShownEmptyToastRef.current) {
      toast({
        title: t('modals.customerService.noRoutesAvailable'),
        type: 'warning',
      });
      hasShownEmptyToastRef.current = true;
      const timer = window.setTimeout(() => onClose(), 100);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [show, pendingNoticeUrl, useNewService, serviceInfo, onClose, t]);

  const handleClickChannel = (url: string) => {
    if (!onSelectChannel) return;
    if (!hasNotice) {
      onSelectChannel(url);
      return;
    }
    setPendingChannelUrl(url);
    setShowTipModal(true);
  };

  const handleConfirmNotice = () => {
    const url = pendingChannelUrl;
    if (!url) {
      setShowTipModal(false);
      return;
    }
    if (onNoticeConfirmed) {
      onNoticeConfirmed(url);
    } else if (onSelectChannel) {
      onSelectChannel(url);
    }
    setShowTipModal(false);
    setPendingChannelUrl('');
  };

  const handleCloseNotice = () => {
    setShowTipModal(false);
    setPendingChannelUrl('');
  };

  const handleCopyHotline = async (tel?: string) => {
    const phoneNumber = tel?.trim();
    if (!phoneNumber) return;
    await copyToClipboard(phoneNumber);
    toast({
      title: t('modals.customerService.copiedToClipboard'),
      type: 'success',
    });
  };

  const renderNoticeOverlay = () => (
    <Overlay
      show={showTipModal}
      close={handleCloseNotice}
      position="center"
      maskClickClose
      zIndex={zIndexMap.customerServiceModal + 1}
    >
      <div className={styles.noticeModal}>
        <div className={styles.noticeHeader}>
          <h2 className={styles.noticeTitle}>{t('modals.customerService.noticeTitle')}</h2>
          <ModalCloseButton className={styles.closeBtn} onClick={handleCloseNotice} />
        </div>
        <div className={styles.windowModalContentTip}>
          {!!preInfo?.windowBeginTime && (
            <div className={styles.time}>{preInfo.windowBeginTime}</div>
          )}
          {!!preInfo?.windowTitle && (
            <div className={styles.noticeContentTitle}>{preInfo.windowTitle}</div>
          )}
          <div className={styles.noticeContent} dangerouslySetInnerHTML={{ __html: noticeHtml }} />
        </div>
        <div className={styles.noticeFooter}>
          <button type="button" className={styles.noticeBtn} onClick={handleConfirmNotice}>
            {t('modals.customerService.noticeConfirm')}
          </button>
        </div>
      </div>
    </Overlay>
  );

  const renderNewChannelRow = (item: CustomerServiceChannelItem, index: number) => {
    const url = String(item.configureUrl ?? '').trim();
    if (!url) return null;
    return (
      <div
        key={`cus-${index}`}
        className={clsx(styles.channelRow, onSelectChannel && styles.channelRowClickable)}
        role={onSelectChannel ? 'button' : undefined}
        onClick={onSelectChannel ? () => handleClickChannel(url) : undefined}
      >
        <div className={styles.channelMain}>
          <div className={styles.channelLogoWrap}>
            <img
              src={item.customerLogo || DEFAULT_CHANNEL_LOGO}
              alt=""
              className={styles.channelLogo}
            />
          </div>
          <div className={styles.channelText}>
            <div className={styles.channelName}>{item.customerName}</div>
            <div className={styles.channelTime}>
              {t('modals.customerService.serviceTimeLabel')}{' '}
              {item.workTime || t('modals.customerService.serviceTime')}
            </div>
          </div>
        </div>
        <span className={styles.channelAction}>{t('modals.customerService.consultNow')}</span>
      </div>
    );
  };

  const renderNewHotlineRow = (item: CustomerServiceHotlineItem, index: number) => {
    if (!isInHotlineWorkTime(item)) return null;
    const tel = String(item.configureTel ?? '').trim();
    if (!tel) return null;
    return (
      <button
        key={`ph-${index}`}
        type="button"
        className={styles.hotlineRow}
        onClick={() => void handleCopyHotline(tel)}
      >
        <PhoneIcon />
        <span>
          {t('modals.customerService.callNumber')}+{tel}
        </span>
      </button>
    );
  };

  // const renderLegacyContent = () => (
  //   <div className={styles.content}>
  //     <div
  //       className={clsx(styles.card, kefu1 && onSelectChannel && styles.cardClickable)}
  //       role={kefu1 && onSelectChannel ? 'button' : undefined}
  //       onClick={kefu1 && onSelectChannel ? () => handleClickChannel(kefu1) : undefined}
  //     >
  //       <div className={styles.cardBody}>
  //         <div className={styles.cardLabel}>{t('modals.customerService.line1')}</div>
  //         <div className={styles.cardServiceTime}>{t('modals.customerService.serviceTime')}</div>
  //         <div className={styles.imgWrap}>
  //           <img src={CUSTOMER_SERVICE_IMG1} alt="" className={styles.img} />
  //         </div>
  //       </div>
  //     </div>
  //     <div
  //       className={clsx(styles.card, kefu2 && onSelectChannel && styles.cardClickable)}
  //       role={kefu2 && onSelectChannel ? 'button' : undefined}
  //       onClick={kefu2 && onSelectChannel ? () => handleClickChannel(kefu2) : undefined}
  //     >
  //       <div className={styles.cardBody}>
  //         <div className={styles.cardLabel}>{t('modals.customerService.line2')}</div>
  //         <div className={styles.cardServiceTime}>{t('modals.customerService.serviceTime')}</div>
  //         <div className={styles.imgWrap}>
  //           <img src={CUSTOMER_SERVICE_IMG2} alt="" className={styles.img} />
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  const renderNewContent = () => {
    const cusList = serviceInfo?.cusList ?? [];
    const phList = serviceInfo?.phList ?? [];
    console.log(cusList);
    return (
      <div className={styles.newContent}>
        {cusList.map(renderNewChannelRow)}
        {phList.map(renderNewHotlineRow)}
      </div>
    );
  };

  const showMainModal =
    show && !pendingNoticeUrl && !showTipModal && hasAvailableServiceData(serviceInfo);
  console.log(useNewService);
  const modalTitle = t('modals.customerService.exclusiveTitle');

  return (
    <>
      <Overlay
        show={showMainModal}
        close={onClose}
        position={position}
        maskClickClose
        zIndex={zIndexMap.customerServiceModal}
      >
        <div className={`${styles.modal} ${isMobile ? styles.mobile : styles.desktop}`}>
          <div className={styles.header}>
            <h2 className={styles.title}>{modalTitle}</h2>
            <ModalCloseButton className={styles.closeBtn} onClick={onClose} />
          </div>
          {renderNewContent()}
          {/* {!useNewService && (
            <div className={styles.footer}>
              <button
                type="button"
                className={styles.callBtn}
                onClick={() => void handleLegacyCall()}
              >
                <PhoneIcon />
                <span>
                  {t('modals.customerService.callNumber')}+{preInfo?.kefuHotline as string}
                </span>
              </button>
            </div>
          )} */}
        </div>
      </Overlay>
      {renderNoticeOverlay()}
    </>
  );
};

export default OnlineCustomerService;

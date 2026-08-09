import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';

import LazyImage from '@/common/components/LazyImage';
import { usePreInfoQuery, type PreInfoResponse } from '@/apis/origin/setting';
import { IMPORTANT_SHOW_LOCK_KEY } from '@/utils/constants/cacheKey';

import styles from './ImportantNotice.module.scss';
import CommonDialog from '../CommonDialog';

const IMPORTANT_ONE_DAY_COOKIE_KEY = 'importantOneDay';

const getDownloadUrls = (preInfo?: PreInfoResponse | null): string[] => {
  if (!preInfo) return [];

  const keys = ['appXzUrl1', 'appXzUrl2', 'appXzUrl3', 'appXzUrl4'] as const;

  return keys
    .map((key) => preInfo[key])
    .filter((url): url is string => !!url && typeof url === 'string');
};

export interface ImportantNoticeProps {
  visible?: boolean;
  onClose?: (dontRemind: boolean) => void;
  showCheck?: boolean;
}

const ImportantNotice: React.FC<ImportantNoticeProps> = ({
  visible: controlledVisible,
  onClose: onCloseProp,
  showCheck = true,
}) => {
  const { t } = useTranslation();
  const { data: preInfo } = usePreInfoQuery();
  const [internalVisible, setInternalVisible] = useState(false);
  const [dontRemind, setDontRemind] = useState(false);

  const isControlled = controlledVisible !== undefined && typeof onCloseProp === 'function';
  const visible = isControlled ? controlledVisible : internalVisible;

  const downloadUrls = useMemo(() => getDownloadUrls(preInfo || undefined), [preInfo]);

  useEffect(() => {
    if (isControlled || typeof window === 'undefined' || !downloadUrls.length || internalVisible) {
      return;
    }

    try {
      if (Cookies.get(IMPORTANT_ONE_DAY_COOKIE_KEY) === '1') return;
    } catch {
      // ignore
    }

    setInternalVisible(true);
  }, [downloadUrls, internalVisible, isControlled]);

  const handleClose = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      if (showCheck && dontRemind) {
        sessionStorage.setItem(IMPORTANT_SHOW_LOCK_KEY, '1');
        Cookies.set(IMPORTANT_ONE_DAY_COOKIE_KEY, '1', { expires: 1 });
      } else if (showCheck) {
        sessionStorage.removeItem(IMPORTANT_SHOW_LOCK_KEY);
      }
    } catch {
      // ignore
    }

    if (isControlled) {
      onCloseProp?.(dontRemind);
      return;
    }

    setInternalVisible(false);
  }, [dontRemind, isControlled, onCloseProp, showCheck]);

  if (!downloadUrls.length) return null;

  return (
    <CommonDialog
      visible={visible}
      onClose={handleClose}
      header={t('modals.importantNotice.title')}
      bodyClassName={styles.body}
      footerButtonText={t('modals.iknow')}
      footerButtonClassName={styles.footerButton}
      onFooterButtonClick={handleClose}
      footerTigMsg={showCheck ? t('modals.dontRemind24h') : undefined}
      footerTipChecked={dontRemind}
      onFooterTipClick={showCheck ? () => setDontRemind((prev) => !prev) : undefined}
    >
      <p className={styles.noticTitle}>{t('modals.importantNotice.downloadDesc')}</p>
      {downloadUrls.map((url, index) => (
        <a
          key={`${url}-${index}`}
          href={`https://www.${url}`}
          target="_blank"
          rel="noreferrer"
          className={styles.rowDown}
        >
          <span className={styles.icoRightWrap}>
            <LazyImage
              src="/images/common/search.svg"
              alt="icon"
              width={14}
              height={14}
              className={styles.icoRightLight}
            />
            <LazyImage
              src="/images/common/searchdark.svg"
              alt="icon"
              width={14}
              height={14}
              className={styles.icoRightDark}
            />
          </span>
          <span className={styles.urlText}>{url}</span>
        </a>
      ))}
    </CommonDialog>
  );
};

export default ImportantNotice;

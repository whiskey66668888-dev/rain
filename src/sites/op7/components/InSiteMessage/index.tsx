import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import {
  stopMustMessageReq,
  readSingleMessageReq,
  type MustMessageResponse,
  type UnreadMessageResponse,
} from '@/apis/origin/message';
import { MSG_SAVE_ID_KEY } from '@/utils/constants/cacheKey';
import { safeGetSessionString, safeSetSessionString } from '@/utils/storage/webStorage';
import { useEmcRichText } from '@/common/hooks/useEmcRichText';
import { useOpenMessageCenter } from '@/common/hooks/messageCenter/useOpenMessageCenter';
import { EMessageTabKey } from '@/core/store/slices/messageCenterSlice';
import { formatMessageRichText } from '@/utils';

import styles from './InSiteMessage.module.scss';
import CommonDialog from '../CommonDialog';

export interface InSiteMessageProps {
  visible: boolean;
  mustMessage?: MustMessageResponse | null;
  unreadMessage?: UnreadMessageResponse | null;
  onClose: () => void;
}

const MustMessageModal: React.FC<{
  visible: boolean;
  message: MustMessageResponse;
  onClose: () => void;
}> = ({ visible, message, onClose }) => {
  const { t } = useTranslation();
  const { richTextOptions, onRichTextClick } = useEmcRichText(onClose);
  const richContent = formatMessageRichText(message.content, richTextOptions);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleNeverRemind = useCallback(() => {
    stopMustMessageReq(message.id).catch(() => {
      // ignore
    });
    onClose();
  }, [message.id, onClose]);

  return (
    <CommonDialog
      visible={visible}
      onClose={handleClose}
      header={t('modals.inSiteMessage.title')}
      footer={
        <div className={styles.btnGroup}>
          <button type="button" className={styles.btnClose} onClick={handleClose}>
            {t('modals.close')}
          </button>
          <button type="button" className={styles.btnNeverRemind} onClick={handleNeverRemind}>
            {t('modals.inSiteMessage.neverRemind')}
          </button>
        </div>
      }
    >
      <div className={styles.body}>
        <p className={styles.msgTitle}>{message.title}</p>
        <div
          className={styles.msgContent}
          dangerouslySetInnerHTML={{ __html: richContent }}
          onClick={onRichTextClick}
        />
      </div>
    </CommonDialog>
  );
};

const NewMessageModal: React.FC<{
  visible: boolean;
  message: UnreadMessageResponse;
  onClose: () => void;
}> = ({ visible, message, onClose }) => {
  const { t } = useTranslation();
  const { openMessageCenter } = useOpenMessageCenter();
  const { richTextOptions, onRichTextClick } = useEmcRichText(onClose);
  const richContent = formatMessageRichText(message.content, richTextOptions);

  const handleMore = useCallback(() => {
    readSingleMessageReq(message.id);
    safeSetSessionString(MSG_SAVE_ID_KEY, String(message.id));
    onClose();
    openMessageCenter({ initialSubTab: EMessageTabKey.INBOX });
  }, [message.id, onClose, openMessageCenter]);

  return (
    <CommonDialog
      visible={visible}
      onClose={onClose}
      maskClickClose
      header={
        <div className={styles.titleBox}>
          <span className={styles.titleText}>{t('modals.inSiteMessage.title')}</span>
          {message.messageSum && message.messageSum > 0 && (
            <span className={styles.badge}>{message.messageSum}</span>
          )}
        </div>
      }
      footerButtonText={t('modals.inSiteMessage.learnMore')}
      onFooterButtonClick={handleMore}
      footerButtonClassName={styles.btnMore}
    >
      <div className={styles.body}>
        <p className={styles.msgTitle}>{message.title}</p>
        <div
          className={styles.msgContent}
          dangerouslySetInnerHTML={{ __html: richContent }}
          onClick={onRichTextClick}
        />
        <div className={styles.msgTime}>{dayjs(message.addTime).format('YYYY-MM-DD HH:mm')}</div>
      </div>
    </CommonDialog>
  );
};

const InSiteMessage: React.FC<InSiteMessageProps> = ({
  visible,
  mustMessage,
  unreadMessage,
  onClose,
}) => {
  const [showMust, setShowMust] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShowMust(false);
      setShowNew(false);
      return;
    }

    if (typeof window === 'undefined') return;

    if (mustMessage?.id) {
      setShowMust(true);
      return;
    }

    if (unreadMessage?.id) {
      const savedMsgId = safeGetSessionString(MSG_SAVE_ID_KEY);
      if (!savedMsgId || unreadMessage.id > parseInt(savedMsgId, 10)) {
        setShowNew(true);
        return;
      }
    }

    onClose();
  }, [visible, mustMessage, unreadMessage, onClose]);

  const handleMustClose = useCallback(() => {
    setShowMust(false);

    if (unreadMessage?.id) {
      const savedMsgId = safeGetSessionString(MSG_SAVE_ID_KEY);
      if (!savedMsgId || unreadMessage.id > parseInt(savedMsgId, 10)) {
        setShowNew(true);
        return;
      }
    }

    onClose();
  }, [unreadMessage, onClose]);

  const handleNewClose = useCallback(() => {
    setShowNew(false);
    onClose();
  }, [onClose]);

  if (!visible) return null;

  return (
    <>
      {mustMessage && showMust && (
        <MustMessageModal visible={showMust} message={mustMessage} onClose={handleMustClose} />
      )}
      {unreadMessage && showNew && !showMust && (
        <NewMessageModal visible={showNew} message={unreadMessage} onClose={handleNewClose} />
      )}
    </>
  );
};

export default InSiteMessage;

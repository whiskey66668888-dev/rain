import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Cookies from 'js-cookie';

import { usePreInfoQuery } from '@/apis/origin/setting';
import { useMustMessageQuery, useUnreadMessageQuery } from '@/apis/origin/message';
import type { TNoticeListResponse } from '@/apis/origin/noticeList';

import ImportantNotice from '../../components/ImportantNotice';
import PlatformNotice from '../../components/PlatformNotice';
import InSiteMessage from '../../components/InSiteMessage';
import { ClientOnly } from '@/common/components/ClientOnly';
import { MSG_SAVE_ID_KEY } from '@/utils/constants/cacheKey';
import { safeGetSessionString } from '@/utils/storage/webStorage';

const IMPORTANT_ONE_DAY_KEY = 'importantOneDay';
const NOTICE_ONE_DAY_KEY = 'noticeOneDay';
const IN_SITE_MESSAGE_ONE_DAY_KEY = 'inSiteMessageOneDay';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Cookie 存弹窗展示时间戳，超过 24 小时后允许再次弹出。
const isWithinOneDay = (value?: string): boolean => {
  const shownAt = Number(value);
  return Number.isFinite(shownAt) && Date.now() - shownAt < ONE_DAY_MS;
};

// Cookie 保留时间长于 24 小时，用时间戳判断是否过期。
const markShownAt = (key: string) => {
  Cookies.set(key, String(Date.now()), { expires: 7 });
};

let hasAttemptedLandingPopupShowInPageLifetime = false;
let hasShownInSiteMessageInPageLifetime = false;

interface LandingPagePopupsProps {
  noticeList: TNoticeListResponse[];
  noticeListReady: boolean;
  isLogin: boolean;
  /** NoticeBar 点击后要打开的公告下标；消费后由 onNoticeBarOpenHandled 清空 */
  noticeBarOpenIndex: number | null;
  onNoticeBarOpenHandled: () => void;
}

const LandingPagePopups: React.FC<LandingPagePopupsProps> = ({
  noticeList,
  noticeListReady,
  isLogin,
  noticeBarOpenIndex,
  onNoticeBarOpenHandled,
}) => {
  const { data: preInfo, isFetched: preInfoReady } = usePreInfoQuery();
  const { data: mustMessage, isFetched: mustMessageReady } = useMustMessageQuery(isLogin);
  const { data: unreadMessage, isFetched: unreadMessageReady } = useUnreadMessageQuery(isLogin);

  const hasDownloadUrls = useMemo(() => {
    if (!preInfo) return false;
    const keys = ['appXzUrl1', 'appXzUrl2', 'appXzUrl3', 'appXzUrl4'] as const;
    return keys.some((key) => preInfo[key]);
  }, [preInfo]);

  const [importantVisible, setImportantVisible] = useState(false);
  const [platformVisible, setPlatformVisible] = useState(false);
  const [platformInitialSlideIndex, setPlatformInitialSlideIndex] = useState(0);
  /** 是否展示「24小时内不再提醒」；NoticeBar 主动打开时为 false */
  const [platformShowCheck, setPlatformShowCheck] = useState(true);
  const [inSiteMessageVisible, setInSiteMessageVisible] = useState(false);
  const [popupCheckTrigger, setPopupCheckTrigger] = useState(0);
  const prevIsLoginRef = useRef(isLogin);

  const openInSiteMessageOnce = useCallback(() => {
    if (!isLogin || hasShownInSiteMessageInPageLifetime) return;
    if (isWithinOneDay(Cookies.get(IN_SITE_MESSAGE_ONE_DAY_KEY))) return;

    const hasMustMessage = !!mustMessage?.id;
    let hasUnreadMessage = false;

    if (unreadMessage?.id) {
      const savedMsgId = safeGetSessionString(MSG_SAVE_ID_KEY);
      hasUnreadMessage = !savedMsgId || unreadMessage.id > parseInt(savedMsgId, 10);
    }

    if (!hasMustMessage && !hasUnreadMessage) return;

    hasShownInSiteMessageInPageLifetime = true;
    markShownAt(IN_SITE_MESSAGE_ONE_DAY_KEY);
    setInSiteMessageVisible(true);
  }, [isLogin, mustMessage?.id, unreadMessage?.id]);

  useEffect(() => {
    if (!prevIsLoginRef.current && isLogin) {
      hasAttemptedLandingPopupShowInPageLifetime = false;
      hasShownInSiteMessageInPageLifetime = false;
      setPopupCheckTrigger((prev) => prev + 1);
    }
    prevIsLoginRef.current = isLogin;
  }, [isLogin]);

  useEffect(() => {
    if (!isLogin) {
      setInSiteMessageVisible(false);
    }
  }, [isLogin]);

  const openPlatformNotice = useCallback(
    (initialSlideIndex = 0, showDontRemindCheck = true, shouldMarkShown = false) => {
      if (noticeList.length === 0) return;
      const i = Math.min(Math.max(initialSlideIndex, 0), noticeList.length - 1);
      if (shouldMarkShown) {
        markShownAt(NOTICE_ONE_DAY_KEY);
      }
      setPlatformInitialSlideIndex(i);
      setPlatformShowCheck(showDontRemindCheck);
      setPlatformVisible(true);
    },
    [noticeList.length],
  );

  useEffect(() => {
    if (noticeBarOpenIndex === null) return;
    if (noticeList.length === 0) {
      onNoticeBarOpenHandled();
      return;
    }
    openPlatformNotice(noticeBarOpenIndex, false);
    onNoticeBarOpenHandled();
  }, [noticeBarOpenIndex, noticeList.length, openPlatformNotice, onNoticeBarOpenHandled]);

  // 落地页弹窗优先级：重要通知 -> 平台公告 -> 站内信（仅登录用户才会打开站内信）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const inSiteMessageReady = !isLogin || (mustMessageReady && unreadMessageReady);
    if (!preInfoReady || !noticeListReady || !inSiteMessageReady) return;
    if (hasAttemptedLandingPopupShowInPageLifetime) return;

    try {
      const hasImportantCookie = isWithinOneDay(Cookies.get(IMPORTANT_ONE_DAY_KEY));
      const hasNoticeCookie = isWithinOneDay(Cookies.get(NOTICE_ONE_DAY_KEY));

      if (hasDownloadUrls && !hasImportantCookie) {
        hasAttemptedLandingPopupShowInPageLifetime = true;
        markShownAt(IMPORTANT_ONE_DAY_KEY);
        setImportantVisible(true);
        return;
      }

      if (noticeList.length > 0 && !hasNoticeCookie) {
        hasAttemptedLandingPopupShowInPageLifetime = true;
        openPlatformNotice(0, false, true);
        return;
      }

      hasAttemptedLandingPopupShowInPageLifetime = true;
      openInSiteMessageOnce();
    } catch {}
  }, [
    hasDownloadUrls,
    preInfoReady,
    noticeList.length,
    noticeListReady,
    isLogin,
    mustMessageReady,
    unreadMessageReady,
    popupCheckTrigger,
    openPlatformNotice,
    openInSiteMessageOnce,
  ]);

  const handleImportantClose = useCallback(
    (_dontRemind: boolean) => {
      setImportantVisible(false);
      if (typeof window === 'undefined') return;

      if (noticeList.length > 0) {
        try {
          const hasNoticeCookie = isWithinOneDay(Cookies.get(NOTICE_ONE_DAY_KEY));
          if (!hasNoticeCookie) {
            openPlatformNotice(0, false, true);
            return;
          }
        } catch {
          // ignore
        }
      }

      openInSiteMessageOnce();
    },
    [noticeList.length, openPlatformNotice, openInSiteMessageOnce],
  );

  const handlePlatformClose = useCallback(() => {
    setPlatformVisible(false);
    setPlatformInitialSlideIndex(0);
    setPlatformShowCheck(true);
    openInSiteMessageOnce();
  }, [openInSiteMessageOnce]);

  const handleInSiteMessageClose = useCallback(() => {
    setInSiteMessageVisible(false);
  }, []);

  return (
    <ClientOnly>
      <ImportantNotice
        visible={importantVisible}
        onClose={handleImportantClose}
        showCheck={false}
      />
      <PlatformNotice
        visible={platformVisible}
        noticeList={noticeList}
        initialSlideIndex={platformInitialSlideIndex}
        onClose={handlePlatformClose}
        showCheck={platformShowCheck}
      />
      <InSiteMessage
        visible={inSiteMessageVisible && isLogin}
        mustMessage={isLogin ? mustMessage : undefined}
        unreadMessage={isLogin ? unreadMessage : undefined}
        onClose={handleInSiteMessageClose}
      />
    </ClientOnly>
  );
};

export default LandingPagePopups;

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Empty from '@/common/components/Empty';
import { useGetMemberInfo } from '@/common/hooks/useMemberInfo';
import { useAppSelector } from '@/core/store/hooks';
import { getSystemTheme } from '@/utils';
import { VERSION } from '@/utils/constants/system';
import { isSSR } from '@/utils/env';

import styles from './MomentsPage.module.scss';
import {
  setMomentsIframeTarget,
  requestMomentsOpenPublish,
  cancelMomentsOpenPublish,
} from './momentsIframeBridge';

const MOMENTS_SIT_ORIGIN =
  import.meta.env.DEV || import.meta.env.VITE_MOMENTS_USE_SIT === 'true'
    ? 'https://emc-sit-h5.test400.co'
    : '';

export type MomentsViewProps = {
  /** 官方动态 */
  official?: boolean;
  /** 公开动态 */
  public?: boolean;
};

function buildMomentsIframeSrc(
  loginMemberId: number,
  theme: string,
  official: boolean,
  isPublic: boolean,
): string {
  const origin =
    MOMENTS_SIT_ORIGIN || (typeof window !== 'undefined' ? window.location.origin : '');
  const base = `${origin}/h5/moments`;
  const params = new URLSearchParams({
    loginMemberId: String(loginMemberId),
    theme,
    version: VERSION,
    visitSource: 'h5',
  });
  if (official) {
    params.set('official', '1');
  }
  if (isPublic) {
    params.set('public', '1');
  }
  if (official || isPublic) {
    return `${base}/dynamic?${params.toString()}`;
  }
  return `${base}?${params.toString()}`;
}

const MomentsView: React.FC<MomentsViewProps> = ({
  official = false,
  public: isPublic = false,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getMemberInfo } = useGetMemberInfo();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  // const authToken = useAppSelector((state) => state.user.loginInfo?.Authorization?.trim() ?? '');
  const memberId = useAppSelector((state) => state.user.memberInfo.id);
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = (themeMode === 'system' ? getSystemTheme() : themeMode) || 'light';

  const [readyId, setReadyId] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (isSSR() || !isLogin) {
      setReadyId(0);
      return;
    }
    if (memberId) {
      setReadyId(memberId);
      return;
    }
    void getMemberInfo({ isLoading: false })
      .then((info) => {
        if (info?.id) setReadyId(info.id);
      })
      .catch(() => setReadyId(0));
  }, [getMemberInfo, isLogin, memberId]);

  const iframeSrc = useMemo(() => {
    if (!readyId) return '';
    return buildMomentsIframeSrc(readyId, theme, official, isPublic);
  }, [readyId, theme, official, isPublic]);

  const iframeOrigin = useMemo(() => {
    if (!iframeSrc) return '*';
    try {
      return new URL(iframeSrc).origin;
    } catch {
      return '*';
    }
  }, [iframeSrc]);

  const syncIframeTarget = useCallback(() => {
    setMomentsIframeTarget(iframeRef.current?.contentWindow ?? null, iframeOrigin);
  }, [iframeOrigin]);

  useEffect(() => {
    syncIframeTarget();
    return () => setMomentsIframeTarget(null);
  }, [syncIframeTarget, iframeSrc]);

  // 赛事分享 / 注单分享进入朋友圈（?openPublish=1）：登记待唤起发布器，
  // 实际唤起由 GlobalPostMessageHost 收到 iframe 的 momentMounted 后触发。
  // 正常进入（无该参数）不做任何处理。
  const openPublishRequested = searchParams.get('openPublish') === '1';
  useEffect(() => {
    if (isSSR() || !isLogin || !iframeSrc || !openPublishRequested) return;
    requestMomentsOpenPublish();
    // 消费掉参数，避免从子页返回本页时重复唤起
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('openPublish');
        return next;
      },
      { replace: true },
    );
  }, [openPublishRequested, isLogin, iframeSrc, setSearchParams]);

  // 仅在真正卸载时取消（空依赖：主题切换等导致 iframeSrc 变化时不能误取消飞行中的登记）
  useEffect(() => () => cancelMomentsOpenPublish(), []);

  if (!isLogin || !iframeSrc) {
    return (
      <div className={styles.wrap}>
        <Empty />
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <iframe
        ref={iframeRef}
        title={official ? '官方动态' : isPublic ? '公共朋友圈' : '朋友圈'}
        src={iframeSrc}
        className={styles.iframe}
        onLoad={syncIframeTarget}
      />
    </div>
  );
};

export default MomentsView;

'use client';
import styles from './PromotionPage.module.scss';
import { useEffect, useState, useMemo } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import clsx from 'clsx';

import PrimaryTabs from './components/PrimaryTabs/PrimaryTabs';

import {
  PRIMARY_TABS,
  PRIMARY_TABS_PC,
  filterPrimaryTabsBySocialConfig,
  type PrimaryTabType,
} from './constants';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { useAuthNavigate } from '@/common/hooks/useAuthNavigate';
import { useAppSelector } from '@/core/store/hooks';
import { PATHS } from '@/sites/op7/routes/paths';
import { useSocialConfigQuery } from '@/apis/origin/social/getSocialConfig';

const PromotionPage = () => {
  const outlet = useOutlet();
  const location = useLocation();
  const navigate = useNavigateWithLanguage();
  const authNavigate = useAuthNavigate();
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const { data: socialConfig } = useSocialConfigQuery();

  const primaryTabs = useMemo(
    () => filterPrimaryTabsBySocialConfig(isMobile ? PRIMARY_TABS : PRIMARY_TABS_PC, socialConfig),
    [isMobile, socialConfig],
  );
  // ✅ 提取最后一个路由片段的逻辑
  const lastSegment = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    return segments[segments.length - 1] as PrimaryTabType;
  }, [location.pathname]);

  // ✅ 使用路由片段作为状态
  const [primaryTab, setPrimaryTab] = useState<PrimaryTabType>(lastSegment);

  // ✅ 路由变化时同步状态
  useEffect(() => {
    setPrimaryTab(lastSegment);
  }, [lastSegment]);

  // 配置关闭时，若当前在隐藏 Tab 则跳转到第一个可用 Tab
  useEffect(() => {
    if (!socialConfig || primaryTabs.some((tab) => tab.value === primaryTab)) return;
    const fallback = primaryTabs[0];
    if (fallback) {
      navigate(fallback.path, { replace: true });
    }
  }, [socialConfig, primaryTabs, primaryTab, navigate]);

  // ✅ Tab 切换处理
  const handlePrimaryChange = (obj: { label: string; value: PrimaryTabType; path: string }) => {
    const needAuth =
      obj.path === PATHS.promotionHotEvent ||
      obj.path === PATHS.promotionMomentsPublic ||
      obj.path === PATHS.promotionMomentsOfficial;
    const fn = needAuth ? authNavigate : navigate;
    fn(obj.path, { replace: true });
    if (isLogin) {
      setPrimaryTab(obj.value);
    }
  };

  return (
    <div
      className={clsx(styles.promotionPage, lastSegment === 'hotEventApp' && styles.hotEventLayout)}
    >
      {/* 一级 Tabs */}
      <div className={styles.tabs}>
        <PrimaryTabs tabs={primaryTabs} active={primaryTab} onChange={handlePrimaryChange} />
      </div>

      {/* 内容区 */}
      <div className={styles.content}>{outlet}</div>
    </div>
  );
};

export default PromotionPage;

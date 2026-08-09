import React, { useMemo, useEffect, useState, useRef, useLayoutEffect } from 'react';

import styles from './MatchDrawer.module.scss';
import { ClientOnly } from '@/common/components/ClientOnly';
import MainList from '../../../SportsPage/components/MainList';
import { useAppSelector } from '@/core/store/hooks';
import SimpleTabList from '../../../SportsPage/components/SearchBarH5/components/simpleTabList';
import useSportsMainListControl from '@/common/hooks/useSportsMainListControl';
import { FBCompetitionMap, FBSportId } from '@/apis/fbSports/common/constants';
import { LocalHandicapItem } from '@/apis/fbSports/common/types';
import { PlayType } from '@/apis/commonSports/constants';
import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';
import { zIndexMap } from '@/utils/constants/zIndex';

interface MatchDrawerProps {
  visible: boolean;
  currentMatchId?: string | number;
  currentLeagueId?: number;
  leagueName: string;
  onClose: () => void;
  onMatchSelect: (matchId: string) => void;
}

const ANIM_DURATION = 300;

/**
 * 赛事抽屉组件：显示滚球赛事列表
 * 限制在详情页面的可视区域内
 */
const MatchDrawer: React.FC<MatchDrawerProps> = ({
  visible,
  onClose,
  currentLeagueId,
  leagueName,
  onMatchSelect,
}) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const overlayPosition = useMemo<OverlayPosition>(
    () => (isMobile ? 'bottom' : 'center'),
    [isMobile],
  );
  const sportId = useAppSelector((state) => state.sport.mainList.settings.sportId);
  const playType = useAppSelector((state) => state.sport.mainList.settings.playType);
  const isLive = playType == PlayType.Living;
  // 桌面端不需要动画
  const animDuration = useMemo(() => (isMobile ? ANIM_DURATION : 0), [isMobile]);
  const [active, setActive] = useState(false);
  const [exiting, setExiting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const [containerStyle, setContainerStyle] = useState<React.CSSProperties>({});
  const { changeSimpleActiveItem } = useSportsMainListControl();
  // 处理显示/隐藏状态和动画
  useLayoutEffect(() => {
    if (visible) {
      setActive(true);
      setExiting(false);
      // 桌面端不需要动画，直接设置为打开状态
      return undefined;
    }
    if (animDuration > 0) {
      setExiting(true);
      const timer = window.setTimeout(() => {
        setExiting(false);
        setActive(false);
      }, animDuration);
      return () => window.clearTimeout(timer);
    }
    setActive(false);
    setExiting(false);
    return undefined;
  }, [visible, animDuration, isMobile]);

  // 延迟触发打开动画，确保从初始状态开始（仅移动端）
  useEffect(() => {
    // 延迟确保 DOM 已渲染并应用初始样式
    // 先等待 ClientOnly mounted，然后延迟两帧触发动画
    let rafId1: number;
    let rafId2: number;

    const timer = setTimeout(() => {
      // 延迟两帧以确保浏览器已应用初始样式
      rafId1 = requestAnimationFrame(() => {
        rafId2 = requestAnimationFrame(() => {
          // 强制浏览器重新计算样式，确保初始状态已应用
          if (drawerRef.current) {
            // 触发重排，确保初始样式已应用
            void drawerRef.current.offsetHeight;
          }
        });
      });
    }, 0);

    return () => {
      clearTimeout(timer);
      if (rafId1) cancelAnimationFrame(rafId1);
      if (rafId2) cancelAnimationFrame(rafId2);
    };
  }, [active, exiting, isMobile]);

  useEffect(() => {
    if (!active) return;

    let resizeObserver: ResizeObserver | null = null;
    let matchDetailsContainer: Element | null = null;

    // 计算详情页面容器的位置和尺寸
    const findMatchDetailsContainer = () => {
      if (!containerRef.current) return null;

      // 向上查找包含 matchDetails 类的容器
      let parent = containerRef.current.parentElement;

      while (parent) {
        if (
          parent.className &&
          typeof parent.className === 'string' &&
          parent.className.includes('matchDetails')
        ) {
          return parent;
        }
        // 也检查 classList
        if (
          parent.classList &&
          Array.from(parent.classList).some((cls) => cls.includes('matchDetails'))
        ) {
          return parent;
        }
        parent = parent.parentElement;
      }

      return null;
    };

    const updatePosition = () => {
      // 移动端时全屏显示，不需要限制容器
      if (isMobile) {
        setContainerStyle({});
        return;
      }

      // 每次都重新查找容器，确保在页面布局变化时能找到正确的容器
      const foundContainer = findMatchDetailsContainer();

      if (foundContainer) {
        // 如果容器发生变化，重新设置 ResizeObserver
        if (matchDetailsContainer !== foundContainer) {
          if (resizeObserver && matchDetailsContainer) {
            resizeObserver.unobserve(matchDetailsContainer);
          }
          matchDetailsContainer = foundContainer;
          if (resizeObserver) {
            resizeObserver.observe(matchDetailsContainer);
          }
        }

        const rect = foundContainer.getBoundingClientRect();
        // 确保宽度和位置正确设置，限制在详情区域内
        setContainerStyle({
          top: `${Math.max(0, rect.top)}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: `${Math.min(rect.height, window.innerHeight - Math.max(0, rect.top))}px`,
        });
      } else {
        matchDetailsContainer = null;
      }
    };

    // 侧边栏收起有 transition，布局变化后延迟再更新一次确保蒙层位置正确
    const SIDEBAR_TRANSITION_MS = 300;
    const scheduleDelayedUpdate = () => {
      const t = setTimeout(updatePosition, SIDEBAR_TRANSITION_MS);
      return () => clearTimeout(t);
    };

    // 使用防抖优化性能
    let rafId: number | null = null;
    let delayedCleanup: (() => void) | undefined;
    const debouncedUpdate = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        updatePosition();
        rafId = null;
        // 侧边栏 transition 结束后再更新一次
        delayedCleanup?.();
        delayedCleanup = scheduleDelayedUpdate();
      });
    };

    // 使用 setTimeout 确保 DOM 已渲染
    const timer = setTimeout(() => {
      updatePosition();

      // 初始化 ResizeObserver
      if (!resizeObserver) {
        resizeObserver = new ResizeObserver(() => {
          debouncedUpdate();
        });
      }

      // 如果找到了容器，开始观察
      if (matchDetailsContainer) {
        resizeObserver.observe(matchDetailsContainer);
      }
    }, 0);

    window.addEventListener('resize', debouncedUpdate, { passive: true });
    window.addEventListener('scroll', debouncedUpdate, { passive: true, capture: true });
    window.addEventListener('orientationchange', debouncedUpdate);

    return () => {
      clearTimeout(timer);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      delayedCleanup?.();
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener('scroll', debouncedUpdate, true);
      window.removeEventListener('orientationchange', debouncedUpdate);
      if (resizeObserver && matchDetailsContainer) {
        resizeObserver.unobserve(matchDetailsContainer);
        resizeObserver.disconnect();
      }
    };
  }, [active, isMobile]);

  useEffect(() => {
    changeSimpleActiveItem(
      (Object.values(FBCompetitionMap).find((item) => item.id === sportId)
        ?.simpleList[0] as LocalHandicapItem) ?? FBCompetitionMap[FBSportId.Football].simpleList[0],
    );
  }, [changeSimpleActiveItem, sportId]);

  if (!active) return null;
  return (
    <ClientOnly>
      <div
        ref={containerRef}
        className={`${styles.drawerContainer} ${isMobile ? styles.mobile : ''}`}
        style={containerStyle}
      >
        <Overlay
          show={true}
          close={onClose}
          position={overlayPosition}
          maskClickClose
          zIndex={zIndexMap.betFloatingButton}
        >
          <div
            className={`${styles.loginModal} ${isMobile ? styles.mobile : styles.desktop} font-400 _tf[14]`}
          >
            {/* <ModalCloseButton onClick={onClose} /> */}
            <p
              className={
                '_tf[16] font-500 text-[var(--Text-Main-10)] text-center h-52px line-height-52px'
              }
            >
              {isLive ? '所有滚球' : leagueName}
            </p>
            <div className="bg-[var(--Background-300)] mx-4px p-2px rounded-40px mb-12px">
              <SimpleTabList variant={isMobile ? 'bettingPopup' : 'betting'} />
            </div>

            <MainList
              forceMobile={true}
              isSimpleOdds={true}
              threeLineColumn={true}
              leagueIdFilter={isLive ? undefined : currentLeagueId}
              hideLoadMore={true}
              onMatchClick={(matchId) => onMatchSelect(String(matchId))}
            />
          </div>
        </Overlay>
        {/* <div
          ref={drawerRef}
          className={`${styles.drawer} ${isMobile ? styles.mobile : styles.desktop} ${
            isOpen && !exiting ? styles.drawerOpen : ''
          }`}
        >
          <div className={`${styles.loginModal} ${isMobile ? styles.mobile : styles.desktop}`}>
            <SimpleTabList />

            <MainList forceMobile={true} isSimpleOdds={true} />
          </div>
        </div> */}
      </div>
    </ClientOnly>
  );
};

export default MatchDrawer;

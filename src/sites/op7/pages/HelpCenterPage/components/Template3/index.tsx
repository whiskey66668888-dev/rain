'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import styles from './index.module.scss';
import ImageView from '../imageView';
import LazyImage from '@/common/components/LazyImage';
import clsx from 'clsx';
import { useSearchParams } from 'react-router-dom';
import {
  VirtualCurrencyAnswerItem,
  VirtualCurrencyFirstTab,
  VirtualCurrencySecondTab,
  VirtualCurrencyTutorialDetail,
} from '@/apis/origin/helpCenter/helpvirtual';
interface Template3Props {
  item: VirtualCurrencyTutorialDetail;
  onSubTabChange?: (subTabId?: number) => void; // 修改：只传递 subTabId
}

const Template3: React.FC<Template3Props> = ({ item, onSubTabChange }) => {
  const [firstTabId, setFirstTabId] = useState<number | null>(null);
  const [secondTabId, setSecondTabId] = useState<number | null>(null);
  const [subtitle, setSubtitle] = useState('');
  const [visible, setVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const subTabContainerRef = useRef<HTMLDivElement>(null);

  const [searchParams] = useSearchParams();
  const isFullScreen = searchParams.get('isFullScreen') === '1';
  const statusBarHeight = searchParams.get('statusBarHeight') || 0;
  // Tab数据处理
  const firstTabs = useMemo(() => {
    return item?.firstTabs || [];
  }, [item]);

  const activeFirstTab = useMemo(() => {
    const found = firstTabs.find((t) => t.firstTabId === firstTabId);
    const result = found || firstTabs[0];
    return result;
  }, [firstTabs, firstTabId]);

  const secondTabs = useMemo(() => {
    const tabs = activeFirstTab?.secondTabs || [];
    return tabs;
  }, [activeFirstTab]);

  const activeSecondTab = useMemo(() => {
    const found = secondTabs.find((s) => s.secondTabId === secondTabId);
    const result = found || secondTabs[0];
    return result;
  }, [secondTabs, secondTabId]);

  const answers = useMemo(() => activeSecondTab?.answerList || [], [activeSecondTab]);

  // 添加滚动到中心的函数
  const scrollTabToCenter = (element: HTMLElement) => {
    if (!subTabContainerRef.current || !element) return;

    const tabContainer = subTabContainerRef.current;
    const containerWidth = tabContainer.offsetWidth;
    const tabWidth = element.offsetWidth;
    const tabLeft = element.offsetLeft;

    // 计算滚动位置，使选中的选项卡居中
    const scrollPosition = tabLeft - containerWidth / 2 + tabWidth / 2;

    // 使用平滑滚动效果
    tabContainer.scrollTo({
      left: scrollPosition,
      behavior: 'smooth',
    });
  };

  const hasInitialized = useRef(false);

  // 当 item 变化时重置初始化状态
  useEffect(() => {
    hasInitialized.current = false;
    setFirstTabId(null);
    setSecondTabId(null);
    setSubtitle('');
  }, [item]);

  // 初始化 - 只在 firstTabs 有数据且未初始化时执行
  useEffect(() => {
    if (hasInitialized.current) return;
    if (firstTabs.length === 0) return;

    const firstTab = firstTabs[0];
    if (!firstTab) return;

    hasInitialized.current = true;

    setFirstTabId(firstTab.firstTabId);

    const firstSecond = firstTab?.secondTabs?.[0];
    if (firstSecond) {
      setSecondTabId(firstSecond.secondTabId);
      setSubtitle(firstSecond?.contentTitle || '');
      onSubTabChange?.(firstSecond.secondTabId);
    }
  }, [firstTabs, onSubTabChange]);

  // 事件处理
  const handleFirstTabClick = (tab: VirtualCurrencyFirstTab) => {
    console.log('Template3 - 点击一级Tab:', tab.firstTabName, tab.firstTabId);
    setFirstTabId(tab.firstTabId);

    // 自动选择第一个二级tab
    const firstSecond = tab?.secondTabs?.[0];
    if (firstSecond) {
      setSecondTabId(firstSecond.secondTabId);
      const newSubtitle = firstSecond?.contentTitle || '';
      setSubtitle(newSubtitle);
      // 传递 secondTabId 给父组件用于投票
      onSubTabChange?.(firstSecond.secondTabId);
    }
  };

  const handleSecondTabClick = (
    tab: VirtualCurrencySecondTab,
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    console.log('Template3 - 点击二级Tab:', tab.secondTabName, tab.secondTabId);
    setSecondTabId(tab.secondTabId);
    const newSubtitle = tab?.contentTitle || '';
    setSubtitle(newSubtitle);
    // 传递 secondTabId 给父组件用于投票
    onSubTabChange?.(tab.secondTabId);

    // 滚动选中项到中间位置
    scrollTabToCenter(event.currentTarget);
  };

  // 渲染答案内容
  const renderAnswerContent = (answer: VirtualCurrencyAnswerItem, index: number) => {
    // 图片资源
    if (answer.resourceType === 1 && answer.resourceAddress) {
      const imageIndex = demoImages.indexOf(answer.resourceAddress);
      return (
        <>
          <div className={styles.coinItemContent}>
            <span
              className={styles.text}
              dangerouslySetInnerHTML={{ __html: answer.answertContent || '' }}
            />
          </div>
          <div className={styles.imageContent}>
            <LazyImage
              src={answer.resourceAddress}
              alt={`image-${index}`}
              width={155}
              height={319}
              onClick={() => {
                setCurrentImageIndex(imageIndex);
                setVisible(true);
              }}
            />
          </div>
        </>
      );
    }

    // 视频资源
    if (answer.resourceType === 2 && answer.resourceAddress) {
      return (
        <>
          <div className={styles.coinItemContent}>
            <span
              className={styles.text}
              dangerouslySetInnerHTML={{ __html: answer.answertContent || '' }}
            />
          </div>
          <video
            className={styles.videoPlayer}
            src={answer.resourceAddress}
            controls
            playsInline
            preload="metadata"
          />
        </>
      );
    }

    // 下载资源
    if (answer.resourceType === 3 && answer.resourceAddress) {
      return (
        <div
          className={styles.downloadBtnWrapper}
          onClick={() => window.open(answer.resourceAddress, '_blank')}
        >
          {answer.downloadIcon && (
            <LazyImage src={answer.downloadIcon} alt="Download" width={20} height={20} />
          )}
          <span
            className={styles.text}
            dangerouslySetInnerHTML={{ __html: answer.answertContent || '' }}
          ></span>
        </div>
      );
    }

    // 纯文本内容
    return (
      <div className={styles.coinItemContent}>
        <span
          className={styles.text}
          dangerouslySetInnerHTML={{ __html: answer.answertContent || '' }}
        />
      </div>
    );
  };
  // 获取所有图片资源
  const demoImages = useMemo(() => {
    return answers
      .filter((answer) => answer.resourceType === 1 && answer.resourceAddress)
      .map((answer) => answer.resourceAddress);
  }, [answers]);
  return (
    <div className={styles.template3}>
      {/* 一级Tab */}
      {firstTabs.length > 0 && (
        <div className={styles.tabWrapper}>
          <div className={styles.tabArea}>
            <div className={clsx(styles.tabs, firstTabs.length === 1 ? styles.justifyCenter : '')}>
              {firstTabs.map((tab: VirtualCurrencyFirstTab) => {
                const isActive = firstTabId === tab.firstTabId;
                return (
                  <div
                    key={tab.firstTabId}
                    className={`${styles.tabItem} ${isActive ? styles.active : ''}`}
                    onClick={() => handleFirstTabClick(tab)}
                  >
                    {tab.firstTabName}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 二级Tab */}
      {secondTabs.length > 0 && (
        <div className={styles.subtabWrapper}>
          <div className={styles.subTabs} ref={subTabContainerRef}>
            {secondTabs.map((tab: VirtualCurrencySecondTab) => {
              const isActive = secondTabId === tab.secondTabId;
              return (
                <div key={tab.secondTabId} className={styles.subTabItem}>
                  <div
                    className={`${styles.subTabItemContent} ${isActive ? styles.subactive : ''}`}
                    onClick={(event) => handleSecondTabClick(tab, event)}
                  >
                    {tab.secondTabName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 内容区域 */}
      <div className={styles.detailContent}>
        <div className={styles.contentHeader}>
          <span className={styles.subtitle}>{subtitle}</span>
        </div>

        {answers.map((answer: VirtualCurrencyAnswerItem, index: number) => (
          <div key={`answer-${index}`} className={styles.contentItem}>
            <div className={styles.itemTitle}>
              <span className={styles.number}>{index + 1}</span>
              <span className={styles.text}>{answer.answerContentTitle}</span>
            </div>
            {renderAnswerContent(answer, index)}
          </div>
        ))}

        {answers.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyImage} />
            <span className={styles.emptyText}>暂无内容</span>
          </div>
        )}
      </div>

      <ImageView
        isFullScreen={isFullScreen}
        statusBarHeight={statusBarHeight}
        images={demoImages}
        visible={visible}
        defaultIndex={currentImageIndex}
        onClose={() => setVisible(false)}
        onIndexChange={(index) => setCurrentImageIndex(index)}
      />
    </div>
  );
};

export default Template3;

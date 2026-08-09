'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import styles from './index.module.scss';
// import { ImageViewer } from "antd-mobile";
import ImageView from '../imageView';
import LazyImage from '@/common/components/LazyImage';
import { useSearchParams } from 'react-router-dom';
import {
  HelpTutorialAnswer,
  HelpTutorialContent,
  HelpTutorialFirstTab,
} from '@/apis/origin/helpCenter/helpTutorial';
interface Template4Props {
  item: HelpTutorialContent;
  onSubTabChange?: (subTabId?: number) => void; // 修改：只传递 subTabId
}

const Template4: React.FC<Template4Props> = ({ item, onSubTabChange }) => {
  const [subTabItemId, setSubTabItemId] = useState<number | null>(null);
  const [subtitle, setSubtitle] = useState('');
  const [visible, setVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchParams] = useSearchParams();
  const isFullScreen = searchParams.get('isFullScreen') === '1';
  const statusBarHeight = searchParams.get('statusBarHeight') || 0;
  const tabsRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  // 获取 firstTabs 作为 secondTabs 使用
  const secondTabs = useMemo(() => {
    return item?.firstTabs || [];
  }, [item]);

  // 获取当前激活的 tab - 使用 tutorialId 而不是 questionId
  const activeSecondTab = useMemo(() => {
    if (subTabItemId === null) {
      return secondTabs[0];
    }

    const found = secondTabs.find((s) => {
      // 从 answerList 中获取 tutorialId
      return s.tutorialId === subTabItemId;
    });

    return found || secondTabs[0];
  }, [secondTabs, subTabItemId]);

  // 获取答案列表
  const answers = useMemo(() => {
    return activeSecondTab?.answerList || [];
  }, [activeSecondTab]);

  // 获取所有图片资源
  const demoImages = useMemo(() => {
    return answers
      .filter((answer) => answer.resourceType === 1 && answer.resourceAddress)
      .map((answer) => answer.resourceAddress);
  }, [answers]);

  // 当 item 变化时重置状态
  useEffect(() => {
    hasInitialized.current = false;
    setSubTabItemId(null);
    setSubtitle('');
  }, [item]);

  // 初始化 - 只跑一次
  useEffect(() => {
    if (hasInitialized.current) return;
    if (secondTabs.length === 0) return;

    const firstTab = secondTabs[0];
    if (!firstTab) return;

    hasInitialized.current = true;

    const firstTutorialId = firstTab.tutorialId;
    setSubTabItemId(firstTutorialId);
    setSubtitle(firstTab?.tabTitle || '');
    // ✅ 初始化时通知父组件
    onSubTabChange?.(firstTutorialId);
    setTimeout(() => scrollTabToCenter(firstTutorialId), 100);
  }, [secondTabs, onSubTabChange]);

  // 处理 tab 点击，点击后让选中项居中
  const handleTabClick = (tab: HelpTutorialFirstTab) => {
    const tutorialId = tab.tutorialId;
    setSubTabItemId(tutorialId);
    const newSubtitle = tab?.tabTitle || '';
    setSubtitle(newSubtitle);
    scrollTabToCenter(tutorialId);

    onSubTabChange?.(tutorialId);
  };

  // 让选中的 tab 居中
  const scrollTabToCenter = (tutorialId: number) => {
    if (!tabsRef.current) return;
    const activeEl = tabsRef.current.querySelector(
      `[data-tutorial-id="${tutorialId}"]`,
    ) as HTMLElement;
    if (!activeEl) return;
    // 滚动的是 subtabWrapper（tabsRef 的父元素）
    const wrapper = tabsRef.current.parentElement;
    if (!wrapper) return;
    const wrapperWidth = wrapper.offsetWidth;
    const activeLeft = activeEl.offsetLeft;
    const activeWidth = activeEl.offsetWidth;
    wrapper.scrollTo({
      left: activeLeft - wrapperWidth / 2 + activeWidth / 2,
      behavior: 'smooth',
    });
  };

  // 渲染答案内容
  const renderAnswerContent = (answer: HelpTutorialAnswer, index: number) => {
    // 图片资源
    if (answer.resourceType === 1 && answer.resourceAddress) {
      const imageIndex = demoImages.indexOf(answer.resourceAddress);
      return (
        <>
          <div className={styles.coinItemContent}>
            {/* <span
              className={styles.text}
              dangerouslySetInnerHTML={{ __html: answer.answerContent || "" }}
            /> */}
          </div>
          <div className={styles.imageContent}>
            <LazyImage
              src={answer.resourceAddress}
              alt={`image-${index}`}
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
              dangerouslySetInnerHTML={{ __html: answer.answerContent || '' }}
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
          <span className={styles.text}>{answer.answerContent}</span>
        </div>
      );
    }

    // 纯文本内容
    return (
      <div className={styles.coinItemContent}>
        <span
          className={styles.text}
          dangerouslySetInnerHTML={{ __html: answer.answerContent || '' }}
        />
      </div>
    );
  };

  return (
    <div className={styles.template4}>
      {/* 二级Tab导航 */}
      {secondTabs.length > 0 && (
        <div className={styles.subtabWrapper}>
          <div className={styles.subTabs} ref={tabsRef}>
            {secondTabs.map((tab: HelpTutorialFirstTab) => {
              const tutorialId = tab.tutorialId;
              const isActive = subTabItemId === tutorialId;

              return (
                <div
                  key={`tutorial-${tutorialId}`}
                  data-tutorial-id={tutorialId}
                  className={`${styles.subTabItem} ${isActive ? styles.subactive : ''}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.tabName}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 内容区域 */}
      <div className={styles.detailContent}>
        <div className={styles.contentHeader}>
          <span className={styles.subtitle}>{activeSecondTab?.tabName}</span>
        </div>
        {subtitle && (
          <div className={styles.tips}>
            <img src={'/images/common/helpCenter/tips.svg'} alt="" />
            {subtitle}
          </div>
        )}
        {answers.map((answer: HelpTutorialAnswer, index: number) => (
          <div key={`answer-${index}`} className={styles.contentItem}>
            <div className={styles.itemTitle}>
              <span className={styles.number}>{index + 1}</span>
              <span
                className={styles.text}
                dangerouslySetInnerHTML={{ __html: answer.answerContent || '' }}
              ></span>
            </div>
            {renderAnswerContent(answer, index)}
          </div>
        ))}

        {answers.length === 0 && (
          <>
            <div className={styles.empty}>
              <div className={styles.emptyImage} />
              <span className={styles.emptyText}>暂无内容</span>
            </div>
          </>
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

export default Template4;

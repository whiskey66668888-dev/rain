'use client';

import React, { useMemo, useState } from 'react';
import styles from './index.module.scss';
import ImageView from '../imageView';
import LazyImage from '@/common/components/LazyImage';
import { useSearchParams } from 'react-router-dom';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { AnswerContent, QuestionDetail } from '@/apis/origin/helpCenter/helpCenterInfo';

interface Template2Props {
  answers: AnswerContent[];
  item: QuestionDetail;
}

const Template2: React.FC<Template2Props> = ({ answers, item }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigateWithLanguage();
  // 1. 定义状态
  const [visible, setVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hideHead = searchParams.get('hideHead') === '1';
  const isFullScreen = searchParams.get('isFullScreen') === '1';
  const statusBarHeight = searchParams.get('statusBarHeight') || 0;
  const handleCoinLinkClick = () => {
    // 构造参数
    const params = new URLSearchParams();
    if (hideHead) params.append('hideHead', '1');
    if (isFullScreen) params.append('isFullScreen', '1');
    if (statusBarHeight) params.append('statusBarHeight', String(statusBarHeight));
    const queryString = params.toString() ? `?${params.toString()}` : '';

    navigate(`/mine/newerHelp/vituralCoins${queryString}`);
  };

  // 2. 提取图片列表
  const demoImages = useMemo(() => {
    return answers
      .filter((answer) => answer.resourceType === 1 && answer.resourceAddress)
      .map((answer) => answer.resourceAddress);
  }, [answers]);
  return (
    <div className={styles.template2}>
      {item?.loadVirtualLink && (
        <div className={styles.coinLink} onClick={handleCoinLinkClick}>
          <div className={styles.linkImage} />
          <div className={styles.linkText}>快捷虚拟币</div>
          <div className={styles.forwardIcon} />
        </div>
      )}

      <div className={styles.detailContent}>
        <div className={styles.contentHeader}>
          <span className={styles.subtitle}>{item?.answerTitle || ''}</span>
        </div>

        {answers.map((answer, index) => {
          // 计算当前图片在 demoImages 中的索引
          const imageIndex = demoImages.indexOf(answer.resourceAddress);

          return (
            <div key={`answer-${index}`} className={styles.contentItem}>
              <div className={styles.itemTitle}>
                <span className={styles.number}>{index + 1}</span>
                <span className={styles.text}>{answer.answerContentTitle}</span>
              </div>

              <div className={styles.imageContent}>
                <div className={styles.imageWrapper}>
                  {/* 3. 点击图片时打开查看器 */}
                  <LazyImage
                    src={answer.resourceAddress}
                    alt={`image-${index}`}
                    width={155}
                    height={319}
                    onClick={() => {
                      setCurrentImageIndex(imageIndex); // 设置当前索引
                      setVisible(true); // 显示查看器
                    }}
                    style={{ cursor: 'pointer' }} // 添加手型光标提示
                  />
                </div>
              </div>

              <div className={styles.coinItemContent}>
                <div
                  className={styles.text}
                  dangerouslySetInnerHTML={{
                    __html: answer.answertContent || '',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. 渲染 ImageView 组件 */}
      <ImageView
        isFullScreen={isFullScreen}
        statusBarHeight={statusBarHeight}
        images={demoImages} // 所有图片地址
        visible={visible} // 是否显示
        defaultIndex={currentImageIndex} // 当前显示哪张
        onClose={() => setVisible(false)} // 关闭时隐藏
        onIndexChange={(index) => setCurrentImageIndex(index)} // 切换图片时更新索引
      />
    </div>
  );
};

export default Template2;

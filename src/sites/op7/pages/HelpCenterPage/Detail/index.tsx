import { useCallback, useEffect, useState } from 'react';
import { Loading } from 'antd-mobile';
import { useSearchParams } from 'react-router-dom';
// components
import Template1 from '../components/Template1';
import Template2 from '../components/Template2';
import Template3 from '../components/Template3';
import Template4 from '../components/Template4';
import { toast } from '@/common/components/Toast';
// hooks
import { useVoteStorage } from '../hooks/useVoteStorage';
// styles
import styles from './index.module.scss';
import { useThrottleFn } from 'ahooks';
import useFlutterBridge from '@/sites/op7/hooks/useFlutterBridge';
import { likeOrUnlike, LikeOrUnlikeParams } from '@/apis/origin/helpCenter/helpAction';
import clsx from 'clsx';
import {
  HelpTutorialContent,
  useTutorialContentQuery,
} from '@/apis/origin/helpCenter/helpTutorial';
import {
  useVirtualCurrencyTutorialQuery,
  VirtualCurrencyTutorialDetail,
} from '@/apis/origin/helpCenter/helpvirtual';

import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';
import H5Header from '@/sites/op7/components/H5Header';
import { QuestionDetail, useQuestions } from '@/apis/origin/helpCenter/helpCenterInfo';

type SupportDetailPageProps = {
  layoutMode?: 'default' | 'pc-popup';
};

const SupportDetailPage = ({ layoutMode = 'default' }: SupportDetailPageProps) => {
  const navigate = useNavigateWithLanguage();
  const openCustomerService = useOpenCustomerService(true);
  const [searchParams] = useSearchParams();
  const { sendToFlutter, isInFlutter } = useFlutterBridge();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const hideHeader = isMounted && searchParams.get('hideHead') === '1';
  const isFullScreen = isMounted && searchParams.get('isFullScreen') === '1';
  const statusBarHeight = isMounted ? searchParams.get('statusBarHeight') || 0 : 0;
  const questionId = isMounted ? Number(searchParams.get('questionId') || 1) : 1;
  const isVirtualCoin = isMounted && searchParams.get('isVirtualCoin') === 'true';
  const virtualId = isMounted ? searchParams.get('virtualId') : null;
  const isApp = isMounted ? decodeURIComponent(searchParams.get('isApp') || '') : '';
  // 投票存储 hook
  const { getVote, setVote } = useVoteStorage();
  const { data: questionsData, refetch: refetchQuestionsData } = useQuestions();
  const { data: tutorialContentData, refetch: refetchTutorialContent } =
    useTutorialContentQuery(questionId);
  const { data: virtualCurrencyTutorialData, refetch: refetchVirtualCurrencyTutorial } =
    useVirtualCurrencyTutorialQuery(Number(virtualId));

  // 从 data 中取出实际数据
  const virtualDetail = virtualCurrencyTutorialData?.data ?? null;
  const tutorialContent = tutorialContentData?.data ?? null;
  console.log(
    tutorialContentData,
    'tutorialContentData',
    virtualCurrencyTutorialData,
    'virtualCurrencyTutorialData',
  );
  // 页面状态
  const [item, setItem] = useState<QuestionDetail | VirtualCurrencyTutorialDetail>();
  const [title, setTitle] = useState<string>('');
  const displayTitle = title || '问题详情';

  // 点赞状态
  const [voteStatus, setVoteStatus] = useState<number | null>(null); // 1: 有用, 2: 没用, null: 未投票
  const [currentSubTabId, setCurrentSubTabId] = useState<number | null>(null); // 用于模版3和4
  console.log(currentSubTabId);
  // 获取模板类型
  const templateType = item?.answerTemplate || 1;

  // 获取投票存储的key
  const getVoteKey = useCallback(() => {
    if (templateType === 1 || templateType === 2) {
      return `question_${questionId}`;
    } else if (templateType === 3 && currentSubTabId) {
      return `virtual_${currentSubTabId}`;
    } else if (templateType === 4 && currentSubTabId) {
      return `tutorial_${currentSubTabId}`;
    }
    return null;
  }, [currentSubTabId, questionId, templateType]);

  // 从本地存储读取点赞状态
  useEffect(() => {
    const voteKey = getVoteKey();
    console.log(`获取投票key: ${voteKey}`);
    if (voteKey) {
      const savedStatus = getVote(voteKey);
      console.log(`获取投票key: ${savedStatus}`);
      setVoteStatus(savedStatus);
      console.log(`读取投票状态: ${voteKey} = ${savedStatus}`);
    } else {
      setVoteStatus(null);
    }
  }, [templateType, questionId, currentSubTabId, getVote, getVoteKey]);
  useEffect(() => {
    if (templateType === 4) {
      refetchTutorialContent();
      return;
    }
  }, [refetchTutorialContent, templateType]);
  // 拉取数据
  useEffect(() => {
    console.log('拉取数据 - isVirtualCoin:', isVirtualCoin, 'virtualId:', virtualId);

    if (isVirtualCoin && virtualId) {
      refetchVirtualCurrencyTutorial();
    } else {
      refetchQuestionsData();
    }
  }, [isVirtualCoin, refetchQuestionsData, refetchVirtualCurrencyTutorial, virtualId]);

  // 虚拟币教程模式
  useEffect(() => {
    if (!isVirtualCoin || !virtualDetail) return;

    console.log('虚拟币教程模式 - virtualDetail:', virtualDetail);
    setItem(virtualDetail);
    setTitle(virtualDetail?.answerTitle);
  }, [isVirtualCoin, virtualDetail]);

  // 常见问题模式
  useEffect(() => {
    if (isVirtualCoin) return;

    const list = questionsData?.data?.questionTypeList ?? [];
    if (!list.length) return;

    let selected = null;
    for (const type of list) {
      const found = type?.questionList?.find((q) => q.questionId === questionId);
      if (found) {
        selected = found;
        break;
      }
    }
    if (selected) {
      setItem(selected);
      setTitle(selected?.answerTitle);
    }
  }, [isVirtualCoin, questionsData?.data?.questionTypeList, questionId]);

  // 处理子tab变化
  const handleSubTabChange = useCallback((subTabId?: number) => {
    if (subTabId !== undefined) {
      setCurrentSubTabId(subTabId);
    }
  }, []);

  // 投票功能
  const voteFun = async (isLike: boolean) => {
    if (!item) {
      return;
    }

    // 构建请求参数
    const params: LikeOrUnlikeParams = {
      lickOrUnLike: isLike ? 1 : 2, // 1: 点赞, 2: 取消点赞
    };

    // 根据模版类型设置对应的ID
    if (templateType === 1 || templateType === 2) {
      // 普通问题模版
      params.questionId = questionId;
    } else if (templateType === 3) {
      // 虚拟币教程模版
      if (!currentSubTabId) {
        console.log('虚拟币教程需要选择子tab');
        return;
      }
      params.virtualcCurrencySecondTabId = currentSubTabId;
    } else if (templateType === 4) {
      // 盘口教程模版
      if (!currentSubTabId) {
        console.log('盘口教程需要选择子tab');
        return;
      }
      params.tutorialTabId = currentSubTabId;
    }

    console.log('投票参数:', params);

    try {
      await likeOrUnlike(params);
      toast({ description: '评价成功，感谢您的评价', type: 'success' });
      // 保存投票状态到本地存储
      const newStatus = isLike ? 1 : 2;
      setVoteStatus(newStatus);

      const voteKey = getVoteKey();
      if (voteKey) {
        setVote(voteKey, newStatus);
        console.log(`保存投票状态: ${voteKey} = ${newStatus}`);
      }
    } catch (err) {
      console.error('投票失败:', err);
    }
  };

  // 渲染对应的模板
  const renderTemplate = () => {
    if (!item) {
      return (
        <div className={styles.loadingContainer}>
          <span className={styles.loadingText}>
            加载中... <Loading color="primary" />
          </span>
        </div>
      );
    }

    // const commonProps: {
    //   item: VirtualCurrencyTutorialDetail;
    //   onSubTabChange: (subTabId?: number) => void;
    // } = {
    //   item: item as VirtualCurrencyTutorialDetail,
    //   onSubTabChange: handleSubTabChange,
    // };
    switch (templateType) {
      case 1:
        return <Template1 answers={item?.answerList || []} item={item as QuestionDetail} />;
      case 2:
        return <Template2 answers={item?.answerList || []} item={item as QuestionDetail} />;
      case 3:
        return (
          <Template3
            item={item as VirtualCurrencyTutorialDetail}
            onSubTabChange={handleSubTabChange}
          />
        );
      case 4:
        return (
          <Template4
            onSubTabChange={handleSubTabChange}
            item={tutorialContent as HelpTutorialContent}
          />
        );
      default:
        return <Template1 answers={item?.answerList || []} item={item as QuestionDetail} />;
    }
  };
  const { run: handleHelpClick } = useThrottleFn(
    () => {
      if (isInFlutter()) {
        sendToFlutter('goCustomerService');
      } else {
        openCustomerService();
      }
    },
    {
      wait: 1000, // 冷却时间，建议 1000ms，防止用户疯狂连点
      leading: true, // 点击时立即触发
      trailing: false, // 冷却结束后不再次触发（关键配置）
    },
  );
  const handleBack = () => {
    if (isInFlutter() && isApp === '1') {
      sendToFlutter('goBack');
    } else {
      navigate(-1);
    }
  };
  return (
    <div
      className={clsx(
        styles.supportDetailPage,
        layoutMode === 'pc-popup' ? styles.pcPopup : '',
        hideHeader ? styles.noHeader : '',
        isFullScreen ? styles.fullScreen : '',
        'lg:max-w-[1200px]',
        'mx-auto',
        'w-full',
      )}
      style={{
        paddingTop: isFullScreen ? `${statusBarHeight}px` : undefined,
      }}
    >
      {!hideHeader && layoutMode === 'default' && (
        <H5Header title={displayTitle} onBack={handleBack} pcHidden={false} isFixed={false} />
      )}
      <div
        className={clsx(
          'flex-1 flex flex-col',
          layoutMode === 'pc-popup' ? 'min-h-0 overflow-auto' : 'overflow-scroll',
          styles.content,
        )}
      >
        <div className={styles.bodyWrapper}>{renderTemplate()}</div>

        {/* 投票区域 */}
        <div className={styles.voteArea}>
          <div className={styles.question}>
            <span className={styles.text}>—— 以上回答对您有帮助吗 ——</span>
          </div>
          <div className={styles.voteBtns}>
            <div
              className={`${styles.vote} ${voteStatus === 2 ? styles.voted : ''}`}
              onClick={() => {
                voteFun(false);
              }}
            >
              <div className={styles.imgMeiyong} />
              <span className={styles.text}>没用</span>
            </div>
            <div
              className={`${styles.vote} ${voteStatus === 1 ? styles.voted : ''}`}
              onClick={() => {
                voteFun(true);
              }}
            >
              <div className={styles.imgYouyong} />
              <span className={styles.text}>有用</span>
            </div>
          </div>
        </div>

        {/* 页脚 */}
        <div className={styles.detailFooter}>
          <div className={styles.supportBtn} onClick={handleHelpClick}>
            <div className={styles.icon} />
            <span className={styles.text}>在线客服</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportDetailPage;

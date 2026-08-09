import React, { useCallback, useEffect, useState } from 'react';
import { Loading } from 'antd-mobile';
import { useSearchParams, useParams } from 'react-router-dom';
// components
import Template1 from '../components/Template1';
import Template2 from '../components/Template2';
import Template3 from '../components/Template3';
import Template4 from '../components/Template4';
import { toast } from '@/common/components/Toast';
// hooks
import { useVoteStorage } from '../hooks/useVoteStorage';
// styles
import styles from './page.module.scss';
import { likeOrUnlike, LikeOrUnlikeParams } from '@/apis/origin/helpCenter/helpAction';
import useFlutterBridge from '@/sites/op7/hooks/useFlutterBridge';
import { useThrottleFn } from 'ahooks';
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
type VirtualCoinKey = 'binance' | 'gateio' | 'imtoken' | 'okx';

// 页面配置
const PAGE_CONFIG = {
  virtualCoin: {
    ids: ['binance', 'gateio', 'imtoken', 'okx'] as const,
    mapping: {
      binance: 1,
      gateio: 2,
      imtoken: 3,
      okx: 4,
    } as Record<VirtualCoinKey, number>,
  },
  betRule: { id: '3', contentId: 3 },
  ebpay: { id: 'ebpay', contentId: 63 },
};

const SupportDetailPage: React.FC = () => {
  const navigate = useNavigateWithLanguage();
  const openCustomerService = useOpenCustomerService(true);
  const { sendToFlutter, isInFlutter } = useFlutterBridge();
  const [searchParams] = useSearchParams();
  const { id = '' } = useParams<{ id: string }>();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const hideHeader = isMounted && searchParams.get('hideHead') === '1';
  const isApp = isMounted ? decodeURIComponent(searchParams.get('isApp') || '') : '';
  const isFullScreen = isMounted && searchParams.get('isFullScreen') === '1';
  const statusBarHeight = isMounted ? searchParams.get('statusBarHeight') || 0 : 0;
  // 投票存储 hook
  const { getVote, setVote } = useVoteStorage();

  // 页面状态
  const [item, setItem] = useState<QuestionDetail | VirtualCurrencyTutorialDetail | null>(null);
  const [title, setTitle] = useState('问题详情');

  // 点赞状态
  const [voteStatus, setVoteStatus] = useState<number | null>(null);
  const [currentSubTabId, setCurrentSubTabId] = useState<number | null>(null);

  const pageInfo = React.useMemo(() => {
    if (id === PAGE_CONFIG.betRule.id) {
      return { type: 'betRule' as const, contentId: PAGE_CONFIG.betRule.contentId };
    }
    if (PAGE_CONFIG.virtualCoin.ids.includes(id as VirtualCoinKey)) {
      return {
        type: 'virtualCoin' as const,
        contentId: PAGE_CONFIG.virtualCoin.mapping[id as VirtualCoinKey],
      };
    }
    if (id === PAGE_CONFIG.ebpay.id) {
      return { type: 'ebpay' as const, contentId: PAGE_CONFIG.ebpay.contentId };
    }
    return { type: 'question' as const, contentId: Number(id) || 0 };
  }, [id]);

  // 获取模板类型
  const templateType = React.useMemo(() => {
    if (pageInfo.type === 'betRule') return 4;
    if (pageInfo.type === 'ebpay') return 4;
    return (item as QuestionDetail)?.answerTemplate || 1;
  }, [pageInfo.type, item]);

  // React Query hooks
  const { data: questionsData, refetch: refetchQuestionsData } = useQuestions();
  const { data: tutorialContentData, refetch: refetchTutorialContent } = useTutorialContentQuery(
    pageInfo.contentId ?? 0,
  );
  const { data: virtualCurrencyTutorialData, refetch: refetchVirtualCurrencyTutorial } =
    useVirtualCurrencyTutorialQuery(pageInfo.type === 'virtualCoin' ? pageInfo.contentId : 0);

  const virtualDetail = virtualCurrencyTutorialData?.data ?? null;
  const tutorialContent = tutorialContentData?.data ?? null;

  // 获取投票存储的 key
  const getVoteKey = useCallback(() => {
    if (templateType === 1 || templateType === 2) {
      return `question_${pageInfo.contentId}`;
    } else if (templateType === 3 && currentSubTabId) {
      return `virtual_${currentSubTabId}`;
    } else if (templateType === 4 && currentSubTabId) {
      return `tutorial_${currentSubTabId}`;
    }
    return null;
  }, [currentSubTabId, pageInfo.contentId, templateType]);

  // 从本地存储读取点赞状态
  useEffect(() => {
    const voteKey = getVoteKey();
    if (voteKey) {
      const savedStatus = getVote(voteKey);
      setVoteStatus(savedStatus);
    } else {
      setVoteStatus(null);
    }
  }, [templateType, pageInfo.contentId, currentSubTabId, getVote, getVoteKey]);

  // 拉取数据
  useEffect(() => {
    const { type } = pageInfo;
    if (type === 'betRule' || type === 'ebpay') {
      refetchTutorialContent();
    } else if (type === 'virtualCoin') {
      refetchVirtualCurrencyTutorial();
    } else {
      refetchQuestionsData();
    }
  }, [pageInfo, refetchQuestionsData, refetchTutorialContent, refetchVirtualCurrencyTutorial]);

  // 虚拟币教程模式
  useEffect(() => {
    if (pageInfo.type !== 'virtualCoin' || !virtualDetail) return;
    setItem(virtualDetail);
    setTitle(virtualDetail?.answerTitle);
  }, [pageInfo.type, virtualDetail]);

  // 常见问题模式
  useEffect(() => {
    if (pageInfo.type !== 'question') return;
    const list = questionsData?.data?.questionTypeList ?? [];
    if (!list.length) return;
    let selected: QuestionDetail | null = null;
    for (const type of list) {
      const found = type?.questionList?.find((q) => q.questionId === pageInfo.contentId);
      if (found) {
        selected = found;
        break;
      }
    }
    if (selected) {
      setItem(selected);
      setTitle(selected?.answerTitle);
    }
  }, [pageInfo.type, pageInfo.contentId, questionsData]);

  // betRule / ebpay 教程模式
  useEffect(() => {
    if (pageInfo.type !== 'betRule' && pageInfo.type !== 'ebpay') return;
    if (!tutorialContent) return;
    setItem(tutorialContent as unknown as QuestionDetail);
    setTitle(
      typeof tutorialContent?.answerTitle === 'string' && tutorialContent.answerTitle.trim() !== ''
        ? tutorialContent.answerTitle
        : '问题详情',
    );
  }, [pageInfo.type, tutorialContent]);

  // 处理子tab变化
  const handleSubTabChange = useCallback((subTabId?: number) => {
    if (subTabId !== undefined) {
      setCurrentSubTabId(subTabId);
    }
  }, []);

  // 投票功能
  const voteFun = async (isLike: boolean) => {
    if (!item) return;

    const params: LikeOrUnlikeParams = {
      lickOrUnLike: isLike ? 1 : 2,
    };

    if (templateType === 1 || templateType === 2) {
      params.questionId = pageInfo.contentId;
    } else if (templateType === 3) {
      if (!currentSubTabId) return;
      params.virtualcCurrencySecondTabId = currentSubTabId;
    } else if (templateType === 4) {
      if (!currentSubTabId) return;
      params.tutorialTabId = currentSubTabId;
    }

    try {
      await likeOrUnlike(params);
      toast({ description: '评价成功，感谢您的评价', type: 'success' });
      const newStatus = isLike ? 1 : 2;
      setVoteStatus(newStatus);
      const voteKey = getVoteKey();
      if (voteKey) {
        setVote(voteKey, newStatus);
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

    switch (templateType) {
      case 1:
        return (
          <Template1
            answers={(item as QuestionDetail)?.answerList || []}
            item={item as QuestionDetail}
          />
        );
      case 2:
        return (
          <Template2
            answers={(item as QuestionDetail)?.answerList || []}
            item={item as QuestionDetail}
          />
        );
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
        return (
          <Template1
            answers={(item as QuestionDetail)?.answerList || []}
            item={item as QuestionDetail}
          />
        );
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
    { wait: 1000, leading: true, trailing: false },
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
      {!hideHeader && (
        <H5Header title={title} onBack={handleBack} pcHidden={false} isFixed={false} />
      )}
      <div className={clsx('flex-1 flex flex-col overflow-scroll', styles.content)}>
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
                void voteFun(false);
              }}
            >
              <div className={styles.imgMeiyong} />
              <span className={styles.text}>没用</span>
            </div>
            <div
              className={`${styles.vote} ${voteStatus === 1 ? styles.voted : ''}`}
              onClick={() => {
                void voteFun(true);
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

// type Props = {
//   params: {
//     id: string;
//   };
// };

// 页面配置
// const PAGE_CONFIG = {
//   virtualCoin: {
//     ids: ['binance', 'gateio', 'imtoken', 'okx'] as const,
//     mapping: {
//       binance: 1,
//       gateio: 2,
//       imtoken: 3,
//       okx: 4,
//     } as Record<VirtualCoinKey, number>,
//   },
//   betRule: { id: '3', contentId: 3 },
//   ebpay: { id: 'ebpay', contentId: 63 },
// };

// const SupportDetailPage: React.FC<any> = ({ params }) => {
//   const router = useRouter();
//   const { helpData, tutorialDetail, tutorialContent } = helpStore;
//   const { sendToFlutter, isInFlutter } = useFlutterBridge();
//   const searchParams = useSearchParams();
//   const hideHeader = searchParams.get('hideHead') === '1';
//   const isApp = decodeURIComponent(searchParams.get('isApp') || '');
//   const isFullScreen = searchParams.get('isFullScreen') === '1';
//   const statusBarHeight = searchParams.get('statusBarHeight') || 0;

//   // 投票存储 hook
//   const { getVote, setVote } = useVoteStorage();

//   // 页面状态
//   const [item, setItem] = useState<any>(null);
//   const [title, setTitle] = useState('问题详情');
//   const [subtitle, setSubtitle] = useState('');

//   // 点赞状态
//   const [voteStatus, setVoteStatus] = useState<number | null>(null); // 1: 有用, 2: 没用, null: 未投票
//   const [currentSubTabId, setCurrentSubTabId] = useState<number | null>(null); // 用于模版3和4

//   const pageInfo = React.useMemo(() => {
//     const { id } = params;

//     if (id === PAGE_CONFIG.betRule.id) {
//       return {
//         type: 'betRule' as const,
//         contentId: PAGE_CONFIG.betRule.contentId,
//       };
//     }

//     if (PAGE_CONFIG.virtualCoin.ids.includes(id as VirtualCoinKey)) {
//       return {
//         type: 'virtualCoin' as const,
//         contentId: PAGE_CONFIG.virtualCoin.mapping[id as VirtualCoinKey],
//       };
//     }

//     if (id === PAGE_CONFIG.ebpay.id) {
//       return {
//         type: 'ebpay' as const,
//         contentId: PAGE_CONFIG.ebpay.contentId,
//       };
//     }

//     return { type: 'question' as const };
//   }, [params.id]);

//   // 获取模板类型
//   const templateType = React.useMemo(() => {
//     if (pageInfo.type === 'betRule') return 4;
//     if (pageInfo.type === 'ebpay') {
//       return 4;
//     }
//     return item?.answerTemplate || 1;
//   }, [pageInfo.type, item?.answerTemplate]);

//   // 获取投票存储的key
//   const getVoteKey = () => {
//     if (templateType === 1 || templateType === 2) {
//       // 对于动态路由，使用 contentId 作为标识
//       return `question_${pageInfo.contentId}`;
//     } else if (templateType === 3 && currentSubTabId) {
//       return `virtual_${currentSubTabId}`;
//     } else if (templateType === 4 && currentSubTabId) {
//       return `tutorial_${currentSubTabId}`;
//     }
//     return null;
//   };

//   // 从本地存储读取点赞状态
//   useEffect(() => {
//     const voteKey = getVoteKey();
//     console.log(voteKey, 'voteKey1231232323');
//     if (voteKey) {
//       const savedStatus = getVote(voteKey);
//       setVoteStatus(savedStatus);
//       console.log(`读取投票状态: ${voteKey} = ${savedStatus}`);
//     } else {
//       setVoteStatus(null);
//     }
//   }, [templateType, pageInfo.contentId, currentSubTabId, getVote]);

//   // 数据获取
//   useEffect(() => {
//     const { type, contentId } = pageInfo;
//     console.log('数据获取 - type:', type, 'contentId:', contentId);
//     if (type === 'betRule') {
//       helpStore.getTutorialContent(contentId);
//     } else if (type === 'virtualCoin') {
//       helpStore.clearTutorialDetail();
//       helpStore.getVirtualCurrencyTutorial(contentId);
//     } else if (type === 'ebpay') {
//       // ebpay 需要获取问题列表数据
//       // helpStore.getQuestions();
//       helpStore.getTutorialContent(contentId);
//     } else {
//       helpStore.getQuestions();
//     }
//   }, [pageInfo]);

//   // 数据初始化
//   useEffect(() => {
//     let contentData = null;

//     if (pageInfo.type === 'betRule' && tutorialContent) {
//       contentData = tutorialContent;
//     } else if (pageInfo.type === 'virtualCoin' && tutorialDetail) {
//       contentData = tutorialDetail;
//     } else if (pageInfo.type === 'ebpay' && tutorialContent) {
//       // // 从 questionTypeList 中查找所有 questionList，然后找到 questionId 为 8 的项目
//       // let targetQuestion = null;

//       // for (const questionType of helpData.questionTypeList) {
//       //   if (questionType.questionList) {
//       //     targetQuestion = questionType.questionList.find(
//       //       (question: any) => question.questionId === 63,
//       //     );
//       //     if (targetQuestion) break;
//       //   }
//       // }

//       // contentData = targetQuestion;

//       contentData = tutorialContent;
//     }

//     if (!contentData) return;

//     setItem(contentData);
//     setTitle(contentData?.answerTitle || contentData?.questionName || '问题详情');
//   }, [pageInfo.type, tutorialDetail, tutorialContent, helpData]);

//   // 处理子tab变化
//   const handleSubTabChange = (subTabId?: number) => {
//     console.log('子tab变化 - subTabId:', subTabId);

//     // 保存当前选中的子tab ID（用于模版3和4的点赞）
//     if (subTabId !== undefined) {
//       setCurrentSubTabId(subTabId);
//     }
//   };

//   // 投票功能
//   const voteFun = async (isLike: boolean) => {
//     console.log('投票 - item:', toJS(item), 'templateType:', templateType);

//     if (!item) {
//       console.log('没有item数据');
//       return;
//     }

//     // 构建请求参数
//     const params: any = {
//       lickOrUnLike: isLike ? 1 : 2, // 1: 点赞, 2: 取消点赞
//     };

//     // 根据模版类型设置对应的ID
//     if (templateType === 1 || templateType === 2) {
//       // 普通问题模版 - 使用 contentId
//       params.questionId = pageInfo.contentId;
//     } else if (templateType === 3) {
//       // 虚拟币教程模版
//       if (!currentSubTabId) {
//         console.log('虚拟币教程需要选择子tab');
//         return;
//       }
//       params.virtualcCurrencySecondTabId = currentSubTabId;
//     } else if (templateType === 4) {
//       // 盘口教程模版
//       if (!currentSubTabId) {
//         console.log('盘口教程需要选择子tab');
//         return;
//       }
//       params.tutorialTabId = currentSubTabId;
//     }

//     console.log('投票参数:', params);

//     try {
//       const res = await likeOrUnlike(params);
//       Toast.success('评价成功，感谢您的评价');

//       // 保存投票状态到本地存储
//       const newStatus = isLike ? 1 : 2;
//       setVoteStatus(newStatus);

//       const voteKey = getVoteKey();
//       if (voteKey) {
//         setVote(voteKey, newStatus);
//         console.log(`保存投票状态: ${voteKey} = ${newStatus}`);
//       }
//     } catch (err) {
//       console.error('投票失败:', err);
//     }
//   };

//   // 渲染对应的模板
//   const renderTemplate = () => {
//     // 如果没有数据就不渲染
//     if (!item) {
//       return (
//         <div className={styles.loadingContainer}>
//           <span className={styles.loadingText}>
//             加载中...
//             <Loading color="primary" />
//           </span>
//         </div>
//       );
//     }

//     const commonProps = {
//       item,
//       onSubTabChange: handleSubTabChange,
//     };

//     console.log(templateType, 'templateType');

//     switch (templateType) {
//       case 1:
//         return <Template1 key={params.id} answers={item?.answerList || []} item={item} />;
//       case 2:
//         return <Template2 key={params.id} answers={item?.answerList || []} item={item} />;
//       case 3:
//         return <Template3 key={params.id} {...commonProps} />;
//       case 4:
//         return <Template4 key={params.id} {...commonProps} />;
//       default:
//         return <Template1 key={params.id} answers={item?.answerList || []} item={item} />;
//     }
//   };
//   const { run: handleHelpClick } = useThrottleFn(
//     () => {
//       if (isInFlutter()) {
//         sendToFlutter('goCustomerService');
//       } else {
//         Customer.open(true);
//       }
//     },
//     {
//       wait: 1000, // 冷却时间，建议 1000ms，防止用户疯狂连点
//       leading: true, // 点击时立即触发
//       trailing: false, // 冷却结束后不再次触发（关键配置）
//     },
//   );
//   const handleBack = () => {
//     if (isInFlutter() && isApp === '1') {
//       sendToFlutter('goBack');
//     } else {
//       router.back();
//     }
//   };
//   return (
//     <div
//       className={classNames(
//         styles.supportDetailPage,
//         hideHeader ? styles.noHeader : '',
//         isFullScreen ? styles.fullScreen : '',
//       )}
//       style={{
//         paddingTop: isFullScreen ? `calc(${44 / 3.75}vw + ${statusBarHeight}px)` : undefined,
//       }}
//     >
//       {!hideHeader && (
//         <Header
//           center={title}
//           onClickLeft={handleBack}
//           forceTheme="light"
//           isFullScreen={isFullScreen}
//           statusBarHeight={statusBarHeight}
//         ></Header>
//       )}
//       <div className={styles.bodyWrapper}>{renderTemplate()}</div>

//       {/* 投票区域 */}
//       <div className={styles.voteArea}>
//         <div className={styles.question}>
//           <span className={styles.text}>—— 以上回答对您有帮助吗 ——</span>
//         </div>
//         <div className={styles.voteBtns}>
//           <div
//             className={`${styles.vote} ${voteStatus === 2 ? styles.voted : ''}`}
//             onClick={() => voteFun(false)}
//           >
//             <div className={styles.imgMeiyong} />
//             <span className={styles.text}>没用</span>
//           </div>
//           <div
//             className={`${styles.vote} ${voteStatus === 1 ? styles.voted : ''}`}
//             onClick={() => voteFun(true)}
//           >
//             <div className={styles.imgYouyong} />
//             <span className={styles.text}>有用</span>
//           </div>
//         </div>
//       </div>

//       {/* 页脚 */}
//       <div className={styles.detailFooter}>
//         <div className={styles.supportBtn} onClick={handleHelpClick}>
//           <div className={styles.icon} />
//           <span className={styles.text}>在线客服</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default observer(SupportDetailPage);

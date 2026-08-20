import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { useSearchParams } from 'react-router-dom';

import H5Header from '@/sites/op7/components/H5Header';
import styles from './HelpCenterPage.module.scss';
import {
  useHelpToolsList,
  useQuestions,
  QuestionType,
  QuestionDetail,
} from '@/apis/origin/helpCenter/helpCenterInfo';
import Tools from './components/Tools';
import Empty from '@/common/components/Empty';
import { ClientOnly } from '@/common/components/ClientOnly';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import SupportFooter from './components/SupportFooter';
import Overlay, { OverlayPosition } from '@/common/components/Overlay';
import { zIndexMap } from '@/utils/constants/zIndex';
import { useAppSelector } from '@/core/store/hooks';
import { ArrowLeftSvg } from '@/sites/op7/components/SvgIcons';
import Icon from '@/common/components/Icon';
import useFlutterBridge from '@/sites/op7/hooks/useFlutterBridge';

// import VirtualCoinList from './components/VituralCoins';
/**
 * 帮助中心
 */
const HelpCenterPage: React.FC = () => {
  const navigate = useNavigateWithLanguage();
  const [searchParams] = useSearchParams();
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const overlayPosition = useMemo<OverlayPosition>(
    () => (isMobile ? 'bottom' : 'center'),
    [isMobile],
  );
  const { sendToFlutter, isInFlutter } = useFlutterBridge();

  // ✅ 获取数据
  const { data: helpToolsList } = useHelpToolsList();
  const { data: questionsData } = useQuestions();

  // ✅ 状态管理
  const [tabList, setTabList] = useState<QuestionType[]>([]);
  const [selectedTabItem, setSelectedTabItem] = useState('');
  const [questionList, setQuestionList] = useState<QuestionDetail[]>([]);

  // 弹窗状态
  const [showVirtualList, setShowVirtualList] = useState(false);

  const tabContainerRef = useRef<HTMLDivElement>(null); // 标签容器引用
  const hideHeader = searchParams.get('hideHead') === '1';
  const isFullScreen = searchParams.get('isFullScreen') === '1';
  const statusBarHeight = searchParams.get('statusBarHeight') || 0;

  const navigateToHelpSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (hideHeader) params.append('hideHead', '1');
    if (isFullScreen) params.append('isFullScreen', '1');
    if (statusBarHeight) params.append('statusBarHeight', String(statusBarHeight));
    const qs = params.toString();
    navigate(qs ? `${PATHS.helpCenterSearch}?${qs}` : PATHS.helpCenterSearch);
  }, [navigate, hideHeader, isFullScreen, statusBarHeight]);

  // ✅ 更新 URL 参数的函数
  const updateUrlParams = useCallback(
    (tabId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('selectedTab', tabId);

      window.history.replaceState(
        {
          ...window.history.state,
          as: `?${params.toString()}`,
          url: `?${params.toString()}`,
        },
        '',
        `?${params.toString()}`,
      );
    },
    [searchParams],
  );
  // ✅ 滚动到指定的 tab
  const scrollToSelectedTab = useCallback(
    (tabId: string) => {
      if (!tabContainerRef.current) return;

      const tabElements = tabContainerRef.current.querySelectorAll(`.${styles.tabItem}`);
      const targetTabElement = Array.from(tabElements).find((element) => {
        const key = element.getAttribute('data-tab-id');
        return key === tabId;
      }) as HTMLElement;

      if (targetTabElement) {
        scrollTabToCenter(targetTabElement);
      }
    },
    [tabContainerRef],
  );

  // ✅ 初始化问题分类和选中项
  useEffect(() => {
    const list = questionsData?.data?.questionTypeList || [];
    if (!list.length) return;

    setTabList(list);

    if (!selectedTabItem) {
      // 从 URL 参数中获取选中的 tab
      const urlSelectedTab = searchParams.get('selectedTab');

      let targetTab: QuestionType | undefined;
      if (urlSelectedTab) {
        // 查找 URL 中指定的 tab 是否存在
        targetTab = list.find((item) => String(item.questionTypeId) === urlSelectedTab);
      }

      // 如果找不到 URL 中的 tab,则使用第一个
      if (!targetTab) {
        targetTab = list[0];
      }

      // 确保 targetTab 存在后再进行操作
      if (targetTab) {
        console.log('初始化选择的 tab:', targetTab);
        setSelectedTabItem(String(targetTab.questionTypeId));
        setQuestionList(targetTab.questionList || []);

        // 如果 URL 中没有 selectedTab 参数,添加默认的
        if (!urlSelectedTab) {
          updateUrlParams(String(targetTab.questionTypeId));
        }

        // 初始化完成后,滚动到选中的 tab
        setTimeout(() => {
          scrollToSelectedTab(String(targetTab.questionTypeId));
        }, 100); // 延迟确保 DOM 已渲染
      }
    }
  }, [
    questionsData?.data?.questionTypeList,
    selectedTabItem,
    searchParams,
    updateUrlParams,
    scrollToSelectedTab,
  ]);

  // ✅ 滚动到中心的函数,增加边界处理
  const scrollTabToCenter = (element: HTMLElement) => {
    if (!tabContainerRef.current || !element) return;

    const tabContainer = tabContainerRef.current;
    const containerWidth = tabContainer.offsetWidth;
    const tabWidth = element.offsetWidth;
    const tabLeft = element.offsetLeft;

    // 计算滚动位置,使选中的选项卡居中
    let scrollPosition = tabLeft - containerWidth / 2 + tabWidth / 2;

    // 边界处理:不能小于0,不能大于最大滚动距离
    const maxScroll = tabContainer.scrollWidth - containerWidth;
    scrollPosition = Math.max(0, Math.min(scrollPosition, maxScroll));

    // 平滑滚动效果
    tabContainer.scrollTo({
      left: scrollPosition,
      behavior: 'smooth',
    });
  };

  // ✅ 修改 handleTabClick 函数,使用 URL 参数
  const handleTabClick = (item: QuestionType, event: React.MouseEvent<HTMLDivElement>) => {
    console.log('切换到 tab:', item.questionTypeName, item.questionTypeId);

    setSelectedTabItem(String(item.questionTypeId));
    setQuestionList(item.questionList || []);

    // 更新 URL 参数
    updateUrlParams(String(item.questionTypeId));

    // 滚动选中项到中间位置
    scrollTabToCenter(event.currentTarget);
  };

  // ✅ 处理问题点击
  const handleQuestionClick = (question: QuestionDetail) => {
    // 构造基础参数字符串 (处理 hideHead, isFullScreen 和 statusBarHeight)
    const params = new URLSearchParams();
    if (hideHeader) params.append('hideHead', '1');
    if (isFullScreen) params.append('isFullScreen', '1');
    if (statusBarHeight) params.append('statusBarHeight', String(statusBarHeight));

    const queryString = params.toString() ? `?${params.toString()}` : '';
    // 注意:如果是追加到已有参数后面,需要用 & 连接
    const appendString = params.toString() ? `&${params.toString()}` : '';

    if (question?.jumpVirtualTutorial) {
      // 虚拟币教程跳转
      const url = `/vituralCoins${queryString}`;
      navigate(url);
      return;
    } else {
      // // flutter老版本
      // if (question.questionId === 63) {
      //   // EbPay 跳转
      //   // const url = `/mine/newerHelp/ebpay${queryString}`;
      //   const url = `/help_center/detail?questionId=63${appendString}`;
      //   navigate(url);
      //   return;
      // }
      // // flutter老版本
      // if (question.questionId === 3) {
      //   const url = `/help_center/detail?questionId=3${appendString}`;
      //   navigate(url);
      //   return;
      // }

      // 默认跳转到 detail 页面
      // 注意:这里原本就有 tabId 和 questionId 参数,所以使用 appendString
      navigate(`${PATHS.helpCenterDetail}?questionId=${question.questionId}${appendString}`);
    }
  };

  console.log('helpToolsList', helpToolsList?.data);

  useEffect(() => {
    if (isInFlutter()) {
      sendToFlutter('showHeader');
    }
  }, [isInFlutter, sendToFlutter]);

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-y-auto lg:overflow-initial">
      <div
        className={clsx(
          styles.helpCenter,
          'self-center w-full ',
          'flex-1 min-h-0 flex flex-col ',
          // 'overflow-y-auto lg:overflow-initial',
          'lg:max-w-[1220px]',
        )}
      >
        {!hideHeader && (
          <H5Header
            title={<span className="text-main">帮助中心</span>}
            pcHidden={true}
            isFixed={false}
            className="bg-transparent"
            left={
              <button type="button" onClick={() => navigate(-1)} aria-label="返回">
                <ArrowLeftSvg className="h-16px w-16px text-main" />
              </button>
            }
          />
        )}
        <div
          className={clsx(
            styles.helpCenterBanner,
            'flex  items-center  justify-center  overflow-hidden',
          )}
        >
          <div className={clsx(styles.toolsWrap)}>
            <div className={styles.kfInfo}>
              <div className={styles.kfText}>
                <div className={styles.kfName}>Hi~ 小7</div>
                <div className={styles.kfDesc}>OP7线上客服为您服务</div>
              </div>
              <div className={styles.kfAvatar}>
                {/* <LazyImage src={'/images/common/helpCenter/kf.png'} width={102} height={128} /> */}
              </div>
            </div>
            <div className={styles.heroSearchWrap}>
              <button
                type="button"
                className={styles.heroSearchBar}
                onClick={navigateToHelpSearch}
                aria-label="搜索帮助内容"
              >
                <Icon
                  src="/images/common/helpCenter/searchIcon.svg"
                  color="var(--Text-800)"
                  style={{ width: 18, height: 18, flexShrink: 0, opacity: 0.55 }}
                  draggable={false}
                />
                <span className={styles.heroSearchPlaceholder}>请输入你想搜索的内容</span>
              </button>
            </div>
            <Tools data={helpToolsList?.data || []} overlapHeroSearch />
          </div>
        </div>

        {/* ✅ 猜你想问部分 */}
        <div className={styles.contentItem}>
          <div className={styles.contentHeader}>
            <div className={styles.blueLine} />
            <span className={styles.contentHeaderTitle}>猜你想问</span>
          </div>

          {/* ✅ 标签栏 */}
          <div className={styles.contentTabWrap}>
            {/* <div className={styles.shadowLeft}></div> */}
            <div className={styles.contentTab} ref={tabContainerRef}>
              {tabList?.map((item) => (
                <div
                  key={item.questionTypeId}
                  data-tab-id={item.questionTypeId} // 添加这个属性用于查找元素
                  className={clsx(
                    styles.tabItem,
                    selectedTabItem === String(item.questionTypeId) && styles.active,
                  )}
                  onClick={(event) => handleTabClick(item, event)}
                >
                  {item.questionTypeName}
                </div>
              ))}
            </div>
            {/* <div className={styles.shadowRight}></div> */}
          </div>

          {/* ✅ 问题列表 */}
          <div className={styles.questionList}>
            {questionList.length > 0 &&
              questionList.map((question, index: number) => (
                <div
                  key={question.questionId}
                  className={styles.listItem}
                  onClick={() => handleQuestionClick(question)}
                >
                  {index + 1}.{question.questionName}
                  <div className={styles.forwardIcon} />
                </div>
              ))}
          </div>

          {/* ✅ 空状态 */}
          {questionList.length <= 0 && (
            <div className={styles.empty}>
              <ClientOnly>
                <Empty variant="card" />
              </ClientOnly>
            </div>
          )}
        </div>

        <SupportFooter />
        {/* 虚拟币列表 */}
        <Overlay
          show={showVirtualList}
          close={() => setShowVirtualList(false)}
          position={overlayPosition}
          maskClickClose
          zIndex={zIndexMap.loginModal}
        >
          <div></div>
          {/* <VirtualCoinList /> */}
          {/* {vipInfo && <VipDetail vipInfo={vipInfo} handleClose={handleCloseVipDetail} />} */}
        </Overlay>
      </div>
    </div>
  );
};

export default HelpCenterPage;

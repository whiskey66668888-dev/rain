import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { Loading } from 'antd-mobile';

import { QuestionDetail, useSearchQuestions } from '@/apis/origin/helpCenter/helpCenterInfo';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import Empty from '@/common/components/Empty';
import { PATHS } from '@/sites/op7/routes/paths';
import styles from './page.module.scss';
import { ClientOnly } from '@/common/components/ClientOnly';
import { ArrowLeftSvg } from '@/sites/op7/components/SvgIcons';
import useFlutterBridge from '@/sites/op7/hooks/useFlutterBridge';
import { useUnmount } from 'ahooks';

const SupportSearchContent = () => {
  const navigate = useNavigateWithLanguage();
  const { sendToFlutter, isInFlutter } = useFlutterBridge();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isMounted, setIsMounted] = useState(false);

  const hideHeader = isMounted && searchParams.get('hideHead') === '1';
  const isFullScreen = isMounted && searchParams.get('isFullScreen') === '1';
  const statusBarHeight = isMounted ? searchParams.get('statusBarHeight') || 0 : 0;
  // 从 URL 读取搜索词，实现返回后状态恢复
  const searchVal = isMounted ? (searchParams.get('q') ?? '') : '';

  const setSearchVal = (val: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (val) {
          next.set('q', val);
        } else {
          next.delete('q');
        }
        return next;
      },
      { replace: true },
    );
  };

  const { data: results, isLoading: loading, refetch } = useSearchQuestions(searchVal);

  console.log('search results:', results, 'loading:', loading);

  const handleSearch = () => {
    if (searchVal) {
      refetch();
    }
  };
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleQuestionClick = (question: QuestionDetail) => {
    // 1. 统一构造参数
    const params = new URLSearchParams();
    if (hideHeader) params.append('hideHead', '1');
    if (isFullScreen) params.append('isFullScreen', '1');
    if (statusBarHeight) params.append('statusBarHeight', String(statusBarHeight));
    // 用于直接拼接的 query string (例如 ?a=1&b=2)
    const queryString = params.toString() ? `?${params.toString()}` : '';
    // 用于追加到已有参数后的 string (例如 &a=1&b=2)
    const appendString = params.toString() ? `&${params.toString()}` : '';

    if (question?.jumpVirtualTutorial) {
      navigate(PATHS.virtualCoins + queryString);
    } else {
      // 兼容flutter老版本 - 特殊问题直接跳转
      if (question.questionId === 63) {
        // 如果是EBPay的特定问题，直接跳转到对应的页面
        navigate(PATHS.helpCenterwithId.replace(':id', 'ebpay') + queryString);
        return;
      }

      if (question.questionId === 3) {
        navigate(PATHS.helpCenterwithId.replace(':id', '3') + queryString);
        return;
      }

      // 默认跳转到detail页面
      navigate(`${PATHS.helpCenterDetail}?questionId=${question.questionId}${appendString}`);
    }
  };

  useEffect(() => {
    if (isInFlutter()) {
      sendToFlutter('hideHeader');
    }
  }, [isInFlutter, sendToFlutter]);

  useUnmount(() => {
    if (isInFlutter()) {
      sendToFlutter('showHeader');
    }
  });

  return (
    <div
      className={clsx(
        styles.supportPage,
        isFullScreen ? styles.fullScreen : '',
        'self-center w-full ',
        'flex-1 flex flex-col ',
        'overflow-y-auto lg:overflow-initial',
        'lg:max-w-[1220px]',
      )}
      style={{ paddingTop: isFullScreen ? `${statusBarHeight}px` : undefined }}
    >
      <div className={styles.supportHeader}>
        <div onClick={() => navigate(-1)}>
          <ArrowLeftSvg className="h-16px w-16px text-main" />
        </div>
        <div className={styles.center}>
          <i className={styles.searchIcon}></i>
          <input
            type="text"
            value={searchVal}
            className={styles.searchInput}
            placeholder="请输入搜索关键词"
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </div>
        <span className={styles.cancel} onClick={searchVal ? handleSearch : () => navigate(-1)}>
          {searchVal ? '搜索' : '取消'}
        </span>
      </div>
      <div className={styles.supportBody}>
        <div className={styles.list}>
          {results &&
            results.map((item, index) => (
              <div className={styles.item} key={index} onClick={() => handleQuestionClick(item)}>
                <div className={styles.title}>
                  {index + 1}.{item?.questionName}{' '}
                </div>
                <div className={styles.arrowRight} />
              </div>
            ))}
        </div>
        {loading && (
          <div className={styles.loadingContainer}>
            <Loading color="primary" />
          </div>
        )}
        {(!results || results.length === 0) && !loading && (
          <div className={styles.noData}>
            <ClientOnly>
              <Empty text="暂无数据" variant="card" />
            </ClientOnly>
          </div>
        )}
      </div>
    </div>
  );
};

// 主页面组件，使用 Suspense 包装内部组件
const SupportSearch = () => {
  return (
    <Suspense fallback={null}>
      <SupportSearchContent />
    </Suspense>
  );
};

export default SupportSearch;

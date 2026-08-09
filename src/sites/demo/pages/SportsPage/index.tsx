// 体育页
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ClientOnly } from '@/common/components/ClientOnly';

import {
  getRecommendMatchListReq,
  type MatchListParams,
  RecommendMatchListResponseData,
  useRecommendMatchListQuery,
} from '@/apis/fbSports/recommendMatchList';
import { getMenuListReq } from '@/apis/obSports/menu';
import { getFBTokenReq, getOBTokenReq } from '@/apis/origin/system';

import styles from './SportsPage.module.scss';
import VirtualListTest from '../../components/VirtualListTest';
const SportsPage: React.FC = () => {
  const { t } = useTranslation();
  // 使用状态管理查询参数，这样改变参数时查询会自动重新执行
  const [queryParams, setQueryParams] = useState<MatchListParams>({
    size: 15,
    random: true,
  });

  const { data: fbRecommendMatchList = [], isLoading } = useRecommendMatchListQuery(queryParams);

  // 点击时使用新参数重新获取例子
  const handleRefreshWithNewParams = (): void => {
    setQueryParams({
      size: 20,
      random: true,
    });
  };
  const handleGetOBMenuList = async (): Promise<void> => {
    const res = await getMenuListReq();
    console.log(res);
  };
  const handleGetMatchList = async (): Promise<void> => {
    const res = await getRecommendMatchListReq({
      size: 10,
      random: true,
    });
    console.log(res);
  };
  return (
    <div className={styles.sportsPage}>
      <h1 onClick={handleRefreshWithNewParams}>{t('sports.title')}</h1>
      <ClientOnly>
        <section className={'flex gap-4 flex-col'}>
          {isLoading ? (
            <div>加载中...</div>
          ) : (
            <>
              <h3 className="text-lg font-bold mb-4 text-text-primary bg-[var(--color-bg-secondary)]">
                FB接口随机推荐赛事列表数据轮询例子（需要token，只在客户端请求渲染） (
                {fbRecommendMatchList.length})
              </h3>
              <ul>
                {fbRecommendMatchList.map((match: RecommendMatchListResponseData) => (
                  <li key={match.id}>{match?.nm}</li>
                ))}
              </ul>
            </>
          )}
        </section>
      </ClientOnly>
      <button onClick={() => void getFBTokenReq(true)}>测试FB Token接口</button>
      <button onClick={() => void getOBTokenReq(false)}>测试OB Token接口</button>
      <button onClick={() => void handleGetOBMenuList()}>测试OB 获取体育的菜单列表接口</button>
      <button onClick={() => void handleGetMatchList()}>测试FB 获取体育的赛事列表接口</button>
      <VirtualListTest />
    </div>
  );
};

export default SportsPage;

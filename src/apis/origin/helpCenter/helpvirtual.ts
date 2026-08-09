import request from '@/core/sdk/request';
import { useQueryHook } from '@/core/query/hooks';
import { useQuery } from '@tanstack/react-query';

export interface VirtualCurrencyTutorialItem {
  id: number;
  virtualCurrencyName: string;
  logoIcon: string;
  answerTemplate: number;
  answerTitle: string;
  createBy: string;
  createTime: string;
  del: boolean;
  sort: number;
  status: boolean;
  updateBy: string;
  updateTime: string;
}

// 答案内容
export interface VirtualCurrencyAnswerItem {
  answerContentTitle: string;
  answertContent: string;
  resourceType: number;
  resourceAddress: string;
  downloadIcon: string;
}

// 二级tab
export interface VirtualCurrencySecondTab {
  secondTabId: number;
  secondTabName: string;
  contentTitle: string;
  answerList: VirtualCurrencyAnswerItem[];
}

// 一级tab
export interface VirtualCurrencyFirstTab {
  firstTabId: number;
  firstTabName: string;
  secondTabs: VirtualCurrencySecondTab[];
}

// 主体内容
export interface VirtualCurrencyTutorialDetail {
  answerTemplate: number;
  answerTitle: string;
  firstTabs: VirtualCurrencyFirstTab[];
  answerList: null; // 目前返回为 null，如后续有内容可调整类型
}

//获取虚拟币教程列表
export const getVirtualCurrencyTutorialListReq = () => {
  return request.get<VirtualCurrencyTutorialItem[], void>(
    '/api/helpCenter/getVirtualCurrencyTutorialList',
  );
};

//获取虚拟币教程内容-虚拟币教程模版
export const getVirtualCurrencyTutorialReq = (id: number) => {
  return request.get<VirtualCurrencyTutorialDetail, number>(
    `/api/helpCenter/getVirtualCurrencyTutorial?virtualCurrencyId=${encodeURIComponent(id)}`,
  );
};

//

// 获取虚拟币教程列表 - useQueryHook 封装
export const useVirtualCurrencyTutorialListQuery = () => {
  return useQueryHook({
    queryKey: ['virtualCurrencyTutorialList'],
    queryFn: () => getVirtualCurrencyTutorialListReq(),
  });
};

// 获取虚拟币教程内容 - useQuery 封装
export const useVirtualCurrencyTutorialQuery = (id: number) => {
  return useQuery({
    queryKey: ['virtualCurrencyTutorial', id],
    queryFn: () => getVirtualCurrencyTutorialReq(id),
    enabled: false,
  });
};

import request from '@/core/sdk/request';
import { useQuery } from '@tanstack/react-query';

// 问题类型
export interface HelpQuestionType {
  id: number;
  questionTypeName: string;
  createBy: string;
  createTime: string;
  updateTime: string;
  updateBy: string;
  sort: number;
  status: boolean;
  del: boolean;
}

// 问题详情
export interface HelpQuestionName {
  questionTypeId: number;
  helpQuestionType: HelpQuestionType;
  questionId: number;
  questionName: string;
  answerTemplate: number;
  answerTitle: string;
  contentTitle: string;
  sort: number;
  usefulCount: number;
  uselessCount: number;
  loadVirtualLink: boolean;
  createBy: string;
  createTime: string;
  updateTime: string;
  updateBy: string;
  status: boolean;
  del: boolean;
}

// tab信息
export interface HelpTutorialTab {
  id: number;
  questionId: number;
  helpQuestionName: HelpQuestionName;
  tabName: string;
  tabTitle: string;
  createBy: string;
  createTime: string;
  updateTime: string;
  updateBy: string;
  usefulCount: number;
  uselessCount: number;
  status: boolean;
  sort: number;
  del: boolean;
}

// 答案内容
export interface HelpTutorialAnswer {
  id: number;
  tutorialId: number;
  helpTutorialTab: HelpTutorialTab;
  answerContent: string;
  resourceType: number;
  resourceAddress: string;
  downloadIcon: string;
  sort: number;
  createBy: string;
  createTime: string;
  updateTime: string | null;
  updateBy: string | null;
  status: boolean;
  del: boolean;
}

// 一级tab
export interface HelpTutorialFirstTab {
  questionId: number;
  tutorialId: number;
  tabName: string;
  tabTitle: string;
  answerList: HelpTutorialAnswer[];
}

// 主体内容
export interface HelpTutorialContent {
  questionId: number;
  answerTitle: string;
  firstTabs: HelpTutorialFirstTab[];
}

//获取教程内容
export const getTutorialContentReq = (id: number) => {
  return request.get<HelpTutorialContent, number>(
    `/api/helpCenter/getTutorialContent?questionId=${encodeURIComponent(id)}`,
  );
};
// 获取教程内容 - react-query hook
export const useTutorialContentQuery = (id: number, options = {}) => {
  return useQuery({
    queryKey: ['tutorialContent', id],
    queryFn: () => getTutorialContentReq(id),
    select: (data) => data,
    enabled: false,
    ...options,
  });
};

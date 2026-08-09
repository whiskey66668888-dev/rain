import request from '@/core/sdk/request';
import { useQueryHook } from '@/core/query/hooks';
import { useQuery } from '@tanstack/react-query';
// ✅ 帮助工具类型
export interface HelpToolItem {
  id: number;
  toolsKey: string;
  toolsName: string;
  status: boolean;
  sort: number;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
  icon: string;
}

// ✅ 答案内容类型
export interface AnswerContent {
  answerContentTitle: string;
  answertContent: string;
  resourceType: number | null;
  resourceAddress: string;
  downloadIcon: string;
}

// ✅ 问题详情类型
export interface QuestionDetail {
  questionId: number;
  questionName: string;
  answerTemplate: number; // 1: 普通文本, 2: 图片, 3: 跳转虚拟教程, 4: 教程
  jumpVirtualTutorial: boolean;
  loadVirtualLink: boolean;
  answerTitle: string;
  contentTitle: string;
  answerList: AnswerContent[];
  tutorial: boolean;
}

// ✅ 问题分类类型
export interface QuestionType {
  questionTypeId: number;
  questionTypeName: string;
  questionList: QuestionDetail[];
}

// ✅ 问题列表响应类型
export interface QuestionsResponse {
  questionTypeList: QuestionType[];
}

// ✅ 安全中心请求参数
export interface GetSecurityCenterParams {
  loginName?: string;
  [key: string]: unknown;
}

// ✅ 安全绑定项类型
export interface SecurityBindItem {
  id: number;
  securityKey: string; // 'Microsoft_Token' | 'Safety_Email' | 'Safety_Phone' | 'Pay_Password' | 'Login_Password'
  title: string;
  describe: string;
  popInfo: string | null;
  detail: string | null;
  pop: boolean;
  recommendBind: boolean;
  bind: boolean;
}

// ✅ 账户绑定项类型
export interface AccountBindItem {
  title: string; // '银行卡' | '支付宝' | '数字货币' | '虚拟币'
  accountBindType:
    | 'BANK_ACCOUNT_BIND'
    | 'ZFB_ACCOUNT_BIND'
    | 'DIGITAL_ACCOUNT_BIND'
    | 'VIRTUAL_ACCOUNT_BIND';
  max: number; // 最大绑定数量
  number: number; // 已绑定数量
  bind: boolean; // 是否已绑定
}

// ✅ 绑定状态数据
export interface BindData {
  Microsoft_Token: boolean; // 微软安全令牌
  Safety_Email: boolean; // 安全邮箱
  Safety_Phone: boolean; // 安全手机号
  Pay_Password: boolean; // 支付密码
  Login_Password: boolean; // 登录密码
  Telegram: boolean; // Telegram
  Gesture_Password: boolean; // 手势密码
}

// ✅ 安全中心响应数据
export interface SecurityCenterData {
  percentage: number; // 安全等级百分比 (0-100)
  optimizationCount: number; // 可优化项数量
  securityBindList: SecurityBindItem[]; // 安全绑定列表
  accountBindList: AccountBindItem[]; // 账户绑定列表
  bindData: BindData; // 绑定状态快捷访问
}

// ================== API 请求 ==================

// 获取自主工具
export const getHelpToolsList = () => {
  return request.get<HelpToolItem[], void>('/api/helpCenter/getHelpToolsList');
};

// 获取问题和答案列表
export const getQuestionsReq = () => {
  return request.get<QuestionsResponse, void>('/api/helpCenter/getQuestions');
};

// ✅ 获取安全中心信息
export const getSecurityCenterReq = (data?: GetSecurityCenterParams) => {
  return request.post<SecurityCenterData, GetSecurityCenterParams>('/v3/member/securityCenter2', {
    isErrorToast: true,
    body: data || {},
  });
};
//模糊查询问题列表
export const searchQuestionReq = (questionName: string) => {
  return request.get<QuestionDetail[], string>(
    `/api/helpCenter/searchQuestion?questionName=${encodeURIComponent(questionName)}`,
  );
};
// ================== Hooks ==================

// ✅ Hook: 获取帮助工具列表
export const useHelpToolsList = () => {
  return useQueryHook({
    queryKey: ['helpToolsList'],
    queryFn: getHelpToolsList,
    refetchOnMount: 'always',
  });
};

// ✅ Hook: 获取问题列表
export const useQuestions = () => {
  return useQueryHook({
    queryKey: ['questions'],
    queryFn: getQuestionsReq,
    refetchOnMount: 'always',
  });
};

// ✅ Hook: 获取安全中心信息
export const useSecurityCenter = () => {
  return useQuery({
    queryKey: ['securityCenter'],
    queryFn: getSecurityCenterReq,
    refetchOnMount: 'always',
  });
};

// ✅ Hook: 搜索问题
export const useSearchQuestions = (questionName: string) => {
  return useQuery({
    queryKey: ['searchQuestions', questionName],
    queryFn: () => searchQuestionReq(questionName),
    select: (response) => response.data,
    enabled: false,
  });
};

// ================== 辅助函数 ==================

// ✅ 检查特定安全项是否已绑定
export const isSecurityBound = (
  securityData: SecurityCenterData | undefined,
  securityKey: keyof BindData,
): boolean => {
  return securityData?.bindData?.[securityKey] ?? false;
};

// ✅ 获取特定账户类型的绑定信息
export const getAccountBindInfo = (
  securityData: SecurityCenterData | undefined,
  accountType: AccountBindItem['accountBindType'],
): AccountBindItem | undefined => {
  return securityData?.accountBindList.find((item) => item.accountBindType === accountType);
};

// ✅ 获取未绑定的安全项
export const getUnboundSecurityItems = (
  securityData: SecurityCenterData | undefined,
): SecurityBindItem[] => {
  return securityData?.securityBindList.filter((item) => !item.bind) ?? [];
};

// ✅ 获取推荐绑定的安全项
export const getRecommendedSecurityItems = (
  securityData: SecurityCenterData | undefined,
): SecurityBindItem[] => {
  return securityData?.securityBindList.filter((item) => item.recommendBind && !item.bind) ?? [];
};

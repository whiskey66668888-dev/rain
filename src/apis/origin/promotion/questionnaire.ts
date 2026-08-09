import { useQuery, useMutation } from '@tanstack/react-query';
import request from '@/core/sdk/request';
import type { ResponseData } from '@/core/sdk/request/model';

/* ====================== */
/* ===== types ========== */
/* ====================== */

/** 单道题目 */
export interface PrizeQuestion {
  prizeQuestionId: number;
  title: string;
  answerContent: string;
  opinionTitle: string;
  /** 该题是否已完成 */
  finish: boolean;
  /** 已选评分（0 表示未评分） */
  prizeScore: number;
  /** 已填文字意见 */
  opinionContent: string;
}

/** 获取问卷数据的响应体 */
export interface QuestionnaireData {
  /**
   * 有奖问卷完成状态
   * - 0: 未开始
   * - 1: 进行中（中途退出）
   * - 2: 本次提交成功
   * - 9: 已完成
   */
  finishStatus: number;
  /** 已完成步骤数（用于进度显示） */
  finishPrizeQuestionStep: number;
  /** 问卷最大步骤数 */
  maxPrizeQuestionStep: number;
  /** 最后一步的问题 ID */
  lastStepPrizeQuestionId: number;
  /** 当前有奖问卷详情说明文案 */
  prizeQuestionDetail: string;
  /** 所有题目列表，按顺序回答 */
  allQuestions: PrizeQuestion[];
}

/** 获取问卷数据参数 */
export interface GetDataParams {
  id: number;
}

/** 单条提交答案 */
export interface SubmitAnswer {
  /** 对应题目 ID（字段名与后端一致，注意拼写） */
  questinId: number;
  /** 评分 */
  score: number;
  /** 文字意见（可为空字符串） */
  opinionContent: string;
}

/** 提交问卷参数 */
export interface SubmitPrizeQuestionParams {
  /** 奖励类型 ID */
  bonusTypeId: number;
  /** 活动 ID */
  id: number;
  /**
   * 提交类型
   * - 1: 中途保存进度
   * - 9: 完成全部题目并提交
   */
  submitType: 1 | 9;
  /** 答案列表 */
  answers: SubmitAnswer[];
}

/** 提交问卷响应体 */
export interface SubmitPrizeQuestionResponse {
  info: string;
}

/* ====================== */
/* ===== request ======== */
/* ====================== */

/** 查询有奖问卷活动数据 */
export const getData = (params: GetDataParams): Promise<ResponseData<QuestionnaireData>> => {
  return request.post<QuestionnaireData, GetDataParams>('/json/discount/data/getData', {
    isErrorToast: false,
    tokenExpiresnotGoLogin: true,
    body: params,
  });
};

/** 提交有奖问卷（保存进度或最终提交） */
export const submitPrizeQuestion = (
  params: SubmitPrizeQuestionParams,
): Promise<ResponseData<SubmitPrizeQuestionResponse>> => {
  return request.post<SubmitPrizeQuestionResponse, SubmitPrizeQuestionParams>(
    '/json/discount/save/submitPrizeQuestion',
    {
      isErrorToast: true,
      tokenExpiresnotGoLogin: true,
      headers: { 'Content-Type': 'application/json' },
      body: params,
    },
  );
};

/* ====================== */
/* ===== hooks ========== */
/* ====================== */

/**
 * 获取有奖问卷数据
 * @param id 活动 ID
 */
export const useQuestionnaireQuery = (id: number) => {
  return useQuery({
    queryKey: ['questionnaire', id],
    queryFn: () => getData({ id }),
    staleTime: 0,
    select: (response) => response.data,
  });
};

/**
 * 提交有奖问卷（保存进度 / 最终提交）
 */
export const useSubmitPrizeQuestionMutation = () => {
  return useMutation({
    mutationFn: submitPrizeQuestion,
  });
};

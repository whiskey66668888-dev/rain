import { useQuery } from '@tanstack/react-query';
import request from '@/core/sdk/request';
import { ResponseData } from '@/core/sdk/request/model';
import { useQueryHook } from '@/core/query/hooks';
/* ====================== */
/* ===== types ========== */
/* ====================== */

// 热门事件数据
export interface HotEventItem {
  eventId: number;
  subIcon: string;
  subTitle: string;
  imageUrl: string;
  imageUrl2: string | null;
  imageUrl3: string | null;
  imageUrl4: string | null;
  imageUrl5: string | null;
  subIconBlack: string | null;
  subBeginTime: number;
  subEndTime: number;
  commentSwitch: number;
  discountStatus: number;
  title?: string;
  content?: string;
  createTime?: string;
  commentCount?: number;
}

// 评论数据类型
export interface CommentItem {
  id: number;
  loginName: string;
  avatarAddress: string | null;
  vipLevel: number;
  comments: string;
  addTime: number;
  likeNum: number;
  myLike: boolean;
  eventId?: number;
  isTop?: boolean;
}

// 我的评论项
export interface MyCommentItem {
  comments: string;
  addTime: number;
  displayStatus: boolean;
  cash: number;
  status: number;
  failInfo?: string;
}

// 我的评论响应
export interface MyCommentResponse {
  list: MyCommentItem[];
}

// 所有评论响应
export interface AllCommentResponse {
  list: CommentItem[];
  total?: number;
}

// 热门事件评论参数
export interface HotEventSendParams {
  eventId: number;
  comments: string;
}

// 获取我的评论参数
export interface GetMyCommentParams {
  eventId: number;
}

// 获取置顶评论参数
export interface GetTopCommentParams {
  eventId: number;
}

// 获取所有评论参数
export interface GetAllCommentParams {
  eventId: number;
  id?: number;
}

// 点赞/取消点赞参数
export interface LikeParams {
  id: number;
  ind: number;
}

// 有奖问卷获取数据参数
export interface GetDataParams {
  activityId?: string;
  [key: string]: unknown;
}

// 提交有奖问卷参数
export interface SubmitPrizeQuestionParams {
  activityId: string;
  answers: Array<{
    questionId: string;
    answer: string | string[];
  }>;
  [key: string]: unknown;
}

/* ====================== */
/* ===== request ======== */
/* ====================== */

// 热门事件列表
export const getHoteventinfolist = (): Promise<ResponseData<HotEventItem[]>> => {
  return request.post<HotEventItem[], void>('/api/hotevent/infolist', {
    isErrorToast: false,
    tokenExpiresnotGoLogin: true,
    transformResponse: (data) => {
      return {
        ...data,
        data: data.data,
      };
    },
  });
};

// 热门事件详情
export const getHoteventinfo = (): Promise<ResponseData<HotEventItem>> => {
  return request.post<HotEventItem, void>('/api/hotevent/info', {
    isErrorToast: false,
    tokenExpiresnotGoLogin: true,
  });
};

// ✅ 热门事件发表评论（支持 FormData 和 JSON）
export const HoteventSend = (
  data: HotEventSendParams | FormData,
): Promise<ResponseData<{ success: boolean }>> => {
  return request.post<{ success: boolean }, HotEventSendParams | FormData>('/api/hotevent/save', {
    body: data,
    tokenExpiresnotGoLogin: true,
  });
};

// 获取我的评论记录
export const getMycomment = (
  data: GetMyCommentParams,
): Promise<ResponseData<MyCommentResponse>> => {
  return request.post<MyCommentResponse, GetMyCommentParams>('/api/hotevent/mycomment', {
    isErrorToast: true,
    tokenExpiresnotGoLogin: true,
    body: data,
  });
};

// 获取置顶评论
export const getTopComment = (
  data: GetTopCommentParams,
): Promise<ResponseData<AllCommentResponse>> => {
  return request.post<AllCommentResponse, GetTopCommentParams>(
    '/api/hotevent/getCommentByUserName',
    {
      isErrorToast: true,
      tokenExpiresnotGoLogin: true,
      body: data,
    },
  );
};

// 获取所有评论
export const getAllcomment = (
  data: GetAllCommentParams,
): Promise<ResponseData<AllCommentResponse>> => {
  return request.post<AllCommentResponse, GetAllCommentParams>('/api/hotevent/allcomment', {
    isErrorToast: true,
    tokenExpiresnotGoLogin: true,
    body: data,
  });
};

// 获取网站设置
export const getPreInfoReq = (): Promise<ResponseData<Record<string, unknown>>> => {
  return request.get<Record<string, unknown>, void>('/api/website/setting', {
    tokenExpiresnotGoLogin: true,
  });
};

// 点赞
export const likeAdd = (data: LikeParams): Promise<ResponseData<{ success: boolean }>> => {
  return request.post<{ success: boolean }, LikeParams>('/api/hotevent/comment/likenum/add', {
    isErrorToast: true,
    tokenExpiresnotGoLogin: true,
    body: data,
  });
};

// 取消点赞
export const likeSub = (data: LikeParams): Promise<ResponseData<{ success: boolean }>> => {
  return request.post<{ success: boolean }, LikeParams>('/api/hotevent/comment/likenum/sub', {
    isErrorToast: true,
    tokenExpiresnotGoLogin: true,
    body: data,
  });
};

// 查询有奖问卷活动数据
export const getData = (data: GetDataParams): Promise<ResponseData<unknown>> => {
  return request.post<unknown, GetDataParams>('/json/discount/data/getData', {
    isErrorToast: false,
    tokenExpiresnotGoLogin: true,
    body: data,
  });
};

// 提交有奖问卷
export const submitPrizeQuestion = (
  data: SubmitPrizeQuestionParams,
): Promise<ResponseData<{ success: boolean }>> => {
  return request.post<{ success: boolean }, SubmitPrizeQuestionParams>(
    '/json/discount/save/submitPrizeQuestion',
    {
      isErrorToast: true,
      tokenExpiresnotGoLogin: true,
      headers: { 'Content-Type': 'application/json' },
      body: data,
    },
  );
};

/* ====================== */
/* ===== hooks ========== */
/* ====================== */

/**
 * 获取热门事件列表
 */
export const useHotEventListQuery = () => {
  return useQueryHook({
    queryKey: ['hotEventList'],
    queryFn: getHoteventinfolist,
    staleTime: 5 * 60 * 1000,
    // select: (response) => response.data,
  });
};

/**
 * 获取热门事件详情
 */
export const useHotEventInfoQuery = () => {
  return useQuery({
    queryKey: ['hotEventInfo'],
    queryFn: getHoteventinfo,
    staleTime: 5 * 60 * 1000,
    select: (response) => response.data,
  });
};

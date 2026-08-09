import request from '@/core/sdk/request';
export interface LikeOrUnlikeParams {
  questionId?: number; // 问题ID，可选
  virtualcCurrencySecondTabId?: number; // 虚拟币二级tabId，可选
  tutorialTabId?: number; // 教程tabId，可选
  lickOrUnLike?: number; // 1: 点赞, 2: 取消点赞，可选
}
export const likeOrUnlike = (data: LikeOrUnlikeParams) => {
  return request.post<boolean, LikeOrUnlikeParams>('/api/helpCenter/likeOrUnlike', {
    body: {
      ...data,
    },
  });
};

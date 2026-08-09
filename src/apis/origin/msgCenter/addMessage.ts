import request from '@/core/sdk/request';
import { EMessageCategory } from '@/apis/commonSports/constants';

// imgDetail: [{"img":"/message/20260310/202603100924261541892.png","id":"202603100924261541892"}]

export interface TImgDetailItem {
  img: string;
  id: string;
}

export interface TAddMessageParams {
  title: string;
  category?: EMessageCategory;
  messageInfo: string;
  newsId?: number;
  imgDetail: string;
}

/**
 * 添加站内信
 * 可以是新增消息，不需要传 newsId
 * 也可以是回复消息，不需要传 category
 */
export const addMessageReq = (params: TAddMessageParams) => {
  return request.post<string, TAddMessageParams>('/api/center/news/addMessage', {
    body: params,
  });
};

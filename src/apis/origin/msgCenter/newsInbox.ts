import request from '@/core/sdk/request';
import { EMessageCategory, EMessageStatus } from '@/apis/commonSports/constants';

export interface TNewsMsgItem {
  /** 0: 未读 1: 已读 */
  messageStatus: EMessageStatus;
  imgUrl: string;
  senderName: string;
  addTime: string;
  messageInfo: string;
  receiverName: string;
  id: number;
  category: EMessageCategory;
  title: string;
  /** 是否可回复 */
  isReply?: boolean;
  imgList: {
    img: string;
    id: string;
  }[];
}

export const getNewsInboxReq = () => {
  return request.post<TNewsMsgItem[], unknown>('/api/center/news/inbox', {
    body: {},
  });
};

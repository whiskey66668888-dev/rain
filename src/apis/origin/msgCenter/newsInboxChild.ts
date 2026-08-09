import request from '@/core/sdk/request';
import { EMessageCategory, EMessageStatus } from '@/apis/commonSports/constants';

interface TNewsInboxChildParams {
  id: number;
}

export interface TNewsInboxChildItem {
  messageStatus: EMessageStatus;
  imgUrl: string;
  senderName: string;
  addTime: string;
  messageInfo: string;
  receiverName: string;
  id: number;
  category: EMessageCategory;
  title: string;
  parentId: number;
  isReply: boolean;
  imgList: {
    img: string;
    id: string;
  }[];
}

export const getNewsInboxChildReq = (params: TNewsInboxChildParams) => {
  return request.post<TNewsInboxChildItem[], TNewsInboxChildParams>(
    '/api/center/news/newsInboxChild',
    {
      body: params,
    },
  );
};

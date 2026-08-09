import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import isEmpty from 'lodash/isEmpty';

import {
  getMycomment,
  HoteventSend,
  likeAdd,
  likeSub,
  getAllcomment,
  getTopComment,
  getHoteventinfolist,
} from '@/apis/origin/promotion/getHot';
import type { HotEventItem, CommentItem, HotEventSendParams } from '@/apis/origin/promotion/getHot';
import { toast } from '@/common/components/Toast';
import useFlutterBridge from '@/sites/op7/hooks/useFlutterBridge';

/* ====================== */
/* ===== types ========== */
/* ====================== */

// Hook 配置选项
export interface UseHotEventDataOptions {
  onSendSuccess?: () => void;
}

// 扩展的点赞参数（包含索引）
interface LikeParamsWithIndex {
  ind: number; // 评论在列表中的索引
  id: number; // 评论ID
}

/* ====================== */
/* ===== Hook =========== */
/* ====================== */

export const useHotEventData = (options?: UseHotEventDataOptions) => {
  const queryClient = useQueryClient();
  const { sendToFlutter, isInFlutter } = useFlutterBridge();
  const [hotData, setHotData] = useState<HotEventItem | null>(null);
  const [hotList, setHotList] = useState<HotEventItem[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [pending, setPending] = useState(true);
  const [allcomment, setAllcomment] = useState<CommentItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  // ✅ 获取我的评论
  const { data: mycomment, refetch: refetchMyComment } = useQuery({
    queryKey: ['mycomment', hotData?.eventId],
    queryFn: () => getMycomment({ eventId: hotData!.eventId }),
    enabled: !!hotData?.eventId,
    staleTime: 0,
    select: (response) => response.data,
  });

  // ✅ 发送评论
  const { mutate: sendComment, isPending: sendLoading } = useMutation({
    mutationFn: HoteventSend,
    onSuccess: async () => {
      toast({
        description: '发送成功',
        type: 'success',
        duration: 1500,
      });

      // 刷新我的评论
      await refetchMyComment();

      // 刷新主题列表数据
      try {
        const response = await getHoteventinfolist();
        const list = response.data || [];

        if (!isEmpty(list) && Array.isArray(list) && list.length > 0) {
          setHotList(list);
          const targetIndex = Math.min(currentEventIndex, list.length - 1);
          setHotData(list[targetIndex] ?? null);
        } else {
          setHotList([]);
          setHotData(null);
        }
      } catch (error) {
        console.error('刷新主题列表失败', error);
      }

      // 使主题列表缓存失效
      queryClient.invalidateQueries({ queryKey: ['hotEventList'] });

      options?.onSendSuccess?.();
    },
  });

  // ✅ 点赞
  const { mutate: addLike } = useMutation({
    mutationFn: (params: LikeParamsWithIndex) => {
      const { ...likeParams } = params;
      return likeAdd(likeParams);
    },
    onSuccess: (_data, variables) => {
      const index = variables.ind;
      setAllcomment((prev) => {
        const newComments = [...prev];
        if (!newComments[index]) return prev;
        newComments[index] = {
          ...newComments[index],
          myLike: true,
          likeNum: (newComments[index].likeNum ?? 0) + 1,
        };
        return newComments;
      });
    },
  });

  // ✅ 取消点赞
  const { mutate: removeLike } = useMutation({
    mutationFn: (params: LikeParamsWithIndex) => {
      const { ...likeParams } = params;
      return likeSub(likeParams);
    },
    onSuccess: (_data, variables) => {
      const index = variables.ind;
      setAllcomment((prev) => {
        const newComments = [...prev];
        if (!newComments[index]) return prev;
        newComments[index] = {
          ...newComments[index],
          myLike: false,
          likeNum: Math.max((newComments[index].likeNum ?? 0) - 1, 0),
        };
        return newComments;
      });
    },
  });

  // ✅ 首次获取所有评论
  const firstGetAllcomment = useCallback(async (id: number) => {
    try {
      setPending(true);
      const [allRes, topRes] = await Promise.all([
        getAllcomment({ eventId: id }),
        getTopComment({ eventId: id }),
      ]);

      // 处理所有评论响应
      const allList = allRes.data?.list || [];

      // 处理置顶评论响应
      const topList = (topRes.data?.list || []).map((item) => ({
        ...item,
        isTop: true,
      }));

      // 合并评论（置顶在前，去重）
      const topIds = new Set(topList.map((item) => item.id));
      const filteredList = allList.filter((item) => !topIds.has(item.id));
      const newList = [...topList, ...filteredList];

      setAllcomment(newList);

      if (allList.length < 20) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('获取评论失败', error);
    } finally {
      setPending(false);
    }
  }, []);

  // ✅ 加载更多评论
  const loadMore = useCallback(async () => {
    if (pending || allcomment.length <= 0) return;

    const lastItem = allcomment[allcomment.length - 1];
    if (!lastItem) return;

    try {
      const response = await getAllcomment({
        eventId: (hotData as HotEventItem)?.eventId,
        id: lastItem.id,
      });

      const newList = response.data?.list || [];

      if (newList.length > 0) {
        setAllcomment((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const filtered = newList.filter((item) => !existingIds.has(item.id));
          return [...prev, ...filtered];
        });

        if (newList.length < 20) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('加载更多评论失败', err);
      setHasMore(false);
    }
  }, [pending, allcomment, hotData]);

  // ✅ 切换主题
  const handleSwitchEvent = useCallback(
    (index: number) => {
      if (index === currentEventIndex || pending) return;

      setCurrentEventIndex(index);
      const selectedEvent = hotList[index];

      if (selectedEvent) {
        if (isInFlutter()) {
          sendToFlutter('eggHotTopicClick');
        }
        setHotData(selectedEvent);
        setAllcomment([]);
        setHasMore(true);
        firstGetAllcomment(selectedEvent.eventId);

        if (scrollRef.current) {
          scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    },
    [currentEventIndex, pending, hotList, isInFlutter, firstGetAllcomment, sendToFlutter],
  );

  // ✅ 初始化数据
  const getInitData = useCallback(
    async (init = false) => {
      if (init) {
        setLoading(true);
      }
      setPending(true);
      setHasMore(true);

      try {
        const response = await getHoteventinfolist();
        const list = response.data || [];

        if (!isEmpty(list) && Array.isArray(list) && list.length > 0) {
          setHotList(list);
          const targetIndex = init ? 0 : Math.min(currentEventIndex, list.length - 1);
          const targetEvent = list[targetIndex];

          setHotData(targetEvent ?? null);
          setCurrentEventIndex(targetIndex);
          if (targetEvent) {
            firstGetAllcomment(targetEvent.eventId);
          }
        } else {
          setHotList([]);
          setHotData(null);
        }
      } catch (e) {
        console.error('获取热门事件列表失败:', e);
        setHotList([]);
        setHotData(null);
        throw e;
      } finally {
        if (init) {
          console.log('初始数据加载完成');
          setLoading(false);
        }
        setPending(false);
      }
    },
    [currentEventIndex, firstGetAllcomment],
  );

  return {
    // 状态
    hotData,
    hotList,
    currentEventIndex,
    pending,
    allcomment,
    hasMore,
    loading,
    mycomment,
    sendLoading,
    scrollRef,

    // 方法
    setHotData,
    setAllcomment,
    setHasMore,
    runHoteventSend: sendComment,
    runlikeAdd: addLike,
    runlikeSub: removeLike,
    runGetMycomment: refetchMyComment,
    firstGetAllcomment,
    loadMore,
    handleSwitchEvent,
    getInitData,
  };
};

export default useHotEventData;

// ✅ 导出类型
export type { HotEventItem, CommentItem, HotEventSendParams };

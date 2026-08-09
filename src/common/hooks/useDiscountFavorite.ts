import { useEffect, useState } from 'react';
import { useAppSelector } from '@/core/store/hooks';
import { toast } from '@/common/components/Toast';
import {
  favoritesCheck,
  saveDiscountFavorite,
  cancelDiscountFavorite,
} from '@/apis/origin/inviteFriends';

export const useDiscountFavorite = (discountId: number) => {
  const isLogin = useAppSelector((s) => s.user.userInfo.isLogin);
  const [isSaved, setIsSaved] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    if (!isLogin || !discountId) return;
    void favoritesCheck({ discountId }).then((res) => {
      setIsSaved(Boolean(res?.data?.favorites));
    });
  }, [isLogin, discountId]);

  const toggleFavorite = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!isLogin) {
      toast({ type: 'info', description: '请先登录' });
      return;
    }
    if (favLoading) return;
    setFavLoading(true);
    try {
      if (isSaved) {
        await cancelDiscountFavorite({ discountId });
        setIsSaved(false);
        toast({ type: 'success', description: '取消成功' });
      } else {
        await saveDiscountFavorite({ discountId });
        setIsSaved(true);
        toast({ type: 'success', description: '收藏成功' });
      }
    } catch {
      // 错误由 request 统一处理或静默
    } finally {
      setFavLoading(false);
    }
  };

  return { isSaved, favLoading, toggleFavorite };
};

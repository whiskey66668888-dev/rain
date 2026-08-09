import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '@/core/store/hooks';
import { usePreInfoQuery } from '@/apis/origin/setting';
import { useServiceInfoQuery } from '@/apis/origin/customerService';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import {
  getInWorkTimeByRange,
  hasAvailableServiceData,
  isInHotlineWorkTime,
} from '@/sites/op7/utils/customerServiceTime';
import CustomerServiceModal from '../components/CustomerServiceModal';
import OnlineCustomerService from '../components/OnlineCustomerService';
import { toast } from '@/common/components/Toast';

export interface UseOnlineCustomerServiceOptions {
  mustShowCustomer?: boolean;
}

export interface UseOnlineCustomerServiceReturn {
  openCustomerService: (options?: UseOnlineCustomerServiceOptions) => void;
  CustomerServiceModal: React.ReactNode;
}

/**
 * 新客服：优先 getCustomerConfiguration；单线路且满足条件时直达 iframe。
 * 未开启新客服时回退 kefu1 / kefu2 旧逻辑。
 */
export function useOnlineCustomerService(
  defaultOptions?: UseOnlineCustomerServiceOptions,
): UseOnlineCustomerServiceReturn {
  const [showChoose, setShowChoose] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const [kefuUrl, setKefuUrl] = useState<string | null>(null);
  const [pendingNoticeUrl, setPendingNoticeUrl] = useState<string | null>(null);
  const { t } = useTranslation();
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const { data: preInfo } = usePreInfoQuery();
  const { data: serviceInfo } = useServiceInfoQuery(1);
  const navigate = useNavigateWithLanguage();
  const useNewService = Boolean(serviceInfo?.isOpen);

  const openIframeWithNotice = useCallback(
    (url: string) => {
      if (preInfo?.windowStatus) {
        setPendingNoticeUrl(url);
        setShowChoose(true);
        return;
      }
      setKefuUrl(url);
      setShowIframe(true);
    },
    [preInfo?.windowStatus],
  );

  const tryDirectOpenByServiceInfo = useCallback((): boolean => {
    if (!serviceInfo) return false;

    const cusList = serviceInfo.cusList ?? [];
    const phList = serviceInfo.phList ?? [];
    const hasHotline = phList.some((item) => isInHotlineWorkTime(item));

    // 无在线线路且无可用热线时提示（不依赖 isOpen，避免被提前 return 挡住）
    if (cusList.length === 0 && !hasHotline) {
      toast({
        type: 'warning',
        title: t('modals.customerService.noRoutesAvailable'),
      });
      return true;
    }

    if (!serviceInfo.isOpen) return false;
    if (cusList.length !== 1) return false;

    let isInWorkTime = false;
    if (phList.length > 0) {
      isInWorkTime = getInWorkTimeByRange(phList[0]?.workTime);
    }
    if (phList.length > 0 && isInWorkTime) return false;
    if (phList.length === 0 || !isInWorkTime) {
      const url = String(cusList[0]?.configureUrl ?? '').trim();
      if (!url) return false;
      openIframeWithNotice(url);
      return true;
    }
    return false;
  }, [openIframeWithNotice, serviceInfo, t]);

  const openLegacyCustomerService = useCallback(() => {
    const k1 = String(preInfo?.kefu1 ?? '').trim();
    const k2 = String(preInfo?.kefu2 ?? '').trim();
    const has1 = Boolean(k1);
    const has2 = Boolean(k2);

    if (has1 && !has2) {
      openIframeWithNotice(k1);
      return;
    }
    if (!has1 && has2) {
      openIframeWithNotice(k2);
      return;
    }
    setShowChoose(true);
  }, [openIframeWithNotice, preInfo?.kefu1, preInfo?.kefu2]);

  const openCustomerService = useCallback(
    (options?: UseOnlineCustomerServiceOptions) => {
      const mustShowCustomer = options?.mustShowCustomer ?? defaultOptions?.mustShowCustomer;
      if (preInfo?.jumpHelperCenter === '1' && !mustShowCustomer) {
        navigate(PATHS.helpCenter);
        return;
      }

      if (tryDirectOpenByServiceInfo()) return;

      if (useNewService && hasAvailableServiceData(serviceInfo)) {
        setShowChoose(true);
        return;
      }

      openLegacyCustomerService();
    },
    [
      defaultOptions?.mustShowCustomer,
      navigate,
      openLegacyCustomerService,
      preInfo?.jumpHelperCenter,
      serviceInfo,
      tryDirectOpenByServiceInfo,
      useNewService,
    ],
  );

  const resetCustomerServiceState = useCallback(() => {
    setShowChoose(false);
    setShowIframe(false);
    setKefuUrl(null);
    setPendingNoticeUrl(null);
  }, []);

  const handleCloseChoose = resetCustomerServiceState;

  const handleSelectChannel = useCallback((url: string) => {
    setShowChoose(false);
    setPendingNoticeUrl(null);
    setKefuUrl(url);
    setShowIframe(true);
  }, []);

  const handleCloseIframe = resetCustomerServiceState;

  const CustomerServiceModalNode = useMemo(
    () => (
      <>
        <OnlineCustomerService
          show={showChoose}
          onClose={handleCloseChoose}
          isMobile={isMobile}
          onSelectChannel={handleSelectChannel}
          pendingNoticeUrl={pendingNoticeUrl}
          onNoticeConfirmed={handleSelectChannel}
        />
        <CustomerServiceModal
          show={showIframe}
          onClose={handleCloseIframe}
          kefuUrl={kefuUrl}
          isMobile={isMobile}
        />
      </>
    ),
    [
      showChoose,
      showIframe,
      handleCloseChoose,
      handleCloseIframe,
      handleSelectChannel,
      kefuUrl,
      isMobile,
      pendingNoticeUrl,
    ],
  );

  return { openCustomerService, CustomerServiceModal: CustomerServiceModalNode };
}

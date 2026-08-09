import { useState, useEffect } from 'react';
// styles
import styles from './page.module.scss';

import { useThrottleFn } from 'ahooks';
import clsx from 'clsx';
import useFlutterBridge from '@/sites/op7/hooks/useFlutterBridge';
import { useSearchParams } from 'react-router-dom';
import {
  useVirtualCurrencyTutorialListQuery,
  VirtualCurrencyTutorialItem,
} from '@/apis/origin/helpCenter/helpvirtual';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';
import H5Header from '@/sites/op7/components/H5Header';
import LazyImage from '@/common/components/LazyImage';
const VituralCoins = () => {
  const { sendToFlutter, isInFlutter } = useFlutterBridge();
  const [searchParams] = useSearchParams();
  const navigate = useNavigateWithLanguage();
  const openCustomerService = useOpenCustomerService(true);
  const hideHeader = searchParams.get('hideHead') === '1';
  const isFullScreen = searchParams.get('isFullScreen') === '1';
  const statusBarHeight = searchParams.get('statusBarHeight') || 0;
  const [tabList, setTabList] = useState<VirtualCurrencyTutorialItem[]>([]);
  // const { tutorialList } = helpStore;
  const isApp = decodeURIComponent(searchParams.get('isApp') || '');

  const { data: tutorialList } = useVirtualCurrencyTutorialListQuery();

  useEffect(() => {
    const list = tutorialList?.data || [];
    if (!list.length) return;
    setTabList(list);
  }, [tutorialList]);

  const handleClick = (item: VirtualCurrencyTutorialItem) => {
    // 1. 统一构造参数
    const params = new URLSearchParams();
    if (hideHeader) params.append('hideHead', '1');
    if (isFullScreen) params.append('isFullScreen', '1');
    if (statusBarHeight) params.append('statusBarHeight', String(statusBarHeight));
    // 用于直接拼接 (例如 ?a=1)
    // const queryString = params.toString() ? `?${params.toString()}` : '';
    // 用于追加参数 (例如 &a=1)
    const appendString = params.toString() ? `&${params.toString()}` : '';

    // if (item.id === 1) {
    //   // Binance充值
    //   navigate(`/mine/newerHelp/binance${queryString}`);
    //   return;
    // } else if (item.id === 2) {
    //   navigate(`/mine/newerHelp/gateio${queryString}`);
    //   return;
    // } else if (item.id === 3) {
    //   navigate(`/mine/newerHelp/imtoken${queryString}`);
    //   return;
    // } else if (item.id === 4) {
    //   navigate(`/mine/newerHelp/okx${queryString}`);
    //   return;
    // }

    // 对于其他情况，跳转到 detail 页面
    navigate(`${PATHS.helpCenterDetail}?isVirtualCoin=true&virtualId=${item.id}${appendString}`);
  };
  const handleBack = () => {
    if (isInFlutter() && isApp === '1') {
      sendToFlutter('goExistVirturalCoin');
    } else {
      navigate(-1);
    }
  };
  const { run: handleHelpClick } = useThrottleFn(
    () => {
      if (isInFlutter()) {
        sendToFlutter('goCustomerService');
      } else {
        openCustomerService();
      }
    },
    {
      wait: 1000, // 冷却时间，建议 1000ms，防止用户疯狂连点
      leading: true, // 点击时立即触发
      trailing: false, // 冷却结束后不再次触发（关键配置）
    },
  );
  return (
    <div
      className={clsx(
        styles.supportPage,
        hideHeader ? styles.noHeader : '',
        isFullScreen ? styles.fullScreen : '',
        'lg:max-w-[1200px]',
        'mx-auto',
        'w-full',
      )}
      style={{
        paddingTop: isFullScreen ? `calc(${44 / 3.75}vw + ${statusBarHeight}px)` : undefined,
      }}
    >
      {!hideHeader && (
        <H5Header title="快捷虚拟币" onBack={handleBack} />
        // <Header
        //   center={'快捷虚拟币'}
        //   onClickLeft={handleBack}
        //   forceTheme="light"
        //   isFullScreen={isFullScreen}
        //   statusBarHeight={statusBarHeight}
        // />
      )}
      <div className={styles.supportBody}>
        <div className={styles.list}>
          {tabList.map((item, index) => (
            <div className={styles.item} key={index} onClick={() => handleClick(item)}>
              <div className={styles.icon}>
                <LazyImage src={item.logoIcon} alt="" width={24} height={24} />
              </div>
              {/* <div className={styles.divider}></div> */}
              <span className={styles.title}>{item.answerTitle}</span>
              <i className={styles.arrowRight}></i>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.supportFooter}>
        <div className={styles.supportBtn} onClick={handleHelpClick}>
          <div className={styles.icon} />
          <span className={styles.text}>在线客服</span>
        </div>
      </div>
    </div>
  );
};

export default VituralCoins;

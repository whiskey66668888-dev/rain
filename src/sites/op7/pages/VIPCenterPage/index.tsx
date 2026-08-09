import clsx from 'clsx';
import dayjs from 'dayjs';
import fileSaver from 'file-saver';
import html2canvas from 'html2canvas';
import isEmpty from 'lodash/isEmpty';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CenterPopup } from 'antd-mobile';

import {
  birthdayMoneyReq,
  cashVipMoneyReq,
  checkUpgrade,
  getLevelHelpAmount,
  upgradeNew,
  weekVipMoneyReq,
} from '@/apis/origin/vip/vipAction';
import { useVipInfo, VipLevelInfo } from '@/apis/origin/vip/getVipinfo';
import LazyImage from '@/common/components/LazyImage';
import Overlay, { OverlayPosition } from '@/common/components/Overlay';
import { toast } from '@/common/components/Toast';
import { useGetMemberInfo } from '@/common/hooks/useMemberInfo';
import { useAppSelector } from '@/core/store/hooks';
import H5Header from '@/sites/op7/components/H5Header';
import { getSystemTheme } from '@/utils';

import {
  DEFAULT_AVATAR,
  discountData,
  GIFT_STATUS_CONFIG,
  GiftStatus,
  quotaData,
  QuotaDataItem,
} from './constants';
import Progress from './Progress';
import VipDetail from './VipDetail';
import styles from './VIPCenterPage.module.scss';
import VipSwitch from './vipSwitch';
import { ClientOnly } from '@/common/components/ClientOnly';
import { zIndexMap } from '@/utils/constants/zIndex';

const VIPCenterPage: React.FC = () => {
  const userInfo = useAppSelector((state) => state.user.memberInfo);
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const { data: vipInfo, refetch } = useVipInfo();
  const { getMemberInfo } = useGetMemberInfo();
  const { saveAs } = fileSaver;
  const [upgradeCode, setUpgradeCode] = useState<number>(-1);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showVipDetail, setShowVipDetail] = useState(false);

  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const overlayPosition = useMemo<OverlayPosition>(
    () => (isMobile ? 'bottom' : 'center'),
    [isMobile],
  );
  console.log('isMobile', overlayPosition);
  const [disable, setDisable] = useState(false);
  const [checkData, setCheckData] = useState<VipLevelInfo | undefined>();
  const [isScrolled, setIsScrolled] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const inviteImageRef = useRef<HTMLDivElement>(null);
  const isDark = useMemo(() => theme === 'dark', [theme]);
  const scheduleBoxRef = React.useRef<HTMLDivElement>(null);
  const progressBar2 = React.useRef<HTMLDivElement>(null);
  const avatarAddress = useAppSelector((state) => state.user.userAvatar);
  const avatar = avatarAddress || DEFAULT_AVATAR;
  const [showTip, setShowTip] = useState(false);
  const [addressList, setAddressList] = useState<string[]>([]);

  // ✅ 获取礼金项的状态
  const getGiftStatus = (index: number, item: QuotaDataItem): GiftStatus => {
    const isCurrentLevel = checkData?.level === vipInfo?.level;

    switch (index) {
      case 2: // 升级礼金
        if (item.promotionStatus === '1') return 'received';
        if (item.promotionStatus === '0') return 'available';
        return null;

      case 3: // 升级助力金
        if (!isCurrentLevel) return null;
        const helpStatus = vipInfo?.statusAlreadyGetMemberVipUpgradeHelpBonus;
        if (helpStatus === 9) return 'received';
        if (helpStatus && [-9, -1, -2].includes(helpStatus) && vipInfo?.isOver75Percent)
          return 'available';
        if (helpStatus && [0, 1, 2].includes(helpStatus)) return 'locked';
        return null;

      case 4: // 生日礼金
        if (item.birthdayCashStatus === '1') return 'received';
        if (item.birthdayCashStatus === '0') return 'available';
        if (item.birthdayCashStatus === '6') return 'locked';
        return null;

      case 5: // 每周红包
        if (item.weekBonusStatus === '2') return 'received';
        if (item.weekBonusStatus === '1') return 'available';
        return null;

      default:
        return null;
    }
  };

  // ✅ 渲染礼金状态图标
  const renderGiftIcon = (status: GiftStatus) => {
    if (!status) return null;

    const config = GIFT_STATUS_CONFIG[status];
    return (
      <div className={styles.icoImg}>
        <LazyImage src={config.icon} alt={config.text} title={config.text} width={34} height={34} />
      </div>
    );
  };

  // ✅ 处理礼金领取点击
  const handleGiftClick = async (index: number, item: QuotaDataItem) => {
    const status = getGiftStatus(index, item);
    if (status !== 'available') return;

    try {
      let response;

      switch (index) {
        case 2: // 升级礼金
          if (item.promotionStatus === '0' && item.groupId) {
            response = await cashVipMoneyReq({ groupId: item.groupId });
            if (response.code === '0000') {
              toast({ description: '领取成功', type: 'success' });
              await refetch(); // 刷新 VIP 信息
              await getMemberInfo(); // 刷新用户信息
            } else {
              toast({ description: response.info || '领取失败', type: 'warning' });
            }
          }
          break;

        case 3: // 升级助力金
          const helpStatus = vipInfo?.statusAlreadyGetMemberVipUpgradeHelpBonus;
          if (
            helpStatus &&
            [-9, -1, -2].includes(helpStatus) &&
            vipInfo?.isOver75Percent &&
            item.groupId
          ) {
            response = await getLevelHelpAmount({ groupId: item.groupId });
            if (response?.data.ucUrl) {
              //  显示 UC 下载地址弹窗
              setAddressList(response.data.ucUrl.split(','));
              setShowTip(true);
              await refetch();
              await getMemberInfo();
            }
          }
          break;

        case 4: // 生日礼金
          if (item.birthdayCashStatus === '0') {
            response = await birthdayMoneyReq();
            toast({ description: '领取成功', type: 'success' });
            await refetch();
            await getMemberInfo();
          }
          break;

        case 5: // 每周红包
          if (item.weekBonusStatus === '1') {
            response = await weekVipMoneyReq();
            toast({ description: '领取成功', type: 'success' });
            await refetch();
            await getMemberInfo();
          }
          break;

        default:
          break;
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        description: err?.message || '领取失败',
        type: 'error',
      });
    }
  };

  // ✅ 填充额度数据
  const getEnrichedQuotaData = (): QuotaDataItem[] => {
    if (isEmpty(checkData)) return [];

    return quotaData.map((item, index) => {
      const enrichedItem = { ...item };

      switch (index) {
        case 0: // 每日提款次数
          enrichedItem.title = String(checkData.outNumsMax);
          break;
        case 1: // 每日提款额度
          enrichedItem.title = String(checkData.outMoneyMax);
          break;
        case 2: // 升级礼金
          enrichedItem.title = String(checkData.promotionCash);
          enrichedItem.groupId = checkData.groupId;
          enrichedItem.promotionStatus = String(checkData.promotionStatus);
          break;
        case 3: // 升级助力金
          enrichedItem.title = String(checkData.upgradeHelpCash || '0');
          break;
        case 4: // 生日礼金
          enrichedItem.title = String(checkData.birthdayCash);
          enrichedItem.birthdayCashStatus = String(checkData.birthdayCashStatus);
          break;
        case 5: // 每周红包
          enrichedItem.title = String(checkData.weekCash);
          enrichedItem.weekBonusStatus = String(checkData.weekBonusStatus);
          break;
      }

      return enrichedItem;
    });
  };

  // ✅ 过滤需要显示的额度项
  const getVisibleQuotaItems = (): QuotaDataItem[] => {
    const enrichedData = getEnrichedQuotaData();
    if (isEmpty(checkData)) return [];

    return enrichedData.filter((item, index) => {
      // 升级助力金：VIP < 5 或 VIP = 10 不显示
      if (index === 3 && (checkData.level < 5 || checkData.level === 10)) {
        return false;
      }
      // 生日礼金：VIP < 5 不显示
      if (index === 4 && checkData.level < 5) {
        return false;
      }
      return true;
    });
  };

  const checkUpgradeFn = () => {
    checkUpgrade().then((data) => {
      if (data.code === '0000') {
        setUpgradeCode(data.data);
      }
    });
  };

  const copyContent = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ description: '复制成功', type: 'success' });
    } catch (_err) {
      toast({ description: '复制失败，请手动复制', type: 'error' });
    }
  };

  // 一键复制
  const handleCopy = async () => {
    try {
      const textToCopy = `UC下载地址:\n${addressList.join('\n')}`;
      await navigator.clipboard.writeText(textToCopy);

      // 可选：显示成功提示
      toast({ description: '复制成功', type: 'success' });
    } catch (_err) {
      toast({ description: '复制失败，请手动复制', type: 'error' });
    }
  };

  // 处理图片下载 - 使用 file-saver 库
  const handleDownloadImage = async () => {
    if (!inviteImageRef.current) return;

    try {
      // setDownloading(true);

      // 使用html2canvas将DOM元素转换为canvas
      const canvas = await html2canvas(inviteImageRef.current, {
        useCORS: true, // 允许跨域图片
        scale: 3, // 提高清晰度
        backgroundColor: null, // 透明背景
      });
      // 在非 Flutter 环境中，保存为文件
      canvas.toBlob((blob) => {
        if (blob) {
          // 使用 file-saver 保存为文件
          saveAs(blob, `永久域名.png`);
          toast({ description: '图片已保存', type: 'success' });
        } else {
          toast({ description: '保存失败，请重试', type: 'error' });
        }
      }, 'image/png');
    } catch (error) {
      console.error('处理图片失败:', error);
      toast({ description: '操作失败，请重试', type: 'error' });
    }
  };

  const handleCloseVipDetail = useCallback(() => setShowVipDetail(false), []);
  useEffect(() => {
    if (!vipInfo?.levelList?.length || userInfo?.level === undefined) return;

    const levelIndex = vipInfo.levelList.findIndex((item) => item.level === userInfo.level);
    const initialData = vipInfo.levelList[levelIndex >= 0 ? levelIndex : 0];
    if (initialData) {
      setCheckData(initialData);
    }
  }, [vipInfo, userInfo.level]);

  // ✅ 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      if (pageRef.current) {
        setIsScrolled(pageRef.current.scrollTop > 0);
      }
    };

    const pageElement = pageRef.current;
    if (pageElement) {
      pageElement.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (pageElement) {
        pageElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);
  // ✅ 渲染额度项
  const visibleQuotaItems = getVisibleQuotaItems();

  const visibleDiscountItems = useMemo(() => {
    if (!checkData || isEmpty(checkData)) return [];

    return discountData
      .map((item, index) => {
        const row = { ...item };
        switch (index) {
          case 0:
            row.title = `${checkData.videoRebates || 0}%`;
            break;
          case 1:
            row.title = `${checkData.sportsRebates || 0}%`;
            break;
          case 2: {
            const footballRebate = Number(checkData.footballRebates ?? 0);
            if (!footballRebate) return null;
            row.title = `${checkData.footballRebates}%`;
            break;
          }
          case 3:
            row.title = `${checkData.esportRebates || 0}%`;
            break;
          case 4:
            row.title = `${checkData.pokerRebates || 0}%`;
            break;
          case 5:
            row.title = `${checkData.slotRebates || 0}%`;
            break;
          default:
            break;
        }
        return row;
      })
      .filter((item): item is (typeof discountData)[number] => item !== null);
  }, [checkData]);

  return (
    <div
      ref={pageRef}
      data-desc="vip-center-page"
      className={clsx(
        styles.vipPage,
        'self-center w-full flex-1 flex flex-col overflow-y-auto lg:overflow-initial lg:max-w-[1200px]',
      )}
    >
      <H5Header
        title="VIP特权"
        style={{ backgroundColor: isScrolled ? undefined : 'transparent' }}
        isFixed
        right={
          <div
            onClick={() => setShowVipDetail(true)}
            className="_tf[14] text-[var(--ThemeColor-Main)] cursor-pointer"
          >
            VIP详情
          </div>
        }
      />

      <div className={styles.vipContent}>
        {/* 会员信息 */}
        <div className={styles.vipMember}>
          <div className={styles.userInfo}>
            <div className={styles.userInfo_left}>
              <div className={styles.imgs}>
                <LazyImage src={avatar} alt={'icon'} width={38} height={38} />
              </div>
              <div className={styles.user_name}>
                <div className={styles.user_fonts1}>{userInfo?.loginName}</div>
                <div className={styles.user_fonts2}>
                  已加入大家庭 <span className={styles.white}> {userInfo?.subDay}天</span>
                </div>
              </div>
            </div>
            <div className={styles.userInfo_right}>
              <LazyImage
                src={`/images/common/promotion/hotEvent/vip${vipInfo?.level || '0'}.png`}
                alt={'icon'}
              />
              <span className={styles.sweepEffect}></span>
            </div>
          </div>

          <div
            className={clsx(
              styles.scheduleBox,
              Number(vipInfo?.schedule) < 100 ? styles.scheduleBox_btn : null,
            )}
            ref={scheduleBoxRef}
          >
            <div className={styles.money_status}>
              <div className={styles.status_list}>
                <div className={styles.fonts}>
                  当前流水
                  <div className={styles.black_fonts}>{vipInfo?.keepBetCash}</div>
                </div>
              </div>
              <div className={styles.status_list}>
                <div className={styles.fonts}>
                  保级所需流水(3个月)
                  <div className={styles.black_fonts}>{vipInfo?.needKeepBetCash}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 保级进度 */}
        <div className={clsx(styles.progress_box, styles.progress_baoji)}>
          <Progress
            num={vipInfo?.keepSchedule != null ? Number(vipInfo.keepSchedule) : 0}
            index={1}
            progressBar={progressBar2}
            isDarkMode={isDark}
          />
        </div>

        <div className={styles.keepInfoBox}>
          <div className={styles.keepInfoText}>
            保级流水：
            <span className={styles.keepInfoTextBlue}>{vipInfo?.keepBetCash}</span>/
            {vipInfo?.needKeepBetCash}
          </div>
          <div className={styles.keepInfoText}>
            保级验证时间：{vipInfo?.keepDate ? dayjs(vipInfo.keepDate).format('YYYY-MM-DD') : '-'}
          </div>
        </div>

        {/* VIP 切换卡片 */}
        {vipInfo && <VipSwitch vipData={vipInfo} setCheckData={setCheckData} />}

        {/* 升级按钮 */}
        {upgradeCode === 1 && vipInfo?.level !== 10 && (
          <div className={styles.upgradeBox}>
            <button
              className={clsx(styles.upgrade, disable ? styles.upgrade2 : null)}
              disabled={disable}
              onClick={() => {
                setDisable(true);
                upgradeNew()
                  .then((data) => {
                    if (data.code === '0000') {
                      setShowUpgradeModal(true);
                      checkUpgradeFn();
                    } else {
                      toast({ description: data.info, type: 'warning' });
                    }
                    setDisable(false);
                  })
                  .catch(() => {
                    setDisable(false);
                  });
              }}
            >
              {disable ? (
                '升级中…'
              ) : (
                <>
                  <LazyImage
                    className={styles.upgrade_ico}
                    src={'/images/common/vip/upgrade_icon.png'}
                    alt={'icon'}
                    width={16}
                    height={16}
                  />
                  立即升级
                </>
              )}
            </button>
          </div>
        )}
        <div className={styles.quotaBoxWrap}>
          <div className={styles.quotaBox}>
            <div className={styles.title}>
              <LazyImage
                src={'/images/common/vip/vip_title_line.png'}
                alt={'icon'}
                width={2}
                height={16}
              />
              <div className={styles.text}>VIP{checkData?.level}尊享</div>
            </div>

            <div className={styles.quoContetn}>
              {visibleQuotaItems.map((item) => {
                // 获取原始索引（用于判断礼金类型）
                const index = quotaData.findIndex((q) => q.fonts === item.fonts);
                const isBirthdayDisabled = index === 4 && (checkData?.level ?? 0) < 5;
                const giftStatus = getGiftStatus(index, item);

                // 选择图标
                const effectiveIcon = isBirthdayDisabled
                  ? isDark
                    ? item.iconDisabledDark
                    : item.iconDisabled
                  : isDark
                    ? item.iconDark
                    : item.icon;

                return (
                  <div key={item.fonts} className={styles.queItem}>
                    <div className={styles.queItemImgBox}>
                      <LazyImage
                        className={styles.queItemImg}
                        src={effectiveIcon ?? ''}
                        alt={'icon'}
                      />
                    </div>

                    <div className={styles.queItem_right}>
                      <div className={styles.queItem_right_text1}>{item.title}</div>
                      <div className={styles.queItem_right_text2}>{item.fonts}</div>
                    </div>

                    {!isBirthdayDisabled && (
                      <div
                        className={styles.clickBox}
                        onClick={() => void handleGiftClick(index, item)}
                        style={{ cursor: giftStatus === 'available' ? 'pointer' : 'default' }}
                      >
                        {renderGiftIcon(giftStatus)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {/* VIP 晋级优惠 */}
          <div className={clsx(styles.quotaBox, styles.quotaBox1)}>
            <div className={styles.title}>
              <LazyImage
                src={'/images/common/vip/vip_title_line.png'}
                alt={'icon'}
                width={2}
                height={16}
              />
              <div className={styles.text}>VIP{checkData?.level}晋级优惠</div>
            </div>

            <div className={styles.discountContetn}>
              {visibleDiscountItems.map((item) => (
                <div key={item.fonts} className={styles.queItem}>
                  <div className={styles.queItem_right_text1}>{item.title}</div>
                  <div className={styles.queItem_right_text2}>{item.fonts}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/*  */}
        <div
          className={`${styles.goDetails} flex justify-center items-center w-[94%] h-[40px] bg-[var(--Background-300)] rounded-[12px] m-[12px_auto_0] text-[var(--ThemeColor-Main)] cursor-pointer`}
          onClick={() => setShowVipDetail(true)}
        >
          VIP详情
        </div>
      </div>

      {showUpgradeModal && (
        <div className={styles.upgradeMask}>
          <div className={styles.upgradeModal}>
            <div className={styles.upgradeIconWrapper}>
              <LazyImage
                className={styles.upgradeIcon}
                src={`/images/common/vip/vip_card_icon_${vipInfo?.nextLevel}_actived.png`}
                alt={'vip-upgrade'}
              />
            </div>
            <div className={styles.upgradeTitle}>恭喜升级至 VIP{vipInfo?.nextLevel}</div>
            <div className={styles.upgradeDesc}>
              系统每10分钟更新计算您下次等级的
              <br />
              升级条件
            </div>
            <button
              type="button"
              className={styles.upgradeConfirm}
              onClick={() => {
                setShowUpgradeModal(false);
                refetch();
                getMemberInfo();
              }}
            >
              我知道了
            </button>
          </div>
        </div>
      )}
      {/* uc下载地址 */}
      <CenterPopup
        visible={showTip}
        style={{
          '--min-width': '311px',
          '--border-radius': '10px',
          '--background-color': 'var(--Background-300)',
        }}
        className={styles.myCenterpop}
        onMaskClick={() => setShowTip(false)}
        destroyOnClose
      >
        <div className={styles.tipModal}>
          <div ref={inviteImageRef}>
            <div className={styles.topContent}>
              <LazyImage
                className={styles.titleText}
                src={'/images/common/vip/vip_top_title.png'}
                alt={'icon'}
              />
              <LazyImage
                className={styles.close}
                src={'/images/common/vip/close_outline.png'}
                alt={'icon'}
                onClick={() => setShowTip(false)}
              />
            </div>
            <div className={styles.tips}>
              下载并注册UC，向UC官方客服提供VIP详情页截图及游戏账号领取助力金。
            </div>
            <div className={styles.imgBox}>
              <LazyImage
                className={styles.imgContent}
                src={'/images/common/vip/vip_top_content.png'}
                alt={'icon'}
              />
            </div>
            <div className={styles.downLoadText}>UC下载地址：</div>
            <div className={styles.addressBox}>
              {addressList.map((item, index) => (
                <div className={styles.addressItem} key={index}>
                  <div className={styles.addressLeft}>
                    <LazyImage
                      className={styles.searchIcon}
                      src={'/images/common/vip/search.png'}
                      alt={'icon'}
                    />
                    <div className={styles.addresstext}>{item}</div>
                  </div>

                  <LazyImage
                    className={styles.addressRight}
                    onClick={() => {
                      copyContent(item);
                    }}
                    src={'/images/common/vip/copy.png'}
                    alt={'icon'}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className={styles.btnBox}>
            <div
              className={styles.btnLeft}
              onClick={() => {
                handleDownloadImage();
              }}
            >
              保存至相册
            </div>
            <div
              className={styles.btnRight}
              onClick={() => {
                handleCopy();
              }}
            >
              一键复制
            </div>
          </div>
        </div>
      </CenterPopup>
      <ClientOnly>
        <Overlay
          show={showVipDetail}
          close={handleCloseVipDetail}
          position={overlayPosition}
          maskClickClose
          zIndex={zIndexMap.loginModal}
        >
          {vipInfo && <VipDetail vipInfo={vipInfo} handleClose={handleCloseVipDetail} />}
        </Overlay>
      </ClientOnly>
    </div>
  );
};

export default VIPCenterPage;

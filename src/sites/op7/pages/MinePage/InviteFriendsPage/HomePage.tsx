import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { SwiperRef } from 'swiper/react';
import 'swiper/css';

import Overlay from '@/common/components/Overlay';
import ModalHeader from '@/sites/op7/components/ModalHeader';
import H5Header from '@/sites/op7/components/H5Header';
import { useInviteFriendsNavigate } from './useInviteFriendsNavigate';
import { useAppSelector } from '@/core/store/hooks';
import { handleContent } from '@/utils/format/handleContent';
import { useDiscountFavorite } from '@/common/hooks/useDiscountFavorite';

import {
  INVITE_FRIENDS_DISCOUNT_ID,
  getAccumulatedAwardDetails,
  getDiscount297Info,
  getDiscountItem,
  getFirstAwardDetails,
  getLatestAwardRecords,
} from '@/apis/origin/inviteFriends';

import useFlutterBridge from '@/sites/op7/hooks/useFlutterBridge';
import { defaultRules0, defaultRules1, defaultRules2, defaultRules3 } from './constants';
import ActivityRules from './components/ActivityRules';
import BonusReportPanel from './components/BonusReportPanel';
import RebateReportPanel from './components/RebateReportPanel';
import MyTitle from './components/MyTitle';
import MyTable from './components/MyTable';
import InviteSubPage from './InviteSubPage';
import { isEmbeddedInNativeApp } from '@/utils/appEmbed';
import { NEW_FRIEND_ROUTE_KEY } from './paths';
import styles from './home.module.scss';
import reportStyles from './report.module.scss';
import { toDisplayString } from './stringUtils';

import bannerDark from '@/sites/op7/images/dark/inviteFriends/banner.webp';
import bannerLight from '@/sites/op7/images/light/inviteFriends/banner.webp';
import bannerH5Dark from '@/sites/op7/images/dark/inviteFriends/banner_h5.webp';
import bannerH5Light from '@/sites/op7/images/light/inviteFriends/banner_h5.webp';
import { getSystemTheme } from '@/utils';
import { PATHS } from '@/sites/op7/routes/paths';
import { CloseSvg } from '@/sites/op7/components/SvgIcons';
import { FollowIcon } from '@/sites/op7/pages/MinePage/InviteFriendsPage/components/icons';

const NAV_LIST = ['累计奖励', '邀请礼金', '好友升级', '返水奖励'] as const;
function asRecord(d: unknown): Record<string, unknown> {
  return d && typeof d === 'object' ? (d as Record<string, unknown>) : {};
}

function InviteFriendsHomePage() {
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const isDark = useMemo(() => {
    return theme === 'dark';
  }, [theme]);
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const navigateInviteFriends = useInviteFriendsNavigate();
  const { sendToFlutter, isInFlutter } = useFlutterBridge();
  const [searchParams] = useSearchParams();
  const isApp = Boolean(searchParams.get('isApp')) || isEmbeddedInNativeApp();
  const isLogin = useAppSelector((s) => s.user.userInfo.isLogin);

  const [navIndex, setNavIndex] = useState(0);
  const [rulesPop, setRulesPop] = useState(false);
  const [bonusReportPop, setBonusReportPop] = useState(false);
  const [rebateReportPop, setRebateReportPop] = useState(false);
  const [inviteSharePop, setInviteSharePop] = useState(false);

  const { isSaved, toggleFavorite } = useDiscountFavorite(INVITE_FRIENDS_DISCOUNT_ID);

  const swiperRef = useRef<SwiperRef | null>(null);

  const defaultRules = useMemo(
    () => [defaultRules0, defaultRules1, defaultRules2, defaultRules3],
    [],
  );

  const { data: discountInfo } = useRequest(async () => {
    const res = await getDiscount297Info();
    return asRecord(res?.data);
  });

  const { data: discountItem } = useRequest(async () => {
    const res = await getDiscountItem({ id: INVITE_FRIENDS_DISCOUNT_ID, isMobile });
    return asRecord(res?.data);
  });

  const { data: firstAwardDetails } = useRequest(async () => {
    const res = await getFirstAwardDetails();
    return asRecord(res?.data);
  });

  const { data: accumulatedAwardDetails } = useRequest(async () => {
    const res = await getAccumulatedAwardDetails();
    return asRecord(res?.data);
  });

  const { data: latestRecords } = useRequest(async () => {
    const res = await getLatestAwardRecords();
    return asRecord(res?.data);
  });

  useEffect(() => {
    localStorage.setItem(NEW_FRIEND_ROUTE_KEY, 'newFriend');
  }, []);

  useEffect(() => {
    const list = asRecord(latestRecords)?.list;
    if (Array.isArray(list) && list.length > 0) {
      const t = setTimeout(() => {
        swiperRef.current?.swiper?.autoplay?.start();
      }, 300);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [latestRecords]);

  const memoizedFirstAwardList = useMemo(() => {
    const list = asRecord(firstAwardDetails)?.list;
    return Array.isArray(list) ? list : [];
  }, [firstAwardDetails]);

  const titleText = toDisplayString(discountItem?.title, '优惠活动详情');

  const goInvite = () => {
    if (isInFlutter()) {
      sendToFlutter('invite');
    }
    if (isMobile) {
      navigateInviteFriends(PATHS.mineInviteFriendsInvite);
      return;
    }
    setInviteSharePop(true);
  };

  const goBonusReport = () => {
    if (isInFlutter()) {
      sendToFlutter('bonusReport');
    }
    if (isMobile) {
      navigateInviteFriends(PATHS.mineInviteFriendsBonusReport);
      return;
    }
    setBonusReportPop(true);
  };

  const goRebateReport = () => {
    if (isInFlutter()) {
      sendToFlutter('rebateReport');
    }
    if (isMobile) {
      navigateInviteFriends(PATHS.mineInviteFriendsRebateReport);
      return;
    }
    setRebateReportPop(true);
  };

  /** Swiper loop + slidesPerView:5 需要足够多 slide，与 emc-h5 一致并避免条数过少时循环异常 */
  const MIN_LATEST_AWARD_SLIDES = 11;

  const latestListRaw = asRecord(latestRecords)?.list;
  const latestList = useMemo(() => {
    if (Array.isArray(latestListRaw) && latestListRaw.length > 0) {
      const base = latestListRaw.map((row) => asRecord(row));
      const items: Record<string, unknown>[] = [];
      while (items.length < MIN_LATEST_AWARD_SLIDES) {
        for (const row of base) {
          if (items.length >= MIN_LATEST_AWARD_SLIDES) break;
          items.push({ ...row });
        }
      }
      return items;
    }
    return Array.from({ length: 10 }, (_, i) => ({
      loginName: '-',
      bonusType: 1,
      bonusCash: '-',
      id: `placeholder-${i}`,
      isPlaceholder: true,
    }));
  }, [latestListRaw]);

  return (
    <div className={styles.inviteFriendsContent}>
      {!isApp && (
        <H5Header
          title={titleText}
          right={
            isLogin ? (
              <button
                type="button"
                aria-label={isSaved ? '取消收藏1' : '收藏'}
                className={clsx(
                  'flex h-32px w-32px items-center justify-center rounded-full border-none bg-transparent p-0',
                  styles.follow,
                  isSaved && styles.followed,
                )}
                onClick={(e) => void toggleFavorite(e)}
              >
                <FollowIcon />
              </button>
            ) : null
          }
        />
      )}

      <div className={styles.topBannerWrap}>
        <img
          src={
            isDark ? (isMobile ? bannerH5Dark : bannerDark) : isMobile ? bannerH5Light : bannerLight
          }
          alt=""
          className={styles.topBanner}
        />
      </div>

      <div className={clsx(styles.main, isMobile && styles.mainH5)}>
        <div className={styles.mainTop}>
          <div className={styles.navBox}>
            {NAV_LIST.map((item, index) => (
              <div
                key={item}
                className={clsx(styles.navList, navIndex === index && styles.navActiving)}
                onClick={() => setNavIndex(index)}
              >
                {item}
              </div>
            ))}
          </div>

          <div className={styles.navBottomBox} onClick={goInvite}>
            <svg
              className={styles.navBottomIcon}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M12.4027 9.72291V12.3057C12.4027 12.7501 12.0428 13.123 11.619 13.123L3.33644 13.1378C2.9126 13.1378 2.5669 12.7773 2.5669 12.3328L2.58111 3.69566C2.58111 3.25368 2.94101 2.87837 3.36485 2.87837H7.94654V1.92773H3.36485C2.39642 1.92773 1.67188 2.94997 1.67188 3.86357V12.3328C1.67188 13.2909 2.41773 14.0711 3.3388 14.0711H11.4604C12.4311 14.0711 13.3143 13.2291 13.3143 12.3057V9.72291H12.4027ZM10.2551 2.42898L13.6719 5.9994L10.2551 9.56735V7.52782C10.2551 7.52782 6.86446 7.13522 4.88498 10.0785C4.88498 10.0785 5.50771 4.46851 10.2551 4.46851V2.42898Z"
                fill="currentColor"
              />
            </svg>
            分享邀请码
          </div>
        </div>

        <div style={{ display: navIndex === 0 ? 'block' : 'none' }}>
          <MyTitle
            leftContent="嘉奖明细"
            rightContent={
              <div
                // className={clsx(styles.commendationRight, styles.dot, !isMobile && styles.dotPc)}
                className={clsx(styles.commendationRight)}
                onClick={goBonusReport}
              >
                <svg
                  className={styles.receiveIcon}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M13.3346 3.99967C13.3346 2.55434 10.8926 1.33301 8.0013 1.33301C5.10997 1.33301 2.66797 2.55434 2.66797 3.99967V5.33301C2.66797 6.77834 5.10997 7.99967 8.0013 7.99967C10.8926 7.99967 13.3346 6.77834 13.3346 5.33301V3.99967ZM8.0013 12.6663C5.10997 12.6663 2.66797 11.445 2.66797 9.99967V11.9997C2.66797 13.445 5.10997 14.6663 8.0013 14.6663C10.8926 14.6663 13.3346 13.445 13.3346 11.9997V9.99967C13.3346 11.445 10.8926 12.6663 8.0013 12.6663Z"
                    fill="currentColor"
                  />
                  <path
                    d="M13.3346 6.66699C13.3346 8.11233 10.8926 9.33366 8.0013 9.33366C5.10997 9.33366 2.66797 8.11233 2.66797 6.66699V8.66699C2.66797 10.1123 5.10997 11.3337 8.0013 11.3337C10.8926 11.3337 13.3346 10.1123 13.3346 8.66699V6.66699Z"
                    fill="currentColor"
                  />
                </svg>
                <span>点击领取</span>
              </div>
            }
          />
          <MyTable
            key="table_0"
            columns={[
              {
                title: '有效邀请会员数(个)',
                dataIndex: 'efficientNum',
                cellClassName: styles.cell21,
              },
              { title: '邀请奖励(元/人)', dataIndex: 'bonus', cellClassName: styles.cell22 },
            ]}
            dataSource={
              (asRecord(accumulatedAwardDetails)?.list as Record<string, string | number>[]) ?? []
            }
            collapsedRows={3}
            expandText="查看更多"
            collapseText="收起"
          />
          <div className={styles.tips}>注：奖励上不封顶100个=15万</div>
        </div>

        <div style={{ display: navIndex === 1 ? 'block' : 'none' }}>
          <MyTitle
            leftContent="嘉奖明细"
            rightContent={
              <div
                // className={clsx(styles.commendationRight, styles.dot, !isMobile && styles.dotPc)}
                className={clsx(styles.commendationRight)}
                onClick={goBonusReport}
              >
                <svg
                  className={styles.receiveIcon}
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M13.3346 3.99967C13.3346 2.55434 10.8926 1.33301 8.0013 1.33301C5.10997 1.33301 2.66797 2.55434 2.66797 3.99967V5.33301C2.66797 6.77834 5.10997 7.99967 8.0013 7.99967C10.8926 7.99967 13.3346 6.77834 13.3346 5.33301V3.99967ZM8.0013 12.6663C5.10997 12.6663 2.66797 11.445 2.66797 9.99967V11.9997C2.66797 13.445 5.10997 14.6663 8.0013 14.6663C10.8926 14.6663 13.3346 13.445 13.3346 11.9997V9.99967C13.3346 11.445 10.8926 12.6663 8.0013 12.6663Z"
                    fill="currentColor"
                  />
                  <path
                    d="M13.3346 6.66699C13.3346 8.11233 10.8926 9.33366 8.0013 9.33366C5.10997 9.33366 2.66797 8.11233 2.66797 6.66699V8.66699C2.66797 10.1123 5.10997 11.3337 8.0013 11.3337C10.8926 11.3337 13.3346 10.1123 13.3346 8.66699V6.66699Z"
                    fill="currentColor"
                  />
                </svg>
                <span>点击领取</span>
              </div>
            }
          />
          <MyTable
            key="table_1"
            columns={[
              { title: '好友首存(元)', dataIndex: 'amount', cellClassName: styles.cell11 },
              { title: '邀请奖励(元)', dataIndex: 'bonus', cellClassName: styles.cell12 },
            ]}
            dataSource={memoizedFirstAwardList as Record<string, string | number>[]}
            collapsedRows={3}
            expandText="查看更多"
            collapseText="收起"
          />
        </div>

        <div style={{ display: navIndex === 2 ? 'block' : 'none' }}>
          <MyTitle leftContent="嘉奖明细" />
          <MyTable
            key="table_2"
            columns={[
              {
                title: '邀请人等级',
                dataIndex: 'level',
                cellClassName: styles.cell31,
                width: '30%',
              },
              {
                title: '受邀人条件',
                dataIndex: 'condition',
                cellClassName: styles.cell32,
                width: '40%',
              },
              {
                title: '受邀人等级',
                dataIndex: 'inlevel',
                cellClassName: styles.cell33,
                width: '30%',
              },
            ]}
            dataSource={[
              {
                level: 'VIP0~10',
                condition: '体育/棋牌/电竞/真人/电子<br>任一完成有效流水≥3888',
                inlevel: '直升邀请人同级!<br>（最高VIP5）',
              },
            ]}
            collapsedRows={3}
            expandText="查看更多"
            collapseText="收起"
          />
        </div>

        <div style={{ display: navIndex === 3 ? 'block' : 'none' }}>
          <MyTitle
            className={styles.titlePc}
            leftContent="嘉奖明细"
            centerContent="邀请人获得受邀人每旬总返水奖励百分比"
            rightContent={
              <div
                // className={clsx(styles.commendationRight, styles.dot, !isMobile && styles.dotPc)}
                className={clsx(styles.commendationRight)}
                onClick={goRebateReport}
              >
                <svg
                  className={styles.receiveIcon}
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M13.3346 3.99967C13.3346 2.55434 10.8926 1.33301 8.0013 1.33301C5.10997 1.33301 2.66797 2.55434 2.66797 3.99967V5.33301C2.66797 6.77834 5.10997 7.99967 8.0013 7.99967C10.8926 7.99967 13.3346 6.77834 13.3346 5.33301V3.99967ZM8.0013 12.6663C5.10997 12.6663 2.66797 11.445 2.66797 9.99967V11.9997C2.66797 13.445 5.10997 14.6663 8.0013 14.6663C10.8926 14.6663 13.3346 13.445 13.3346 11.9997V9.99967C13.3346 11.445 10.8926 12.6663 8.0013 12.6663Z"
                    fill="currentColor"
                  />
                  <path
                    d="M13.3346 6.66699C13.3346 8.11233 10.8926 9.33366 8.0013 9.33366C5.10997 9.33366 2.66797 8.11233 2.66797 6.66699V8.66699C2.66797 10.1123 5.10997 11.3337 8.0013 11.3337C10.8926 11.3337 13.3346 10.1123 13.3346 8.66699V6.66699Z"
                    fill="currentColor"
                  />
                </svg>
                <span>点击领取</span>
              </div>
            }
          />
          <MyTable
            key="table_3"
            columns={[
              { title: '游戏分类', dataIndex: 'label', cellClassName: styles.cell41 },
              { title: '返水比例', dataIndex: 'value', cellClassName: styles.cell42 },
              { title: '彩金上限(元)', dataIndex: 'limit', cellClassName: styles.cell43 },
            ]}
            dataSource={[
              { label: '体育', value: '10%', limit: '无上限' },
              { label: '电竞', value: '10%', limit: '无上限' },
              { label: '棋牌', value: '8%', limit: '8888' },
              { label: '真人', value: '8%', limit: '8888' },
              { label: '电子', value: '8%', limit: '8888' },
            ]}
            collapsedRows={3}
          />
        </div>

        <MyTitle leftContent="最新领奖记录" />
        <div className={styles.tableListBox}>
          <div className={styles.prizeResultsScroll}>
            <Swiper
              ref={swiperRef}
              modules={[Autoplay]}
              direction="vertical"
              allowTouchMove={false}
              loop
              autoplay={{ delay: 1000, disableOnInteraction: false }}
              speed={600}
              slidesPerView={5}
              centeredSlides
              roundLengths
              spaceBetween={2}
            >
              {latestList.map((item: Record<string, unknown>, index: number) => {
                const isPlaceholder = item.isPlaceholder === true;
                const idStr = toDisplayString(item.id, '');
                const slideKey = idStr
                  ? `${idStr}-${index}`
                  : `${toDisplayString(item.loginName, 'row')}-${index}`;
                return (
                  <SwiperSlide key={slideKey}>
                    {isPlaceholder ? (
                      <div className={styles.latestAwardPlaceholder}>
                        <span>—</span>
                      </div>
                    ) : (
                      <div className={styles.scrollList}>
                        <div className={styles.scrollListSide}>
                          用户<span>{toDisplayString(item.loginName, '-')}</span>
                        </div>
                        <div className={styles.bounsType}>
                          获得{item.bonusType === 1 ? '首存礼金' : '累计礼金'}
                        </div>
                        <div className={styles.bonusCash}>
                          {toDisplayString(item.bonusCash, '-')}元
                        </div>
                      </div>
                    )}
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>

        <MyTitle
          leftContent="活动说明"
          rightContent={
            <div className={styles.commendationRight} onClick={() => setRulesPop(true)}>
              <svg
                className={styles.ruleIcon}
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M11.9993 14.6663C12.353 14.6663 12.6921 14.5259 12.9422 14.2758C13.1922 14.0258 13.3327 13.6866 13.3327 13.333V5.33301L9.33268 1.33301H3.99935C3.64573 1.33301 3.30659 1.47348 3.05654 1.72353C2.80649 1.97358 2.66602 2.31272 2.66602 2.66634V13.333C2.66602 13.6866 2.80649 14.0258 3.05654 14.2758C3.30659 14.5259 3.64573 14.6663 3.99935 14.6663H11.9993ZM8.66602 2.66634L11.9993 5.99967H8.66602V2.66634ZM4.66602 5.33301H6.66602V6.66634H4.66602V5.33301ZM4.66602 7.99967H11.3327V9.33301H4.66602V7.99967ZM4.66602 10.6663H11.3327V11.9997H4.66602V10.6663Z"
                  fill="currentColor"
                />
              </svg>
              <span>活动规则</span>
            </div>
          }
        />
        <div className={styles.rulesBox}>
          <ActivityRules
            timeRange={`${toDisplayString(discountInfo?.beginTime, '-')}至${toDisplayString(discountInfo?.endTime, '-')}`}
            description={defaultRules[navIndex]?.description ?? ''}
            rules={defaultRules[navIndex]?.rules ?? []}
          />
        </div>
      </div>

      <Overlay
        show={inviteSharePop}
        close={() => setInviteSharePop(false)}
        position={isMobile ? 'bottom' : 'center'}
        bodyClassname={clsx(
          'flex flex-col overflow-hidden bg-[var(--Background-400)] rounded-t-12px safe-b max-h-[90vh]',
          !isMobile && 'w-450px rounded-b-12px',
        )}
      >
        <ModalHeader
          title="邀请好友"
          className="bg-[var(--Background-300)]"
          right={
            <div className="flex items-center justify-end gap-8px">
              <button
                type="button"
                className="flex h-20px w-20px items-center justify-center border-none p-0"
                aria-label="关闭"
                onClick={() => setInviteSharePop(false)}
              >
                <CloseSvg className="text-[var(--Text-Main-10)]" />
              </button>
            </div>
          }
        />
        <div className="min-h-0 flex-1 overflow-y-auto px-12px">
          <InviteSubPage embedded />
        </div>
      </Overlay>

      <Overlay
        show={bonusReportPop}
        close={() => setBonusReportPop(false)}
        position={isMobile ? 'bottom' : 'center'}
        bodyClassname={clsx(
          'flex flex-col overflow-hidden bg-[var(--Background-400)] rounded-t-12px safe-b min-h-[32vh] max-h-[85vh]',
          !isMobile && 'w-450px rounded-b-12px',
        )}
      >
        <ModalHeader
          title="奖金报表"
          className="bg-[var(--Background-300)]"
          right={
            <div className="flex items-center justify-end gap-8px">
              <button
                type="button"
                className="flex items-center justify-center border-none bg-none p-0 w-20px h-20px"
                aria-label="关闭"
                onClick={() => setBonusReportPop(false)}
              >
                <CloseSvg className="text-[var(--Text-Main-10)]" />
              </button>
            </div>
          }
        />
        <div
          className={clsx(
            'flex-1 min-h-0 overflow-y-auto',
            reportStyles.reportPage,
            isMobile && reportStyles.reportPageH5,
          )}
        >
          <BonusReportPanel isPc={!isMobile} />
        </div>
      </Overlay>

      <Overlay
        show={rebateReportPop}
        close={() => setRebateReportPop(false)}
        position={isMobile ? 'bottom' : 'center'}
        bodyClassname={clsx(
          'flex flex-col overflow-hidden bg-[var(--Background-400)] rounded-t-12px safe-b min-h-[32vh] max-h-[85vh]',
          !isMobile && 'w-450px rounded-b-12px',
        )}
      >
        <ModalHeader
          title="返水报表"
          className="bg-[var(--Background-300)]"
          right={
            <div className="flex items-center justify-end gap-8px">
              <button
                type="button"
                className="flex items-center justify-center border-none bg-none p-0 w-20px h-20px"
                aria-label="关闭"
                onClick={() => setRebateReportPop(false)}
              >
                <CloseSvg className="text-[var(--Text-Main-10)]" />
              </button>
            </div>
          }
        />
        <div
          className={clsx(
            'flex-1 min-h-0 overflow-y-auto',
            reportStyles.reportPage,
            isMobile && reportStyles.reportPageH5,
          )}
        >
          <RebateReportPanel isPc={!isMobile} />
        </div>
      </Overlay>

      <Overlay
        show={rulesPop}
        close={() => setRulesPop(false)}
        position={isMobile ? 'bottom' : 'center'}
        bodyClassname={clsx(
          'flex flex-col overflow-hidden bg-[var(--Background-400)] rounded-t-12px safe-b max-h-[85vh]',
          !isMobile && 'w-450px rounded-b-12px',
        )}
      >
        <ModalHeader
          title="活动规则"
          onClose={() => setRulesPop(false)}
          right={
            <div className="flex items-center justify-end gap-8px">
              <button
                type="button"
                className="flex items-center justify-center border-none bg-none p-0 w-20px h-20px"
                aria-label="关闭"
                onClick={() => setRulesPop(false)}
              >
                <CloseSvg className="text-[var(--Text-Main-10)]" />
              </button>
            </div>
          }
        />
        <div className={styles.rulesContent}>
          <div
            className={styles.popTitle}
            dangerouslySetInnerHTML={{
              __html: handleContent(defaultRules[navIndex]?.popTitle ?? ''),
            }}
          />
          <div className={styles.popContent}>
            {(defaultRules[navIndex]?.popList ?? []).map((item) => (
              <div
                key={item.id}
                className={styles.popItem}
                dangerouslySetInnerHTML={{ __html: handleContent(item.content) }}
              />
            ))}
          </div>
        </div>
      </Overlay>
    </div>
  );
}

export default InviteFriendsHomePage;

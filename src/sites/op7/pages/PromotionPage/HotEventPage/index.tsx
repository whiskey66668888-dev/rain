import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Skeleton, Swiper } from 'antd-mobile';
import { Swiper as SwiperJS, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { useCarouselResQuery, PidType } from '@/apis/origin/carouselRes';
import useHotEventData from './hooks/useHotEventData';
import EventTabs from './EventTabs';
import LazyImage from '@/common/components/LazyImage';
import MyPullToRefresh from '@/common/components/MyPullToRefresh';
import styles from './HotEvent.module.scss';
import likeIcon from '/images/common/promotion/hotEvent/like.png';
import unlikeIcon from '/images/common/promotion/hotEvent/unlike.png';
// ✅ 导入类型
import type { HotEventItem } from '@/apis/origin/promotion/getHot';
import MyInfiniteScroll from './MyInfiniteScroll';

import dayjs from 'dayjs';
import { btnList, getBtnText, rulesList } from './constants';
import throttle from 'lodash/throttle';
import isEmpty from 'lodash/isEmpty';
import { toast } from '@/common/components/Toast';
import { useAppSelector } from '@/core/store/hooks';
import { getSystemTheme } from '@/utils';
import { handleContent } from '@/utils/format/handleContent';
import RulesDialog from './RulesDialog/RulesDialog';
import MyComment from './MyComment';
import SendCommon from './SendCommon';
import { useMount } from 'ahooks';
import Questionnaire from './Questions/questionnaire';
import { AVATAR_LIST } from './constants/avatarAssets';
import useFlutterBridge from '@/sites/op7/hooks/useFlutterBridge';
import Icon from '@/common/components/Icon';
// import HotEventPageSkeleton from '@/common/components/Skeleton/promotion/HotEventPageSkeleton';
const HotEventPage = () => {
  const { sendToFlutter, isInFlutter } = useFlutterBridge();
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;

  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  // 根据 screenBreakpoint 判断是否为移动端（md lg 为 H5，其他为 PC）
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  console.log('theme', theme);
  const { data: carouselData } = useCarouselResQuery({ isMobile: true, pid: PidType.HotEvent });

  // UI 相关状态
  const [rulesShow, setRulesShow] = useState(false); //规则pop
  const [commentShow, setCommentShow] = useState(false); //评论pop
  const [send, setSend] = useState(false); // 评论pop
  const [open, setOpen] = useState(false);
  const [twoChildHeight] = useState<number>(146);
  // 使用抽离的 Hook 管理数据
  const {
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
    runHoteventSend,
    runlikeAdd,
    runlikeSub,
    loadMore,
    handleSwitchEvent: _handleSwitchEvent,
    getInitData,
  } = useHotEventData({
    onSendSuccess: () => {
      setSend(false);
    },
  });
  // 包装切换主题方法，添加收起评论列表逻辑
  const handleSwitchEvent = (index: number) => {
    setOpen(false);
    _handleSwitchEvent(index);
  };
  const throttledToastWarn = throttle(() => {
    toast({
      type: 'warning',
      description: '评论暂未开启，请稍后再试。',
    });
  }, 3000);

  // const onFocus = () => {
  //   setTimeout(() => {
  //     if ((window).goTop) {
  //       (window).goTop.postMessage("");
  //     }
  //   }, 300);
  // };
  const renderNoEvent = () => {
    const bannerList = carouselData ?? [];
    if (bannerList.length > 0) {
      return (
        <div style={{ minHeight: 160 }}>
          <SwiperJS
            modules={[Autoplay]}
            speed={800}
            loop={bannerList.length > 1}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            roundLengths
          >
            {bannerList.map((item) => {
              const src =
                theme === 'dark' && item.nightMaterialContent
                  ? item.nightMaterialContent
                  : item.daytimeMaterialContent;
              return (
                <SwiperSlide key={item.id}>
                  <LazyImage src={src} className="w-full h-auto block" alt="" lazy={false} />
                </SwiperSlide>
              );
            })}
          </SwiperJS>
        </div>
      );
    }
    return (
      <div className={styles.noneBg}>
        <LazyImage src="/images/common/promotion/hotEvent/default.webp" />
      </div>
    );
  };
  const renderLoading = () => {
    return <div></div>;
  };
  const renderPending = () => {
    return [1, 2].map((item) => {
      // ✅ 随机行数，更真实
      const lineCount = item === 1 ? 4 : item === 2 ? 2 : 3;

      return (
        <div className={styles.commontItem} key={item}>
          <Skeleton animated className={styles.avatar}></Skeleton>

          <div className={styles.commontInfo}>
            <div className={styles.commontTimewrap}>
              <div className={styles.vip}>
                <Skeleton animated className={styles.skeletonVipIcon} />
                <Skeleton animated className={styles.skeletonUserName} />
              </div>
              <div className={styles.time}>
                <Skeleton animated className={styles.skeletonTime} />
                <div className={styles.likeWrap}>
                  <Skeleton animated className={styles.skeletonLikeIcon} />
                </div>
              </div>
            </div>

            <div className={styles.commontDetails}>
              <Skeleton.Paragraph
                lineCount={lineCount} // ✅ 动态行数
                animated
              />
            </div>
          </div>
        </div>
      );
    });
  };
  const renderComment = () => {
    return allcomment?.map((item, index) => {
      return (
        <div key={item.id} className={clsx(styles.commontItem, item.isTop ? styles.isTop : '')}>
          <div className={styles.avatar}>
            <LazyImage
              src={
                item.isTop
                  ? '/images/common/promotion/default.png'
                  : (AVATAR_LIST[(index - 1) % AVATAR_LIST.length]?.src ??
                    '/images/common/promotion/default.png')
              }
              className={styles.avatarImg}
              alt=""
              width={34}
              height={34}
            />
          </div>
          <div className={styles.commontInfo}>
            <div className={styles.commontTimewrap}>
              <div className={styles.vip}>
                <LazyImage
                  className={clsx(styles.vipIcon, item.isTop ? styles.avatarGF : '')}
                  src={
                    item.isTop
                      ? '/images/common/promotion/hotEvent/vipgf.png'
                      : `/images/common/promotion/hotEvent/vip${item.vipLevel}.png`
                  }
                  alt=""
                />
                <div className={clsx(styles.name, item.isTop ? styles.nameGF : '')}>
                  {item.isTop ? `OP7体育` : item.loginName}:
                </div>
              </div>
              <div className={styles.time}>
                <div className={styles.timeText}> {dayjs(item.addTime).format('MM-DD HH:mm')}</div>
                <div
                  className={styles.likeWrap}
                  onClick={() => {
                    if (item.myLike) {
                      runlikeSub({ id: item.id, ind: index });
                    } else {
                      runlikeAdd({ id: item.id, ind: index });
                    }
                  }}
                >
                  <div className={styles.likeIcon}>
                    {item.myLike ? (
                      <LazyImage src={likeIcon} alt="" />
                    ) : (
                      <LazyImage src={unlikeIcon} alt="" />
                    )}
                  </div>
                  <div className={styles.likeNum}>{item.likeNum ? item.likeNum : null}</div>
                </div>
              </div>
            </div>
            <div className={styles.commontDetails}>
              {item.comments.split(/\r?\n/).map((line, idx) => (
                <div
                  key={idx}
                  style={{ marginBottom: line.trim() ? '0px' : '0' }} // 只对非空行加空隙
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    });
  };
  const renderEvent = () => {
    return (
      <div className={clsx(styles.hotEventPage)}>
        {/* 主题切换按钮 */}
        <EventTabs
          list={hotList}
          currentIndex={currentEventIndex}
          onChange={handleSwitchEvent}
          disabled={pending}
        />
        <div className={styles.imgBox}>
          {(() => {
            // ✅ 使用导入的类型
            const imgKeys: (keyof HotEventItem)[] = [
              'imageUrl',
              'imageUrl2',
              'imageUrl3',
              'imageUrl4',
              'imageUrl5',
            ];

            const imgList = imgKeys
              .map((key) => hotData?.[key])
              .filter((url): url is string => typeof url === 'string' && !!url);

            return (
              <Swiper
                className={styles.imgBg}
                loop={imgList.length > 1}
                autoplay={imgList.length > 1}
                defaultIndex={0}
                autoplayInterval={5000}
                indicator={(total, current) =>
                  total > 1 ? (
                    <div className={styles.customIndicator}>
                      {Array.from({ length: total }).map((_, i) => (
                        <span key={i} className={i === current ? styles.activeDot : styles.dot} />
                      ))}
                    </div>
                  ) : null
                }
              >
                {imgList.map((item, i) => (
                  <Swiper.Item key={i}>
                    <LazyImage
                      src={item}
                      alt={`image${i + 1}`}
                      // placeholder="blur"
                      className={styles.imgBg}
                    />
                  </Swiper.Item>
                ))}
              </Swiper>
            );
          })()}
        </div>

        <div
          className={clsx(
            styles.commentWrap,
            // open && hotList && hotList.length <= 1 ? styles.commentWrapMaxNormal : '',
            // open && hotList && hotList.length > 1 ? styles.commentWrapMax : '',
          )}
        >
          {allcomment?.length > 0 || pending ? (
            <div
              className={clsx(styles.comment, open ? styles.open : '')}
              style={{
                height: isMobile ? (open ? '100%' : twoChildHeight + 'px') : '100%', // ✅ PC 端固定 408px
              }}
            >
              {isMobile && (
                <div
                  className={styles.commentTop}
                  onClick={() => {
                    if (pending) return;
                    setOpen((boo) => {
                      if (boo && scrollRef.current) {
                        scrollRef.current.scrollTo({
                          top: 0,
                          behavior: 'smooth',
                        });
                      }
                      return !boo;
                    });
                  }}
                >
                  <div className={styles.text}>{open ? '收起' : '展开'}</div>
                  <div className={clsx(styles.up, open ? styles.down : '')}>
                    <Icon
                      src={`/images/common/sportsDetails/vector.svg`}
                      color="var(--Text-Main-10)"
                      size={12}
                    />
                  </div>
                </div>
              )}

              <div className={clsx(styles.commontList)}>
                <div
                  className={clsx(styles.commonScroll, pending ? styles.hidden : '')}
                  ref={scrollRef}
                >
                  {pending ? renderPending() : renderComment()}
                  <MyInfiniteScroll loadMore={loadMore} hasMore={hasMore} threshold={10} />
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <div className={styles.bottomGroup}>
          {btnList.map((item, index) => {
            // 是否是发送评论按钮
            const isSendBtn = index === 2;
            // 评论全局开关是否关闭
            const isCommentClosed = hotData?.commentSwitch === 0;
            // 个人是否有资格发送评论
            const canSendComment = hotData?.discountStatus === 1;
            // 按钮是否禁用
            const isDisabled = isSendBtn && (!canSendComment || isCommentClosed);
            // 是否显示状态文本（非默认按钮内容）
            const showStatusText = isSendBtn && !canSendComment && !isCommentClosed;

            const handleClick = () => {
              // 活动规则
              if (index === 0) {
                setRulesShow(true);
                return;
              }
              // 评论记录
              if (index === 1) {
                if (isEmpty(hotData)) return;
                setCommentShow(true);
                return;
              }
              // 发送评论
              if (isCommentClosed) {
                throttledToastWarn();
                return;
              }
              if (isEmpty(hotData) || !canSendComment) return;
              setSend(true);

              if (isInFlutter()) {
                sendToFlutter('eggHotCommentClick');
              }
              // setTimeout(() => {
              //   if (textareaRef.current) {
              //     onTextareaChange({
              //       target: textareaRef.current,
              //     } as React.ChangeEvent<HTMLTextAreaElement>);
              //   }
              // }, 0);
            };

            return (
              <div
                key={index}
                className={clsx(styles.btn, isDisabled && styles.disabled)}
                onClick={handleClick}
              >
                {showStatusText ? (
                  getBtnText(hotData?.discountStatus ?? 4)
                ) : (
                  <>
                    <Icon
                      src={item.iocn}
                      color={index === 2 ? 'var(--White-100)' : 'var(--Text-Main-10)'}
                      size={14}
                    />
                    {item.text}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  useMount(() => {
    getInitData(true);
  });
  return (
    <div className={clsx(styles.hotEventContainer)}>
      <MyPullToRefresh
        disabled={pending || loading || !isMobile}
        threshold={30}
        onRefresh={async () => {
          try {
            await getInitData();
          } catch (e) {
            console.error('Refresh failed', e);
            throw e;
          }
        }}
      >
        {loading ? renderLoading() : !hotData ? renderNoEvent() : renderEvent()}
        <Questionnaire></Questionnaire>
      </MyPullToRefresh>

      {/* ✅ 使用响应式规则弹窗 */}
      <RulesDialog visible={rulesShow} onClose={() => setRulesShow(false)}>
        <div className={styles.rulesContent}>
          {rulesList.map((item, index) => {
            return (
              <div
                className={styles.rulesItem}
                key={index}
                dangerouslySetInnerHTML={{ __html: handleContent(item) }}
              ></div>
            );
          })}
        </div>
      </RulesDialog>

      {/* 我的评论论记录 */}
      <RulesDialog title="评论记录" visible={commentShow} onClose={() => setCommentShow(false)}>
        <MyComment list={mycomment?.list ?? []}></MyComment>
      </RulesDialog>

      {/* 发送评论 */}
      <SendCommon
        visible={send}
        sendLoading={sendLoading}
        // onFocus={onFocus}
        onClose={() => setSend(false)}
        onSend={(content: string) => {
          if (sendLoading) return;
          if (!content) {
            toast({
              type: 'warning',
              description: '请输入评论',
            });
            return;
          }
          const formData = new FormData();
          formData.append('eventId', String(hotData?.eventId ?? ''));
          formData.append('comments', content);
          runHoteventSend(formData);
        }}
      />
    </div>
  );
};

export default HotEventPage;

/**
 * 游戏内页
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './GamePage.module.scss';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import Icon from '@/common/components/Icon';
import Modal from '@/common/components/Modal';
import Button from '@/common/components/Button';
import {
  setCurrentGameInfo,
  setIsGamePlaying,
  setIsFullscreen,
} from '@/core/store/slices/entertainmentSlice';
import { useMemoizedFn } from 'ahooks';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useEntertainmentHooks } from '@/common/hooks/useEntertainmentHooks';
import LazyImage from '@/common/components/LazyImage';
import { getSystemTheme, scrollToTopLayoutMainContent } from '@/utils';
import { isNativeFullscreenActive, toggleFullscreenForElement } from '@/utils/fullscreen';
import { zIndexMap } from '@/utils/constants/zIndex';
import { useGameTransfer } from './useGameTransfer';
import { SuspendedBall } from '@/sites/op7/components/SuspendedBall';
import { PATHS } from '../../routes/paths';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { openLoginModal } from '@/core/store/slices/authUISlice';
import { launchGameByMenuUrlReq } from '@/apis/origin/gamePlay';
import { toast } from '@/common/components/Toast';

// const GamePage: React.FC<{ refetchRecentGameSlotList: () => void }> = ({
const GamePage: React.FC = (
  {
    // refetchRecentGameSlotList,
  },
) => {
  const { currentGameInfo, isGamePlaying } = useAppSelector((state) => state.entertainment);
  const isMobile = useAppSelector((state) => state.config.screenBreakpoint) === 'md';
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const isFullscreen = useAppSelector((state) => state.entertainment.isFullscreen);
  const trialInterface = useAppSelector((state) => state.config.system.trialInterface);
  const location = useLocation();
  const { handleCollectGame } = useEntertainmentHooks();
  const gameContentRef = useRef<HTMLDivElement>(null);
  const previousPathnameRef = useRef(location.pathname);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeLoadSeqRef = useRef(0);
  const [iframeLoadSeq, setIframeLoadSeq] = useState(0);
  // 场馆试玩：缓存「启动接口 path → 真实游戏地址」，避免反复切换时重复请求
  const venueTryPlayCacheRef = useRef<{ apiUrl: string; realUrl: string } | null>(null);
  const venueTryPlayLaunchSeqRef = useRef(0);
  const venueTryPlayLaunchingRef = useRef(false);
  // 初始化进来的时候如果是pc则直接进入游戏，否则展示h5详情页（或者非电子游戏）
  const [isFavorite, setIsFavorite] = useState(currentGameInfo?.isFavorite ?? false);
  const [isTryPlay, setIsTryPlay] = useState(currentGameInfo?.isTryPlay);
  // 场馆试玩解析后的真实地址；电子试玩不走此字段
  const [venueTryPlayUrl, setVenueTryPlayUrl] = useState<string>();
  // const [isWebDataCollapsed, setIsWebDataCollapsed] = useState(false);
  // 游戏初始化的时候loading，刷新的时候不显示
  const [gameInitLoading, setGameInitLoading] = useState(true);
  const dispatch = useAppDispatch();
  const navigate = useNavigateWithLanguage();

  const handleSetIsGamePlaying = useMemoizedFn((value: boolean) => {
    dispatch(setIsGamePlaying(value));
  });
  const getFirstValidUrl = useMemoizedFn(
    (...urls: Array<string | null | undefined>): string | undefined => {
      // 选择“当前端优先 + 空值自动回退到另一端”
      return urls.find((url): url is string => typeof url === 'string' && url.trim() !== '');
    },
  );
  const {
    // isWaitingTransfer,
    transferVisible,
    mainBalance,
    venueBalance,
    mainBalanceLoading,
    venueBalanceLoading,
    recycleLoading,
    depositLoading,
    autoCashMode,
    openTransfer,
    closeTransfer,
    handleRecycle,
    handleOneClickDeposit,
  } = useGameTransfer({
    refreshGame: () => setIframeKey((k) => k + 1),
  });

  const leaveGameTheme = useMemo(() => {
    return themeMode === 'system' ? getSystemTheme() : (themeMode ?? 'light');
  }, [themeMode]);

  useEffect(() => {
    setGameInitLoading(true);
  }, [currentGameInfo]);

  // 监听路由变化
  useEffect(() => {
    if (previousPathnameRef.current !== location.pathname) {
      dispatch(setCurrentGameInfo(null));
      previousPathnameRef.current = location.pathname;
    }
  }, [dispatch, location.pathname]);

  // 监听设备变化
  useEffect(() => {
    // if (!isMobile) { // h5暂时跳过详情页直接进游戏
    // h5切换到pc直接进入游戏
    handleSetIsGamePlaying(true);
    // }
  }, [isMobile, handleSetIsGamePlaying]);

  useEffect(() => {
    if (!currentGameInfo?.isSlotGame) {
      // 非电子游戏直接进入游戏
      handleSetIsGamePlaying(true);
    }
  }, [handleSetIsGamePlaying, dispatch, currentGameInfo?.isSlotGame]);

  useEffect(() => {
    const onFullscreenChange = () => {
      dispatch(setIsFullscreen(isNativeFullscreenActive()));
    };
    onFullscreenChange();
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    };
  }, [dispatch]);

  // 组件卸载时，重置游戏状态
  useEffect(() => {
    return () => {
      handleSetIsGamePlaying(false);
      dispatch(setCurrentGameInfo(null));
    };
  }, [dispatch, handleSetIsGamePlaying]);

  const normalizeOptionalUrl = (url: unknown): string | undefined => {
    if (typeof url !== 'string') return undefined;
    const trimmedUrl = url.trim();
    return trimmedUrl ? trimmedUrl : undefined;
  };

  const tryPlaySourceUrl = useMemo(() => {
    const gameTestUrl = normalizeOptionalUrl(currentGameInfo?.gameTestUrl);
    const webGameTestUrl = normalizeOptionalUrl(currentGameInfo?.webGameTestUrl);
    return isMobile
      ? getFirstValidUrl(gameTestUrl, webGameTestUrl)
      : getFirstValidUrl(webGameTestUrl, gameTestUrl);
  }, [currentGameInfo?.gameTestUrl, currentGameInfo?.webGameTestUrl, isMobile, getFirstValidUrl]);

  const hasTryPlay = !!tryPlaySourceUrl;

  // 切换场馆/游戏时清空试玩缓存，避免串用上一场的真实地址
  useEffect(() => {
    venueTryPlayCacheRef.current = null;
    venueTryPlayLaunchSeqRef.current += 1;
    venueTryPlayLaunchingRef.current = false;
    setVenueTryPlayUrl(undefined);
  }, [currentGameInfo?.venueGameId, currentGameInfo?.id, currentGameInfo?.gameTestUrl]);

  const gameUrl = useMemo(() => {
    const gameUrl = normalizeOptionalUrl(currentGameInfo?.gameUrl);
    const webGameUrl = normalizeOptionalUrl(currentGameInfo?.webGameUrl);
    const realGameUrl = isMobile
      ? getFirstValidUrl(gameUrl, webGameUrl)
      : getFirstValidUrl(webGameUrl, gameUrl);
    if (isTryPlay && hasTryPlay) {
      // 有试玩模式且有试玩地址则返回试玩地址，否则返回真实地址
      // 电子：列表已返回可打开地址；场馆：需用 POST testUrl 解析后的真实地址
      if (currentGameInfo?.isSlotGame) {
        return tryPlaySourceUrl;
      }
      return venueTryPlayUrl;
    }
    return realGameUrl;
  }, [
    currentGameInfo?.gameUrl,
    currentGameInfo?.webGameUrl,
    currentGameInfo?.isSlotGame,
    isTryPlay,
    hasTryPlay,
    isMobile,
    getFirstValidUrl,
    tryPlaySourceUrl,
    venueTryPlayUrl,
  ]);

  // 每次游戏地址变化或手动刷新时，开启一轮新的 iframe 加载任务
  useEffect(() => {
    if (!gameUrl) return;
    const nextSeq = iframeLoadSeqRef.current + 1;
    iframeLoadSeqRef.current = nextSeq;
    setIframeLoadSeq(nextSeq);
    setGameInitLoading(true);
  }, [gameUrl, iframeKey]);

  const handleRefresh = useMemoizedFn(() => {
    setIframeKey((k) => k + 1);
  });

  const handleIframeLoad = useMemoizedFn((e: React.SyntheticEvent<HTMLIFrameElement>) => {
    const frame = e.currentTarget;
    const srcAttr = frame.getAttribute('src')?.trim();
    if (!srcAttr) return;
    const loadSeq = Number(frame.dataset.loadSeq ?? 0);
    if (loadSeq !== iframeLoadSeqRef.current) return;
    setTimeout(() => {
      setGameInitLoading(false);
    }, 1000);
  });
  const handleFullscreen = useMemoizedFn(() => {
    const el = gameContentRef.current;
    const usedNativeFullscreen = toggleFullscreenForElement(el);
    // iOS 等不支持原生 Fullscreen API 的场景：退化为页面内“伪全屏”状态
    if (!usedNativeFullscreen) {
      dispatch(setIsFullscreen(!isFullscreen));
    }
  });
  const handleSwitchPlayMode = useMemoizedFn((tryPlay: boolean) => {
    if (!isLogin && !tryPlay) {
      dispatch(openLoginModal());
      return;
    }

    const switchMode = async () => {
      // 场馆试玩：testUrl 是启动接口，需先 POST 拿真实地址；结果按 apiUrl 缓存
      if (tryPlay && !currentGameInfo?.isSlotGame) {
        if (!tryPlaySourceUrl) return;
        const cached = venueTryPlayCacheRef.current;
        if (cached?.apiUrl === tryPlaySourceUrl) {
          setVenueTryPlayUrl(cached.realUrl);
        } else {
          if (venueTryPlayLaunchingRef.current) return;
          const launchSeq = ++venueTryPlayLaunchSeqRef.current;
          venueTryPlayLaunchingRef.current = true;
          setGameInitLoading(true);
          try {
            const platform = isMobile ? 'APP' : 'WEB';
            const realUrl = await launchGameByMenuUrlReq(tryPlaySourceUrl, platform);
            if (launchSeq !== venueTryPlayLaunchSeqRef.current) return;
            venueTryPlayCacheRef.current = { apiUrl: tryPlaySourceUrl, realUrl };
            setVenueTryPlayUrl(realUrl);
          } catch {
            if (launchSeq !== venueTryPlayLaunchSeqRef.current) return;
            setGameInitLoading(false);
            toast({
              description: '获取试玩地址失败，请稍后重试',
              type: 'error',
            });
            return;
          } finally {
            if (launchSeq === venueTryPlayLaunchSeqRef.current) {
              venueTryPlayLaunchingRef.current = false;
            }
          }
        }
      }

      setIsTryPlay(tryPlay);
      setGameInitLoading(true);
      handleSetIsGamePlaying(true);
      setIframeKey((k) => k + 1);
    };

    void switchMode();
  });

  const handleToggleFavorite = useMemoizedFn(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const gameId = currentGameInfo?.id;
    if (!gameId) return;

    const nextFavorite = !isFavorite;
    const success = await handleCollectGame(gameId, isFavorite);
    if (success) {
      setIsFavorite(nextFavorite);
    }
  });

  const handleGoHome = useMemoizedFn(() => {
    // 退出时如果开启自动转账 则自动归集 并且不提示信息
    if (autoCashMode) {
      handleRecycle(false);
    }
    dispatch(setCurrentGameInfo(null));
    scrollToTopLayoutMainContent();
  });

  const handleLeaveGame = useMemoizedFn((goToDeposit: boolean = false) => {
    if (!isGamePlaying) {
      handleGoHome();
      return;
    }
    Modal.open({
      content: (close) => (
        <div className={styles.leaveGamePanel}>
          <div className={styles.leaveGameTitle}>确定离开游戏吗?</div>
          <div className={styles.leaveGameBody}>
            <img
              src={`/images/${leaveGameTheme}/leave-game.png`}
              alt=""
              className={styles.leaveGameImage}
            />
            <div className={styles.leaveGameActions}>
              <Button type="primary" className={styles.leaveGameButton} onClick={close}>
                再玩一会
              </Button>
              <Button
                type="second"
                className={styles.leaveGameButton}
                onClick={() => {
                  close();
                  if (goToDeposit) {
                    navigate(PATHS.mineDeposit);
                  } else {
                    handleGoHome();
                  }
                }}
              >
                离开
              </Button>
            </div>
          </div>
        </div>
      ),
      showCloseButton: false,
      footer: null,
      width: 320,
      className: styles.leaveGameModal,
      contentClassName: styles.leaveGameModalContent,
      zIndex: 100,
    });
  });
  const handleTransfer = useMemoizedFn(() => {
    openTransfer();
  });

  const renderBalanceValue = useMemoizedFn((value: string, loading: boolean, highlight = false) => {
    const balanceClassName = highlight
      ? `${styles.transferBalance} ${styles.transferBalanceHighlight}`
      : styles.transferBalance;

    return loading ? (
      <div className={balanceClassName}>
        <Icon
          src="/images/common/loading.svg"
          size={18}
          color={highlight ? 'var(--ThemeColor-Main)' : 'var(--Text-Main-10)'}
          className={styles.balanceLoadingIcon}
        />
      </div>
    ) : (
      <div className={balanceClassName}>{value}</div>
    );
  });

  return (
    <div className={styles.gamePage}>
      <div>
        <div className={styles.header}>
          <Icon
            onClick={() => handleLeaveGame(false)}
            src="/images/common/back.svg"
            size="12px"
            color="var(--Text-800)"
          />
          <span className={clsx('_tf[14]', styles.h5GameTitle)}>{currentGameInfo?.name}</span>
          {!isMobile && (
            <div className={styles.gameHeaderBtns}>
              {!currentGameInfo?.hideGameTransfer && !isTryPlay && (
                <span onClick={handleTransfer}>转账</span>
              )}
              <span onClick={handleRefresh}>刷新</span>
            </div>
          )}
        </div>

        <div className={styles.gameContent}>
          {isMobile ? (
            <>
              <div className={styles.h5GameDetails}>
                <div className={styles.gameBaseInfo}>
                  <LazyImage
                    src={currentGameInfo?.imageUrl ?? ''}
                    alt={currentGameInfo?.name ?? ''}
                    className="min-w-100px w-[25%] aspect-[10/13] h-auto object-cover rounded-10px"
                  />
                  <div className={styles.gameMeta}>
                    <p className={styles.gameName}>{currentGameInfo?.name}</p>
                    <p className={styles.gameProvider}>By progmaotic play</p>
                    <div className={styles.gamePopularity}>
                      <Icon
                        src={'/images/common/follow.svg'}
                        size="16px"
                        color={isFavorite ? 'var(--ThemeColor-Main)' : 'var(--Text-800)'}
                        className="flex-shrink-0"
                        onClick={(e) => {
                          handleToggleFavorite(e);
                        }}
                      />
                      {/* <span>2347</span> */}
                    </div>
                    <div className={styles.gameStats}>
                      <div className={styles.statItem}>
                        <span>理论返还率</span>
                        <strong>92.2%</strong>
                      </div>
                      <div className={styles.statItem}>
                        <span>最低投注</span>
                        <strong>0.01</strong>
                      </div>
                      <div className={styles.statItem}>
                        <span>最高投注</span>
                        <strong>100</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.playBtn}
                  onClick={() => handleSwitchPlayMode(false)}
                >
                  真钱游戏
                </button>

                <div className={styles.gameActions}>
                  <button type="button" onClick={() => alert('游戏规则 TODO')}>
                    游戏规则
                  </button>
                  {hasTryPlay && trialInterface && (
                    <button
                      type="button"
                      className={clsx(!hasTryPlay && styles.notAvailable)}
                      onClick={() => handleSwitchPlayMode(true)}
                    >
                      试玩模式
                    </button>
                  )}
                </div>
              </div>
              <div className={styles.h5GameData}>
                <div className={styles.dataItem}>
                  <p>日均返还率</p>
                  <div className={clsx(styles.dataValue, styles.arrowUp)}>
                    <span>92%</span>
                    <i />
                  </div>
                </div>
                <div className={styles.dataItem}>
                  <p>周均返还率</p>
                  <div className={clsx(styles.dataValue, styles.arrowDown)}>
                    <span>92%</span>
                    <i />
                  </div>
                </div>
                <div className={styles.dataItem}>
                  <p>月均返还率</p>
                  <div className={clsx(styles.dataValue, styles.arrowUp)}>
                    <span>92%</span>
                    <i />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.webGameWrapper}>
                <div
                  className={clsx(
                    styles.webGameContent,
                    styles[`gameId-${currentGameInfo?.venueGameId ?? 0}`],
                  )}
                  ref={gameContentRef}
                >
                  {gameInitLoading && (
                    <div className={styles.gameInitLoading}>
                      <img src={`/images/${leaveGameTheme}/loading.png`} alt="loading" />
                    </div>
                  )}
                  <iframe
                    key={iframeKey}
                    src={gameUrl}
                    title="game"
                    data-load-seq={iframeLoadSeq}
                    onLoad={handleIframeLoad}
                  >
                    <div className={clsx(styles.gameInitLoading, gameInitLoading && styles.show)}>
                      <img src={`/images/${leaveGameTheme}/loading.png`} alt="loading" />
                    </div>
                  </iframe>
                </div>
                <div className={styles.webGameFooter}>
                  <div className={styles.gamePcFooterLeft}>
                    {currentGameInfo?.isSlotGame && (
                      <div className="_tf[12]">
                        <Icon
                          src={'/images/common/follow_game_dz.svg'}
                          size="20px"
                          color={isFavorite ? 'var(--Warning-200)' : 'var(--Text-800)'}
                          onClick={(e) => {
                            handleToggleFavorite(e);
                          }}
                        />
                        {/* <span>2347</span> */}
                      </div>
                    )}
                    <Icon
                      src="/images/common/fullscreen.svg"
                      size="18px"
                      color="var(--Text-800)"
                      onClick={handleFullscreen}
                    />
                  </div>
                  {trialInterface && (
                    <div className={clsx('_tf[14]', styles.gamePcFooterRight)}>
                      <button
                        type="button"
                        onClick={() => hasTryPlay && handleSwitchPlayMode(true)}
                        className={clsx(
                          isTryPlay && styles.active,
                          !hasTryPlay && styles.notAvailable,
                        )}
                      >
                        试玩模式
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSwitchPlayMode(false)}
                        className={clsx(!isTryPlay && styles.active)}
                      >
                        真钱游戏
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {/* {currentGameInfo?.isSlotGame && (
                <div className={styles.webGameData}>
                  <div className={styles.dataHead}>
                    <div className={styles.dataTitle}>{currentGameInfo?.name}</div>
                    <div className={styles.dataTags}>
                      {['高爆', '高倍', '高回报', '高赔率', '爆分', '大奖频出'].map(
                        (tag, index) => (
                          <span key={tag} className={clsx(index === 0 && styles.active)}>
                            {tag}
                          </span>
                        ),
                      )}
                    </div>
                    <button
                      type="button"
                      className={styles.dataToggle}
                      onClick={() => setIsWebDataCollapsed((prev) => !prev)}
                    >
                      <Icon
                        src="/images/common/single_arrow.svg"
                        size="10px"
                        color="var(--Text-800)"
                        className={clsx(styles.toggleIcon, !isWebDataCollapsed && styles.expanded)}
                      />
                    </button>
                  </div>
                  <div className={clsx(styles.dataContent, isWebDataCollapsed && styles.collapsed)}>
                    <div className={styles.dataStats}>
                      <div>
                        <p>理论返还率</p>
                        <strong>92.2%</strong>
                      </div>
                      <div>
                        <p>最低投注</p>
                        <strong>0.01</strong>
                      </div>
                      <div>
                        <p>最高投注</p>
                        <strong>100</strong>
                      </div>
                      <div>
                        <p>日均返还率</p>
                        <strong className={styles.up}>92%</strong>
                      </div>
                      <div>
                        <p>周均返还率</p>
                        <strong className={styles.down}>92%</strong>
                      </div>
                      <div>
                        <p>月均返还率</p>
                        <strong className={styles.up}>92%</strong>
                      </div>
                    </div>
                    <p className={styles.dataDesc}>
                      PG
                      Soft游戏规则是出品的这款以中国神话为灵感的视频老虎机游戏《麒麟之道》提供超过46,656种赢钱方式。游戏将玩家带入美丽的中国文化世界，其精美的符号、画面和插图都令人叹为观止。游戏中的符号包括金罐、船、钱袋和小白菜，并拥有丰富的特色功能和令人印象深刻的倍数奖励。如果您喜欢Megaways机制的游戏，那么您一定会喜欢BC.GAME上的《麒麟之道》，因为它们有很多相似之处。事实证明，《麒麟之道》是一款令人愉悦的视频老虎机游戏。
                    </p>
                  </div>
                </div>
              )} */}
            </>
          )}
        </div>
        {isMobile && isGamePlaying && (
          <div className={styles.h5GameWrapper}>
            <div
              className={clsx(styles.h5GameHeader, isFullscreen && 'important:hidden')}
              style={{ backgroundColor: currentGameInfo?.backgroundColor }}
            >
              <div onClick={() => handleLeaveGame(false)} className={styles.headerBtn}>
                <Icon
                  src="/images/common/back.svg"
                  size="16px"
                  color={currentGameInfo?.titleColor ?? 'var(--Text-Main-10)'}
                />
                <span style={{ color: currentGameInfo?.titleColor }}>{currentGameInfo?.name}</span>
              </div>
              <div className={styles.headerBtns}>
                <span
                  className={styles.headerBtn}
                  style={{ color: currentGameInfo?.titleColor }}
                  onClick={handleFullscreen}
                >
                  全屏
                </span>
                {!currentGameInfo?.hideGameTransfer && !isTryPlay && (
                  <span
                    className={styles.headerBtn}
                    style={{ color: currentGameInfo?.titleColor }}
                    onClick={handleTransfer}
                  >
                    转账
                  </span>
                )}
                <span
                  className={styles.headerBtn}
                  style={{ color: currentGameInfo?.titleColor }}
                  onClick={handleRefresh}
                >
                  刷新
                </span>
              </div>
            </div>
            <div className={styles.h5GameContent} ref={gameContentRef}>
              {gameInitLoading && (
                <div className={styles.gameInitLoading}>
                  <img src={`/images/${leaveGameTheme}/loading.png`} alt="loading" />
                </div>
              )}
              {/* 全屏的时候展示悬浮球 */}
              {isFullscreen && (
                <SuspendedBall
                  toggleTransfer={handleTransfer}
                  toggleRefresh={handleRefresh}
                  toggleFullscreen={handleFullscreen}
                  toggleExit={(goToDeposit) => handleLeaveGame(goToDeposit)}
                  isTryPlay={isTryPlay ?? false}
                />
              )}
              <iframe
                key={iframeKey}
                src={gameUrl}
                title="game"
                data-load-seq={iframeLoadSeq}
                onLoad={handleIframeLoad}
              >
                <div className={clsx(styles.gameInitLoading, gameInitLoading && styles.show)}>
                  <img src={`/images/${leaveGameTheme}/loading.png`} alt="loading" />
                </div>
              </iframe>
            </div>
          </div>
        )}
        <Modal
          show={transferVisible}
          onClose={closeTransfer}
          title="转账"
          showCloseButton
          closeButtonClassName="!right-0 top-2px"
          footer={null}
          maskClickClose={!recycleLoading && !depositLoading}
          zIndex={zIndexMap.walletSubModal}
          width={isMobile ? 320 : 402}
          className={styles.transferModal}
          contentClassName={styles.transferModalContent}
        >
          <div className={styles.transferColumns}>
            <div className={styles.transferColumn}>
              <div className={styles.transferLabel}>主账户余额</div>
              {renderBalanceValue(mainBalance, mainBalanceLoading, true)}
              <button
                type="button"
                className={styles.transferAction}
                onClick={() => {
                  void handleRecycle();
                }}
                disabled={recycleLoading || depositLoading}
              >
                {recycleLoading ? '处理中...' : '主账户回收'}
              </button>
            </div>
            <div className={styles.transferDivider} />
            <div className={styles.transferColumn}>
              <div className={styles.transferLabel}>当前游戏余额</div>
              {renderBalanceValue(venueBalance, venueBalanceLoading)}
              <button
                type="button"
                className={styles.transferAction}
                onClick={() => {
                  void handleOneClickDeposit();
                }}
                disabled={recycleLoading || depositLoading}
              >
                {depositLoading ? '处理中...' : '一键转入'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default GamePage;

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ClientOnly } from '@/common/components/ClientOnly';
import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';

import { useAppSelector } from '@/core/store/hooks';

import { ModalCloseButton } from '../../components/themeIcon';
// import siteConfig from '../../site.config';
import styles from './FastSettingsModal.module.scss';
import { zIndexMap } from '@/utils/constants/zIndex';
import Switch from '@/common/components/Switch';
import SegmentedControl from '@/common/components/SegmentedControl';
import { useSportSettings } from '@/common/hooks/sports/useSportSettings';
import Icon from '@/common/components/Icon';
import CircleCheck from '@/common/components/CircleCheck';
import clsx from 'clsx';
import { ACCEPT_ODDS_PREFER_VALUE_MAP, EAcceptOddsPrefer } from '@/apis/commonSports/constants';
import { FONT_SIZE_OPTIONS, FontScaleType, THEME_OPTIONS } from '@/utils/constants/system';
import { useSystem } from '@/common/hooks/useSystem';
import Popover from '@/common/components/Popover';
import { useQuestions } from '@/apis/origin/helpCenter/helpCenterInfo';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';

const PLATE_STYLE_OPTIONS: { value: string; label: string }[] = [
  { value: 'pro', label: '专业版' },
  { value: 'simple', label: '简洁版' },
];

const ACCEPT_ODDS_PREFER_OPTIONS = [
  {
    label: <p className="text-[var(--Text-800)]">不自动接受任何变动</p>,
    value: EAcceptOddsPrefer.No,
  },
  {
    label: (
      <p className="text-[var(--Text-800)]">
        自动接受<span className="text-[var(--ThemeColor-Main)]">更高</span>赔率（预设）
      </p>
    ),
    value: EAcceptOddsPrefer.Better,
  },
  {
    label: (
      <p>
        自动接受<span className="text-[var(--ThemeColor-Main)]">最新</span>赔率（最优，推荐）
      </p>
    ),
    value: EAcceptOddsPrefer.Any,
  },
];
interface FastSettingsModalProps {
  show: boolean;
  handleClose: () => void;
}
const FastSettingsModal: React.FC<FastSettingsModalProps> = ({ show, handleClose }) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isSimpleOdds = useAppSelector((state) => state.sport.mainList.settings.isSimpleOdds);
  const isOpenGoalSound = useAppSelector((state) => state.sport.isOpenGoalSound);
  const syncSingleParlay = useAppSelector((state) => state.sport.syncSingleParlay);
  const acceptOddsPrefer = useAppSelector((state) => state.user.acceptOddsPrefer);
  const autoFollowMatch = useAppSelector((state) => state.user.autoFollowMatch);
  const { fontScaleType, themeMode } = useAppSelector((state) => state.config.system);
  const [showBettingSettings, setShowBettingSettings] = useState(false);
  const { setFontScaleType, setTheme } = useSystem();
  const navigate = useNavigateWithLanguage();
  const isH5 = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const acceptOddsPreferDisplayText = useMemo(
    () =>
      (ACCEPT_ODDS_PREFER_VALUE_MAP[acceptOddsPrefer] ?? '')
        .replace(/（[^）]*）|\([^)]*\)/g, '')
        .trim(),
    [acceptOddsPrefer],
  );
  const {
    toggleSyncSingleParlay,
    toggleIsSimpleOdds,
    toggleIsOpenGoalSound,
    setAcceptOddsPrefer,
    toggleAutoFollowMatch,
  } = useSportSettings();

  const { data: questionsData } = useQuestions();

  const goToHandicapTutorial = useCallback(() => {
    handleClose();
    const id = questionsData?.data?.questionTypeList
      ?.find((item) => item.questionTypeName === '游戏问题')
      ?.questionList.find((item) => item.questionName.includes('盘口教程'))?.questionId;
    if (id) {
      navigate(`${PATHS.helpCenterDetail}?questionId=${id}`);
    } else {
      navigate(PATHS.helpCenter);
    }
  }, [handleClose, navigate, questionsData]);

  const goToBettingRules = useCallback(() => {
    handleClose();
    const id = questionsData?.data?.questionTypeList
      ?.find((item) => item.questionTypeName === '游戏问题')
      ?.questionList.find((item) => item.questionName.includes('投注规则'))?.questionId;
    if (id) {
      navigate(`${PATHS.helpCenterDetail}?questionId=${id}`);
    } else {
      navigate(PATHS.helpCenter);
    }
  }, [handleClose, navigate, questionsData]);

  // 根据 screenBreakpoint 判断是否为移动端（md 为 H5，其他为 PC）
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const overlayPosition = useMemo<OverlayPosition>(
    () => (isMobile ? 'bottom' : 'center'),
    [isMobile],
  );
  const [showQuestion, setShowQuestion] = useState(false);
  const [isStandaloneApp, setIsStandaloneApp] = useState(false);

  useEffect(() => {
    const checkStandalone = (): void => {
      const byDisplayMode = window.matchMedia?.('(display-mode: standalone)').matches ?? false;
      const byIOS = Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
      setIsStandaloneApp(byDisplayMode || byIOS);
    };

    checkStandalone();
    const mediaQuery = window.matchMedia?.('(display-mode: standalone)');
    mediaQuery?.addEventListener('change', checkStandalone);
    return () => mediaQuery?.removeEventListener('change', checkStandalone);
  }, []);

  return (
    <ClientOnly>
      <Overlay
        show={show}
        close={handleClose}
        position={overlayPosition}
        maskClickClose
        zIndex={zIndexMap.loginModal}
      >
        <div
          className={clsx(
            styles.fastSettingsModal,
            isMobile ? styles.mobile : styles.desktop,
            isMobile && isStandaloneApp && styles.standaloneSafeArea,
            'font-400 _tf[14]',
          )}
        >
          {/* 关闭按钮（Pad/Web在右上角，H5在Banner内） */}
          {!!isH5 && (
            <ModalCloseButton onClick={handleClose} className="top-[14px] !right-[12px]" />
          )}

          <p
            className={
              '_tf[16] font-500 text-[var(--Text-Main-10)] text-center h-48px line-height-48px'
            }
          >
            快捷设置
          </p>
          <ul className={styles.btnBox}>
            <li>
              <span>进球铃声</span>
              <Switch checked={!!isOpenGoalSound} onChange={toggleIsOpenGoalSound} hasBtnText />
            </li>
            {isH5 && (
              <li>
                <span>盘口样式</span>
                <SegmentedControl
                  options={PLATE_STYLE_OPTIONS}
                  height={28}
                  value={isSimpleOdds ? 'simple' : 'pro'}
                  onChange={(v) => void toggleIsSimpleOdds(v === 'simple')}
                />
              </li>
            )}
            <li>
              <section>
                同步单串
                <Popover
                  content={
                    <div className="_tf[12]">
                      <div>开启后：选择单关的同时，串关也会被添加；</div>
                      <div>关闭后：选择单关的同时，串关不会被添加；</div>
                    </div>
                  }
                  visible={showQuestion}
                  trigger="click"
                  placement="top"
                >
                  <Icon
                    onMouseEnter={() => setShowQuestion(true)}
                    onMouseLeave={() => setShowQuestion(false)}
                    src="/images/common/question.svg"
                    size="16px"
                    color="var(--ThemeColor-Main)"
                  />
                </Popover>
              </section>
              <div>
                <Switch checked={!!syncSingleParlay} onChange={toggleSyncSingleParlay} hasBtnText />
              </div>
            </li>
            <li
              onClick={() => setShowBettingSettings(!showBettingSettings)}
              className={clsx(showBettingSettings && 'important:border-b-0')}
            >
              <span>投注设置</span>
              <div className="flex items-center">
                <span className="text-[var(--ThemeColor-Main)] _tf[12] pr-4px">
                  {acceptOddsPreferDisplayText}
                </span>
                <Icon
                  src="/images/common/arrow_sports.svg"
                  size="12px"
                  color={showBettingSettings ? 'var(--Text-700)' : 'var(--Text-800)'}
                  className={clsx(styles.collapsedIcon, {
                    [styles.collapsed as string]: showBettingSettings,
                  })}
                />
              </div>
            </li>
            {showBettingSettings && (
              <section className={styles.bettingSettings}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4px">
                    接受赔率设置
                    <Popover
                      content={
                        <span className="_tf[12]">
                          当前盘口发生赔率变化时，系统 会遵循您的设定处理
                        </span>
                      }
                      trigger="click"
                      placement="top"
                    >
                      <Icon src="/images/common/question.svg" size="16px" color="var(--Text-700)" />
                    </Popover>
                  </div>
                </div>
                <div className="flex flex-col gap-8px">
                  {ACCEPT_ODDS_PREFER_OPTIONS.map((item) => (
                    <div
                      key={item.value}
                      className="flex items-center gap-8px _tf[12]"
                      onClick={() => setAcceptOddsPrefer(item.value)}
                    >
                      <div>
                        <CircleCheck checked={acceptOddsPrefer === item.value} />
                      </div>
                      {item.label}
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-8px _tf[12]">
                    <section className="flex items-center gap-4px">
                      投注成功后自动关注赛事
                      <Icon
                        src="/images/common/question.svg"
                        size="16px"
                        color="var(--ThemeColor-Main)"
                      />
                    </section>
                    <Switch
                      checked={!!autoFollowMatch}
                      onChange={toggleAutoFollowMatch}
                      hasBtnText
                    />
                  </div>
                </div>
              </section>
            )}
            <li onClick={goToHandicapTutorial}>
              <span>盘口教程</span>
              <Icon
                src="/images/common/arrow_sports.svg"
                size="12px"
                color="var(--Text-800)"
                className="rotate-90deg"
              />
            </li>
            <li onClick={goToBettingRules}>
              <span>投注规则</span>
              <Icon
                src="/images/common/arrow_sports.svg"
                size="12px"
                color="var(--Text-800)"
                className="rotate-90deg"
              />
            </li>
            <li>
              <span>字体大小</span>
              <SegmentedControl
                options={FONT_SIZE_OPTIONS}
                value={fontScaleType ?? FontScaleType.NORMAL}
                onChange={(v) => setFontScaleType(v)}
                height={28}
              />
            </li>
            <li>
              <span>外观样式</span>
              <SegmentedControl
                options={THEME_OPTIONS}
                value={themeMode ?? 'system'}
                onChange={(v) => setTheme(v)}
                height={28}
              />
            </li>
          </ul>
        </div>
      </Overlay>
    </ClientOnly>
  );
};

export default FastSettingsModal;

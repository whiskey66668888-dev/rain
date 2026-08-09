/**
 * 体育页面PC端选项栏
 */
import React, { useCallback, useState } from 'react';
import styles from './OptionBarPC.module.scss';
import { PATHS } from '@/sites/op7/routes/paths';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import Icon from '@/common/components/Icon';
import Button from '@/common/components/Button';
import { useQuestions } from '@/apis/origin/helpCenter/helpCenterInfo';
import { usePopupWindows } from '@/common/hooks/popupWindows/usePopupWindows';
import FastSettingsModal from '../../../FastSettingsPage';

const OptionBarPC: React.FC = () => {
  const navigate = useNavigateWithLanguage();
  const {
    openBetHistoryWindow,
    openResultWindow,
    openSportsRulesWindow,
    openBettingTutorialWindow,
  } = usePopupWindows();
  const { data: questionsData } = useQuestions();
  const [fastSettingsModalShow, setFastSettingsModalShow] = useState(false);
  const openHelpPopup = useCallback(
    (keyword: string, onOpen: (questionId: number) => void) => {
      const id = questionsData?.data?.questionTypeList
        ?.find((item) => item.questionTypeName === '游戏问题')
        ?.questionList.find((item) => item.questionName.includes(keyword))?.questionId;

      if (id) {
        onOpen(id);
        return;
      }

      navigate(PATHS.helpCenter);
    },
    [navigate, questionsData],
  );

  const goToSportsRules = useCallback(() => {
    openHelpPopup('投注规则', openSportsRulesWindow);
  }, [openHelpPopup, openSportsRulesWindow]);

  const goToBettingTutorial = useCallback(() => {
    openHelpPopup('盘口教程', openBettingTutorialWindow);
  }, [openBettingTutorialWindow, openHelpPopup]);

  return (
    <div className={styles.option}>
      <div className="_tf[14]">
        <div onClick={() => openBetHistoryWindow()}>
          <Icon src="/images/common/menu/bethistory.svg" size="16px" color="var(--Text-800)" />
          <span>注单历史</span>
        </div>
        <div onClick={openResultWindow}>
          <Icon src="/images/common/menu/result.svg" size="16px" color="var(--Text-800)" />
          <span>赛果查询</span>
        </div>
      </div>
      <div>
        <Button type="fourth" size="small" onClick={goToSportsRules}>
          体育规则
        </Button>
        <Button type="fourth" size="small" onClick={goToBettingTutorial}>
          投注教程
        </Button>
        <Button type="fourth" size="small" onClick={() => setFastSettingsModalShow(true)}>
          设置
        </Button>
      </div>
      <FastSettingsModal
        handleClose={() => setFastSettingsModalShow(false)}
        show={fastSettingsModalShow}
      />
    </div>
  );
};

export default OptionBarPC;

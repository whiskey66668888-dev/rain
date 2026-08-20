import React from 'react';

import { ChannelItemV2 } from '@/apis/origin/finance/depositV2';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';

import styles from './index.module.scss';

interface TutorialEntryProps {
  channelItem: ChannelItemV2;
}

const TutorialEntry: React.FC<TutorialEntryProps> = ({ channelItem }) => {
  const navigate = useNavigateWithLanguage();

  const openTutorial = () => {
    if (!channelItem.helpId) return;
    navigate(`${PATHS.helpCenterDetail}?questionId=${channelItem.helpId}`);
  };

  return (
    <button type="button" className={styles.tutorial} onClick={openTutorial}>
      {channelItem.img ? <img src={channelItem.img} alt="" /> : null}
      <span>{channelItem.name}充值教程</span>
    </button>
  );
};

export default TutorialEntry;

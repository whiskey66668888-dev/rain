import { useState } from 'react';
import type { ChatFilterType } from '../types';

export const useChatFilter = () => {
  const [chatFilterType, setChatFilterType] = useState<ChatFilterType>('chat');

  const isChatTab = chatFilterType === 'chat';
  const isShareTab = chatFilterType === 'share';
  const isBigTab = chatFilterType === 'big';

  return {
    chatFilterType,
    setChatFilterType,
    isChatTab,
    isShareTab,
    isBigTab,
  };
};

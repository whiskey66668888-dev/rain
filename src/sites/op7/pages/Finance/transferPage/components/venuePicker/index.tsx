import React, { useMemo } from 'react';

import { ClientOnly } from '@/common/components/ClientOnly';
import Overlay from '@/common/components/Overlay';
import type { OverlayPosition } from '@/common/components/Overlay';

import type { GameItem } from '@/apis/origin/finance/transfer';
import { useAppSelector } from '@/core/store/hooks';
// utils
import { zIndexMap } from '@/utils/constants/zIndex';
// styles
import styles from './index.module.scss';
import { ModalCloseButton } from '@/sites/op7/components/themeIcon';

interface GameGroup {
  groupName: string;
  list: GameItem[];
}

const GAME_TYPE_GROUP_MAP: Record<number, string> = {};

const groupArr = [
  { group: '体育', keys: [89, 114, 79, 78, 30, 60] }, //
  { group: '棋牌', keys: [38, 55, 18, 74, 118] }, //
  { group: '电竞', keys: [81, 84, 88] }, //
  { group: '真人', keys: [43, 31, 5, 20, 91] }, //
  { group: '电子', keys: [68, 70, 72, 12, 51, 120, 113, 9, 117, 116] }, //
  { group: '彩票', keys: [83, 110, 71, 115, 63, 16] }, //
];

groupArr.forEach(({ group, keys }) => {
  keys.forEach((key) => {
    GAME_TYPE_GROUP_MAP[key] = group;
  });
});

const groupByGameType = (list: GameItem[]): GameGroup[] => {
  const groupMap: Record<string, GameItem[]> = {};
  list.forEach((item) => {
    const groupName = GAME_TYPE_GROUP_MAP[item.gameId];
    if (groupName) {
      if (!groupMap[groupName]) groupMap[groupName] = [];
      groupMap[groupName].push(item);
    }
  });
  const sortArr = ['体育', '棋牌', '电竞', '真人', '电子', '彩票'];
  return sortArr
    .map((groupName) => ({
      groupName,
      list: groupMap[groupName] || [],
    }))
    .filter((item) => item.list.length > 0);
};

const VenuePicker: React.FC<{
  visible: boolean;
  onClose: () => void;
  list: GameItem[];
  value: GameItem | null;
  onChange: (val: GameItem) => void;
}> = ({ visible, onClose, list = [], value, onChange }) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  // 根据 screenBreakpoint 判断是否为移动端（md 为 H5，其他为 PC）
  const isMobile = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const overlayPosition = useMemo<OverlayPosition>(
    () => (isMobile ? 'bottom' : 'center'),
    [isMobile],
  );

  const groups = useMemo(() => {
    return groupByGameType(list);
  }, [list]);

  const onSelect = (item: GameItem) => {
    onChange(item);
    onClose();
  };

  return (
    <ClientOnly>
      <Overlay
        show={visible}
        close={onClose}
        position={overlayPosition}
        maskClickClose
        zIndex={zIndexMap.walletSubModal}
      >
        <div className={`${styles.accountPicker} ${isMobile ? styles.mobile : styles.desktop}`}>
          <header>
            选择账户
            <ModalCloseButton onClick={onClose} className={styles.bnClose} />
          </header>
          <section>
            <div className={styles.cardList}>
              {groups.map((group) => (
                <div key={group.groupName} className={styles.group}>
                  <div className={styles.groupTitle}>{group.groupName}</div>
                  <div className={styles.btnList}>
                    {group.list.map((item) => (
                      <button
                        key={item.gameId}
                        className={`${styles.accountBtn} ${value && value.gameId === item.gameId ? styles.activeBtn : ''}`}
                        onClick={() => {
                          onSelect(item);
                          onClose();
                        }}
                      >
                        {item.gameName}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </Overlay>
    </ClientOnly>
  );
};

export default VenuePicker;

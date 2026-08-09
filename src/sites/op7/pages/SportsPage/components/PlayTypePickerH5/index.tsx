// 赛事分组类型选择器
import React, { useMemo } from 'react';

import { ClientOnly } from '@/common/components/ClientOnly';

import { HotSportId, LotterySportId, PlayType, PlayTypeId } from '@/apis/commonSports/constants';
import { useAppSelector } from '@/core/store/hooks';

import useSportsMainListControl from '@/common/hooks/useSportsMainListControl';

import styles from './PlayTypePicker.module.scss';
import skeletonStyles from '@/common/components/Skeleton/Skeleton.module.scss';

const PlayTypePickerH5: React.FC = () => {
  const { switchPlayType } = useSportsMainListControl();
  const currentPlayType = useAppSelector((state) => state.sport.mainList.settings.playType);
  const followMatch = useAppSelector((state) => state.sport.mainList.settings.followMatch);
  const menuInfo = useAppSelector((state) => state.sport.mainList.datas.menuInfo);

  const playTypeMenuList = useMemo(() => {
    // 在倒数第二个插入关注按钮
    const newPlayTypeList = [...(menuInfo?.playTypes || [])];
    newPlayTypeList.splice(newPlayTypeList.length - 1, 0, {
      type: PlayType.Follow,
      typeId: PlayTypeId.Follow,
      name: '关注',
      count: _.size(followMatch),
    });
    return newPlayTypeList;
  }, [menuInfo, followMatch]);

  if (menuInfo?.playTypes.length === 0) {
    return (
      <div className={styles.playTypePicker}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={skeletonStyles.skeletonBase}></div>
        ))}
      </div>
    );
  }
  return (
    <div className={styles.playTypePicker}>
      {playTypeMenuList.map((item) => {
        const isActive = item.type === currentPlayType;
        return (
          <div
            key={item.typeId}
            onClick={() =>
              switchPlayType(
                item.type,
                menuInfo?.menus?.[item.type]?.[0]?.sportId ?? HotSportId,
                item.typeId,
              )
            }
            className={isActive ? styles.active : ''}
          >
            {item.type !== PlayType.Champion && (
              <span className={` ${isActive ? '_tf[16]' : '_tf[12]'} fw[600] max-lg:_tf[12]`}>
                {item.type === PlayType.Follow ? (
                  // 用户相关内容服务端不渲染
                  <ClientOnly fallback={<span>-</span>}>{item.count}</ClientOnly>
                ) : (
                  // 竞彩不参与计数，
                  menuInfo?.menus?.[item.type]?.reduce(
                    (acc, item) => (item.sportId === LotterySportId ? acc : acc + item.count),
                    0,
                  )
                )}
              </span>
            )}
            <span className={`_tf[14] fw[500] ${styles.playTypeName}`}>{item.name}</span>
          </div>
        );
      })}
    </div>
  );
};

export default PlayTypePickerH5;

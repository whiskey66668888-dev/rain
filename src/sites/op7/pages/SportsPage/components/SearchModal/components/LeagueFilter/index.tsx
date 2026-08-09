import { LeagueGroup, LeagueItem } from '@/apis/fbSports/common/types';
import { useGetLeaguesQuery } from '@/apis/fbSports/getLeagues';
import Skeleton from '@/common/components/Skeleton';
import Empty from '@/common/components/Empty';
import LazyImage from '@/common/components/LazyImage';
import Input from '@/common/components/SearchInput';
import Icon from '@/common/components/Icon';
import { useAppSelector } from '@/core/store/hooks';
import { IndexBar } from 'antd-mobile';

import styles from './index.module.scss';
import CheckBox from '@/common/components/CheckBox';
import { useEffect, useMemo, useState } from 'react';

const LeagueFilter: React.FC<{
  sportId: number;
  /** 与列表已生效的筛选同步，用于再次打开弹窗时恢复勾选高亮 */
  initialSelectedLeagueIds?: number[];
  onLeagueFilter: (sportId: number, leagueIds: number[], text?: string) => void;
  defaultText?: string;
  changeText?: (val: string) => void;
}> = ({ sportId, initialSelectedLeagueIds, onLeagueFilter, defaultText, changeText }) => {
  const hotLeagueGroupName = '热门联赛';
  const [collapseList, setCollapseList] = useState<string[]>([]);
  const [selectedList, setSelectedList] = useState<number[]>(() => [
    ...(initialSelectedLeagueIds ?? []),
  ]);
  const [searchText, setSearchText] = useState<string>(defaultText ?? '');

  const syncedLeagueIdsKey = [...(initialSelectedLeagueIds ?? [])].sort((a, b) => a - b).join(',');
  useEffect(() => {
    setSelectedList([...(initialSelectedLeagueIds ?? [])]);
    // syncedLeagueIdsKey：按联赛 id 集合变化同步，忽略 Redux 数组引用更替
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncedLeagueIdsKey]);
  const { playTypeId } = useAppSelector((state) => state.sport.mainList.settings);
  const { data, isLoading } = useGetLeaguesQuery({ type: playTypeId ?? 0, sportId });

  const leagueGroupList: LeagueGroup[] | undefined = data;

  const filterList = useMemo(() => {
    if (leagueGroupList === undefined) return [];

    let groupList: LeagueGroup[] = [];
    if (!searchText) {
      groupList = [...leagueGroupList];
    } else {
      leagueGroupList.forEach((leagueGroup) => {
        if (leagueGroup.name.includes(searchText)) {
          groupList.push(leagueGroup);
          return;
        }

        const itemList: LeagueItem[] = leagueGroup.list.filter((obj) =>
          obj.name.includes(searchText),
        );
        if (itemList.length) {
          groupList.push({
            ...leagueGroup,
            list: itemList,
          });
        }
      });
    }

    const hotLeagueList = groupList.flatMap((leagueGroup) =>
      leagueGroup.list.filter((league) => league.hot),
    );
    const hotGroupList: LeagueGroup[] = hotLeagueList.length
      ? [
          {
            spell: '热',
            name: hotLeagueGroupName,
            isCollapsed: false,
            list: Array.from(new Map(hotLeagueList.map((league) => [league.id, league])).values()),
          },
        ]
      : [];

    const sortedGroupList = [...groupList].sort((a, b) => {
      if (a.spell < b.spell) {
        return -1;
      }
      if (a.spell > b.spell) {
        return 1;
      }
      return 0;
    });

    return [...hotGroupList, ...sortedGroupList].map((obj) => ({
      ...obj,
      isCollapsed: collapseList.includes(obj.name),
    }));
  }, [searchText, collapseList, leagueGroupList, hotLeagueGroupName]);

  const indexList = useMemo(() => {
    const groupList: { index: string; list: LeagueGroup[] }[] = [];

    filterList.forEach((leagueGroup) => {
      const index = leagueGroup.name === hotLeagueGroupName ? '热' : leagueGroup.spell;
      const currentGroup = groupList.find((item) => item.index === index);

      if (currentGroup) {
        currentGroup.list.push(leagueGroup);
        return;
      }

      groupList.push({
        index,
        list: [leagueGroup],
      });
    });

    return groupList;
  }, [filterList, hotLeagueGroupName]);

  const onCollapse = (name: string) => {
    if (collapseList.includes(name)) {
      setCollapseList(collapseList.filter((obj) => obj !== name));
      return;
    }

    setCollapseList([...collapseList, name]);
  };

  const onLeagueCheckedChange = (id: number) => {
    if (selectedList.includes(id)) {
      setSelectedList(selectedList.filter((obj) => obj !== id));
      return;
    }

    setSelectedList([...selectedList, id]);
  };

  const onGroupCheckedChange = (isChecked: boolean, leagueGroup: LeagueGroup) => {
    if (isChecked) {
      const addList: number[] = [];
      leagueGroup.list.forEach((league) => {
        if (!selectedList.includes(league.id)) {
          addList.push(league.id);
        }
      });

      if (addList.length) {
        setSelectedList([...selectedList, ...addList]);
      }
      return;
    }

    const removeList: number[] = [];
    leagueGroup.list.forEach((league) => {
      if (selectedList.includes(league.id)) {
        removeList.push(league.id);
      }
    });

    if (removeList.length) {
      setSelectedList(selectedList.filter((obj) => !removeList.includes(obj)));
    }
  };

  const onChangeSelectedAll = (isChecked: boolean) => {
    if (!isChecked) {
      setSelectedList([]);
      return;
    }

    const list = new Set<number>();
    filterList.forEach((leagueGroup) => {
      leagueGroup.list.forEach((league) => {
        list.add(league.id);
      });
    });

    setSelectedList([...list]);
  };

  const checkIsGroup = (leagueGroup: LeagueGroup) => {
    let result = true;
    leagueGroup.list.forEach((league) => {
      if (!selectedList.includes(league.id)) {
        result = false;
      }
    });

    return result;
  };

  const isCheckedAll = useMemo(() => {
    if (filterList.length === 0) return false;

    let selectAll = true;
    filterList.forEach((leagueGroup) => {
      leagueGroup.list.forEach((league) => {
        if (!selectedList.includes(league.id)) {
          selectAll = false;
        }
      });
    });

    return selectAll;
  }, [filterList, selectedList]);

  const isAllChecked = useMemo(() => {
    if (leagueGroupList === undefined) return true;

    let selectAll = true;
    leagueGroupList.forEach((leagueGroup) => {
      leagueGroup.list.forEach((league) => {
        if (!selectedList.includes(league.id)) {
          selectAll = false;
        }
      });
    });

    return selectAll;
  }, [leagueGroupList, selectedList]);

  const onChangeText = (val: string) => {
    setSearchText(val);
    changeText?.(val);
  };

  const onSubmit = () => {
    const leagueIds = isAllChecked ? [] : [...selectedList];
    onLeagueFilter(sportId, leagueIds, searchText);
  };

  const renderLeagueGroup = (item: LeagueGroup) => {
    const isCheckGroup = checkIsGroup(item);

    return (
      <div key={item.name} className={styles.leagueGroup}>
        <div className={styles.leagueGroupTitle}>
          <div className={styles.left} onClick={() => onCollapse(item.name)}>
            <Icon
              className={`${styles.icArrow} ${item.isCollapsed ? styles.collapsed : ''}`}
              src="/images/common/arrow_down.svg"
              size="12px"
              color="var(--Text-800)"
            />
            <span>{item.name}</span>
          </div>

          {!isCheckGroup ? (
            <span
              onClick={() => onGroupCheckedChange(!isCheckGroup, item)}
              className={styles.selectionIcon}
            />
          ) : (
            <LazyImage
              lazy={false}
              src="/images/common/CheckboxCircle.svg"
              width={16}
              height={16}
              onClick={() => onGroupCheckedChange(!isCheckGroup, item)}
            />
          )}
        </div>

        <div className={`${styles.leagueList} ${item.isCollapsed ? styles.hide : ''}`}>
          {item.list.map((league) => {
            const isChecked = selectedList.includes(league.id);

            return (
              <div
                key={`${item.name}-${league.id}`}
                className={styles.leagueItem}
                onClick={() => onLeagueCheckedChange(league.id)}
              >
                <div className={styles.leagueName}>
                  <LazyImage src={league.icon} width={20} height={20} />
                  <span>{league.name}</span>
                </div>
                <div className={styles.right}>
                  {/* <span className={styles.leagueCount}>({league.mt})</span> */}
                  {!isChecked ? (
                    <span className={styles.selectionIcon} />
                  ) : (
                    <LazyImage
                      lazy={false}
                      src="/images/common/CheckboxCircle.svg"
                      width={16}
                      height={16}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return <Skeleton type="leagueFilter" />;
    }

    if (filterList.length === 0) {
      return (
        <div className={styles.emptyWrapper}>
          <Empty type="search" variant="card" />
        </div>
      );
    }

    return (
      <IndexBar className={styles.indexBar} sticky={false}>
        {indexList.map((item) => (
          <IndexBar.Panel key={item.index} index={item.index} title={null}>
            <div className={styles.indexPanel}>{item.list.map(renderLeagueGroup)}</div>
          </IndexBar.Panel>
        ))}
      </IndexBar>
    );
  };

  return (
    <div className={styles.leagueFilter}>
      <Input
        className={styles.searchInput}
        inputClassName={styles.searchInputElement}
        iconSize="16px"
        iconColor="var(--Text-700)"
        placeholder={'请输入联赛名或地区名'}
        value={searchText}
        onChange={onChangeText}
      />

      <div className={styles.leagueGroupList}>{renderContent()}</div>

      <div className={styles.footer}>
        <div className={styles.left} onClick={() => onChangeSelectedAll(!isCheckedAll)}>
          <CheckBox value={isCheckedAll} />
          <span>{'全选'}</span>
        </div>

        {selectedList.length > 0 && (
          <span className={styles.bnConfirm} onClick={onSubmit}>
            {`筛选(${selectedList.length})`}
          </span>
        )}
      </div>
    </div>
  );
};

export default LeagueFilter;

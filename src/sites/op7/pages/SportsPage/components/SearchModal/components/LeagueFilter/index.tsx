import { LeagueGroup, LeagueItem } from '@/apis/fbSports/common/types';
import { EVenue } from '@/apis/commonSports/constants';
import { useVenueService } from '@/apis/commonSports';
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

const HOT_LEAGUE_GROUP_NAME = '热门联赛';

type LeagueId = number | string;

const sameLeagueId = (a: LeagueId, b: LeagueId) => String(a) === String(b);

/** 按搜索文案过滤分组（地区名命中则整组保留） */
function filterGroupsBySearch(groups: LeagueGroup[], searchText: string): LeagueGroup[] {
  if (!searchText) return groups;

  const result: LeagueGroup[] = [];
  for (const leagueGroup of groups) {
    if (leagueGroup.name.includes(searchText)) {
      result.push(leagueGroup);
      continue;
    }
    const itemList = leagueGroup.list.filter((obj) => obj.name.includes(searchText));
    if (itemList.length) {
      result.push({ ...leagueGroup, list: itemList });
    }
  }
  return result;
}

/** FB：从 hot 标记重建「热门联赛」组并按拼音排序（OB 接口已含热门组，勿走此逻辑） */
function buildFbDisplayGroups(groups: LeagueGroup[]): LeagueGroup[] {
  const hotLeagueList = groups.flatMap((leagueGroup) =>
    leagueGroup.list.filter((league) => league.hot),
  );
  const hotGroupList: LeagueGroup[] = hotLeagueList.length
    ? [
        {
          spell: '热',
          name: HOT_LEAGUE_GROUP_NAME,
          isCollapsed: false,
          list: Array.from(
            new Map(hotLeagueList.map((league) => [String(league.id), league])).values(),
          ),
        },
      ]
    : [];

  const sortedGroupList = [...groups].sort((a, b) => {
    if (a.spell < b.spell) return -1;
    if (a.spell > b.spell) return 1;
    return 0;
  });

  return [...hotGroupList, ...sortedGroupList];
}

const LeagueFilter: React.FC<{
  sportId: number;
  /** 与列表已生效的筛选同步，用于再次打开弹窗时恢复勾选高亮 */
  initialSelectedLeagueIds?: LeagueId[];
  onLeagueFilter: (sportId: number, leagueIds: LeagueId[], text?: string) => void;
  defaultText?: string;
  changeText?: (val: string) => void;
}> = ({ sportId, initialSelectedLeagueIds, onLeagueFilter, defaultText, changeText }) => {
  const [collapseList, setCollapseList] = useState<string[]>([]);
  const [selectedList, setSelectedList] = useState<LeagueId[]>(() => [
    ...(initialSelectedLeagueIds ?? []),
  ]);
  const [searchText, setSearchText] = useState<string>(defaultText ?? '');

  const syncedLeagueIdsKey = [...(initialSelectedLeagueIds ?? [])].map(String).sort().join(',');
  useEffect(() => {
    setSelectedList([...(initialSelectedLeagueIds ?? [])]);
    // syncedLeagueIdsKey：按联赛 id 集合变化同步，忽略 Redux 数组引用更替
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncedLeagueIdsKey]);

  const venue = useAppSelector((state) => state.sport.venue);
  const { playTypeId } = useAppSelector((state) => state.sport.mainList.settings);
  const { useGetLeaguesQuery } = useVenueService();
  const isOb = venue === EVenue.OB;
  const leagueParams = { type: playTypeId ?? 0, sportId };

  const { data, isLoading } = useGetLeaguesQuery(leagueParams);

  const leagueGroupList: LeagueGroup[] | undefined = data;
  const selectedSet = useMemo(() => new Set(selectedList.map(String)), [selectedList]);

  const filterList = useMemo(() => {
    if (leagueGroupList === undefined) return [];

    const searched = filterGroupsBySearch(leagueGroupList, searchText);
    // OB：接口已返回热门分组（spell=热）并排序；FB：本地拼热门组
    const displayGroups = isOb ? searched : buildFbDisplayGroups(searched);

    return displayGroups.map((obj) => ({
      ...obj,
      isCollapsed: collapseList.includes(obj.name),
    }));
  }, [searchText, collapseList, leagueGroupList, isOb]);

  const indexList = useMemo(() => {
    const groupList: { index: string; list: LeagueGroup[] }[] = [];

    for (const leagueGroup of filterList) {
      const index = leagueGroup.name === HOT_LEAGUE_GROUP_NAME ? '热' : leagueGroup.spell;
      const currentGroup = groupList.find((item) => item.index === index);

      if (currentGroup) {
        currentGroup.list.push(leagueGroup);
        continue;
      }

      groupList.push({
        index,
        list: [leagueGroup],
      });
    }

    return groupList;
  }, [filterList]);

  const onCollapse = (name: string) => {
    setCollapseList((prev) =>
      prev.includes(name) ? prev.filter((obj) => obj !== name) : [...prev, name],
    );
  };

  const onLeagueCheckedChange = (id: LeagueId) => {
    setSelectedList((prev) =>
      prev.some((item) => sameLeagueId(item, id))
        ? prev.filter((item) => !sameLeagueId(item, id))
        : [...prev, id],
    );
  };

  const onGroupCheckedChange = (isChecked: boolean, leagueGroup: LeagueGroup) => {
    setSelectedList((prev) => {
      const prevSet = new Set(prev.map(String));
      if (isChecked) {
        const next = [...prev];
        for (const league of leagueGroup.list) {
          if (!prevSet.has(String(league.id))) next.push(league.id);
        }
        return next;
      }
      const removeSet = new Set(leagueGroup.list.map((league) => String(league.id)));
      return prev.filter((id) => !removeSet.has(String(id)));
    });
  };

  const onChangeSelectedAll = (isChecked: boolean) => {
    if (!isChecked) {
      setSelectedList([]);
      return;
    }

    const list = new Map<string, LeagueId>();
    for (const leagueGroup of filterList) {
      for (const league of leagueGroup.list) {
        list.set(String(league.id), league.id);
      }
    }
    setSelectedList([...list.values()]);
  };

  const checkIsGroup = (leagueGroup: LeagueGroup) => {
    if (!leagueGroup.list.length) return false;
    return leagueGroup.list.every((league) => selectedSet.has(String(league.id)));
  };

  const isCheckedAll = useMemo(() => {
    if (filterList.length === 0) return false;
    for (const leagueGroup of filterList) {
      for (const league of leagueGroup.list) {
        if (!selectedSet.has(String(league.id))) return false;
      }
    }
    return true;
  }, [filterList, selectedSet]);

  const isAllChecked = useMemo(() => {
    if (leagueGroupList === undefined) return true;
    for (const leagueGroup of leagueGroupList) {
      for (const league of leagueGroup.list) {
        if (!selectedSet.has(String(league.id))) return false;
      }
    }
    return true;
  }, [leagueGroupList, selectedSet]);

  const onChangeText = (val: string) => {
    setSearchText(val);
    changeText?.(val);
  };

  const onSubmit = () => {
    // OB 对齐 Flutter：始终提交勾选 id（含全选）；FB 全选传 [] 表示不筛选
    const leagueIds = isOb ? [...selectedList] : isAllChecked ? [] : [...selectedList];
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
          {item.list.map((league: LeagueItem) => {
            const isChecked = selectedSet.has(String(league.id));

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

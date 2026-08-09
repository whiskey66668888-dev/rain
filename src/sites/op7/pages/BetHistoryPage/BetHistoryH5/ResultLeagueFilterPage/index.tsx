import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';

import { getFirstLetterPinyin } from '@/apis/fbSports/common/fbFormat';
import { fbList } from '@/apis/fbSports/common/constants';
import { useFbMatchResultListQuery } from '@/apis/fbSports/betRecord/getFBResultList';
import Empty from '@/common/components/Empty';
import Icon from '@/common/components/Icon';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';

import {
  createResultLeagueOptionsFromLgs,
  readResultLeagueFilterStorage,
  type ResultLeagueOption,
  writeResultLeagueFilterStorage,
  type ResultLeagueFilterMode,
} from '../utils/resultLeagueFilterStorage';
import styles from './index.module.scss';

interface LeagueLetterGroup {
  letter: string;
  list: ResultLeagueOption[];
}

const getLeagueFirstLetter = (name: string) => {
  const firstChar = name.trim().charAt(0);
  if (/^[a-z]$/i.test(firstChar)) {
    return firstChar.toUpperCase();
  }

  const pinyinLetter = getFirstLetterPinyin(firstChar).charAt(0);
  if (/^[A-Z]$/.test(pinyinLetter)) {
    return pinyinLetter;
  }

  return '#';
};

const groupLeaguesByLetter = (leagues: ResultLeagueOption[]): LeagueLetterGroup[] => {
  const groupMap = new Map<string, ResultLeagueOption[]>();

  leagues.forEach((league) => {
    const letter = getLeagueFirstLetter(league.leagueName);
    const group = groupMap.get(letter) ?? [];
    group.push(league);
    groupMap.set(letter, group);
  });

  return Array.from(groupMap.entries())
    .sort(([a], [b]) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    })
    .map(([letter, list]) => ({
      letter,
      list: list.sort((a, b) => a.leagueName.localeCompare(b.leagueName, 'zh-Hans-CN')),
    }));
};

const createDefaultDateRange = () => ({
  startTime: dayjs().startOf('day').valueOf(),
  endTime: dayjs().endOf('day').valueOf(),
});

const ResultLeagueFilterPage = () => {
  const navigate = useNavigateWithLanguage();
  const initialStorage = useMemo(readResultLeagueFilterStorage, []);
  const dateRange = useMemo(
    () => initialStorage?.dateRange ?? createDefaultDateRange(),
    [initialStorage?.dateRange],
  );
  const sportId = initialStorage?.sportId ?? 1;
  const sportName =
    initialStorage?.sportName ?? fbList.find((item) => item.id === sportId)?.label ?? '足球';
  const [leagueOptions, setLeagueOptions] = useState<ResultLeagueOption[]>(
    () => initialStorage?.leagueOptions ?? [],
  );
  const [searchText, setSearchText] = useState(initialStorage?.searchText ?? '');
  const [mode, setMode] = useState<ResultLeagueFilterMode>(initialStorage?.mode ?? 'all');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    () => new Set(initialStorage?.leagueIds ?? []),
  );
  const [activeLetter, setActiveLetter] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const groupRefs = useRef<Record<string, HTMLElement | null>>({});
  const { data: resultLeagueData } = useFbMatchResultListQuery(
    {
      sportId,
      beginTime: dateRange.startTime,
      endTime: dateRange.endTime,
      leagueIds: [],
      size: 300,
    },
    { enabled: leagueOptions.length === 0 },
  );

  const allLeagues = leagueOptions;
  const allLeagueIds = useMemo(() => allLeagues.map((league) => league.leagueId), [allLeagues]);

  const filteredLeagues = useMemo(() => {
    const keyword = searchText.trim();
    if (!keyword) return allLeagues;

    return allLeagues.filter((league) => league.leagueName.includes(keyword));
  }, [allLeagues, searchText]);

  const letterGroups = useMemo(() => groupLeaguesByLetter(filteredLeagues), [filteredLeagues]);
  const selectedCount = mode === 'all' ? allLeagueIds.length : selectedIds.size;
  const confirmDisabled = mode === 'partial' && selectedIds.size === 0;
  const isAllChecked = allLeagueIds.length > 0 && selectedCount === allLeagueIds.length;

  const isLeagueSelected = (id: number) => {
    if (mode === 'all') return true;
    return selectedIds.has(id);
  };

  const normalizeSelectedSet = (nextSet: Set<number>) => {
    if (nextSet.size === allLeagueIds.length) {
      setMode('all');
      setSelectedIds(new Set());
      return;
    }

    setMode('partial');
    setSelectedIds(nextSet);
  };

  const handleLeagueToggle = (id: number) => {
    const currentSet = mode === 'all' ? new Set(allLeagueIds) : new Set(selectedIds);

    if (currentSet.has(id)) {
      currentSet.delete(id);
    } else {
      currentSet.add(id);
    }

    normalizeSelectedSet(currentSet);
  };

  const handleAllToggle = () => {
    if (isAllChecked) {
      setMode('partial');
      setSelectedIds(new Set());
      return;
    }

    setMode('all');
    setSelectedIds(new Set());
  };

  const handleConfirm = () => {
    if (confirmDisabled) return;

    writeResultLeagueFilterStorage({
      dateRange,
      sportId,
      sportName,
      mode,
      leagueIds: mode === 'all' ? [] : Array.from(selectedIds),
      leagueOptions,
      searchText,
      updatedAt: Date.now(),
    });
    navigate(-1);
  };

  const updateActiveLetter = useCallback(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea || letterGroups.length === 0) return;

    const currentTop = scrollArea.scrollTop + 16;
    let nextLetter = letterGroups[0]?.letter ?? '';

    for (let index = letterGroups.length - 1; index >= 0; index -= 1) {
      const group = letterGroups[index];
      if (!group) continue;

      const groupNode = groupRefs.current[group.letter];
      if (groupNode && groupNode.offsetTop <= currentTop) {
        nextLetter = group.letter;
        break;
      }
    }

    setActiveLetter(nextLetter);
  }, [letterGroups]);

  const handleLetterClick = (letter: string) => {
    const scrollArea = scrollAreaRef.current;
    const groupNode = groupRefs.current[letter];
    if (!scrollArea || !groupNode) return;

    setActiveLetter(letter);
    scrollArea.scrollTo({ top: groupNode.offsetTop, behavior: 'smooth' });
  };

  useEffect(() => {
    setActiveLetter(letterGroups[0]?.letter ?? '');
  }, [letterGroups]);

  useEffect(() => {
    const options = createResultLeagueOptionsFromLgs(resultLeagueData?.pages[0]?.lgs);
    if (options.length === 0) return;

    setLeagueOptions(options);
    writeResultLeagueFilterStorage({
      dateRange,
      sportId,
      sportName,
      mode,
      leagueIds: mode === 'all' ? [] : Array.from(selectedIds),
      leagueOptions: options,
      searchText,
      updatedAt: Date.now(),
    });
  }, [dateRange, mode, resultLeagueData?.pages, searchText, selectedIds, sportId, sportName]);

  return (
    <div className={styles.resultLeagueFilterPage}>
      <header className={styles.header}>
        <button type="button" className={styles.backButton} onClick={() => navigate(-1)}>
          {/* <ArrowLeftSvg className={styles.backIcon} /> */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="9"
            height="16"
            viewBox="0 0 9 16"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0 7.87073C0.00811342 7.66882 0.0892472 7.4693 0.243402 7.31515L7.31447 0.244078C7.63991 -0.0813592 8.16754 -0.0813592 8.49298 0.244078C8.81842 0.569515 8.81842 1.09715 8.49298 1.42259L2.00454 7.91033L8.49298 14.3985C8.81842 14.7239 8.81842 15.2516 8.49298 15.577C8.16754 15.9024 7.63991 15.9024 7.31447 15.577L0.243402 8.50592C0.0892472 8.35177 0.00811342 8.15224 0 7.95033V7.87073Z"
              fill="currentColor"
            />
          </svg>
        </button>
        <h1>筛选联赛</h1>
        <span className={styles.headerPlaceholder} />
      </header>

      <section className={styles.searchSection}>
        <div className={styles.sportTitle}>
          <span className={styles.titleMark} />
          <strong>{sportName}</strong>
        </div>
        <label className={styles.searchBox}>
          <Icon src="/images/common/ic_search.svg" size="16px" color="var(--Text-700,#7c8aa1)" />
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="请输入联赛名或地区名"
          />
        </label>
      </section>

      <main className={styles.content}>
        <div className={styles.listHeader}>全部联赛 A-Z</div>

        <div ref={scrollAreaRef} className={styles.scrollArea} onScroll={updateActiveLetter}>
          {letterGroups.length === 0 && <Empty />}

          {letterGroups.map((group) => (
            <section
              key={group.letter}
              ref={(node) => {
                groupRefs.current[group.letter] = node;
              }}
              className={styles.letterGroup}
            >
              <h2>{group.letter}</h2>
              <div className={styles.leagueList}>
                {group.list.map((league) => {
                  const checked = isLeagueSelected(league.leagueId);

                  return (
                    <button
                      key={league.leagueId}
                      type="button"
                      className={styles.leagueItem}
                      onClick={() => handleLeagueToggle(league.leagueId)}
                    >
                      <span className={checked ? styles.checkboxChecked : styles.checkbox} />
                      <span className={styles.leagueName}>{league.leagueName}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {letterGroups.length > 0 && (
          <nav className={styles.letterIndex} aria-label="联赛字母索引">
            {letterGroups.map((group) => (
              <button
                key={group.letter}
                type="button"
                className={activeLetter === group.letter ? styles.letterIndexActive : undefined}
                onClick={() => handleLetterClick(group.letter)}
              >
                {group.letter}
              </button>
            ))}
          </nav>
        )}
      </main>

      <footer className={styles.footer}>
        <button type="button" className={styles.allButton} onClick={handleAllToggle}>
          <span className={isAllChecked ? styles.checkboxChecked : styles.checkbox} />
          <span>全选</span>
        </button>
        <button
          type="button"
          className={styles.confirmButton}
          disabled={confirmDisabled}
          onClick={handleConfirm}
        >
          确认 <span>{selectedCount}</span>
        </button>
      </footer>
    </div>
  );
};

export default ResultLeagueFilterPage;

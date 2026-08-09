import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import { ImageViewer } from 'antd-mobile';

import Empty from '@/common/components/Empty';
import type { IncidentItem, IncidentMsg } from '@/apis/origin/discover';
import {
  formatIncidentTime,
  getVisibleIncidentRows,
  isGoalIncident,
} from '../../../utils/formatDiscoverData';
import { match_evn_img_map } from '../../constants';
import whistleIcon from '@/sites/op7/images/common/discover/liveSituation/ic_whistle_new.png.webp';
import styles from './index.module.scss';

const getMessageIcon = (msg: IncidentMsg, item: IncidentItem): string | undefined => {
  if (msg.icon === '上') return match_evn_img_map[1000];
  if (msg.icon === '下') return match_evn_img_map[1001];
  if (msg.isAssist) return match_evn_img_map[18];
  return match_evn_img_map[Number(item.type)];
};

const EventText: React.FC<{ item: IncidentItem; isHome: boolean }> = ({ item, isHome }) => {
  const messages = (item.list ?? []).filter((msg) => {
    if (!msg.text) return false;
    if ((item.list?.length ?? 0) > 1 && !msg.icon && msg.text.includes(' - ')) return false;
    if (msg.isTip && msg.text === '换人') return false;
    return true;
  });

  if (messages.length === 0) {
    return <div className={clsx(styles.eventText, !isHome && styles.eventTextAway)}></div>;
  }

  console.log('EventText:', messages);
  return (
    <div className={clsx(styles.eventText, !isHome && styles.eventTextAway)}>
      {messages.map((msg, index) => {
        // Skip the score msg
        if ((!msg.icon && msg.text.includes(' - ')) || !msg.text) {
          return null;
        }
        return (
          <span
            className={clsx(
              msg.isTip && styles.tipText,
              msg.isAssist && styles.assistText,
              msg.icon === '上' && styles.inText,
              msg.icon === '下' && styles.outText,
            )}
            key={`${msg.text}-${index}`}
          >
            {msg.text}
          </span>
        );
      })}
    </div>
  );
};

const EventIcons: React.FC<{ item: IncidentItem }> = ({ item }) => {
  const icons = ['1', '9', '11', '10', '12', '23', '29'].includes(item.type)
    ? (item.list ?? [])
        .filter((msg) => !(msg.isTip || !msg.icon))
        .map((msg) => getMessageIcon(msg, item))
        .filter((icon): icon is string => Boolean(icon))
    : [match_evn_img_map[Number(item.type)]].filter((icon): icon is string => Boolean(icon));

  if (icons.length === 0) return <span className={styles.iconSlot} />;

  return (
    <span className={styles.iconSlot}>
      {icons.map((icon, index) => (
        <img src={icon} alt="" key={`${icon}-${index}`} />
      ))}
    </span>
  );
};

const EventPill: React.FC<{
  item: IncidentItem;
  onPreview: (src: string) => void;
}> = ({ item, onPreview }) => {
  const image = item.gif || item.cover || '';
  const canShowPill = (Boolean(item.home_score) || Boolean(item.gif)) && item.type !== '30';
  const hasScore = isGoalIncident(item) && item.home_score && item.away_score;

  if (!canShowPill) return null;

  return (
    <button
      type="button"
      className={styles.eventPill}
      onClick={() => {
        if (image) onPreview(image);
      }}
    >
      {image && <span className={styles.playMark} />}
      {hasScore ? `${item.home_score}-${item.away_score}` : item.type_info || '事件'}
    </button>
  );
};

const Whistle: React.FC = () => (
  <div className={styles.whistle}>
    <i />
    <img src={whistleIcon} alt="" />
    <i />
  </div>
);

const ImportantEvents: React.FC<{ incidents: IncidentItem[] }> = ({ incidents }) => {
  const [onlyGoals, setOnlyGoals] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const visibleIncidents = useMemo(
    () => getVisibleIncidentRows(incidents, onlyGoals),
    [incidents, onlyGoals],
  );

  console.log('visibleIncidents:', incidents);

  return (
    <section className={styles.eventsPanel}>
      <header className={styles.panelHeader}>
        <h4>重要事件</h4>
        <label className={styles.goalSwitch}>
          <span>进球</span>
          <input
            type="checkbox"
            checked={onlyGoals}
            onChange={(event) => setOnlyGoals(event.target.checked)}
          />
          <i />
        </label>
      </header>

      {visibleIncidents.length === 0 ? (
        <Empty
          text="暂无重要事件"
          variant="card"
          className="h-[160px]"
          imgWrapClassName="w-[64px] h-[64px]"
          iconClassName="w-[30px] h-[30px]"
          textClassName="_tf[13]"
        />
      ) : (
        <>
          <Whistle />
          <div className={styles.timeline}>
            {visibleIncidents.map((item, index) => {
              const isHome = item.position === '1';
              const isAway = item.position === '2';
              const time = formatIncidentTime(item, incidents);

              if (!isHome && !isAway) {
                return (
                  <div className={styles.neutralEvent} key={`${item.type}-${item.time}-${index}`}>
                    <i />
                    <span>{time || item.type_info || '-'}</span>
                    <i />
                  </div>
                );
              }

              return (
                <div
                  className={clsx(styles.eventRow, isHome ? styles.homeEvent : styles.awayEvent)}
                  key={`${item.type}-${item.time}-${index}`}
                >
                  {isHome ? (
                    <>
                      <time>{time || '-'}</time>
                      <div className={styles.eventMedia}>
                        <EventIcons item={item} />
                        <EventPill item={item} onPreview={setPreviewImage} />
                      </div>
                      <EventText item={item} isHome />
                    </>
                  ) : (
                    <>
                      <EventText item={item} isHome={false} />
                      <div className={styles.eventMedia}>
                        <EventPill item={item} onPreview={setPreviewImage} />
                        <EventIcons item={item} />
                      </div>
                      <time>{time || '-'}</time>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <Whistle />
        </>
      )}

      {previewImage && (
        <ImageViewer
          image={previewImage}
          visible={Boolean(previewImage)}
          onClose={() => setPreviewImage('')}
        />
      )}
    </section>
  );
};

export default ImportantEvents;

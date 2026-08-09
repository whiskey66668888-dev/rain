import React, { useMemo, useState } from 'react';
import { ImageViewer } from 'antd-mobile';

import { match_evn_img_map } from '../../constants';
import { formatIncidentTime } from '../../../utils/formatDiscoverData';
import type { IncidentItem } from '@/apis/origin/discover';

import styles from './index.module.scss';

const Moments: React.FC<{ incidents: IncidentItem[] }> = ({ incidents }) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const moments = useMemo(() => incidents.filter((item) => item.gif || item.cover), [incidents]);

  const previewImages = useMemo(
    () => moments.map((item) => item.gif || item.cover || ''),
    [moments],
  );

  if (moments.length === 0) return null;

  return (
    <section className={styles.moments}>
      <div className={styles.momentScroller}>
        {moments.map((item, index) => (
          <button
            type="button"
            className={styles.moment}
            key={`${item.time}-${index}`}
            onClick={() => {
              setPreviewIndex(index);
              setPreviewVisible(true);
            }}
          >
            <img src={item.cover || item.gif} alt="" />
            <span className={styles.momentMeta}>
              <span className={styles.momentTime}>
                {formatIncidentTime(item, incidents)}
                {match_evn_img_map[Number(item.type)] && (
                  <img src={match_evn_img_map[Number(item.type)]} alt="" />
                )}
              </span>
              {item.home_score || item.away_score ? (
                <span className={styles.momentScore}>
                  {item.home_score || '0'}-{item.away_score || '0'}
                </span>
              ) : null}
            </span>
          </button>
        ))}
      </div>
      {previewVisible && (
        <ImageViewer.Multi
          images={previewImages}
          visible={previewVisible}
          defaultIndex={previewIndex}
          onClose={() => {
            setPreviewVisible(false);
          }}
        />
      )}
    </section>
  );
};

export default Moments;

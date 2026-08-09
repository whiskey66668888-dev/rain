import React, { ReactNode } from 'react';
import clsx from 'clsx';

import styles from './index.module.scss';
import { handleContent } from '@/utils/format/handleContent';
type ActivityTextSection = {
  title: ReactNode;
  content: ReactNode | ReactNode[];
};

interface ActivityTextCardProps {
  sections: ActivityTextSection[];
  className?: string;
}

const ActivityTextCard: React.FC<ActivityTextCardProps> = ({ sections, className }) => {
  return (
    <div className={clsx(styles.card, className)}>
      {sections.map((section, index) => {
        const contentList = Array.isArray(section.content) ? section.content : [section.content];

        return (
          <section className={styles.section} key={index}>
            <div className={styles.title}>
              <span className={styles.dot} />
              <span>{section.title}</span>
            </div>
            <div className={styles.content}>
              {contentList.map((item, itemIndex) => (
                <div
                  className={styles.paragraph}
                  key={itemIndex}
                  dangerouslySetInnerHTML={{ __html: handleContent(item as string) }}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default ActivityTextCard;

'use client';

import React from 'react';
import styles from './index.module.scss';
import { AnswerContent, QuestionDetail } from '@/apis/origin/helpCenter/helpCenterInfo';

interface Template1Props {
  answers: AnswerContent[];
  item: QuestionDetail;
}

const Template1: React.FC<Template1Props> = ({ answers, item }) => {
  return (
    <div className={styles.template1}>
      <div className={styles.title}>{item?.contentTitle}</div>
      {answers.map((answer, index) => (
        <div key={`answer-${index}`} className={styles.contentItem}>
          <div className={styles.itemTitle}>
            <span className={styles.text}>{answer.answerContentTitle}</span>
          </div>
          <div className={styles.itemContent}>
            <span
              className={styles.text}
              dangerouslySetInnerHTML={{ __html: answer.answertContent || '' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Template1;

import React, { useMemo } from 'react';
import styles from './index.module.scss';
import { useState, useEffect } from 'react';
import { Rate } from 'antd-mobile';
import TextAreaComponent from '../TextAreaComponent';
import clsx from 'clsx';
import { toast } from '@/common/components/Toast';
import {
  PrizeQuestion,
  SubmitAnswer,
  SubmitPrizeQuestionParams,
  SubmitPrizeQuestionResponse,
} from '@/apis/origin/promotion/questionnaire';
import type { ResponseData } from '@/core/sdk/request/model';
import LazyImage from '@/common/components/LazyImage';
import { getSystemTheme } from '@/utils';
import { useAppSelector } from '@/core/store/hooks';

/** ref 中保存的当前作答状态，供父组件在关闭弹窗时读取 */
export interface CurrentQuestionRef {
  rateValue: number;
  feedback: string;
  questionId: number | null;
}

const StarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 21 20"
    fill="currentColor"
  >
    <path d="M9.32224 0.557886C9.66535 -0.185991 10.7226 -0.18599 11.0657 0.557887L13.3545 5.52007C13.4944 5.82325 13.7817 6.03199 14.1132 6.0713L19.5398 6.71471C20.3533 6.81116 20.68 7.81666 20.0786 8.37285L16.0666 12.0831C15.8215 12.3097 15.7117 12.6475 15.7768 12.975L16.8418 18.3348C17.0014 19.1383 16.1461 19.7597 15.4313 19.3596L10.6629 16.6904C10.3715 16.5274 10.0164 16.5274 9.72507 16.6904L4.95666 19.3596C4.24183 19.7597 3.38651 19.1383 3.54616 18.3348L4.61116 12.975C4.67623 12.6475 4.56648 12.3097 4.32136 12.0831L0.309329 8.37285C-0.292111 7.81666 0.0345939 6.81117 0.848092 6.71471L6.2747 6.0713C6.60625 6.03199 6.89356 5.82325 7.0334 5.52007L9.32224 0.557886Z" />
  </svg>
);
interface QuestionTemplateProps {
  allQuestions: PrizeQuestion[];
  setFinishStatus: (status: number) => void;
  setShowStatusBox: (show: boolean) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  answerList: SubmitAnswer[];
  setAnswerList: React.Dispatch<React.SetStateAction<SubmitAnswer[]>>;
  /** useMutation 返回的 mutateAsync */
  submitAsync: (
    params: SubmitPrizeQuestionParams,
  ) => Promise<ResponseData<SubmitPrizeQuestionResponse>>;
  currentQuestionRef?: React.MutableRefObject<CurrentQuestionRef>;
}

const QuestionTemplate = (prop: QuestionTemplateProps) => {
  const {
    allQuestions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answerList,
    setAnswerList,
    submitAsync,
    currentQuestionRef,
    setFinishStatus,
    setShowStatusBox,
  } = prop;
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const isDark = useMemo(() => {
    return theme === 'dark';
  }, [theme]);
  const [rateValue, setRateValue] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const rateLabels = ['非常差', '较差', '一般', '推荐', '超赞'];
  const currentQuestion = allQuestions[currentQuestionIndex] ?? ({} as PrizeQuestion);

  // 实时更新 ref 中的值
  useEffect(() => {
    if (currentQuestionRef) {
      currentQuestionRef.current = {
        rateValue,
        feedback,
        questionId: currentQuestion.prizeQuestionId,
      };
    }
  }, [rateValue, feedback, currentQuestion.prizeQuestionId, currentQuestionRef]);

  const currentAnswer = answerList.find(
    (item) => item.questinId === currentQuestion.prizeQuestionId,
  );
  // 把当前作答追加/更新到 answerList
  const saveCurrentAnswer = () => {
    setAnswerList((arr) => [
      ...arr.filter((item) => item.questinId !== currentQuestion.prizeQuestionId),
      {
        questinId: currentQuestion.prizeQuestionId,
        score: rateValue,
        opinionContent: feedback,
      },
    ]);
  };

  // 返回包含当前作答的完整列表（不触发 setState，避免异步问题）
  const getUpdatedAnswerList = (): SubmitAnswer[] => {
    return [
      ...answerList.filter((item) => item.questinId !== currentQuestion.prizeQuestionId),
      {
        questinId: currentQuestion.prizeQuestionId,
        score: rateValue,
        opinionContent: feedback,
      },
    ];
  };

  useEffect(() => {
    if (currentAnswer) {
      setRateValue(currentAnswer.score || 0);
      setFeedback(currentAnswer.opinionContent || '');
    } else {
      setRateValue(0);
      setFeedback('');
    }
  }, [currentQuestion.prizeQuestionId, currentAnswer]);

  return (
    <div className={styles.questionTemplate}>
      <div className={styles.questionTitle}>
        <div className={styles.index}>{+currentQuestionIndex + 1}</div>
        {currentQuestion.title}
      </div>
      <div className={styles.currentQuestion}>
        <div className={styles.logo}>
          <LazyImage src={'/images/common/promotion/default.png'} alt="" width={32} height={32} />
        </div>
        <div className={styles.currentQuestionTitle}>{currentQuestion.answerContent}</div>
      </div>
      <div className={styles.questionRate}>
        <div className={styles.rateWrapper}>
          <Rate
            allowHalf
            value={rateValue}
            onChange={setRateValue}
            character={<StarIcon />}
            style={{
              '--active-color': '#1A81FF',
              '--inactive-color': isDark ? '#3E3E44' : '#DAE4F2',
              '--inactive-color-half': isDark ? '#3E3E44' : '#DAE4F2',
              '--star-size': '48px',
            }}
          />
        </div>
        <div className={styles.rateLabels}>
          {rateLabels.map((label, index) => (
            <div
              key={index}
              className={clsx(styles.label, index < Math.ceil(rateValue) ? styles.active : '')}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.answerWrap}>
        <TextAreaComponent
          value={feedback}
          onChange={setFeedback}
          maxLength={300}
          placeholder={currentQuestion?.opinionTitle ?? '欢迎留下您的改进建议（选填）'}
        />
      </div>
      <div className={styles.btnGroup}>
        {currentQuestionIndex > 0 && (
          <div
            className={styles.prevBtn}
            onClick={() => {
              saveCurrentAnswer();
              setCurrentQuestionIndex(currentQuestionIndex - 1);
            }}
          >
            上一题
          </div>
        )}
        {currentQuestionIndex === allQuestions.length - 1 ? (
          <div
            className={clsx(styles.submitBtn, rateValue === 0 ? styles.disabled : '')}
            onClick={() => {
              if (rateValue === 0) return;
              const finalAnswers = getUpdatedAnswerList();
              submitAsync({
                bonusTypeId: 2880,
                id: 308,
                submitType: 9,
                answers: finalAnswers,
              }).then((res) => {
                console.log('submit result', res);
                toast({ description: res.info, type: 'success' });
                setFinishStatus(2);
                setShowStatusBox(true);
              });
            }}
          >
            提交并完成领奖资格
          </div>
        ) : (
          <div
            className={clsx(styles.nextBtn, rateValue === 0 ? styles.disabled : '')}
            onClick={() => {
              if (rateValue === 0) return;
              saveCurrentAnswer();
              setCurrentQuestionIndex(currentQuestionIndex + 1);
            }}
          >
            下一题
          </div>
        )}
      </div>
      <div className={styles.tips}>
        <img src={'/images/common/promotion/question/tips.png'} alt="" />
        <p>完成问卷活动，统计人工审核发放奖励</p>
      </div>
    </div>
  );
};

export default QuestionTemplate;

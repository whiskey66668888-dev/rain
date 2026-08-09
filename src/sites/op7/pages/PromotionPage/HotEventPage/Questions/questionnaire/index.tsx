import React, { useEffect, useRef, useState } from 'react';
import { CenterPopup } from 'antd-mobile';
import QuestionTemplate from '../questionTemplate';
import type { CurrentQuestionRef } from '../questionTemplate';

import styles from './index.module.scss';
import {
  SubmitAnswer,
  useQuestionnaireQuery,
  useSubmitPrizeQuestionMutation,
} from '@/apis/origin/promotion/questionnaire';
import LazyImage from '@/common/components/LazyImage';
/** 单个状态配置 */
interface StatusConfig {
  title: React.ReactNode;
  content: string;
  btnText: string;
  btnClick: () => void;
  btnText2?: string;
  btnClick2?: () => void;
  tips: string;
}
const Questionnaire = () => {
  const [visible, setVisible] = useState(false); //控制弹窗显示隐藏
  const [showStatusBox, setShowStatusBox] = useState<boolean>(true);
  const [finishStatus, setFinishStatus] = useState<number>(0); //有奖问卷完成状态 0：未开始，1：进行中，9:完成
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0); //当前问卷题目索引

  const [answerList, setAnswerList] = useState<SubmitAnswer[]>([]); //答案列表

  // 保存当前题目和答案的 ref
  const currentQuestionRef = useRef<CurrentQuestionRef>({
    rateValue: 0,
    feedback: '',
    questionId: null,
  });

  const { data, refetch: getAllData } = useQuestionnaireQuery(308);

  // 数据加载完成后根据 finishStatus 恢复进度
  // 等价于原 useRequest 的 onSuccess 回调
  const prevFinishStatusRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (data === undefined) return;
    if (data.finishStatus === prevFinishStatusRef.current) return;
    prevFinishStatusRef.current = data.finishStatus;
    const status = data.finishStatus || 0;
    setFinishStatus(status);
    if (status === 1) {
      const firstNotDoneIndex = data.allQuestions?.findIndex((item) => !item.finish) ?? -1;
      const savedAnswers = (data.allQuestions ?? [])
        .filter((item) => item.finish)
        .map((item) => ({
          questinId: item.prizeQuestionId,
          score: item.prizeScore,
          opinionContent: item.opinionContent,
        }));
      const targetIndex =
        firstNotDoneIndex === -1
          ? Math.max((data.allQuestions?.length || 1) - 1, 0)
          : firstNotDoneIndex;
      setCurrentQuestionIndex(targetIndex);
      setAnswerList(savedAnswers);
    }
  }, [data, data?.finishStatus]);

  const { mutateAsync: submitAsync } = useSubmitPrizeQuestionMutation();

  const allQuestions = data?.allQuestions ?? []; //所有题目列表，按顺序完成
  const allDownLength = allQuestions.filter((item) => item.finish).length;
  const prizeQuestionDetail = data?.prizeQuestionDetail ?? ''; //当前有奖问卷详情说明文案

  console.log(data, 'data');

  const firstStatus = {
    title: '开始有奖问卷',
    content: prizeQuestionDetail,
    btnText: '填写问卷赢彩金',
    btnClick: () => {
      console.log('开始填写问卷');
      setShowStatusBox(false);
    },
    tips: '完成问卷活动，统计人工审核发放奖励',
  };

  const successStatus = {
    title: (
      <div className={styles.wellDownTitle}>
        <img src={'/images/common/promotion/question/successIcon.png'} alt="" /> 提交成功
      </div>
    ),
    content: '您已获得本次活动的彩金领取资格',
    tips: '奖励将在活动结束后1-3个工作日内人工审核发放，请留意账户通知。',
    btnText: '重新填写',
    btnClick: () => {
      console.log('从头开始');
      // 重新开始问卷
      setShowStatusBox(false);
      setCurrentQuestionIndex(0);
      setAnswerList([]);
    },
  };
  const cancelStatus = {
    title: '进度提示',
    content: `确定要退出问卷？<br>您的进度将被自动保存，下次可继续填写。`,
    btnText: '继续填写',
    btnClick: () => {
      console.log('继续填写');
      setShowStatusBox(false);
    },
    tips: '完成问卷活动，统计人工审核发放奖励',
  };
  const refillStatus = {
    title: '您已提交问卷',
    content: `您已成功提交过本次问卷。<br>如需修改答案，可重新填写（不重复获得奖励）。`,
    btnText: '重新填写',
    btnClick: () => {
      console.log('重新填写');
      setShowStatusBox(false);
      setCurrentQuestionIndex(0);
      setAnswerList([]);
    },
    tips: '完成问卷活动，统计人工审核发放奖励',
  };
  const continueStatus = {
    title: '您上次还没答完问卷',
    content: `已完成${allDownLength}/${allQuestions.length}题<br>是否继续上次进度？`,
    btnText: '继续填写赢彩金',
    btnClick: () => {
      console.log('继续填写');
      setShowStatusBox(false);
    },
    btnText2: '重新填写',
    btnClick2: () => {
      setShowStatusBox(false);
      setCurrentQuestionIndex(0);
      setAnswerList([]);
      console.log('重新填写');
    },
    tips: '完成问卷活动，统计人工审核发放奖励',
  };
  const statusMap: Record<number, StatusConfig> = {
    0: firstStatus, //未提交过
    1: continueStatus, // 中途退出 继续
    9: refillStatus, //已提交 重新填写

    2: successStatus, //提交成功
    3: cancelStatus, //中途退出
  };
  const currentStatus: StatusConfig = statusMap[finishStatus] || firstStatus;
  const statusBox = () => {
    return (
      <div className={styles.statusBox}>
        <div className={styles.title}>{currentStatus.title}</div>
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: currentStatus.content }}
        ></div>
        <div className={styles.btn} onClick={currentStatus.btnClick}>
          {currentStatus.btnText}
        </div>
        {currentStatus.btnText2 && (
          <div className={styles.btn2} onClick={currentStatus.btnClick2}>
            {currentStatus.btnText2}
          </div>
        )}

        <div className={styles.tips}>
          <img src={'/images/common/promotion/question/tips.png'} alt="" />
          <p>{currentStatus.tips}</p>
        </div>
      </div>
    );
  };

  if (allQuestions.length === 0) {
    return null;
  }

  return (
    <div className={styles.questionnaire}>
      <div
        className={styles.questionnaireIcon}
        onClick={() => {
          setVisible(true);
        }}
      ></div>

      <CenterPopup visible={visible} className={styles.myCenterpop}>
        <div className={styles.questionBoxWrap}>
          <div className={styles.questionBox}>
            {showStatusBox ? (
              statusBox()
            ) : (
              <QuestionTemplate
                allQuestions={allQuestions}
                setFinishStatus={setFinishStatus}
                setShowStatusBox={setShowStatusBox}
                currentQuestionIndex={currentQuestionIndex}
                setCurrentQuestionIndex={setCurrentQuestionIndex}
                answerList={answerList}
                setAnswerList={setAnswerList}
                submitAsync={submitAsync}
                currentQuestionRef={currentQuestionRef}
              />
            )}
          </div>
          <div
            className={styles.closeBtn}
            onClick={() => {
              if (showStatusBox) {
                setVisible(false);
                getAllData();
              } else {
                // 关闭前将当前作答合并到列表
                const { rateValue, feedback, questionId } = currentQuestionRef.current;

                let finalAnswerList = answerList;
                if (questionId !== null) {
                  finalAnswerList = [
                    ...answerList.filter((item) => item.questinId !== questionId),
                    { questinId: questionId, score: rateValue, opinionContent: feedback },
                  ];
                  setAnswerList(finalAnswerList);
                }

                // 有答案则保存进度
                if (finalAnswerList.length > 0) {
                  submitAsync({
                    bonusTypeId: 2880,
                    id: 308,
                    submitType: 1,
                    answers: finalAnswerList,
                  });
                }

                setFinishStatus(3); // 显示"中途退出"状态
                setShowStatusBox(true);
              }
            }}
          >
            <LazyImage
              src={'/images/common/promotion/question/close_model.png'}
              alt=""
              width={28}
              height={28}
            />
          </div>
        </div>
      </CenterPopup>
    </div>
  );
};

export default Questionnaire;

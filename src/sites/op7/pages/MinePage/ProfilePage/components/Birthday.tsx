import React, { useState } from 'react';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { ArrowRightSvg } from '@/sites/op7/components/SvgIcons';
import Overlay from '@/common/components/Overlay';
import ModalHeader from '@/sites/op7/components/ModalHeader';
import { DatePickerView } from 'antd-mobile';
import dayjs from 'dayjs';
import { updateMemberBirthdayThunk } from '@/core/store/thunks/userThunks';
import { toast } from '@/common/components/Toast';

const Birthday: React.FC = () => {
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const birthData = useAppSelector((state) => state.user.memberInfo.birthData);
  const birthdayFetching = useAppSelector((state) => state.user.birthdayFetching);
  const [show, setShow] = useState(false);
  const [birthDay, setBirthDay] = useState('');
  const dispatch = useAppDispatch();

  const handleClick = () => {
    if (birthData) {
      return;
    }
    if (birthdayFetching) {
      toast({
        title: '请勿频繁操作',
        type: 'warning',
      });
      return;
    }
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
  };

  const labelRenderer = (type: string, data: number) => {
    switch (type) {
      case 'year':
        return data + '年';
      case 'month':
        return data + '月';
      case 'day':
        return data + '日';
      default:
        return data;
    }
  };

  const handleDateChange = (value: Date) => {
    setBirthDay(dayjs(value).format('YYYY-MM-DD'));
  };

  const handleSubmit = () => {
    handleClose();
    dispatch(updateMemberBirthdayThunk(birthDay))
      .unwrap()
      .then(() => {
        toast({
          title: '修改成功',
          type: 'success',
        });
      });
  };

  return (
    <>
      <div
        className={clsx(
          'flex items-center justify-between gap-12px px-12px py-14px lg:px-24px ',
          'shadow-[0_-0.5px_0_0_var(--Line-100)_inset]',
        )}
      >
        <div className="_tf[14] leading-[1.43] text-[var(--Text-Main-10)]">生日</div>
        <div
          className="_tf[14] leading-[1.43] text-[var(--Text-700)] flex items-center gap-4px"
          onClick={handleClick}
        >
          {birthData ? <span>{birthData}</span> : <span>完善信息，获取生日福利</span>}
          {!birthData && <ArrowRightSvg className="w-12px h-12px text-[var(--Text-700)]" />}
        </div>
      </div>
      <Overlay
        show={show}
        position={isMobile ? 'bottom' : 'center'}
        bodyClassname={clsx('flex flex-col', {
          'h-[40%] bg-[var(--Background-700)] rounded-t-16px': isMobile,
          'w-450px h-400px bg-[var(--Background-300)] rounded-16px': !isMobile,
        })}
      >
        <ModalHeader
          title="选择生日"
          onClose={handleClose}
          left={
            <button
              type="button"
              className="_tf[14] leading-[1.43] text-[var(--Text-800)]"
              onClick={handleClose}
            >
              取消
            </button>
          }
          right={
            <button
              type="button"
              className="_tf[14] leading-[1.43] text-[var(--ThemeColor-Main)]"
              onClick={handleSubmit}
            >
              确认
            </button>
          }
        />
        <div className="flex-1 px-12px flex flex-col">
          <DatePickerView
            max={dayjs().toDate()}
            min={dayjs('1890-01-01').toDate()}
            precision="day"
            value={birthDay ? dayjs(birthDay).toDate() : undefined}
            renderLabel={labelRenderer}
            className="flex-1"
            onChange={handleDateChange}
            mouseWheel
          />
        </div>
      </Overlay>
    </>
  );
};

export default Birthday;

import React, { useState } from 'react';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import Overlay from '@/common/components/Overlay';
import H5Header from '@/sites/op7/components/H5Header';
import Button from '@/common/components/Button';
import { setRealNameThunk } from '@/core/store/thunks/userThunks';
import ModalHeader from '@/sites/op7/components/ModalHeader';

interface RealNameModalProps {
  visible: boolean;
  onClose: () => void;
  zIndex?: number;
}

const RealNameModal: React.FC<RealNameModalProps> = ({ visible, onClose, zIndex }) => {
  const dispatch = useAppDispatch();
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const realNameFetching = useAppSelector((state) => state.user.realNameFetching);
  const [inputValue, setInputValue] = useState('');

  const handleClose = () => {
    if (realNameFetching) {
      return;
    }
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (realNameFetching) {
      return;
    }
    setInputValue(e.target.value);
  };

  const handleSubmit = () => {
    dispatch(setRealNameThunk(inputValue.trim()))
      .unwrap()
      .then(() => {
        handleClose();
      });
  };

  return (
    <Overlay
      show={visible}
      zIndex={zIndex}
      position={isMobile ? 'bottom' : 'center'}
      bodyClassname={clsx({
        'w-450px': !isMobile,
        'h-full bg-[var(--Background-700)]': isMobile,
        'h-auto bg-[var(--Background-300)] rounded-12px': !isMobile,
      })}
    >
      <H5Header title="姓名" onBack={handleClose} />
      {/* PC 标题栏 */}
      <ModalHeader title="姓名" onClose={handleClose} mobileHidden />

      <div className="p-12px flex flex-col gap-12px lg:px-24px lg:pt-8px lg:pb-24px gap-24px">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="请输入您的真实姓名"
          maxLength={20}
          className={clsx(
            'w-full h-44px px-12px',
            'bg-[var(--Background-300)] lg:bg-[var(--Background-700)] rounded-full',
            'outline-none box-border',
            'border-[0.5px] border-solid border-transparent focus:border-[var(--ThemeColor-Main)]',
            '_tf[14] text-[var(--Text-Main-10)]',
            'placeholder:text-[var(--Text-700)]',
            'caret-[var(--ThemeColor-Main)]',
          )}
        />

        {/* 提交按钮 */}
        <Button
          type="primary"
          className={clsx('w-full')}
          loading={realNameFetching}
          onClick={handleSubmit}
        >
          提交
        </Button>

        {/* 重要提醒 */}
        <div className="_tf[12] leading-[1.33]">
          <p className="text-[var(--Text-800)] mb-4px">重要提醒：</p>
          <p className="text-[var(--Red-300)]">
            姓名设置成功，不可修改。如有疑问，请联系在线客服。
          </p>
        </div>
      </div>
    </Overlay>
  );
};

export default RealNameModal;

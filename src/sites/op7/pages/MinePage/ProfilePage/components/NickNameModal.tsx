import React, { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

import Overlay from '@/common/components/Overlay';
import Button from '@/common/components/Button';
import { toast } from '@/common/components/Toast';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { setNickNameThunk } from '@/core/store/thunks/userThunks';
import H5Header from '@/sites/op7/components/H5Header';
import ModalHeader from '@/sites/op7/components/ModalHeader';
import {
  getNicknameBlurError,
  isNicknameValid,
  NICKNAME_EMPTY_MSG,
  NICKNAME_FORMAT_ERROR_MSG,
  sanitizeNicknameInput,
} from '@/utils/nicknameRules';

interface NickNameModalProps {
  visible: boolean;
  initialNickName: string;
  onClose: () => void;
  zIndex?: number;
}

const NickNameModal: React.FC<NickNameModalProps> = ({
  visible,
  initialNickName,
  onClose,
  zIndex,
}) => {
  const dispatch = useAppDispatch();
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setValue(initialNickName || '');
    }
  }, [visible, initialNickName]);

  const canSubmit = useMemo(() => isNicknameValid(value), [value]);

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleBlur = useCallback(() => {
    const msg = getNicknameBlurError(value);
    if (msg) {
      toast({ description: msg, type: 'warning' });
    }
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      toast({ description: NICKNAME_EMPTY_MSG, type: 'warning' });
      return;
    }
    if (!isNicknameValid(value)) {
      toast({ description: NICKNAME_FORMAT_ERROR_MSG, type: 'warning' });
      return;
    }
    setSubmitting(true);
    dispatch(setNickNameThunk(trimmed))
      .unwrap()
      .then(({ message }) => {
        onClose();
        const tip = message || '提交成功，请等待审核';
        toast({
          description: tip,
          type: tip.includes('成功') || tip.includes('审核') ? 'success' : 'warning',
        });
      })
      .catch(() => {
        // 接口错误由 request 统一 toast
      })
      .finally(() => setSubmitting(false));
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
      <H5Header title="昵称" onBack={handleClose} />
      <ModalHeader title="昵称" onClose={handleClose} mobileHidden />

      <div className="p-12px flex flex-col gap-20px lg:px-24px lg:pt-8px lg:pb-24px">
        <div
          className={clsx(
            'flex items-center gap-12px h-56px px-15px rounded-10px',
            'bg-[var(--Background-300)] lg:bg-[var(--Background-700)]',
          )}
        >
          <span className="shrink-0 _tf[14] text-[var(--Text-Main-10)]">昵称</span>
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              inputMode="text"
              autoComplete="nickname"
              value={value}
              onChange={(e) => setValue(sanitizeNicknameInput(e.target.value))}
              onBlur={handleBlur}
              placeholder="请输入您的昵称"
              disabled={submitting}
              className={clsx(
                'w-full h-40px pr-24px bg-transparent outline-none border-0',
                '_tf[14] text-[var(--Text-Main-10)] placeholder:text-[var(--Text-700)]',
                'caret-[var(--ThemeColor-Main)]',
              )}
            />
            {!!value && (
              <button
                type="button"
                aria-label="清空"
                disabled={submitting}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-16px h-16px text-[var(--Text-700)]"
                onClick={() => setValue('')}
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  <path
                    d="M8 0.666992C12.05 0.666992 15.3338 3.95006 15.334 8C15.334 12.0501 12.0501 15.334 8 15.334C3.95006 15.3338 0.666992 12.05 0.666992 8C0.667168 3.95017 3.95017 0.667168 8 0.666992ZM8 7.05762L6.11523 5.17188L5.17188 6.11523L7.05762 8L5.17188 9.88574L6.11523 10.8291L8 8.94336L9.88574 10.8291L10.8291 9.88574L8.94336 8L10.8291 6.11523L9.88574 5.17188L8 7.05762Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <Button
          type="primary"
          className="w-full"
          loading={submitting}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          提交
        </Button>
      </div>
    </Overlay>
  );
};

export default NickNameModal;

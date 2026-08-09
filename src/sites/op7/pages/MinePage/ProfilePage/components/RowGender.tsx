import React, { useCallback } from 'react';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { updateMemberGenderThunk } from '@/core/store/thunks/userThunks';
import { EGender } from '@/apis/origin/constants';
import { toast } from '@/common/components/Toast';
import CircleCheck from '@/common/components/CircleCheck';

const RowGender: React.FC = () => {
  const dispatch = useAppDispatch();
  const gender = useAppSelector((state) => state.user.memberInfo.gender);
  const genderFetching = useAppSelector((state) => state.user.genderFetching);

  const handleChange = useCallback(
    (next: EGender) => {
      if (gender === next) {
        return;
      }
      if (genderFetching) {
        toast({
          title: '请勿频繁操作',
          type: 'warning',
        });
        return;
      }
      dispatch(updateMemberGenderThunk(next))
        .unwrap()
        .then(() => {
          toast({
            title: '修改成功',
            type: 'success',
          });
        });
    },
    [dispatch, gender, genderFetching],
  );

  return (
    <div
      className={clsx(
        'flex items-center justify-between gap-12px px-12px py-14px !lg:px-24px ',
        'shadow-[0_-0.5px_0_0_var(--Line-100)_inset]',
      )}
    >
      <div className="_tf[14] leading-[1.43] text-[var(--Text-Main-10)]">性别</div>
      <div className="flex items-center gap-12px">
        <div
          className={clsx(
            'flex items-center gap-4px _tf[14] leading-[1.43]',
            gender === EGender.MALE ? 'text-[var(--Text-Main-10)]' : 'text-[var(--Text-700)]',
          )}
        >
          <CircleCheck
            checked={gender === EGender.MALE}
            onChange={() => handleChange(EGender.MALE)}
          />
          男
        </div>
        <div
          className={clsx(
            'flex items-center gap-4px _tf[14] leading-[1.43]',
            gender === EGender.FEMALE ? 'text-[var(--Text-Main-10)]' : 'text-[var(--Text-700)]',
          )}
        >
          <CircleCheck
            checked={gender === EGender.FEMALE}
            onChange={() => handleChange(EGender.FEMALE)}
          />
          女
        </div>
      </div>
    </div>
  );
};

export default RowGender;

import Overlay from '@/common/components/Overlay';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import React, { useEffect, useMemo, useState } from 'react';
import { setShowAvatarPopup } from '@/core/store/slices/userSlice';
import clsx from 'clsx';
import { zIndexMap } from '@/utils/constants/zIndex';
import LazyImage from '@/common/components/LazyImage';
import ModalHeader from '@/sites/op7/components/ModalHeader';
import Button from '@/common/components/Button';
import {
  DEFAULT_AVATAR_SRC,
  DEFAULT_EMC_AVATAR_ID,
  EMC_AVATAR_CATEGORIES,
  EmcAvatarTabKey,
  resolveEmcAvatarIdFromSrc,
  resolveEmcAvatarSrc,
} from '@/common/utils/emcAvatar';
import { useMemberSettingActions } from '@/common/hooks/memberSettingsBridge';
import { toast } from '@/common/components/Toast';

export const DEFAULT_AVATAR = DEFAULT_AVATAR_SRC;

const AvatarUpdate: React.FC = () => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const show = useAppSelector((state) => state.user.showAvatarPopup);
  const userAvatar = useAppSelector((state) => state.user.userAvatar);
  const memberAvatarId = useAppSelector((state) => state.user.memberInfo.userAvatar);
  const dispatch = useAppDispatch();
  const { updateManagedSetting } = useMemberSettingActions();
  const [activeTab, setActiveTab] = useState<EmcAvatarTabKey>('football');
  const [tempAvatarId, setTempAvatarId] = useState<string>(DEFAULT_EMC_AVATAR_ID);
  const tempAvatarSrc = resolveEmcAvatarSrc(tempAvatarId);

  useEffect(() => {
    if (show) {
      const fallbackAvatarId =
        memberAvatarId ?? resolveEmcAvatarIdFromSrc(userAvatar) ?? DEFAULT_EMC_AVATAR_ID;
      setTempAvatarId(fallbackAvatarId);
    }
  }, [memberAvatarId, show, userAvatar]);

  const handleClose = () => {
    dispatch(setShowAvatarPopup(false));
  };

  const handleConfirm = () => {
    void updateManagedSetting('userAvatar', tempAvatarId).then(() => {
      toast({ description: '头像已更新', type: 'success' });
      handleClose();
    });
  };

  const position = useMemo(() => {
    return screenBreakpoint === 'md' ? 'bottom' : 'center';
  }, [screenBreakpoint]);

  const list = useMemo(
    () => EMC_AVATAR_CATEGORIES.find((item) => item.key === activeTab)?.avatarIds ?? [],
    [activeTab],
  );
  const hasSelection = tempAvatarId !== '';

  return (
    <Overlay
      show={Boolean(show)}
      close={handleClose}
      position={position}
      zIndex={zIndexMap.avatarUpdate}
      bodyClassname={clsx(
        'bg-[var(--Background-300)] rounded-t-16px lg:rounded-16px',
        'h-[80%] lg:max-h-[818px] flex flex-col overflow-hidden',
        'lg:w-449px',
      )}
    >
      {/* 标题栏 */}
      <ModalHeader title="个人头像" onClose={handleClose} />

      <div className="flex-1-col-hidden pt-12px px-24px pb-24px">
        {/* 大头像预览 */}
        <div className="shrink-0 flex items-center justify-center p-24px">
          <LazyImage
            src={tempAvatarSrc}
            fallback={DEFAULT_AVATAR_SRC}
            alt="avatar"
            className="w-120px h-120px rounded-full"
          />
        </div>

        {/* Tab：足球 / 篮球 / 其他 */}
        <div className="shrink-0 flex gap-12px  h-48px">
          {EMC_AVATAR_CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={clsx(
                'flex-1 h-32px rounded-full flex items-center justify-center _tf[12]',
                activeTab === key
                  ? 'font-500 bg-[var(--ThemeColor-Main)] text-[var(--White-100)]'
                  : 'font-400 bg-[var(--Background-500)] text-[var(--Text-Main-10)]',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 滚动区域：当前 tab 下的头像列表 */}
        <div className="flex-1 overflow-hidden py-24px">
          <div className="overflow-y-auto h-full grid grid-cols-4 gap-x-27px gap-y-24px px-4px py-4px">
            {list.map((id) => {
              const src = resolveEmcAvatarSrc(id);
              const selected = tempAvatarId === id;
              return (
                <button
                  key={id}
                  type="button"
                  className="w-full flex flex-col items-center gap-10px active:opacity-80"
                  onClick={() => setTempAvatarId(id)}
                >
                  <div
                    className={clsx(
                      'w-full aspect-square rounded-full shrink-0',
                      selected &&
                        'ring-2 ring-[#1A81FF] ring-offset-2 ring-offset-[var(--Background-300)]',
                    )}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <LazyImage
                        src={src}
                        fallback={DEFAULT_AVATAR_SRC}
                        alt={`avatar-${id}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 底部按钮：设为头像 */}
        <Button disabled={!hasSelection} onClick={handleConfirm}>
          设为头像
        </Button>
      </div>
    </Overlay>
  );
};

export default AvatarUpdate;

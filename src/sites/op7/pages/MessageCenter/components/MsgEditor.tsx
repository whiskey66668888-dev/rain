import Overlay from '@/common/components/Overlay';
import { useAppSelector } from '@/core/store/hooks';
import { useMessageCenterMethods } from '@/common/hooks/messageCenter/useMessageCenterMethods';
import clsx from 'clsx';
import ModalHeader from '@/sites/op7/components/ModalHeader';
import { useCallback, useMemo, useRef, useState } from 'react';
import Button from '@/common/components/Button';
import { toast } from '@/common/components/Toast';
import { LoadingIcon } from '@/sites/op7/components/SvgIcons';
import { messageUploadReq } from '@/apis/origin/msgCenter/messageUpload';
import { usePreInfoQuery } from '@/apis/origin/setting';
import { addMessageReq, TImgDetailItem } from '@/apis/origin/msgCenter/addMessage';
import {
  EMessageCategory,
  messageCategoryList,
  messageCategoryMap,
} from '@/apis/commonSports/constants';
import CheckBox from '@/common/components/CheckBox';
import { ArrowLeftSvg } from '@/sites/op7/components/SvgIcons';
import { EMessageTabKey } from '@/core/store/slices/messageCenterSlice';

type LocalImage = {
  id: string;
  file: File;
  previewUrl: string;
  uploading: boolean;
  imgDetail: TImgDetailItem;
};

export const MsgEditor = () => {
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const visible = useAppSelector((state) => state.messageCenter.msgEditorData.visible);
  const replyItem = useAppSelector((state) => state.messageCenter.msgEditorData.replyItem);
  const subTab = useAppSelector((state) => state.messageCenter.subTab);
  const { closeMsgEditor, getNewsInbox, getNewsOutbox } = useMessageCenterMethods();

  const [images, setImages] = useState<LocalImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: preInfo } = usePreInfoQuery();

  const [titleValue, setTitleValue] = useState(replyItem?.title || '');
  const [messageInfo, setMessageInfo] = useState('');
  const [category, setCategory] = useState<EMessageCategory | undefined>();
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isUploading = useMemo(() => {
    return images.some((img) => img.uploading);
  }, [images]);

  const title = useMemo(() => {
    return replyItem ? '【回复】小7站内信' : '写站内信';
  }, [replyItem]);

  const categoryLabel = useMemo(() => {
    if (!category) return '请选择信件类型';
    return messageCategoryMap[category]?.text ?? '请选择信件类型';
  }, [category]);

  const handleClickUpload = useCallback(() => {
    if (isUploading) {
      toast({ type: 'warning', description: '当前有图片正在上传，请稍后再试' });
      return;
    }

    fileInputRef.current?.click();
  }, [isUploading]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!preInfo?.uploadUrl) {
        toast({ type: 'error', description: '上传地址获取失败，请稍后重试' });
        return;
      }
      const file = e.target.files?.[0];
      if (!file) return;

      const previewUrl = URL.createObjectURL(file);
      const id = `${Date.now()}-${file.name}`;
      const newImage: LocalImage = {
        id,
        file,
        previewUrl,
        uploading: true,
        imgDetail: {
          img: '',
          id: '',
        },
      };

      setImages((prev) => [...prev, newImage]);

      // 调用实际上传接口
      messageUploadReq({ file, uploadUrl: preInfo?.uploadUrl })
        .then((res) => {
          const { imgDetail } = res;
          const imgDetailList = JSON.parse(imgDetail || '[]') as TImgDetailItem[];
          setImages((prev) =>
            prev.map((img) =>
              img.id === id
                ? {
                    ...img,
                    uploading: false,
                    imgDetail: imgDetailList[0] || { img: '', id: '' },
                  }
                : img,
            ),
          );
        })
        .catch(() => {
          toast({ type: 'error', description: '图片上传失败，请稍后重试' });
          setImages((prev) =>
            prev.map((img) =>
              img.id === id
                ? {
                    ...img,
                    uploading: false,
                  }
                : img,
            ),
          );
        });

      // 重置 input 值，避免选择同一文件时 onChange 不触发
      e.target.value = '';
    },
    [preInfo?.uploadUrl],
  );

  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const canAddMore = images.length < 3;

  const canSubmit = useMemo(() => {
    if (submitting || isUploading) return false;
    if (!titleValue.trim() || !messageInfo.trim()) return false;
    if (!replyItem && category === undefined) return false;
    return true;
  }, [category, isUploading, messageInfo, replyItem, submitting, titleValue]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    if (!titleValue.trim()) {
      toast({ type: 'warning', description: '请输入站内信主题' });
      return;
    }
    if (!messageInfo.trim()) {
      toast({ type: 'warning', description: '请输入站内信内容' });
      return;
    }
    if (!replyItem && !category) {
      toast({ type: 'warning', description: '请选择信件类型' });
      return;
    }
    if (isUploading) {
      toast({ type: 'warning', description: '图片正在上传，请稍后提交' });
      return;
    }

    const params = {
      title: titleValue.trim(),
      messageInfo: messageInfo.trim(),
      imgDetail: JSON.stringify(images.map((img) => img.imgDetail)),
      ...(replyItem ? { newsId: replyItem.id } : { category: category! }),
    };

    try {
      setSubmitting(true);
      await addMessageReq(params);
      toast({ type: 'success', description: '提交成功' });
      closeMsgEditor();
      if (subTab === EMessageTabKey.INBOX) {
        getNewsInbox();
      } else if (subTab === EMessageTabKey.OUTBOX) {
        getNewsOutbox();
      }
    } catch {
      toast({ type: 'error', description: '提交失败，请稍后重试' });
    } finally {
      setSubmitting(false);
    }
  }, [
    category,
    closeMsgEditor,
    images,
    isUploading,
    messageInfo,
    replyItem,
    submitting,
    titleValue,
    subTab,
    getNewsInbox,
    getNewsOutbox,
  ]);

  return (
    <>
      <Overlay
        show={!!visible}
        close={closeMsgEditor}
        position={isMobile ? 'bottom' : 'center'}
        bodyClassname={clsx(
          'flex flex-col gap-8px overflow-hidden bg-[var(--Background-400)]',
          isMobile ? 'rounded-t-10px safe-b' : 'rounded-12px w-450px pb-12px',
        )}
        bodyStyle={{
          maxHeight: '80%',
        }}
      >
        <ModalHeader title={title} onClose={closeMsgEditor} />
        <div
          className={clsx(
            'flex-1 flex flex-col overflow-y-aut',
            isMobile ? ' px-12px' : ' px-24px',
          )}
        >
          {/* 其他表单内容... */}
          <div className="flex flex-col gap-12px">
            {/* 主题 */}
            <div
              className={clsx(
                'bg-[var(--Background-700)] rounded-12px px-12px py-8px',
                'flex items-center justify-between',
              )}
            >
              <span className="shrink-0 _tf[14] leading-[1.43] text-[var(--Text-Main-10)]">
                主题：
              </span>
              <input
                disabled={!!replyItem}
                value={titleValue}
                onChange={(e) => {
                  const v = e.target.value.slice(0, 20);
                  setTitleValue(v);
                }}
                placeholder="请输入站内信主题，最多20个字"
                className={clsx(
                  'flex-1 bg-transparent outline-none border-none',
                  '_tf[14] leading-[1.43] text-[var(--Text-Main-10)]',
                  'placeholder:text-[var(--Text-700)]',
                )}
              />
              <span className="shrink-0 _tf[12] text-[var(--Text-700)]">
                {titleValue.length}/20
              </span>
            </div>

            {/* 信件类型 */}
            {!replyItem && (
              <button
                type="button"
                className={clsx(
                  'bg-[var(--Background-700)] rounded-12px px-12px py-12px',
                  'flex items-center justify-between',
                )}
                onClick={() => {
                  if (replyItem) return; // 回复时类型不可修改
                  setCategoryPickerVisible(true);
                  if (!category) {
                    setCategory(messageCategoryList[0]);
                  }
                }}
              >
                <p>
                  <span className="_tf[14] text-[var(--Text-Main-10)]">信件类型：</span>
                  <span
                    className={clsx(
                      '_tf[14]',
                      category ? 'text-[var(--Text-Main-10)]' : 'text-[var(--Text-700)]',
                    )}
                  >
                    {categoryLabel}
                  </span>
                </p>
                <ArrowLeftSvg
                  className={clsx(
                    'w-10px h-10px text-[var(--Text-Main-10)] transition-transform duration-200',
                    categoryPickerVisible ? 'rotate-90' : 'rotate-270',
                  )}
                />
              </button>
            )}

            {/* 内容 */}
            <div className="bg-[var(--Background-700)] rounded-12px px-12px py-8px relative">
              <textarea
                value={messageInfo}
                onChange={(e) => {
                  const v = e.target.value.slice(0, 300);
                  setMessageInfo(v);
                }}
                placeholder="请输入信件内容，最多300字"
                className={clsx(
                  'w-full h-120px resize-none bg-transparent outline-none border-none',
                  '_tf[14] text-[var(--Text-Main-10)]',
                  'placeholder:text-[var(--Text-700)]',
                )}
              />

              <span className="absolute bottom-10px right-16px _tf[12] text-[var(--Text-700)]">
                {messageInfo.length}/300
              </span>
            </div>
          </div>

          {/* 图片上传 */}
          <div className="mt-12px flex gap-12px">
            {canAddMore && (
              <>
                <div
                  className={clsx(
                    'w-80px h-80px rounded-12px bg-[var(--Background-300)]',
                    'flex flex-col items-center justify-center cursor-pointer',
                  )}
                  onClick={handleClickUpload}
                >
                  <span className="text-[32px] leading-none text-[var(--Text-800)]">+</span>
                  <span className="_tf[12] text-[var(--Text-800)] mt-4px">上传图片</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  name="uploadFile"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            )}

            {images.map((img) => (
              <div key={img.id} className={clsx('relative')}>
                <div
                  className={clsx(
                    'w-80px h-80px overflow-hidden',
                    'rounded-12px bg-[var(--Background-700)]',
                    'flex items-center justify-center',
                  )}
                >
                  <img
                    src={img.previewUrl}
                    alt={img.id}
                    className={clsx('max-w-full max-h-full', img.uploading && 'opacity-50')}
                  />
                </div>

                <button
                  type="button"
                  className={clsx(
                    'absolute -top-8px -right-8px w-16px h-16px',
                    'rounded-full bg-[var(--Red-300)]',
                    'items-center justify-center',
                    img.uploading ? 'hidden' : 'flex',
                  )}
                  onClick={() => handleRemoveImage(img.id)}
                >
                  <span className="shrink-0 w-8px h-2px bg-[var(--White-100)]" />
                </button>

                {img.uploading && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <LoadingIcon className={clsx('w-24px h-24px', 'animate-spin')} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className={clsx(isMobile ? 'p-12px' : 'px-24px py-12px')}>
          <Button
            type="primary"
            className="w-full"
            loading={submitting}
            disabled={!canSubmit}
            onClick={() => {
              handleSubmit();
            }}
          >
            {submitting ? '提交中...' : '提交'}
          </Button>
        </div>
      </Overlay>
      {/* 选择类型弹层 */}
      <Overlay
        show={categoryPickerVisible}
        close={() => setCategoryPickerVisible(false)}
        position={isMobile ? 'bottom' : 'center'}
        bodyClassname={clsx(
          'flex flex-col gap-8px overflow-hidden bg-[var(--Background-400)]',
          isMobile ? 'rounded-t-10px safe-b' : 'rounded-12px w-450px',
        )}
        bodyStyle={{
          maxHeight: '50%',
        }}
      >
        <ModalHeader title="选择类型" onClose={() => setCategoryPickerVisible(false)} />
        <div className={clsx('px-12px pb-20px flex-1-col-hidden')}>
          <div className={clsx('bg-[var(--Background-300)] rounded-12px flex-1 overflow-y-auto')}>
            {messageCategoryList.map((key) => {
              return (
                <button
                  key={key}
                  type="button"
                  className={clsx('w-full flex items-center justify-between p-12px')}
                  onClick={() => {
                    setCategory(key);
                    setCategoryPickerVisible(false);
                  }}
                >
                  <span className="_tf[14] font-600 leading-[1.43]">
                    {messageCategoryMap[key].text}
                  </span>
                  {category === key && <CheckBox value={true} />}
                </button>
              );
            })}
          </div>
        </div>
      </Overlay>
    </>
  );
};

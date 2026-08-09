import { useState, useCallback } from 'react';
import { ArrowLeftSvg } from '@/sites/op7/components/SvgIcons';
import clsx from 'clsx';
import { ImageViewer } from 'antd-mobile';
import { TNewsMsgItem } from '@/apis/origin/msgCenter/newsInbox';
import { EMessageTabKey, TChildMsg } from '@/core/store/slices/messageCenterSlice';
import { useMessageCenterMethods } from '@/common/hooks/messageCenter/useMessageCenterMethods';
import Skeleton from '@/common/components/Skeleton';
import { EMessageStatus, messageCategoryMap } from '@/apis/commonSports/constants';
import CheckBox from '@/common/components/CheckBox';
import { useAppSelector } from '@/core/store/hooks';
import { formatMessageRichText, stripTagsFromHtmlString } from '@/utils';
import { useEmcRichText } from '@/common/hooks/useEmcRichText';

import styles from './msgItem.module.scss';

interface TProps {
  type: EMessageTabKey;
  data: TNewsMsgItem;
  expanded?: boolean;
  selected?: boolean;
  childMsg?: TChildMsg;
}

export const MsgItem = ({ type, data, expanded, selected, childMsg }: TProps) => {
  const [visible, setVisible] = useState(false);
  const [previewImgList, setPreviewImgList] = useState<string[]>([]);
  const [defaultPreviewIdx, setDefaultPreviewIdx] = useState(0);

  const multiDeleteMode = useAppSelector((state) => state.messageCenter.multiDeleteMode);
  const isInbox = type === EMessageTabKey.INBOX;
  const { richTextOptions, onRichTextClick } = useEmcRichText();
  const {
    expandInboxMsgItem,
    collapseInboxMsgItem,
    expandOutboxMsgItem,
    collapseOutboxMsgItem,
    toogleSelectOne,
    openMsgEditor,
  } = useMessageCenterMethods();

  const categoryInfo = messageCategoryMap[data.category];

  const handleExpand = useCallback(() => {
    if (type === EMessageTabKey.INBOX) {
      if (childMsg?.loading) return;
      if (expanded) {
        collapseInboxMsgItem(data);
      } else {
        expandInboxMsgItem(data);
      }
    } else {
      if (expanded) {
        collapseOutboxMsgItem(data);
      } else {
        expandOutboxMsgItem(data);
      }
    }
  }, [
    type,
    expanded,
    childMsg?.loading,
    data,
    expandInboxMsgItem,
    collapseInboxMsgItem,
    expandOutboxMsgItem,
    collapseOutboxMsgItem,
  ]);

  const onShowPreview = (
    baseUrl: string,
    imgList: {
      img: string;
      id: string;
    }[],
    idx: number,
  ) => {
    setPreviewImgList(imgList.map((obj) => baseUrl + obj.img));
    setDefaultPreviewIdx(idx);
    setVisible(true);
  };

  const richMessageInfo = formatMessageRichText(
    data.messageInfo,
    isInbox ? richTextOptions : undefined,
  );

  return (
    <div className={clsx(styles.msgItem, 'shrink-0 flex items-center gap-10px')}>
      {multiDeleteMode && (
        <CheckBox
          value={!!selected}
          onChange={() => toogleSelectOne({ id: data.id, subTab: type })}
        />
      )}
      <div
        className="flex-1 flex flex-col gap-8px bg-[var(--Background-300)] rounded-[12px] p-12px overflow-hidden"
        onClick={handleExpand}
      >
        <div className="flex items-center gap-8px">
          {!!categoryInfo && (
            <div
              className={clsx(
                'shrink-0 rounded-full px-10px py-4px _tf[12] leading-[1.33]',
                categoryInfo.bgColor,
                categoryInfo.textColor,
              )}
            >
              {categoryInfo.text}
            </div>
          )}
          <div className="_tf[16] font-600 leading-[1.5] text-[var(--Text-Main-10)] truncate">
            {data.title}
          </div>
        </div>
        <div className="flex flex-col gap-12px">
          {expanded ? (
            <div
              className="_tf[12] leading-[1.3] text-[var(--Text-800)]"
              dangerouslySetInnerHTML={{ __html: richMessageInfo }}
              onClick={(e) => {
                e.stopPropagation();
                if (isInbox) {
                  onRichTextClick(e);
                }
              }}
            />
          ) : (
            <div className="_tf[12] leading-[1.3] text-[var(--Text-800)] line-clamp-1">
              {stripTagsFromHtmlString(richMessageInfo)}
            </div>
          )}

          {expanded && (
            <div onClick={(e) => e.stopPropagation()}>
              {data.imgList.length > 0 && (
                <div className="flex gap-8px">
                  {data.imgList.map((img, index) => (
                    <div key={img.id} className="w-50px h-50px bg-[var(--Background-700)]">
                      <img
                        src={`${data.imgUrl}${img.img}`}
                        className="w-full h-full object-cover"
                        alt={img.id}
                        onClick={() => onShowPreview(data.imgUrl, data.imgList, index)}
                      />
                    </div>
                  ))}
                </div>
              )}
              {childMsg?.loading ? (
                <Skeleton type="msgChildList" />
              ) : childMsg?.list?.length ? (
                <>
                  {data.isReply && (
                    <button
                      className={clsx(
                        'mt-12px w-full bg-[var(--Background-700)] rounded-[12px] p-12px',
                        'flex items-center justify-center',
                      )}
                      onClick={() => {
                        openMsgEditor({ replyItem: data });
                      }}
                    >
                      <span className="_tf[14] font-600 leading-[1.5] text-[var(--Text-Main-10)]">
                        回复
                      </span>
                    </button>
                  )}
                  <div className="mt-12px bg-[var(--Background-700)] rounded-[12px] p-12px flex flex-col gap-12px">
                    {childMsg?.list?.map((item) => (
                      <div key={item.id} className="flex flex-col gap-8px">
                        <div
                          className={clsx(
                            'flex justify-between gap-8px',
                            '_tf[12] leading-[1.5] text-[var(--Text-800)]',
                          )}
                        >
                          <div>{item.title}</div>
                          <div>{item.addTime}</div>
                        </div>
                        <div className="_tf[12] leading-[1.5] text-[var(--Text-Main-10)]">
                          {item.messageInfo}
                        </div>

                        {item.imgList.length > 0 && (
                          <div className="flex gap-8px">
                            {item.imgList.map((img, index) => (
                              <div
                                key={img.id}
                                className="w-50px h-50px bg-[var(--Background-700)]"
                              >
                                <img
                                  src={`${item.imgUrl}${img.img}`}
                                  className="w-full h-full object-cover"
                                  alt={img.id}
                                  onClick={() => onShowPreview(item.imgUrl, item.imgList, index)}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="_tf[12] text-[var(--Text-700)]">{data.addTime}</div>
          <button className="shrink-0 flex items-center gap-4px text-[var(--Text-800)]">
            {data.messageStatus === EMessageStatus.Unread && type === EMessageTabKey.INBOX && (
              <div className="w-6px h-6px bg-[var(--ThemeColor-Main)] rounded-full"></div>
            )}
            <span className="_tf[12] ">{expanded ? '收起' : '展开'}</span>
            <ArrowLeftSvg
              className={clsx(
                'w-10px h-10px transition-transform duration-200',
                expanded ? 'rotate-90' : 'rotate-270',
              )}
            />
          </button>
        </div>
      </div>
      {visible && (
        <ImageViewer.Multi
          images={previewImgList}
          visible={visible}
          defaultIndex={defaultPreviewIdx}
          onClose={() => {
            setVisible(false);
          }}
        />
      )}
    </div>
  );
};

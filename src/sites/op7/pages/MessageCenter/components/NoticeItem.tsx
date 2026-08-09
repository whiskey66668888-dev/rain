import { useState } from 'react';
import { formatMessageRichText, stripTagsFromHtmlString } from '@/utils';
import { ArrowLeftSvg } from '@/sites/op7/components/SvgIcons';
import clsx from 'clsx';

interface TProps {
  title: string;
  content: string;
  addTime: string;
}

export const NoticeItem = ({ title, content, addTime }: TProps) => {
  const [expanded, setExpanded] = useState(false);
  const richContent = formatMessageRichText(content);

  const handleExpand = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <div
      className="flex flex-col gap-8px bg-[var(--Background-300)] rounded-[12px] p-12px"
      onClick={handleExpand}
    >
      <div className="_tf[16] font-600 leading-[1.5] text-[var(--Text-Main-10)] truncate">
        {title}
      </div>
      <div className="transition-height duration-200">
        {expanded ? (
          <div
            className="_tf[12] leading-[1.3] text-[var(--Text-800)]"
            dangerouslySetInnerHTML={{ __html: richContent }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="_tf[12] leading-[1.3] text-[var(--Text-800)] line-clamp-2">
            {stripTagsFromHtmlString(richContent)}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="_tf[12] text-[var(--Text-700)]">{addTime}</div>
        <button className="shrink-0 flex items-center gap-4px text-[var(--Text-800)]">
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
  );
};

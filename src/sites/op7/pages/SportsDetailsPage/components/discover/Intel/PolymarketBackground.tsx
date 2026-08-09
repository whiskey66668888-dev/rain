import React, { useMemo } from 'react';

import { marketDisplayContent, type PolymarketBackgroundData } from '@/apis/origin/discover';
import Empty from '@/common/components/Empty';

interface PolymarketBackgroundProps {
  data: PolymarketBackgroundData | null;
}

/** 按空行拆分段落，对齐 App _splitParagraphs */
const splitParagraphs = (text: string): string[] =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

/** 段落内在中文句号后换行，去掉行尾多余换行，对齐 App _MarketBlock */
const paragraphLines = (paragraph: string): string[] =>
  paragraph.replace(/。/g, '。\n').replace(/\n$/, '').split('\n');

const MarketBlock: React.FC<{ content: string }> = ({ content }) => {
  const paragraphs = useMemo(() => splitParagraphs(content), [content]);
  if (paragraphs.length === 0) return null;

  return (
    <div className="flex flex-col">
      {paragraphs.map((paragraph, pIndex) => (
        <p
          key={pIndex}
          className="mb-10px last:mb-0 _tf[12] font-400 leading-[1.7] text-[var(--Text-Main-10)] whitespace-pre-wrap"
        >
          {paragraphLines(paragraph).join('\n')}
        </p>
      ))}
    </div>
  );
};

/**
 * 发现-情报-盘口背景
 * 对齐 App PolymarketBackgroundSections：拼接各市场背景（中文）+ 规则（英文）
 */
const PolymarketBackground: React.FC<PolymarketBackgroundProps> = ({ data }) => {
  const blocks = useMemo(() => {
    if (!data) return [];
    return data.markets
      .map((market) => marketDisplayContent(market).trim())
      .filter((content) => content.length > 0);
  }, [data]);

  if (blocks.length === 0) {
    return <Empty variant="card" className="py-24px" />;
  }

  return (
    <div className="flex flex-col gap-12px px-12px py-16px rounded-8px bg-[var(--Background-300)]">
      {blocks.map((content, index) => (
        <MarketBlock key={index} content={content} />
      ))}
    </div>
  );
};

export default PolymarketBackground;

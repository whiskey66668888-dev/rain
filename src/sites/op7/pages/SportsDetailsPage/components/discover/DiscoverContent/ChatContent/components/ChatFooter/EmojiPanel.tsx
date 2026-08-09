import React, { useMemo } from 'react';
import emojiData from '@emoji-mart/data';
import deleteIcon from '@/sites/op7/images/common/chat/emoji_delete.svg';
import styles from './ChatFooter.module.scss';

const CATEGORY_ORDER = [
  'people',
  'nature',
  'foods',
  'activity',
  'places',
  'objects',
  'symbols',
  'flags',
] as const;

type EmojiMartData = {
  categories: Array<{ id: string; emojis?: string[] }>;
  emojis: Record<string, { id?: string; skins?: Array<{ native?: string }> }>;
};

const FALLBACK_EMOJIS = [
  '😀',
  '😂',
  '🤣',
  '😊',
  '😍',
  '🥰',
  '😘',
  '😜',
  '🤗',
  '🤔',
  '😎',
  '🥳',
  '😢',
  '😭',
  '😡',
  '🥺',
  '😱',
  '💀',
  '👍',
  '👎',
  '👏',
  '🙏',
  '💪',
  '❤️',
  '🔥',
  '⭐',
  '🎉',
  '💯',
  '👋',
  '⚽',
];

const buildEmojiList = (data: EmojiMartData): Array<{ id: string; native: string }> => {
  const result: Array<{ id: string; native: string }> = [];
  CATEGORY_ORDER.forEach((categoryId) => {
    const category = data.categories.find((item) => item.id === categoryId);
    category?.emojis?.forEach((emojiId) => {
      const emoji = data.emojis[emojiId];
      const native = emoji?.skins?.[0]?.native;
      if (native) result.push({ id: emoji.id || emojiId, native });
    });
  });
  return result;
};

interface EmojiPanelProps {
  onSelect: (emoji: string) => void;
  onDelete: () => void;
}

/** 对齐 tf_90 LiveEmbedEmojiGrid：八列表情网格 + 右下角字素删除。 */
const EmojiPanel: React.FC<EmojiPanelProps> = ({ onSelect, onDelete }) => {
  const emojis = useMemo(() => {
    try {
      const list = buildEmojiList(emojiData as EmojiMartData);
      if (list.length) return list;
    } catch {
      // 使用内置列表兜底，避免表情数据异常拖垮聊天区。
    }
    return FALLBACK_EMOJIS.map((native, index) => ({ id: `${native}-${index}`, native }));
  }, []);

  return (
    <div className={styles.emojiPanel} data-emoji-panel>
      <div className={styles.emojiScroll}>
        <div className={styles.emojiGrid}>
          {emojis.map((emoji) => (
            <button
              key={emoji.id}
              type="button"
              className={styles.emojiCell}
              aria-label={emoji.native}
              onClick={() => onSelect(emoji.native)}
            >
              {emoji.native}
            </button>
          ))}
        </div>
      </div>
      <button type="button" className={styles.emojiDelete} aria-label="删除" onClick={onDelete}>
        <img src={deleteIcon} alt="" />
      </button>
    </div>
  );
};

export default EmojiPanel;

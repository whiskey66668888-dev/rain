import React from 'react';
import { useChatLazyRender } from '../../hooks/useChatLazyRender';

interface ChatMessageVisibilityItemProps {
  children: React.ReactNode;
  /** 列表滚动容器，作为 IntersectionObserver root */
  scrollRoot?: Element | null;
  /** 首屏强制渲染（用于贴底附近消息，避免 H5 首次进入高度不准） */
  forceRender?: boolean;
}

const ChatMessageVisibilityItem: React.FC<ChatMessageVisibilityItemProps> = ({
  children,
  scrollRoot = null,
  forceRender = false,
}) => {
  const { ref, inView, hasBeenVisible, holderHeight, contentRef } = useChatLazyRender(
    72,
    scrollRoot,
  );

  const shouldRender = forceRender || inView || hasBeenVisible;

  return (
    <div ref={ref}>
      {shouldRender ? (
        <div ref={contentRef}>{children}</div>
      ) : (
        <div style={{ minHeight: holderHeight }} />
      )}
    </div>
  );
};

export default ChatMessageVisibilityItem;

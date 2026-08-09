import React from 'react';
import ReactDOM from 'react-dom/client';

const PROMPT_CONTAINER_ID = 'op7-notification-permission-prompt';

type PromptOptions = {
  onEnable: () => void;
  onLater?: () => void;
  message?: string;
  enableText?: string;
  laterText?: string;
};

let promptRoot: ReactDOM.Root | null = null;
let promptContainer: HTMLDivElement | null = null;

function removePromptContainer(): void {
  if (promptRoot) {
    promptRoot.unmount();
    promptRoot = null;
  }
  if (promptContainer) {
    promptContainer.remove();
    promptContainer = null;
  }
}

function NotificationPermissionPrompt({
  message,
  enableText,
  laterText,
  onEnable,
  onLater,
}: {
  message: string;
  enableText: string;
  laterText: string;
  onEnable: () => void;
  onLater: () => void;
}): React.JSX.Element {
  return (
    <div
      style={{
        position: 'fixed',
        left: '12px',
        right: '12px',
        bottom: '16px',
        zIndex: 99999,
        padding: '12px',
        borderRadius: '12px',
        background: 'rgba(24, 24, 27, 0.92)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.28)',
      }}
    >
      <span
        style={{
          fontSize: '13px',
          lineHeight: '18px',
          flex: 1,
        }}
      >
        {message}
      </span>
      <button
        type="button"
        style={{
          height: '32px',
          padding: '0 12px',
          border: 'none',
          borderRadius: '8px',
          background: '#2563eb',
          color: '#fff',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
        }}
        onClick={onEnable}
      >
        {enableText}
      </button>
      <button
        type="button"
        style={{
          height: '32px',
          padding: '0 10px',
          border: '1px solid rgba(255, 255, 255, 0.28)',
          borderRadius: '8px',
          background: 'transparent',
          color: '#fff',
          fontSize: '12px',
          cursor: 'pointer',
        }}
        onClick={onLater}
      >
        {laterText}
      </button>
    </div>
  );
}

export function hideNotificationPermissionPrompt(): void {
  removePromptContainer();
}

export function showNotificationPermissionPrompt({
  onEnable,
  onLater,
  message = '开启通知后可接收系统消息（测试）',
  enableText = '开启通知',
  laterText = '稍后',
}: PromptOptions): void {
  if (typeof window === 'undefined') return;
  if (promptContainer) return;

  promptContainer = document.createElement('div');
  promptContainer.id = PROMPT_CONTAINER_ID;
  document.body.appendChild(promptContainer);
  promptRoot = ReactDOM.createRoot(promptContainer);

  promptRoot.render(
    <NotificationPermissionPrompt
      message={message}
      enableText={enableText}
      laterText={laterText}
      onEnable={onEnable}
      onLater={() => {
        onLater?.();
        removePromptContainer();
      }}
    />,
  );
}

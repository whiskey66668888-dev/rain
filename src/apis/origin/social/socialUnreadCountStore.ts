type Listener = () => void;

let snapshot = 0;
const listeners = new Set<Listener>();

export const getSocialUnreadCountSnapshot = (): number => snapshot;

export const setSocialUnreadCountSnapshot = (value: number): void => {
  snapshot = value;
  listeners.forEach((listener) => listener());
};

export const subscribeSocialUnreadCount = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

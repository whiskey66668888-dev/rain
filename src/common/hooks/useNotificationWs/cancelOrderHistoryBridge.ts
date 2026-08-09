type TCancelOrderHistoryHandler = (orderId: string) => void;

export const cancelOrderHistoryBridge = {
  current: null as TCancelOrderHistoryHandler | null,
};

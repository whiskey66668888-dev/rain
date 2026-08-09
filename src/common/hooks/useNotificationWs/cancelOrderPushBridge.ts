type TCancelOrderPushHandler = (orderId: string) => void;

export const cancelOrderPushBridge = {
  current: null as TCancelOrderPushHandler | null,
};

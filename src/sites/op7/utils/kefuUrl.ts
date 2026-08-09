export function buildKefuUrl(kefu: string, orderId?: string): string {
  if (!orderId) return kefu;
  return kefu.includes('?')
    ? `${kefu}&orderId=${encodeURIComponent(orderId)}`
    : `${kefu}?orderId=${encodeURIComponent(orderId)}`;
}

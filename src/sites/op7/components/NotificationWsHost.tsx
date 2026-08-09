import { useNotificationWs } from '@/common/hooks/useNotificationWs';

export default function NotificationWsHost() {
  useNotificationWs();
  return null;
}

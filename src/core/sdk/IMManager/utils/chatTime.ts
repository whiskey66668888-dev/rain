const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

const pad = (value: number): string => value.toString().padStart(2, '0');

export const formatChatTimestamp = (timestamp: number): string => {
  const sendTime = new Date(timestamp);
  if (Number.isNaN(sendTime.getTime())) return '';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(sendTime.getFullYear(), sendTime.getMonth(), sendTime.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const hhmm = `${pad(sendTime.getHours())}:${pad(sendTime.getMinutes())}`;

  if (messageDate.getTime() === today.getTime()) {
    return hhmm;
  }

  if (messageDate.getTime() === yesterday.getTime()) {
    return `昨天 ${hhmm}`;
  }

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  if (messageDate >= weekStart && messageDate < today) {
    const weekday = weekdays[(sendTime.getDay() + 6) % 7];
    return `${weekday} ${hhmm}`;
  }

  if (sendTime.getFullYear() !== now.getFullYear()) {
    return `${sendTime.getFullYear()}/${pad(sendTime.getMonth() + 1)}/${pad(sendTime.getDate())} ${hhmm}`;
  }

  return `${pad(sendTime.getMonth() + 1)}/${pad(sendTime.getDate())} ${hhmm}`;
};

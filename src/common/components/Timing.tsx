/**
 * @description 时间组件：倒计时时每秒减一，正计时时每秒加一
 * @param time 分秒数字，如 5233 表示 52 分 33 秒
 * @param isCountdown 是否为倒计时
 * @param running 是否运行
 */
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';

interface TimingProps {
  /** 分秒：前两位为分，后两位为秒，如 5233 -> 52:33 */
  time: number;
  isCountdown?: boolean;
  className?: string;
  running?: boolean;
}

/** 总秒数转 MM:SS */
const formatFromTotalSeconds = (totalSeconds: number): string => {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const Timing: React.FC<TimingProps> = ({
  time,
  isCountdown = false,
  className,
  running = true,
}) => {
  const [totalSeconds, setTotalSeconds] = useState(time);

  // time 变化时重置为新的初始值
  useEffect(() => {
    setTotalSeconds(time);
  }, [time]);

  // 每秒更新：倒计时减一，正计时加一
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setTotalSeconds((prev) => {
        if (isCountdown) {
          return prev <= 0 ? 0 : prev - 1;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isCountdown, running]);

  const text = formatFromTotalSeconds(totalSeconds);
  return <span className={clsx(className)}>{text}</span>;
};

export default Timing;

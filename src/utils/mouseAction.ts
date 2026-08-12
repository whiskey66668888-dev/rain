import { BREAKPOINTS } from '@/utils/constants/breakpoints';

/** 与项目 isMobile（screenBreakpoint === 'md'）对齐，lg 及以上视为 PC */
export const isPC = (): boolean => {
  return window.matchMedia(`(min-width: ${BREAKPOINTS.lg}px)`).matches;
};

let started = false;
let startTime = 0;
let concatXY = '';
let firstMoveTime: number | null = null;
let lastMoveTime: number | null = null;
let moveCount = 0;
let clickCount = 0;
let wheelCount = 0;
let totalDistance = 0;
let maxSpeed = 0;
let pauseCount = 0;
let lastX: number | null = null;
let lastY: number | null = null;
let lastT: number | null = null;

const points: Array<{ x: number; y: number; t: number }> = [];

const handleMouseMove = (e: MouseEvent): void => {
  const t = Date.now();

  if (!firstMoveTime) {
    firstMoveTime = t - startTime;
  }

  lastMoveTime = t - startTime;
  moveCount++;
  concatXY += `${e.clientX}${e.clientY}`;

  if (lastX !== null && lastY !== null && lastT !== null) {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const dt = t - lastT;
    const distance = Math.sqrt(dx * dx + dy * dy);
    totalDistance += distance;

    if (dt > 0) {
      const speed = (distance / dt) * 1000;
      if (speed > maxSpeed) {
        maxSpeed = speed;
      }
    }

    if (dt > 800) {
      pauseCount++;
    }
  }

  lastX = e.clientX;
  lastY = e.clientY;
  lastT = t;

  if (points.length < 100) {
    points.push({
      x: e.clientX,
      y: e.clientY,
      t: t - startTime,
    });
  }
};

const handleClick = (): void => {
  clickCount++;
};

const handleWheel = (): void => {
  wheelCount++;
};

/** 页面加载后开始采集鼠标行为 */
export const initMouseActionTracking = (): void => {
  if (started) return;

  started = true;
  startTime = Date.now();

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('click', handleClick);
  document.addEventListener('wheel', handleWheel);
};

/** x、y 数字字符持续拼接后截取后 16 位；仅 PC 端有值 */
export const getMouseAction = (): string => {
  if (!isPC()) return '';
  return concatXY.slice(-16);
};

export const getBehaviorRiskData = (): {
  duration: number;
  firstMoveTime: number | null;
  lastMoveTime: number | null;
  moveCount: number;
  clickCount: number;
  wheelCount: number;
  totalDistance: number;
  avgSpeed: number;
  maxSpeed: number;
  pauseCount: number;
  points: Array<{ x: number; y: number; t: number }>;
} => {
  const duration = Math.max(1, (Date.now() - startTime) / 1000);
  const avgSpeed = totalDistance / duration;

  return {
    duration,
    firstMoveTime,
    lastMoveTime,
    moveCount,
    clickCount,
    wheelCount,
    totalDistance: Math.round(totalDistance),
    avgSpeed: Math.round(avgSpeed),
    maxSpeed: Math.round(maxSpeed),
    pauseCount,
    points,
  };
};

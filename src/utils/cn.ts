import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并类名
 * @note 必须是标准 tailwind 类名，才能够合并
 * @example cn('px-[12px] px-[14px]') 可以合并为 'px-[14px]'
 * @example cn('px-12 px-14') 无法合并，依旧输出 'px-12 px-14'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(...inputs));
}

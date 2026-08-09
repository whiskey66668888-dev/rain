import { useMemo, useState, useRef, useEffect } from 'react';
import { ArrowLeftSvg } from '@/sites/op7/components/SvgIcons';
import { cn } from '@/utils';

interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onChange: (page: number, pageSize: number) => void;
  className?: string;
}

function buildPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];

  if (current > 4) pages.push('...');

  const start = Math.max(2, current - 2);
  const end = Math.min(total - 1, current + 2);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 3) pages.push('...');
  pages.push(total);

  return pages;
}

const Pagination = ({
  current,
  total,
  pageSize,
  pageSizeOptions = [20, 50, 100],
  onChange,
  className,
}: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageNumbers = useMemo(() => buildPageNumbers(current, totalPages), [current, totalPages]);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const btnBase =
    'inline-flex items-center justify-center min-w-28px h-28px px-6px rounded-4px text-12px transition-colors duration-150';
  const btnNormal = 'text-[var(--Text-800)] bg-[var(--Background-300)]';
  const btnActive = 'bg-[var(--ThemeColor-Main)] text-white font-600 cursor-default';
  const btnArrow =
    'text-[var(--Text-800)] bg-[var(--Background-300)] hover:enabled:bg-[var(--Background-700)] disabled:opacity-90 disabled:cursor-not-allowed';

  return (
    <div className={cn('flex items-center gap-6px', className)}>
      {/* 共 N 条 */}
      <span className="text-12px text-[var(--Text-800)] whitespace-nowrap">共 {total} 条</span>
      {/* 上一页 */}
      <button
        type="button"
        disabled={current <= 1}
        className={cn(btnBase, btnArrow, 'w-28px')}
        onClick={() => onChange(current - 1, pageSize)}
      >
        <ArrowLeftSvg className="w-12px h-12px" />
      </button>

      {/* 页码 */}
      {pageNumbers.map((p, i) =>
        p === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className="w-28px text-center text-12px text-[var(--Text-800)]"
          >
            …
          </span>
        ) : (
          <button
            type="button"
            key={p}
            className={cn(btnBase, p === current ? btnActive : btnNormal)}
            onClick={() => p !== current && onChange(p, pageSize)}
          >
            {p}
          </button>
        ),
      )}

      {/* 下一页 */}
      <button
        type="button"
        disabled={current >= totalPages}
        className={cn(btnBase, btnArrow, 'w-28px')}
        onClick={() => onChange(current + 1, pageSize)}
      >
        <ArrowLeftSvg className="w-12px h-12px rotate-180" />
      </button>

      {/* 每页条数 */}
      {pageSizeOptions.length > 0 && (
        <div ref={dropdownRef} className="relative ml-8px">
          <button
            type="button"
            className={cn(btnBase, btnNormal, 'gap-4px px-8px whitespace-nowrap')}
            onClick={() => setDropdownOpen((v) => !v)}
          >
            <span className="text-nowrap whitespace-nowrap">{pageSize} 条/页</span>
            <span
              className={cn(
                'i-carbon-chevron-down text-10px transition-transform duration-150',
                dropdownOpen && 'rotate-180',
              )}
            />
          </button>
          {dropdownOpen && (
            <div className="absolute bottom-full mb-4px right-0 bg-[var(--Background-300)] border border-solid border-[var(--Line-200)] rounded-6px shadow-[0_4px_12px_0_rgba(0,0,0,.15)] py-4px z-50 min-w-80px">
              {pageSizeOptions.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={cn(
                    'w-full text-left px-12px py-6px text-12px transition-colors duration-100 text-nowrap whitespace-nowrap',
                    size === pageSize
                      ? 'text-[var(--ThemeColor-Main)] font-600'
                      : 'text-[var(--Text-800)] hover:bg-[var(--Background-500)] hover:text-[var(--Text-Main-10)]',
                  )}
                  onClick={() => {
                    setDropdownOpen(false);
                    onChange(1, size);
                  }}
                >
                  {size} 条/页
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Pagination;

import clsx from 'clsx';
import { memo, useEffect, useRef, useState } from 'react';
import { handleContent } from '@/utils/format/handleContent';
import styles from './index.module.scss';
import { useAppSelector } from '@core/store/hooks';

let ROW_HEIGHT = '12.8vmin';
const ANIMATION_DURATION = 250;

interface DataItem {
  [key: string]: string | number | undefined;
}

interface Column {
  title: string;
  dataIndex: string;
  render?: (text: string | number | undefined, record: DataItem) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'right' | 'center';
  flex?: number;
  headerClassName?: string;
  cellClassName?: string;
  headerStyle?: React.CSSProperties;
  cellStyle?: React.CSSProperties;
}

interface MyTableProps {
  dataSource: DataItem[];
  columns: Column[];
  collapsedRows?: number;
  onExpandChange?: (expanded: boolean) => void;
  expandText?: string;
  collapseText?: string;
  className?: string;
  defaultExpanded?: boolean;
}

const MyTable: React.FC<MyTableProps> = ({
  dataSource = [],
  columns = [],
  collapsedRows = 3,
  onExpandChange,
  expandText = '查看更多',
  collapseText = '收起',
  className = '',
  defaultExpanded = false,
}) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = screenBreakpoint === 'md';
  if (!isMobile) ROW_HEIGHT = '50px';
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [animating, setAnimating] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleExpand = () => {
    if (animating) return;
    setAnimating(true);
    const next = !expanded;
    setExpanded(next);
    onExpandChange?.(next);
    setTimeout(() => setAnimating(false), ANIMATION_DURATION);
  };

  const getColumnStyle = (column: Column) => {
    if (column.width) return { width: column.width, flex: 'none' };
    if (column.flex) return { flex: column.flex };
    return { flex: 1 };
  };

  const showToggle = Array.isArray(dataSource) && dataSource.length > collapsedRows;

  const renderHtml = (content: string | number | undefined) => {
    if (content === undefined || content === null) return '';
    if (typeof content !== 'string') return content;
    const processedContent = isClient ? handleContent(content) : content;
    if (processedContent.includes('<')) {
      return <div dangerouslySetInnerHTML={{ __html: processedContent }} />;
    }
    return processedContent;
  };

  return (
    <div className={clsx(styles.tableContainer, className)}>
      <div className={styles.tableContainerInner}>
        <div className={styles.header}>
          {columns.map((column, index) => (
            <div
              key={index}
              className={clsx(styles.headerCell, column.headerClassName)}
              style={{
                ...getColumnStyle(column),
                textAlign: column.align || 'center',
                ...(column.headerStyle || {}),
              }}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: isClient ? handleContent(column.title) : column.title,
                }}
              />
            </div>
          ))}
        </div>

        <div
          className={styles.tableContent}
          ref={contentRef}
          style={{
            // ...(expanded ? { minHeight: getTableHeight() } : { height: getTableHeight() }),
            overflow: 'hidden',
            transition: `height ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            boxSizing: 'border-box',
          }}
        >
          {Array.isArray(dataSource) && dataSource.length > 0 ? (
            (expanded ? dataSource : dataSource.filter((_, i) => i < 3)).map((record, rowIndex) => (
              <div key={rowIndex} className={styles.row} style={{ minHeight: ROW_HEIGHT }}>
                {columns.map((column, colIndex) => (
                  <div
                    key={colIndex}
                    className={clsx(styles.cell, column.cellClassName)}
                    style={{
                      ...getColumnStyle(column),
                      textAlign: column.align || 'center',
                      ...(column.cellStyle || {}),
                    }}
                  >
                    {column.render
                      ? column.render(record[column.dataIndex], record)
                      : renderHtml(record[column.dataIndex])}
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className={styles.emptyRow} style={{ height: '0', overflow: 'hidden' }} />
          )}
        </div>
      </div>

      {showToggle && (
        <div
          className={clsx(
            styles.toggleButton,
            animating ? styles.animating : '',
            expanded ? styles.expanded : '',
          )}
          onClick={toggleExpand}
        >
          <div
            className={styles.toggleText}
            dangerouslySetInnerHTML={{
              __html: handleContent(expanded ? collapseText : expandText),
            }}
          />
          <svg
            className={clsx(styles.icon, !expanded && styles.iconOpen)}
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.74781 5.01867C4.86987 4.89661 5.05937 4.88119 5.19801 4.97277C5.2176 4.98577 5.23641 5.0014 5.25367 5.01867L8.28394 8.04894C8.42295 8.18833 8.42295 8.41444 8.28394 8.55382C8.14457 8.69293 7.91848 8.69287 7.77906 8.55382L5.00074 5.7755L2.22242 8.55382C2.08298 8.69288 1.85691 8.69298 1.71754 8.55382C1.57853 8.41444 1.57853 8.18833 1.71754 8.04894L4.74781 5.01867ZM4.74781 1.44738C4.88728 1.30791 5.1142 1.30791 5.25367 1.44738L8.28394 4.47765C8.4229 4.61707 8.423 4.84318 8.28394 4.98253C8.14444 5.12169 7.91843 5.12092 7.77906 4.98156L5.00074 2.20421L2.22242 4.98156C2.08301 5.12097 1.85703 5.12181 1.71754 4.98253C1.57848 4.84318 1.57858 4.61707 1.71754 4.47765L4.74781 1.44738Z"
              fill="currentColor"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default memo(MyTable);

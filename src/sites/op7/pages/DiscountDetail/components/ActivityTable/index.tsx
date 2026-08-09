import React, { ReactNode, CSSProperties, useState } from 'react';
import clsx from 'clsx';
import styles from './index.module.scss';
import { handleContent } from '@/utils/format/handleContent';
import LazyImage from '@/common/components/LazyImage';

const getCellContent = (value: unknown): ReactNode => {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  return '';
};

// 定义表头单元格
export type TableRow = {
  key?: string | number;
  [key: string]: unknown;
};

export type HeaderCell<T extends TableRow = TableRow> = {
  /** 列标题 */
  title: string;
  /** 列标识，对应数据对象中的属性 */
  key: keyof T & string;
  /** 列宽度 */
  width?: string | number;
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right';
  /** 自定义类名 */
  className?: string;
  /** 自定义渲染函数 */
  render?: (value: T[keyof T], record: T, index: number) => ReactNode;
  /** 单元格文字颜色 */
  color?: string;
  /** 表头单元格文字颜色 */
  headerColor?: string;
  /** 数据单元格样式 */
  cellStyle?: CSSProperties;
  /** 表头单元格样式 */
  headerCellStyle?: CSSProperties;
};

interface ActivityTableProps<T extends TableRow = TableRow> {
  /** 表格列定义 */
  columns: HeaderCell<T>[];
  /** 表格数据 */
  dataSource: T[];
  /** 自定义类名 */
  className?: string;
  /** 斑马纹 */
  striped?: boolean;
  /** 空数据文本 */
  emptyText?: string | ReactNode;
  /** 加载状态 */
  loading?: boolean;
  /** 自定义行样式 */
  rowClassName?: (record: T, index: number) => string;
  /** 表格底部内容 */
  footer?: ReactNode;
  /** 是否启用展开收起功能 */
  expandable?: boolean;
  /** 默认显示行数 */
  defaultExpandedRows?: number;
  /** 展开文本 */
  expandText?: string;
  /** 收起文本 */
  collapseText?: string;
  /** 每行高度 */
  rowHeight?: number;
  /** 内容行高度 */
  bodyRowHeight?: number;
  /** 动画持续时间(ms) */
  animationDuration?: number;
}

/**
 * 基于 div 的简单表格组件
 * 支持自定义渲染和列文本颜色
 */
const ActivityTable = <T extends TableRow>({
  columns,
  dataSource = [],
  className,
  striped = true,
  emptyText = '暂无数据',
  loading = false,
  rowClassName,
  footer,
  expandable = false,
  defaultExpandedRows = 3,
  expandText = '展开',
  collapseText = '收起',
  rowHeight = 32,
  bodyRowHeight = 32,
  animationDuration = 300,
}: ActivityTableProps<T>) => {
  const [expanded, setExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const showToggle = expandable && dataSource.length > defaultExpandedRows;

  // 调整计算逻辑，确保空数据情况也有一行高度
  const visibleRowCount = dataSource.length > 0 ? dataSource.length : 1; // 至少显示一行高度，用于显示横杠或空数据提示

  // 计算表格主体高度
  const bodyHeight =
    !showToggle || expanded
      ? `${visibleRowCount * bodyRowHeight}px`
      : `${Math.min(visibleRowCount, defaultExpandedRows) * bodyRowHeight}px`;

  // 切换展开/收起状态
  const toggleExpand = () => {
    setIsAnimating(true);
    setExpanded(!expanded);

    // 动画结束后重置状态
    setTimeout(() => {
      setIsAnimating(false);
    }, animationDuration);
  };

  // 表格主体内容渲染 - 为空时展示与列数相同的横杠
  const renderTableBody = () => {
    if (loading) {
      return (
        <div className={styles.loadingRow}>
          <div className={styles.loadingContent}>加载中...</div>
        </div>
      );
    }

    if (!dataSource || dataSource.length === 0) {
      // 修改：创建一行包含多个横杠的空行，每个横杠对应一列
      if (typeof emptyText !== 'string') {
        return (
          <div className={styles.row} style={{ height: `${bodyRowHeight}px` }}>
            <div style={{ width: '100%' }}>{emptyText}</div>
          </div>
        );
      }
      return (
        <div className={styles.row} style={{ height: `${bodyRowHeight}px` }}>
          {columns.map((column) => {
            // 使用与正常数据单元格相同的样式逻辑
            const baseStyle: React.CSSProperties = {
              width: column.width,
              flex: column.width ? '0 0 auto' : '1',
              textAlign: column.align || 'center',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent:
                column.align === 'left'
                  ? 'flex-start'
                  : column.align === 'right'
                    ? 'flex-end'
                    : 'center',
            };

            // 合并基本样式和自定义样式
            const cellStyle: React.CSSProperties = {
              ...baseStyle,
              color: column.color || '#999', // 使用浅灰色显示横杠
              ...(column.cellStyle || {}),
            };

            return (
              <div
                className={clsx(styles.cell, column.className)}
                key={column.key}
                style={cellStyle}
              >
                -
              </div>
            );
          })}
        </div>
      );
    }

    // 原有的数据渲染逻辑不变
    return dataSource.map((record, rowIndex) => {
      const customRowClassName = rowClassName ? rowClassName(record, rowIndex) : '';
      const rowClass = clsx(
        styles.row,
        striped && rowIndex % 2 !== 0 && styles.stripedRow,
        customRowClassName,
      );

      return (
        <div
          className={rowClass}
          key={record.key || rowIndex}
          style={{ height: `${bodyRowHeight}px` }}
        >
          {columns.map((column) => {
            // 基本样式
            const baseStyle: React.CSSProperties = {
              width: column.width,
              flex: column.width ? '0 0 auto' : '1',
              textAlign: column.align || 'center',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent:
                column.align === 'left'
                  ? 'flex-start'
                  : column.align === 'right'
                    ? 'flex-end'
                    : 'center',
            };

            // 合并基本样式、文字颜色和自定义样式
            const cellStyle: React.CSSProperties = {
              ...baseStyle,
              color: column.color || 'inherit',
              ...(column.cellStyle || {}), // 添加自定义样式
            };

            const cellValue = record[column.key];

            // 使用自定义渲染函数或直接显示值
            let cellContent: ReactNode;
            if (column.render) {
              cellContent = column.render(cellValue, record, rowIndex);
            } else {
              cellContent = getCellContent(cellValue);
            }

            return (
              <div
                className={clsx(styles.cell, column.className)}
                key={column.key}
                style={cellStyle}
              >
                {cellContent}
              </div>
            );
          })}
        </div>
      );
    });
  };

  // 渲染展开/收起按钮
  const renderToggleButton = () => {
    if (!showToggle) return null;

    return (
      <div className={styles.toggleContainer}>
        <div className={styles.toggleButton} onClick={toggleExpand}>
          {expanded ? collapseText : expandText}
          <LazyImage
            src={require('./image/down.png')}
            alt=""
            className={expanded ? styles.rotated : ''}
          />
        </div>
      </div>
    );
  };

  // 渲染表格底部
  const renderFooter = () => {
    if (!footer) return null;

    return footer;
  };

  // 表头渲染
  const renderHeader = () => {
    return (
      <div className={styles.headerRow} style={{ height: `${rowHeight}px` }}>
        {columns.map((column) => {
          // 基本样式
          const baseStyle: React.CSSProperties = {
            width: column.width,
            flex: column.width ? '0 0 auto' : '1',
            textAlign: column.align || 'center',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              column.align === 'left'
                ? 'flex-start'
                : column.align === 'right'
                  ? 'flex-end'
                  : 'center',
          };

          // 合并基本样式、文字颜色和自定义表头样式
          const headerStyle: React.CSSProperties = {
            ...baseStyle,
            color: column.headerColor,
            ...(column.headerCellStyle || {}), // 添加自定义表头样式
          };

          return (
            <div
              className={clsx(styles.headerCell, column.className)}
              key={column.key}
              style={headerStyle}
              dangerouslySetInnerHTML={{ __html: handleContent(column.title) }}
            ></div>
          );
        })}
      </div>
    );
  };

  const tableClass = clsx(styles.simpleTable, className);

  // 表格样式调整，处理动画过程中的显示问题
  const bodyStyle: React.CSSProperties = {
    height: bodyHeight,
    overflow: isAnimating ? 'hidden' : 'visible', // 动画过程中隐藏溢出内容，完成后显示
    transition: `height ${animationDuration}ms ease-in-out`,
  };

  return (
    <div className={tableClass}>
      {renderHeader()}
      <div className={styles.tableBody} style={bodyStyle}>
        {renderTableBody()}
      </div>
      {renderToggleButton()}
      {renderFooter()}
    </div>
  );
};

export default ActivityTable;

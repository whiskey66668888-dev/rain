/** 与 GameList.module.scss 网格 gap 一致 */
export const SLOT_GAME_GRID_GAP = 12;

/** 与 GameList.module.scss 卡片 min / max 宽度一致 */
export const SLOT_GAME_ITEM_MIN_WIDTH = 113;
export const SLOT_GAME_ITEM_MAX_COLUMNS = 9;

/** 默认每次加载行数（产品：3 行） */
export const SLOT_GAME_DEFAULT_ROWS = 3;

/**
 * 根据列表容器宽度计算每行展示数量，与 CSS auto-fill 网格布局对齐。
 * 大屏最多 9 列（产品要求）。
 */
export function calcSlotGameColumnsPerRow(containerWidth: number): number {
  if (containerWidth <= 0) return 3;

  const gap = SLOT_GAME_GRID_GAP;
  const mobileMinCol = Math.min(SLOT_GAME_ITEM_MIN_WIDTH, (containerWidth - gap * 2) / 3);
  const columns = Math.floor((containerWidth + gap) / (mobileMinCol + gap));

  return Math.min(Math.max(columns, 1), SLOT_GAME_ITEM_MAX_COLUMNS);
}

/**
 * 分页数量 = 行数 × 每行数量（产品）
 * - H5（≤3 列）：6 行 × 3 列 = 18
 * - iPad / Web（6 列）：3 行 × 6 列 = 18
 * - 大屏（9 列）：3 行 × 9 列 = 27
 */
export function calcSlotGamePageSize(
  columnsPerRow: number,
  rowCount: number = SLOT_GAME_DEFAULT_ROWS,
): number {
  const cols = Math.max(columnsPerRow, 1);
  const rows = cols <= 3 ? 6 : rowCount;
  return cols * rows;
}

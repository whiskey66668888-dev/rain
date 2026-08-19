/** 字符串 id 列表浅比较，供 useSelector / createSelector 使用 */
export function isShallowEqualStringArray(a: string[], b: string[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export type TSelectedBetHighlight = { marketId: string; selectionId: string };

export function isShallowEqualSelectedBets(
  a: TSelectedBetHighlight[],
  b: TSelectedBetHighlight[],
): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const left = a[i];
    const right = b[i];
    if (
      left == null ||
      right == null ||
      left.marketId !== right.marketId ||
      left.selectionId !== right.selectionId
    ) {
      return false;
    }
  }
  return true;
}

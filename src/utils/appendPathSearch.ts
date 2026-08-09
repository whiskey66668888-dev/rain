/** 路由跳转时保留当前 URL query */
export function appendPathSearch(path: string, search?: URLSearchParams | string): string {
  if (!search) return path;
  const query = typeof search === 'string' ? search.replace(/^\?/, '') : search.toString();
  return query ? `${path}?${query}` : path;
}

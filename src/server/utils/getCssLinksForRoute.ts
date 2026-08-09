import fs from 'node:fs';
import path from 'node:path';

import { Manifest } from 'vite';

const manifestPath = path.resolve(process.cwd(), './client/.vite/manifest.json');
const manifest =
  __NODE_ENV__ === 'production'
    ? (JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as Manifest)
    : {};

export function getCssLinksForRoute(_url: string): string {
  const css = new Set<string>();
  const visited = new Set<string>();

  const walk = (key: string): void => {
    if (visited.has(key) || !key) return;
    visited.add(key);

    const item = manifest[key];
    if (!item) return;

    // 添加当前 chunk 的 CSS
    item.css?.forEach((c: string) => css.add(c));

    // 递归同步导入
    item.imports?.forEach(walk);
    // 递归动态导入（懒加载组件）
    item.dynamicImports?.forEach(walk);
  };

  // 从主入口开始，自动包含所有可能用到的 CSS（包括所有懒加载组件）
  // RICO_TODO: 如果项目较大，可以只包含当前路由的 CSS
  const mainEntry = Object.keys(manifest).find((k) => manifest[k]?.isEntry);
  if (mainEntry) walk(mainEntry);

  return Array.from(css)
    .map((file) => `  <link rel="stylesheet" href="/${file}" />`)
    .join('\n');
}

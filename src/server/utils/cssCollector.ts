import type { ViteDevServer } from 'vite';

/**
 * 在开发环境中收集所有 CSS
 * 暴力方法：遍历 Vite 模块图，收集所有 CSS 文件
 */
export function collectCssForRoute(_urlPathname: string, vite: ViteDevServer): string {
  const cssSet = new Set<string>();

  try {
    // 遍历 Vite 模块图中的所有模块
    const moduleGraph = vite.moduleGraph;
    const allModules = new Set(moduleGraph.idToModuleMap.values());

    for (const module of allModules) {
      if (!module.id) continue;

      // 检查是否是 CSS 文件
      const isCssFile =
        module.id.endsWith('.css') ||
        module.id.endsWith('.scss') ||
        module.id.endsWith('.module.css') ||
        module.id.endsWith('.module.scss');

      if (isCssFile) {
        // 使用模块的 URL，如果没有则使用文件路径
        const url = module.url || `/@fs/${module.id}`;
        cssSet.add(url);
      }
    }
  } catch (error) {
    console.warn('Failed to collect CSS:', error);
  }

  // 生成 CSS 链接
  return Array.from(cssSet)
    .map((cssUrl) => `    <link rel="stylesheet" href="${cssUrl}" />`)
    .join('\n');
}

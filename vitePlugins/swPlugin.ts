import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

/**
 * Service Worker 插件
 */
export default function swPlugin(version: string): Plugin {
  return {
    name: 'vite-plugin-sw',
    enforce: 'post',
    async writeBundle() {
      // 读取 sw.js 模板
      const swTemplatePath = path.resolve(__dirname, '../public/sw.js');
      if (!fs.existsSync(swTemplatePath)) {
        console.warn('⚠️ sw.js template not found');
        return;
      }

      let swContent = fs.readFileSync(swTemplatePath, 'utf-8');

      // 读取 Vite 生成的 manifest.json 来获取预缓存资源
      const manifestPath = path.resolve(process.cwd(), 'dist/client/.vite/manifest.json');
      let precacheAssets: string[] = [];

      if (fs.existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
          const assetSet = new Set<string>();
          const processedKeys = new Set<string>();

          // 递归收集所有资源（包括 imports、dynamicImports、assets）
          function collectAssets(key: string): void {
            if (processedKeys.has(key) || !manifest[key]) {
              return;
            }
            processedKeys.add(key);

            const entry = manifest[key];

            // 添加主文件
            if (entry.file && !entry.file.endsWith('.html')) {
              assetSet.add(`/${entry.file}`);
            }

            // 添加 CSS 文件
            if (entry.css) {
              entry.css.forEach((css: string) => {
                assetSet.add(`/${css}`);
              });
            }

            // 添加其他资源（图片等）
            if (entry.assets) {
              entry.assets.forEach((asset: string) => {
                if (!asset.endsWith('.html')) {
                  assetSet.add(`/${asset}`);
                }
              });
            }

            // 递归处理 imports
            if (entry.imports) {
              entry.imports.forEach((importKey: string) => {
                collectAssets(importKey);
              });
            }

            // 递归处理 dynamicImports
            if (entry.dynamicImports) {
              entry.dynamicImports.forEach((dynamicKey: string) => {
                collectAssets(dynamicKey);
              });
            }
          }

          // 从所有入口开始收集
          Object.keys(manifest).forEach((key) => {
            const entry = manifest[key];
            if (entry.isEntry || entry.isDynamicEntry || key.endsWith('.html')) {
              collectAssets(key);
            }
          });

          // 确保所有有 file 属性的条目都被收集（防止遗漏间接引用的资源）
          Object.keys(manifest).forEach((key) => {
            const entry = manifest[key];
            if (entry.file && !entry.file.endsWith('.html')) {
              assetSet.add(`/${entry.file}`);
            }
          });

          precacheAssets = Array.from(assetSet).filter((asset: string) => !asset.endsWith('.html'));
        } catch (error) {
          console.warn('⚠️ Failed to read manifest.json:', error);
        }
      }

      // 注入预缓存资源列表
      swContent = swContent.replace(
        /const PRECACHE_ASSETS = \[\];/,
        `const PRECACHE_ASSETS = ${JSON.stringify(precacheAssets)};`,
      );
      // 替换版本号
      swContent = swContent.replace(/__VERSION__/g, version);

      // 写入到 dist/client/sw.js
      const outputPath = path.resolve(process.cwd(), 'dist/client/sw.js');
      fs.writeFileSync(outputPath, swContent, 'utf-8');
      console.log(`✅ Service Worker generated: ${outputPath}`);
    },
  };
}

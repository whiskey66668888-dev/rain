import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

type ManifestChunk = {
  file?: string;
  css?: string[];
  assets?: string[];
  imports?: string[];
  dynamicImports?: string[];
  isEntry?: boolean;
  isDynamicEntry?: boolean;
};

type PrecachePlan = {
  shell: string[];
  high: string[];
  idle: string[];
};

function toAssetUrl(file: string): string {
  return file.startsWith('/') ? file : `/${file}`;
}

function isHtml(file: string): boolean {
  return file.endsWith('.html');
}

/**
 * Service Worker 插件：注入分级预缓存清单
 * - shell: 入口及其直接依赖（首装）
 * - high: react/utils/ui vendor、locales、入口 css
 * - idle: 其余可缓存静态资源
 */
export default function swPlugin(version: string): Plugin {
  return {
    name: 'vite-plugin-sw',
    enforce: 'post',
    async writeBundle() {
      const swTemplatePath = path.resolve(__dirname, '../public/sw.js');
      if (!fs.existsSync(swTemplatePath)) {
        console.warn('⚠️ sw.js template not found');
        return;
      }

      let swContent = fs.readFileSync(swTemplatePath, 'utf-8');
      const manifestPath = path.resolve(process.cwd(), 'dist/client/.vite/manifest.json');
      const plan: PrecachePlan = { shell: [], high: [], idle: [] };

      if (fs.existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as Record<
            string,
            ManifestChunk
          >;
          const allAssets = new Set<string>();
          const shellAssets = new Set<string>();
          const highAssets = new Set<string>();
          const processedKeys = new Set<string>();

          const addFile = (set: Set<string>, file?: string) => {
            if (!file || isHtml(file)) return;
            const url = toAssetUrl(file);
            set.add(url);
            allAssets.add(url);
          };

          const collectRecursive = (key: string, withDynamic: boolean): void => {
            if (processedKeys.has(`${key}:${withDynamic}`) || !manifest[key]) return;
            processedKeys.add(`${key}:${withDynamic}`);
            const entry = manifest[key];
            addFile(allAssets, entry.file);
            entry.css?.forEach((css) => addFile(allAssets, css));
            entry.assets?.forEach((asset) => addFile(allAssets, asset));
            entry.imports?.forEach((importKey) => collectRecursive(importKey, false));
            if (withDynamic) {
              entry.dynamicImports?.forEach((dynamicKey) => collectRecursive(dynamicKey, true));
            }
          };

          // shell：仅入口主文件 + 入口 CSS（真正的 app shell，避免一次拉全量依赖）
          Object.entries(manifest).forEach(([, entry]) => {
            if (!(entry.isEntry || entry.file?.endsWith('.html'))) return;
            addFile(shellAssets, entry.file);
            entry.css?.forEach((css) => addFile(shellAssets, css));
          });

          // 全量收集
          Object.keys(manifest).forEach((key) => {
            collectRecursive(key, true);
          });
          Object.values(manifest).forEach((entry) => {
            addFile(allAssets, entry.file);
            entry.css?.forEach((css) => addFile(allAssets, css));
            entry.assets?.forEach((asset) => addFile(allAssets, asset));
          });

          // high：仅首屏高概率小中型依赖（排除 echarts/openim 等大体量包）
          for (const asset of allAssets) {
            const isCoreVendor = /\/vendor-(react|utils|ui)(-|\.)/i.test(asset);
            const isLocale = /\/locales\/.+\.json$/i.test(asset);
            const isSdk = /\/sdk-[^/]+\.(js|css)$/i.test(asset);
            if (isCoreVendor || isLocale || isSdk) {
              highAssets.add(asset);
            }
          }

          const shell = Array.from(shellAssets);
          const high = Array.from(highAssets).filter((asset) => !shellAssets.has(asset));
          const idle = Array.from(allAssets).filter(
            (asset) => !shellAssets.has(asset) && !highAssets.has(asset),
          );

          plan.shell = shell;
          plan.high = high;
          plan.idle = idle;
        } catch (error) {
          console.warn('⚠️ Failed to read manifest.json:', error);
        }
      }

      swContent = swContent.replace(
        /const PRECACHE_PLAN = \{ shell: \[\], high: \[\], idle: \[\] \};/,
        `const PRECACHE_PLAN = ${JSON.stringify(plan)};`,
      );
      swContent = swContent.replace(/__VERSION__/g, version);

      const outputPath = path.resolve(process.cwd(), 'dist/client/sw.js');
      fs.writeFileSync(outputPath, swContent, 'utf-8');
      console.log(
        `✅ Service Worker generated: ${outputPath} (shell=${plan.shell.length}, high=${plan.high.length}, idle=${plan.idle.length})`,
      );
    },
  };
}

import fs from 'node:fs';
import path from 'node:path';

import type { Plugin } from 'vite';

/**
 * 清理 tree-shaking 后只剩空内容的 chunk。
 *
 * 主要用于保留 vendor 拆包策略时，移除被摇树优化后的空 vendor 文件和相关 preload/import 引用。
 */
export default function removeEmptyChunksPlugin(): Plugin {
  return {
    name: 'remove-empty-chunks',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const emptyChunkFiles = new Set<string>();

      for (const [fileName, output] of Object.entries(bundle)) {
        if (
          output.type === 'chunk' &&
          !output.isEntry &&
          !output.isDynamicEntry &&
          output.code.trim() === ''
        ) {
          emptyChunkFiles.add(fileName);
        }
      }

      if (emptyChunkFiles.size === 0) return;

      const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const getImportPath = (fromFile: string, toFile: string) => {
        const relativePath = path.posix.relative(path.posix.dirname(fromFile), toFile);
        return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
      };

      for (const [fileName, output] of Object.entries(bundle)) {
        if (output.type === 'chunk') {
          output.imports = output.imports.filter((importFile) => !emptyChunkFiles.has(importFile));
          output.dynamicImports = output.dynamicImports.filter(
            (importFile) => !emptyChunkFiles.has(importFile),
          );

          for (const emptyChunkFile of emptyChunkFiles) {
            const importPath = escapeRegExp(getImportPath(fileName, emptyChunkFile));
            output.code = output.code.replace(
              new RegExp(`\\bimport\\s*["']${importPath}["'];?`, 'g'),
              '',
            );
          }
        }

        if (output.type === 'asset' && typeof output.source === 'string') {
          for (const emptyChunkFile of emptyChunkFiles) {
            const escapedFileName = escapeRegExp(emptyChunkFile);
            output.source = output.source.replace(
              new RegExp(
                `<link\\s+rel=["']modulepreload["'][^>]*href=["'][^"']*${escapedFileName}["'][^>]*>\\s*`,
                'g',
              ),
              '',
            );
          }
        }
      }

      for (const emptyChunkFile of emptyChunkFiles) {
        delete bundle[emptyChunkFile];
      }
    },
    writeBundle(options) {
      if (!options.dir) return;

      const removeStaleEmptyVendorChunks = (dir: string) => {
        if (!fs.existsSync(dir)) return;

        for (const entry of fs.readdirSync(dir)) {
          const entryPath = path.join(dir, entry);
          const stat = fs.statSync(entryPath);

          if (stat.isDirectory()) {
            removeStaleEmptyVendorChunks(entryPath);
            continue;
          }

          if (!entry.startsWith('vendor-') || !entry.endsWith('.js')) continue;

          const code = fs.readFileSync(entryPath, 'utf-8');
          if (code.trim() !== '') continue;

          fs.unlinkSync(entryPath);
          const sourceMapPath = `${entryPath}.map`;
          if (fs.existsSync(sourceMapPath)) {
            fs.unlinkSync(sourceMapPath);
          }
        }
      };

      removeStaleEmptyVendorChunks(options.dir);
    },
  };
}

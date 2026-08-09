import type { Plugin, Manifest, ManifestChunk } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import type { HtmlTagDescriptor } from 'vite';

interface PreloadOptions {
  /** 需要预加载的资源类型 */
  include?: ('js' | 'css' | 'font' | 'image')[];
  /** 排除特定的 chunk */
  exclude?: string[];
  /** 是否启用 prefetch 用于懒加载的 chunk */
  usePrefetch?: boolean;
}

// 待校验
export default function preloadPlugin(options: PreloadOptions = {}): Plugin {
  const { include = ['js', 'css', 'font'], exclude = [], usePrefetch = true } = options;

  let outDir: string;

  return {
    name: 'vite-plugin-additional-preload',

    configResolved(config) {
      outDir = config.build.outDir;
    },

    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return;

        const manifestPath = path.resolve(outDir, '.vite/manifest.json');
        if (!fs.existsSync(manifestPath)) return;

        const manifest: Manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        const tags: HtmlTagDescriptor[] = [];

        Object.values(manifest).forEach((chunk) => {
          const file = chunk.file;

          // JS dynamic imports → prefetch
          if (include.includes('js') && chunk.isDynamicEntry && usePrefetch) {
            tags.push({
              tag: 'link',
              attrs: { rel: 'prefetch', href: `/${file}`, as: 'script', crossorigin: true },
              injectTo: 'head',
            });
          }

          // todo
          // CSS preload
          // if (include.includes('css') && chunk.css) {
          //   chunk.css.forEach((cssFile) => {
          //     tags.push({
          //       tag: 'link',
          //       attrs: { rel: 'preload', href: `/${cssFile}`, as: 'style' },
          //       injectTo: 'head',
          //     });
          //   });
          // }

          // todo Fonts
          if (include.includes('font') && chunk.css) {
            chunk.css.forEach((cssFile) => {
              const cssPath = path.resolve(outDir, cssFile);
              if (fs.existsSync(cssPath)) {
                const cssContent = fs.readFileSync(cssPath, 'utf-8');
                const fontMatches = cssContent.matchAll(
                  /url\(['"]?([^'")]+\.(woff2?|woff|ttf|otf|eot))['"]?\)/gi,
                );
                for (const match of fontMatches) {
                  const fontFile = match[1];
                  const ext = fontFile.split('.').pop();
                  const mime =
                    ext === 'woff2'
                      ? 'font/woff2'
                      : ext === 'woff'
                        ? 'font/woff'
                        : ext === 'ttf'
                          ? 'font/ttf'
                          : ext === 'otf'
                            ? 'font/otf'
                            : 'application/vnd.ms-fontobject';

                  tags.push({
                    tag: 'link',
                    attrs: {
                      rel: 'preload',
                      href: `/${fontFile}`,
                      as: 'font',
                      type: mime,
                      crossorigin: true,
                    },
                    injectTo: 'head',
                  });
                }
              }
            });
          }
        });

        return tags;
      },
    },
  };
}

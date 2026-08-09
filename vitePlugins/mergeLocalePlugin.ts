import fs from 'node:fs';
import path from 'node:path';

import type { Plugin } from 'vite';

import { locales, type Locale, LOCALE_FILE_MAP } from '../src/utils/constants/local';
/**
 * 合并语言文件插件
 * 在构建时和开发时都将公共和私有的语言文件合并
 */
export default function mergeLocalePlugin(SITE: string): Plugin {
  function mergeLocaleFiles(
    locale: Locale,
  ): { outputPath: string; content: Record<string, unknown> } | null {
    try {
      // 读取公共语言文件
      const commonPath = path.resolve(
        process.cwd(),
        `src/common/resource/locales/${LOCALE_FILE_MAP[locale]}.json`,
      );
      let common: Record<string, unknown> = {};
      if (fs.existsSync(commonPath)) {
        common = JSON.parse(fs.readFileSync(commonPath, 'utf-8')) as Record<string, unknown>;
      }

      // 读取站点私有语言文件
      const sitePath = path.resolve(
        process.cwd(),
        `src/sites/${SITE}/locales/${LOCALE_FILE_MAP[locale]}.json`,
      );
      let site: Record<string, unknown> = {};
      if (fs.existsSync(sitePath)) {
        site = JSON.parse(fs.readFileSync(sitePath, 'utf-8')) as Record<string, unknown>;
      }

      // 合并：私有覆盖公共
      const merged = { ...common, ...site };

      return {
        outputPath: path.resolve(
          process.cwd(),
          `dist/client/locales/${LOCALE_FILE_MAP[locale]}.json`,
        ),
        content: merged,
      };
    } catch (error) {
      console.error(`Failed to merge locale ${LOCALE_FILE_MAP[locale]}:`, error);
      return null;
    }
  }

  return {
    name: 'vite-plugin-merge-locale',
    enforce: 'pre',

    // 开发环境：使用虚拟模块提供合并后的语言文件
    resolveId(id: string) {
      // 匹配虚拟模块：@merged-locales/${locale}.json
      const match = id.match(/^@merged-locales\/([\w-]+)\.json$/);
      if (match) {
        return `\0${id}`; // 标记为虚拟模块
      }
      return null;
    },

    // 加载虚拟模块内容
    load(id: string) {
      const match = id.match(/^\0@merged-locales\/([\w-]+)\.json$/);
      if (match) {
        const locale = match[1];
        const result = mergeLocaleFiles(locale as Locale);
        if (result) {
          return `export default ${JSON.stringify(result.content, null, 2)}`;
        }
      }
      return null;
    },

    // 生产环境：在构建时生成合并后的文件
    buildEnd() {
      const outputDir = path.resolve(process.cwd(), 'dist/client/locales');

      // 确保输出目录存在
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      for (const locale of locales) {
        const result = mergeLocaleFiles(locale);
        console.log('result@@@@@@', result);
        if (result) {
          const outputPath = path.join(outputDir, `${LOCALE_FILE_MAP[locale]}.json`);
          fs.writeFileSync(outputPath, JSON.stringify(result.content, null, 2), 'utf-8');
          console.log(`✅ Merged locale: ${locale} -> ${outputPath}`);
        }
      }
    },
  };
}

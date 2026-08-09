import fs from 'node:fs';
import path from 'node:path';

import type { Plugin } from 'vite';

export default function localeServerPlugin(SITE: string): Plugin {
  return {
    name: 'vite-plugin-locale-server',
    configureServer(server) {
      server.middlewares.use('/locales', (req, res, next) => {
        try {
          // 解析路径：/locales/zh-CN.json（合并后的文件,兼容 query 参数，如 ?v=xxx）
          const pathname = (req.url || '').split('?')[0] ?? '';
          const match = pathname.match(/^\/([\w-]+)\.json$/);
          if (match) {
            const [, locale] = match;

            // 合并公共和私有文件
            const commonPath = path.resolve(
              process.cwd(),
              `src/common/resource/locales/${locale}.json`,
            );
            const sitePath = path.resolve(
              process.cwd(),
              `src/sites/${SITE}/locales/${locale}.json`,
            );

            let common: Record<string, unknown> = {};
            let site: Record<string, unknown> = {};

            if (fs.existsSync(commonPath)) {
              common = JSON.parse(fs.readFileSync(commonPath, 'utf-8')) as Record<string, unknown>;
            }
            if (fs.existsSync(sitePath)) {
              site = JSON.parse(fs.readFileSync(sitePath, 'utf-8')) as Record<string, unknown>;
            }

            // 合并：私有覆盖公共
            const merged = { ...common, ...site };

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-store');
            return res.end(JSON.stringify(merged));
          }
        } catch (error) {
          console.error('Error serving locale file:', error);
        }
        return next();
      });
    },
  };
}

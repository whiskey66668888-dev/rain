import fs from 'node:fs';
import path from 'node:path';

import type { Plugin } from 'vite';

/**
 * 拷贝服务器文件插件
 * 在 SSR 构建完成后，将 server-prod.js 和 ecosystem.config.js 拷贝到 dist 根目录
 * 并插入 ecosystem.config.js 中的 SITE_ID 和 name: `ssr-${SITE}`
 */
export default function copyServerFilesPlugin(SITE: string): Plugin {
  return {
    name: 'copy-server-files',
    writeBundle() {
      const distRoot = path.resolve(process.cwd(), 'dist');
      // 确保 dist 目录存在
      if (!fs.existsSync(distRoot)) {
        fs.mkdirSync(distRoot, { recursive: true });
      }

      const serverProdSrc = path.resolve(process.cwd(), 'src/server/server-prod.js');
      const serverProdDest = path.resolve(distRoot, 'server-prod.js');
      const ecosystemSrc = path.resolve(process.cwd(), 'src/server/ecosystem.config.js');
      const ecosystemDest = path.resolve(distRoot, 'ecosystem.config.js');

      // 拷贝 server-prod.js
      fs.copyFileSync(serverProdSrc, serverProdDest);

      // 拷贝并修改 ecosystem.config.js
      let ecosystemContent = fs.readFileSync(ecosystemSrc, 'utf-8');
      // 替换build-will-replace-here为SITE
      ecosystemContent = ecosystemContent.replace(/build-will-replace-here/g, SITE);
      fs.writeFileSync(ecosystemDest, ecosystemContent, 'utf-8');
      console.log(`✓ Copied and updated ecosystem.config.js to dist/ with SITE_ID=${SITE}`);
    },
  };
}

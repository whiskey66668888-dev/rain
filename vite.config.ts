// @ts-nocheck
import path from 'node:path';
import fs from 'node:fs';
import type { IncomingMessage, NextFunction, ServerResponse } from 'http';

import react from '@vitejs/plugin-react-swc';
import copy from 'rollup-plugin-copy';
import { visualizer } from 'rollup-plugin-visualizer';
import * as sassEmbedded from 'sass-embedded';
import UnoCSS from '@unocss/vite';
import { ConfigEnv, defineConfig, loadEnv, PluginOption, UserConfig, ViteDevServer } from 'vite';
// import { VitePWA } from 'vite-plugin-pwa';
import eslint from 'vite-plugin-eslint';
import AutoImport from 'unplugin-auto-import/vite';
import devtoolsJson from 'vite-plugin-devtools-json';

import consoleWarningPlugin from './vitePlugins/consoleWarningPlugin';
import localeServerPlugin from './vitePlugins/localeServerPlugin';
import mergeLocalePlugin from './vitePlugins/mergeLocalePlugin';
import removeEmptyChunksPlugin from './vitePlugins/removeEmptyChunksPlugin';
import swPlugin from './vitePlugins/swPlugin';
import { createProxyConfig } from './vitePlugins/proxyConfig';

/** 从模块路径解析 npm 包名（支持 scoped package） */
function getNpmPackageName(id: string): string | undefined {
  const segments = id.split('node_modules/');
  const rest = segments[segments.length - 1];
  if (!rest) return undefined;
  if (rest.startsWith('@')) {
    const [scope, name] = rest.split('/');
    return name ? `${scope}/${name}` : undefined;
  }
  return rest.split('/')[0];
}

/** React 核心：独立拆包，长期缓存命中率高 */
const REACT_CORE_PKGS = new Set(['react', 'react-dom', 'scheduler']);

/**
 * UI 类依赖：合并为 vendor-ui，减少首屏并发请求。
 * 含 UI 组件库及其常见 peer/transitive 依赖。
 * ahooks / intersection-observer 必须与 antd-mobile 同包，否则会形成 ui↔utils 循环。
 */
const UI_PKGS = new Set([
  'antd-mobile',
  'antd-mobile-icons',
  'swiper',
  'framer-motion',
  'motion-dom',
  'motion-utils',
  'lottie-react',
  'lottie-web',
  'react-window',
  'react-qr-code',
  'qr.js',
  'qrcode-generator',
  'react-intersection-observer',
  'intersection-observer',
  'ahooks',
  '@floating-ui/core',
  '@floating-ui/dom',
  '@floating-ui/react-dom',
  '@floating-ui/utils',
  'rc-field-form',
  'rc-motion',
  'rc-segmented',
  'rc-util',
  '@rc-component/mini-decimal',
  'async-validator',
  'staged-components',
  '@react-spring/animated',
  '@react-spring/core',
  '@react-spring/shared',
  '@react-spring/web',
  '@react-spring/rafz',
  '@react-spring/types',
  '@use-gesture/core',
  '@use-gesture/react',
  'classnames',
  'nano-memoize',
  'runes2',
  'resize-observer-polyfill',
  'screenfull',
]);

/**
 * 大体量 / 低频使用库：单独拆包，避免污染首屏 vendor-utils/ui，
 * 便于路由级懒加载时按需拉取。
 */
const LARGE_ASYNC_PKGS = new Map<string, string>([
  ['echarts', 'vendor-echarts'],
  ['echarts-for-react', 'vendor-echarts'],
  ['zrender', 'vendor-echarts'],
  ['size-sensor', 'vendor-echarts'],
  ['@front-openim/wasm-client-sdk', 'vendor-openim'],
  ['html2canvas', 'vendor-html2canvas'],
  ['@fingerprintjs/fingerprintjs-pro', 'vendor-fingerprint'],
  ['@emoji-mart/data', 'vendor-emoji'],
  ['emoji-mart', 'vendor-emoji'],
]);

/**
 * OpenIM wasm 客户端（会静态 import @front-openim/wasm-client-sdk）。
 * 不能并进首屏 `sdk` chunk：request.ts 也在 /sdk/ 下，manualChunks 会把整个目录打成一包。
 * groupMemberCache / openImSessionHooks 是登出 reset 的轻量叶子，不含 wasm，必须留在 sdk。
 */
const isOpenImWasmClientModule = (id: string): boolean => {
  const normalized = id.replace(/\\/g, '/');
  if (!normalized.includes('/sdk/IMManager/client/')) return false;
  return !/\/sdk\/IMManager\/client\/(groupMemberCache|openImSessionHooks)\b/.test(normalized);
};

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '');
  const version = Date.now().toString();
  const SITE = env.SITE_ID;
  const isDev = mode === 'development';
  const devHost = env.DEV_HOST || '0.0.0.0';
  const devPublicHost = env.DEV_PUBLIC_HOST || 'localhost';

  const siteRoot = path.resolve(__dirname, `src/sites/${SITE}`);
  const analyze = process.env.ANALYZE === 'true';

  const siteConfig: SiteConfig = require(`./src/sites/${SITE}/site.config.ts`).default;

  // openIM.wasm 34MB，是 @front-openim/wasm-client-sdk 的产物。用 __VERSION__（每次构建都是新
  // 时间戳）当缓存 query 会让它每发一次版就作废重下，改用 SDK 依赖版本，跨发版复用缓存。
  const imWasmVersion =
    require('./package.json').dependencies['@front-openim/wasm-client-sdk'] ?? version;

  return {
    define: {
      __VERSION__: version,
      __IM_WASM_VERSION__: JSON.stringify(imWasmVersion),
      __SITE_ID__: JSON.stringify(SITE),
      __BUILD_ENV__: JSON.stringify(env.BUILD_ENV),
      __NODE_ENV__: JSON.stringify(env.NODE_ENV),
      __SITE_CONFIG__: JSON.stringify(siteConfig),
    },
    plugins: [
      react(),
      UnoCSS(),
      AutoImport({
        imports: [
          {
            lodash: [['default', '_']], // lodash 默认导出绑定到 _
          },
        ],
        dts: false,
      }),
      // Chrome DevTools 工作区支持（仅开发环境）
      ...(isDev ? [devtoolsJson()] : []),
      // ESLint 插件（开发环境显示错误）
      ...(isDev
        ? [
            eslint({
              failOnError: false,
              failOnWarning: false,
              emitError: true,
              emitWarning: true,
              cache: false,
            }),
          ]
        : []),
      mergeLocalePlugin(SITE),
      swPlugin(version),
      removeEmptyChunksPlugin(),
      copy({
        targets: [
          {
            src: `src/sites/${SITE}/images`,
            dest: `dist/client`,
          },
        ],
        hook: 'writeBundle', // ← 确保 build 以后执行
      }) as PluginOption,
      // 控制台警告插件，只在客户端开发环境使用
      ...(isDev ? [consoleWarningPlugin()] : []),
      localeServerPlugin(SITE),
      // 打包体积分析：ANALYZE=true 时生成 stats.html
      ...(analyze
        ? [
            visualizer({
              filename: path.resolve(__dirname, 'dist/stats.html'),
              open: true,
              gzipSize: true,
              brotliSize: true,
              template: 'treemap',
            }) as PluginOption,
          ]
        : []),
    ],
    root: siteRoot,
    resolve: {
      alias: {
        '@common': path.resolve(__dirname, 'src/common'),
        '@core': path.resolve(__dirname, 'src/core'),
        '@sdk': path.resolve(__dirname, 'src/sdk'),
        '@': path.resolve(__dirname, 'src'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          implementation: sassEmbedded,
          additionalData: `
            @use "@/common/styles/_fonts.scss";
            @use "@/common/styles/_variables.scss";
            @use "@/common/styles/_mixins.scss" as *;
            @use "@/common/styles/_functions.scss" as *;
            @use "@/common/styles/_animations.scss";
            @use "@/common/styles/_rwd.scss" as *;
          `,
          api: 'modern-compiler', // or "modern"
        },
      },
      modules: {
        generateScopedName: isDev ? '[name]__[local]___[hash:base64:5]' : '[hash:base64:6]',
      },
    },
    publicDir: path.resolve(__dirname, 'public'),
    optimizeDeps: {
      exclude: ['@front-openim/wasm-client-sdk'],
    },
    server: {
      port: 5173,
      host: devHost,
      allowedHosts: true,
      https: {
        key: fs.readFileSync(path.resolve(__dirname, 'certificates/private.key')),
        cert: fs.readFileSync(path.resolve(__dirname, 'certificates/certificate.crt')),
      },
      hmr: {
        host: devPublicHost,
      },
      fs: {
        allow: [
          path.resolve(__dirname, 'src/sites'),
          path.resolve(__dirname, 'src/common/hooks/useNotificationWs/ws.worker.ts'),
          path.resolve(__dirname, 'node_modules/@front-openim'),
        ],
      },
      setupMiddlewares(middlewares: ViteDevServer['middlewares']) {
        const iconsDir = path.resolve(__dirname, `src/sites/${SITE}/images`);

        middlewares.use(
          '/images',
          (req: IncomingMessage, res: ServerResponse, next: NextFunction) => {
            const fsPath = path.join(iconsDir, req.url);
            res.setHeader('Cache-Control', 'no-store');

            return res.sendFile(fsPath, (err: Error) => {
              if (err) next();
            });
          },
        );

        return middlewares;
      },
      proxy: createProxyConfig(siteConfig),
    },
    preview: {
      port: 4173,
      host: true,
      https: false,
    },
    build: {
      outDir: path.resolve(__dirname, `dist/client`),
      emptyOutDir: true,
      // 生产构建用 terser drop_console（esbuild.drop 在 react-swc 链路下不可靠）
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
      // 统一静态资源目录（含 worker 默认输出目录）
      assetsDir: 'resource',
      manifest: true,
      rollupOptions: {
        input: {
          main: path.resolve(siteRoot, 'index.html'),
        },
        output: {
          // 手动代码分割：避免按包细拆导致首屏并发请求过多
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              // Sentry / APM 单独拆包会导致内部循环依赖（Cannot access before initialization）
              if (id.includes('sentry') || id.includes('@umengfe/apm')) {
                return undefined;
              }

              const pkgName = getNpmPackageName(id);
              if (!pkgName) return 'vendor-utils';

              if (REACT_CORE_PKGS.has(pkgName)) {
                return 'vendor-react';
              }

              const largeChunk = LARGE_ASYNC_PKGS.get(pkgName);
              if (largeChunk) {
                return largeChunk;
              }

              if (UI_PKGS.has(pkgName)) {
                return 'vendor-ui';
              }

              // 其余低频小依赖合并，降低 HTTP 并发
              return 'vendor-utils';
            }

            // SDK 层单独分割。OpenIM wasm 客户端必须跟 vendor-openim 走，否则首页加载 request.ts 就会带上 wasm SDK。
            if (id.includes('/sdk/')) {
              if (isOpenImWasmClientModule(id)) {
                return 'vendor-openim';
              }
              return 'sdk';
            }

            // 公共重型组件单独分割
            if (id.includes('/common/components/') && !id.includes('/common/components/odds/')) {
              if (id.includes('VirtualList') || id.includes('InfiniteScroll')) {
                return 'components-heavy';
              }
            }
            return null;
          },

          // 文件命名规则
          chunkFileNames: 'resource/[name]-[hash].js',
          entryFileNames: 'resource/[name]-[hash].js',
          assetFileNames: 'resource/[name]-[hash].[ext]',
        },
      },
    },
    worker: {
      rollupOptions: {
        output: {
          chunkFileNames: 'resource/[name]-[hash].js',
          entryFileNames: 'resource/[name]-[hash].js',
          assetFileNames: 'resource/[name]-[hash].[ext]',
        },
      },
    },
  };
});

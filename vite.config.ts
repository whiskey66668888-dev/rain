// @ts-nocheck
import path from 'node:path';
import fs from 'node:fs';
import type { IncomingMessage, NextFunction, ServerResponse } from 'http';

import react from '@vitejs/plugin-react-swc';
import copy from 'rollup-plugin-copy';
import * as sassEmbedded from 'sass-embedded';
import UnoCSS from '@unocss/vite';
import { ConfigEnv, defineConfig, loadEnv, PluginOption, UserConfig, ViteDevServer } from 'vite';
// import { VitePWA } from 'vite-plugin-pwa';
import eslint from 'vite-plugin-eslint';
import AutoImport from 'unplugin-auto-import/vite';
import devtoolsJson from 'vite-plugin-devtools-json';

import consoleWarningPlugin from './vitePlugins/consoleWarningPlugin';
import copyServerFilesPlugin from './vitePlugins/copyServerFilesPlugin';
import localeServerPlugin from './vitePlugins/localeServerPlugin';
import mergeLocalePlugin from './vitePlugins/mergeLocalePlugin';
import removeEmptyChunksPlugin from './vitePlugins/removeEmptyChunksPlugin';
import ssrCssTransformPlugin from './vitePlugins/ssrCssTransformPlugin';
import swPlugin from './vitePlugins/swPlugin';
import { createProxyConfig } from './src/server/proxy.config';

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '');
  const version = Date.now().toString();
  const SITE = env.SITE_ID;
  const isServerBuild = env.BUILD_TARGET === 'server';
  const isDev = mode === 'development';
  const devHost = env.DEV_HOST || '0.0.0.0';
  const devPublicHost = env.DEV_PUBLIC_HOST || 'localhost';

  const siteRoot = path.resolve(__dirname, `src/sites/${SITE}`);

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
      __BUILD_TARGET__: JSON.stringify(env.BUILD_TARGET),
      __SITE_CONFIG__: JSON.stringify(siteConfig),
    },
    plugins: [
      react(),
      // SSR CSS 转换插件，用于把第三方库的 CSS 转为空模块
      ssrCssTransformPlugin(),
      ...(isServerBuild
        ? [
            // 拷贝 server-prod.js 和 ecosystem.config.js 到 dist 根目录
            copyServerFilesPlugin(SITE),
          ]
        : []),
      UnoCSS({
        // 注意：UnoCSS 在开发模式下会通过 HMR 注入内联样式
        // SSR 会收集样式到 HTML 头部，客户端的内联样式用于 HMR
        // 如果出现重复，确保 maxWidth 等配置正确，让两套样式一致
      }),
      AutoImport({
        imports: [
          {
            lodash: [['default', '_']], // lodash 默认导出绑定到 _
          },
        ],
        dts: false,
      }),
      // Chrome DevTools 工作区支持（仅开发环境）
      ...(isDev && !isServerBuild ? [devtoolsJson()] : []),
      // ESLint 插件（开发环境显示错误）
      ...(isDev && !isServerBuild
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
      // 合并语言文件插件,PWA插件,复制图片资源插件,服务端不需要
      ...(isServerBuild
        ? []
        : [
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
          ]),
      // 控制台警告插件，只在客户端开发环境使用
      ...(isServerBuild || !isDev ? [] : [consoleWarningPlugin()]),
      localeServerPlugin(SITE),
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
    // 让 Vite 处理 swiper，包括其 CSS 文件
    // 这样 CSS 会被正确转换为空模块（SSR 不需要执行 CSS），但样式会被收集
    ssr:
      isServerBuild || isDev
        ? {
            noExternal: ['swiper', 'antd-mobile', 'lottie-react', 'lottie-web'],
          }
        : undefined,
    build: {
      outDir: isServerBuild
        ? path.resolve(__dirname, `dist/server`)
        : path.resolve(__dirname, `dist/client`),
      emptyOutDir: false,
      // sourcemap: true,
      // 客户端生产构建用 terser drop_console（esbuild.drop 在 react-swc 链路下不可靠）
      ...(!isServerBuild && {
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
      // 统一静态资源目录（含 worker 默认输出目录）
      assetsDir: 'resource',
      manifest: !isServerBuild, // 只有客户端构建需要 manifest.json
      ssr: isServerBuild, // 服务器端构建启用 SSR 模式
      rollupOptions: isServerBuild
        ? {
            // 服务器端构建配置
            input: path.resolve(siteRoot, 'entry-server.tsx'),
            output: {
              format: 'cjs', // CommonJS 格式，Node.js 使用
              // 保持目录结构，便于 require
              chunkFileNames: '[name].js',
              assetFileNames: '[name].[ext]',
            },
            external: (id) => {
              // 友盟 APM 仅浏览器可用，禁止打进 SSR bundle
              if (id === '@umengfe/apm' || id.includes('@umengfe/apm')) {
                return true;
              }
              if (id.includes('core/apm/umeng.client')) {
                return true;
              }

              //  lottie-react vite打包CJS require兼容处理
              if (
                id === 'lottie-react' ||
                id === 'lottie-web' ||
                id.startsWith('lottie-react/') ||
                id.startsWith('lottie-web/')
              ) {
                return false;
              }

              // Node.js 内置模块
              const nodeBuiltins = [
                'fs',
                'path',
                'url',
                'http',
                'https',
                'stream',
                'util',
                'crypto',
                'events',
                'buffer',
                'querystring',
                'os',
                'net',
                'tls',
                'zlib',
                'http2',
                'perf_hooks',
                'worker_threads',
                'child_process',
                'cluster',
                'dgram',
                'dns',
                'readline',
                'repl',
                'string_decoder',
                'timers',
                'tty',
                'v8',
                'vm',
                'assert',
                'console',
                'process',
              ];

              // CSS/样式文件：不 external，由 ssrCssTransformPlugin 转为空模块
              if (
                id.endsWith('.css') ||
                id.endsWith('.less') ||
                id.includes('swiper/css') ||
                id.includes('swiper/swiper.css') ||
                id.includes('swiper/modules/') ||
                id.includes('antd-mobile')
              ) {
                return false;
              }

              // 排除 Node.js 内置模块和 node_modules
              // 不排除路径别名
              if (nodeBuiltins.includes(id)) {
                return true;
              }
              if (
                id.startsWith('@/') ||
                id.startsWith('@common/') ||
                id.startsWith('@core/') ||
                id.startsWith('@sdk/')
              ) {
                return false;
              }
              // 其他非相对路径和非绝对路径的模块
              return !id.startsWith('.') && !path.isAbsolute(id);
            },
          }
        : {
            // 客户端构建配置
            input: {
              main: path.resolve(siteRoot, 'index.html'),
            },
            output: {
              // 手动代码分割配置
              manualChunks: (id) => {
                // node_modules 中的第三方库
                if (id.includes('node_modules')) {
                  // Sentry 单独拆包会导致内部循环依赖，出现 "Cannot access 'R' before initialization"
                  if (id.includes('sentry') || id.includes('@umengfe/apm')) {
                    return undefined;
                  }
                  const pkgName = id?.split('node_modules/')[1]?.split('/')[0]?.replace('@', '');

                  return `vendor-${pkgName}`;
                }

                // SDK 层单独分割
                if (id.includes('/sdk/')) {
                  return 'sdk';
                }

                // 公共组件单独分割（可选）
                if (
                  id.includes('/common/components/') &&
                  !id.includes('/common/components/odds/')
                ) {
                  // 大型组件可以单独分割
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

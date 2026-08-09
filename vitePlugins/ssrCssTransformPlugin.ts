import type { Plugin } from 'vite';

const EMPTY_MODULE = { code: 'export {};', map: null };

const SSR_STUB_PACKAGES = ['antd-mobile', 'swiper'];

/**
 * 判断是否应在 SSR 下被替换为空模块的 CSS/样式请求
 * （Node 无法执行 .css/.less，会报 SyntaxError）
 * @param id - 请求的 id（可能是相对路径如 ./global.css 或绝对路径）
 * @param importer - 发起请求的文件路径（可选），用于解析相对路径来自哪个包
 */
function shouldStubStyle(id: string, importer?: string): boolean {
  const raw = id.replace(/^\0/, '');
  if (!/\.(css|less)$/.test(raw)) return false;
  // 相对路径（如 antd-mobile 里的 require("./global.css")）：看 importer 是否来自需 stub 的包
  if (raw.startsWith('.') && importer) {
    if (SSR_STUB_PACKAGES.some((pkg) => importer.includes(pkg))) return true;
  }
  // swiper：包名样式入口及 node_modules 内路径
  if (raw === 'swiper/css' || raw === 'swiper/css/pagination') return true;
  if (/swiper[/\\]css|swiper[/\\]swiper\.css|swiper[/\\]modules[/\\].*\.css/.test(raw)) return true;
  if (raw.includes('node_modules/swiper') && /\.(css|less)$/.test(raw)) return true;
  // antd-mobile：包内任意 .css / .less（如 cjs/global/global.css、各组件样式等）
  if (raw.includes('antd-mobile') && /\.(css|less)$/.test(raw)) return true;
  return false;
}

/**
 * SSR 样式转换插件
 *
 * 在 SSR 构建时拦截第三方库的 CSS/样式导入（如 swiper/css、antd-mobile 内 global.css 等），
 * 在服务端替换为空模块，避免 Node 把样式文件当 JS 执行导致 SyntaxError。
 *
 * 样式仍由 Vite 的 CSS 管线收集，在 HTML 中正常输出 link，仅 SSR 运行时不再加载这些文件。
 */
export default function ssrCssTransformPlugin(): Plugin {
  return {
    name: 'vite-plugin-ssr-css-transform',
    enforce: 'pre',
    // 仅在 transform 且 options.ssr 时替换为空模块；不在 load 里 stub，否则会把客户端构建的样式也删掉
    transform(code, id, options) {
      if (!options?.ssr) return null;
      // 解析后的路径会传入（如 .../antd-mobile/es/global/global.css），在此统一替换为空模块
      if (shouldStubStyle(id)) return EMPTY_MODULE;
      return null;
    },
  };
}

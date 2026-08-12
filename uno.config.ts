import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetMini,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss';
import presetRemToPx from '@unocss/preset-rem-to-px';

import { getZIndexCssVarsRootDeclarations } from './src/utils/constants/zIndex';

/**
 * UnoCSS 配置
 */
export default defineConfig({
  content: {
    filesystem: ['src/**/*.{ts,tsx,js,jsx}'],
  },
  // 预设
  presets: [
    presetMini(),
    presetWind3({
      // 禁用预检样式（preflight），避免与现有 SCSS 样式冲突
      preflight: false,
    }),
    // 将 rem 转换为 px（baseFontSize: 16 表示 1rem = 16px）
    presetRemToPx({ baseFontSize: 16 }),
    presetAttributify(), // 属性化模式
    presetIcons({
      // 图标预设（可选）
      collections: {
        // 可以添加图标集合
      },
    }),
  ],
  // 转换器
  transformers: [
    transformerDirectives(), // 支持 @apply 指令
    transformerVariantGroup(), // 支持 variant groups (hover:bg-gray-100 hover:text-gray-900)
  ],
  // 自定义断点（与 SCSS 保持一致）
  theme: {
    breakpoints: {
      md: '375px',
      lg: '768px',
      xl: '1440px',
      '2xl': '1920px',
    },
    // 自定义 maxWidth 尺寸（完全覆盖 presetWind3 的默认值）
    // 注意：在 UnoCSS 中，直接设置 theme.maxWidth 会完全替换预设值
    // 所以需要列出所有需要的值，包括常用的尺寸
    maxWidth: {
      md: '375px',
      lg: '768px',
      xl: '1440px',
      '2xl': '1920px',
    },
    fontFamily: {
      'din-pro': ['DINPro', 'sans-serif'],
    },
    // 生成 0-2000 的 spacing 值，如果需要更大值可以调整 length
    // spacing: Object.fromEntries(Array.from({ length: 2000 }, (_, i) => [String(i), `${i}px`])),
    // 暂时用bg-[var(--color-bg-secondary)]这种写法，sass和unocss的变量保持一致。
    // 主题色（使用 CSS 变量）
    // colors: {
    //   primary: 'var(--color-primary)',
    //   'primary-hover': 'var(--color-primary-hover)',
    //   bg: 'var(--color-bg)',
    //   'bg-primary': 'var(--color-bg-primary)',
    //   'bg-secondary': 'var(--color-bg-secondary)',
    //   'bg-soft': 'var(--color-bg-soft)',
    //   'bg-light': 'var(--color-bg-light)',
    //   'bg-hover': 'var(--color-bg-hover)',
    //   text: 'var(--color-text)',
    //   'text-primary': 'var(--color-text-primary)',
    //   'text-secondary': 'var(--color-text-secondary)',
    //   'text-soft': 'var(--color-text-soft)',
    //   border: 'var(--color-border)',
    //   'border-hover': 'var(--color-border-hover)',
    // },
  },
  // 与 useInitCanHover 配合：仅当 html[data-can-hover="true"] 时生效（有鼠标/精确指针时）
  // 用法：can-hover:bg-xxx can-hover:hover:opacity-80 等，替代裸 hover: 避免触摸设备误触
  variants: [
    (matcher) => {
      if (!matcher.startsWith('can-hover:')) return matcher;
      return {
        matcher: matcher.slice(10),
        parent: '@media (hover:hover) and (pointer:fine)',
      };
    },
    // dt: 变体，基于 [data-theme='dark']（dark: 是 presets 保留关键词，用 dt: 替代）
    (matcher) => {
      if (!matcher.startsWith('dt:')) return matcher;
      return {
        matcher: matcher.slice(3),
        selector: (s) => `[data-theme='dark'] ${s}`,
      };
    },
  ],
  // 自定义规则
  rules: [
    // 动态规则：匹配 _tf-[number]、leading-[xxx]、tracking-[xxx] 等
    // 捕获任意 [number] 中的值最后转换为px
    [
      /^_tf\[(.*)\]$/,
      ([, value]) => ({
        'font-size': `calc(${value}px * var(--text-scale, 1))`,
      }),
    ],
    [
      'overflow-y-auto',
      {
        'overflow-y': 'auto',
        'overscroll-behavior-y': 'none',
        '-webkit-overflow-scrolling': 'touch',
      },
    ],
    // [
    //   /^leading-\[(.*)\]$/,
    //   ([, value]) => ({
    //     'line-height': `calc(${value} * var(--text-scale, 1))`,
    //   }),
    // ],
    // [
    //   /^tracking-\[(.*)\]$/,
    //   ([, value]) => ({
    //     'letter-spacing': `calc(${value} * var(--text-scale, 1))`,
    //   }),
    // ],
  ],
  preflights: [
    {
      getCSS: () => `
        :root {
          --text-scale: 1;
${getZIndexCssVarsRootDeclarations()}
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `,
    },
  ],
  // 快捷方式
  shortcuts: {
    // 可以添加快捷方式
    'animate-blink': 'animate-[blink_1s_step-end_infinite]',
    'flex-1-col': 'flex-1 flex flex-col',
    'flex-1-col-hidden': 'flex-1 flex flex-col overflow-hidden',
    'din-pro': 'font-din-pro',
    'safe-b': 'pb-[env(safe-area-inset-bottom,0px)]',
    'safe-t': 'pt-[env(safe-area-inset-top,0px)]',
    'safe-l': 'pl-[env(safe-area-inset-left,0px)]',
    'safe-r': 'pr-[env(safe-area-inset-right,0px)]',
    'pb-bottom-menu': 'pb-[calc(52px+env(safe-area-inset-bottom,0px))]',
  },
  // 安全列表（动态类名需手动添加，确保样式可用）
  // `bg-[${xxxx}]`,这种uno扫描不到，需要手动添加，保证类名存在
  safelist: [
    // 可以添加需要强制包含的类名
    'bg-[var(--ThemeColor-15)]',
    '[--status-color:var(--Green-300)]',
    '[--status-color:var(--Warning-100)]',
    '[--status-color:var(--Red-300)]',
    '[--status-color:var(--Red-400)]',
    '[--status-color:var(--ThemeColor-Main)]',
    'text-[var(--Green-400)]',
    'text-[var(--Green-300)]',
    'text-[var(--Red-300)]',
    'text-[var(--Warning-300)]',
  ],
});

const postcss = require('postcss');

/**
 * 将 px-to-viewport 转换出的 vw 值隔离到移动端媒体查询中，
 * 确保 PC/Pad（≥768px）仍使用原始 px 值，不受影响。
 *
 * 转换逻辑：
 *   原始：    .foo { font-size: 16px; }
 *   转换后：  .foo { font-size: 16px; }
 *             @media screen and (max-width: 767.98px) { .foo { font-size: 4.26667vw; } }
 */
const isolateVwToMobile = () => ({
  postcssPlugin: 'isolate-vw-to-mobile',
  OnceExit(root) {
    const rulesToProcess = [];

    root.walkRules((rule) => {
      // 已在媒体查询内的规则不处理（桌面端 rwd-min('lg') 等保持原样）
      let ancestor = rule.parent;
      while (ancestor) {
        if (ancestor.type === 'atrule' && /^media$/i.test(ancestor.name)) return;
        ancestor = ancestor.parent;
      }

      const vwDecls = [];
      rule.walkDecls((decl) => {
        if (/\d+\.?\d*vw/.test(decl.value)) {
          vwDecls.push({ prop: decl.prop, value: decl.value, decl });
        }
      });

      if (vwDecls.length > 0) {
        rulesToProcess.push({ rule, vwDecls });
      }
    });

    rulesToProcess.forEach(({ rule, vwDecls }) => {
      // 从原始规则中移除 vw 声明（保留原始 px 值）
      vwDecls.forEach(({ decl }) => decl.remove());

      // 新建只含 vw 值的规则
      const vwRule = postcss.rule({ selector: rule.selector });
      vwDecls.forEach(({ prop, value }) => {
        vwRule.append(postcss.decl({ prop, value }));
      });

      // 包裹在移动端媒体查询中
      const media = postcss.atRule({
        name: 'media',
        params: 'screen and (max-width: 767.98px)',
        raws: { between: ' ', after: '\n' },
      });
      media.append(vwRule);

      // 插入到原始规则之后
      rule.parent.insertAfter(rule, media);
    });
  },
});
isolateVwToMobile.postcss = true;

module.exports = {
  plugins: [
    require('postcss-px-to-viewport-8-plugin')({
      // 设计稿基准宽度，与项目 md 断点一致
      viewportWidth: 375,
      unitPrecision: 5,
      viewportUnit: 'vw',
      fontViewportUnit: 'vw',
      // 1px 细线不转换
      minPixelValue: 2,
      // 媒体查询内的 px 不转换（桌面端 rwd-min('lg') 等保持原始 px）
      mediaQuery: false,
      // 保留原始 px，由 isolateVwToMobile 插件统一处理
      replace: false,
      propList: ['*'],
    }),
    isolateVwToMobile(),
  ],
};

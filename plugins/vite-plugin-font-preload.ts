import type { Plugin } from 'vite';

// Noto Sans SC 400 是首屏正文主字重（约 1.1MB），配了 font-display:swap 后
// 不预加载会先出系统字体再跳成思源黑体，整页中文抖一下。
// 这里不能直接往 index.html 里写路径——Vite 会给 woff2 加内容 hash，
// 写死的话下次构建文件名一变就 404（还会留下一条 preload 找不到的告警）。
// 所以在 transformIndexHtml 里从 bundle 反查真实文件名再注入。
const PRELOAD_FONT_PATTERNS = [
  'noto-sans-sc-chinese-simplified-400', // 正文/UI
  'noto-serif-sc-chinese-simplified-400', // 标题（h1-h4 / font-serif）
];

export default function fontPreloadPlugin(): Plugin {
  return {
    name: 'font-preload',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html;

        const links = PRELOAD_FONT_PATTERNS.flatMap((pattern) =>
          Object.keys(ctx.bundle ?? {})
            .filter((file) => file.endsWith('.woff2') && file.includes(pattern))
            .map(
              (file) =>
                `<link rel="preload" as="font" type="font/woff2" href="/${file}" crossorigin />`
            )
        );

        if (links.length === 0) return html;

        const injected = links.map((link) => `    ${link}`).join('\n');
        return html.replace('</head>', `${injected}\n  </head>`);
      },
    },
  };
}

# 网站更新日志

记录摄影作品网站的历次功能与样式调整。

## 2026-08-07

### 样式优化
- **画廊瀑布流图片间距**：移除 `src/pages/GalleryPage.tsx` 图片卡片的 `mb-4` 类（`break-inside-avoid` 那一层），消除上下相邻图片之间的白色空白间隙，使瀑布流实现 PRD 要求的「图片无缝展示、顺滑流动」效果。列间水平间隙 `gap-0` 本就为 0，未改动。

### 工程化清理
- **移除 pnpm 残留字段**：删除 `package.json` 的 `packageManager: pnpm@...`，项目彻底纯 npm 管理（此前已删 `pnpm-lock.yaml`、`pnpm-workspace.yaml`）。
- **删除多余配置**：移除 `vite.config.dev.ts`（秒哒平台在线编辑器专用开发配置，含 HMR 控制 / sentry 注入；本地 `npm run dev` 加载 `vite.config.ts`，无需此文件）。
- **删除模板文件**：移除秒哒导出模板 `README.md`（"欢迎使用你的秒哒应用代码包"，与摄影网站无关）。
- 注：`dist/`（过期构建产物）与 `node_modules`（含 pnpm 缓存 `.pnpm`）因 WorkBuddy 工具内置批量删除保护无法在工具内删除，需本地终端执行 `rm -rf dist && rm -rf node_modules && npm install` 彻底纯化为 npm 结构。

### 工程化调整
- **移除 pnpm，改用纯 npm**：删除 `pnpm-lock.yaml` 与 `pnpm-workspace.yaml`（原 pnpm catalog 仅定义 react-three 相关版本，未被 `package.json` 引用，删除无副作用）。项目现以 npm 为唯一包管理器（`package-lock.json` 为权威锁文件），`npm install` / `npm run dev` / `npm run build` 均验证可用。
- 注：`node_modules` 仍为早期 pnpm 安装的符号链接结构（含 `.pnpm`），对 npm 运行时兼容，可直接使用；如需纯 npm 结构的 `node_modules`，在本地终端执行 `rm -rf node_modules && npm install` 即可。

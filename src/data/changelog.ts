// 更新日志数据 - 整理归档所有版本更新项目

export type ChangeType = "feature" | "fix" | "improvement";
export type ChangePriority = "high" | "medium" | "low";

export interface ChangeItem {
  type: ChangeType;
  priority: ChangePriority;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
}

export interface ChangelogVersion {
  version: string;
  date: string;
  summaryZh: string;
  summaryEn: string;
  changes: ChangeItem[];
}

export const changelog: ChangelogVersion[] = [
  {
    version: "v0.2.0",
    date: "2026-07-31",
    summaryZh: "功能完善与体验优化：新增画廊筛选、留言展示、SEO 优化等多项改进",
    summaryEn: "Refinement & UX overhaul: gallery filtering, message display, SEO, and more",
    changes: [
      // 高优先级
      {
        type: "fix",
        priority: "high",
        titleZh: "修复首页排序副作用污染",
        titleEn: "Fix sort side-effect pollution on home page",
        descZh: "时间线视图中 photos.sort() 会修改原数组，改为创建副本再排序，避免数据被意外修改。",
        descEn: "photos.sort() mutated the original array; switched to a copy before sorting to prevent unintended data changes.",
      },
      {
        type: "feature",
        priority: "high",
        titleZh: "画廊页新增分类筛选",
        titleEn: "Gallery category filtering",
        descZh: "画廊页新增分类筛选栏，支持动态提取分类、结果计数、空状态提示，切换带过渡动画。",
        descEn: "Added a category filter bar to the gallery with dynamic categories, result count, empty state, and animated transitions.",
      },
      {
        type: "feature",
        priority: "high",
        titleZh: "留言板新增回声墙展示",
        titleEn: "Echo Wall message display",
        descZh: "回声页新增已有留言展示区，通过安全函数仅返回脱敏字段（不含邮箱），提交后自动刷新。",
        descEn: "Added an echo wall section showing existing messages via a SECURITY DEFINER function that returns only sanitized fields (no email).",
      },
      // 中优先级
      {
        type: "improvement",
        priority: "medium",
        titleZh: "摄影师肖像图加载容错",
        titleEn: "Photographer portrait fallback",
        descZh: "提取硬编码链接为常量，加载失败时显示相机图标占位，避免页面 broken。",
        descEn: "Extracted hardcoded URL to a constant; shows a camera icon placeholder on load failure.",
      },
      {
        type: "improvement",
        priority: "medium",
        titleZh: "路由懒加载骨架屏",
        titleEn: "Route lazy-load skeleton",
        descZh: "新增 PageSkeleton 组件，页面切换时显示脉冲加载动画与照片卡片骨架，替代空白 div。",
        descEn: "Added a PageSkeleton component with pulse animation and photo card placeholders, replacing blank divs.",
      },
      {
        type: "improvement",
        priority: "medium",
        titleZh: "Footer 版权年份动态化",
        titleEn: "Dynamic footer copyright year",
        descZh: "将硬编码的 © 2026 改为动态生成当前年份。",
        descEn: "Changed hardcoded © 2026 to dynamically render the current year.",
      },
      {
        type: "feature",
        priority: "medium",
        titleZh: "全站 SEO Meta 标签",
        titleEn: "Site-wide SEO meta tags",
        descZh: "为首页、画廊、自白、回声、登录、404 页面配置独立的 title 和 description，中英文双语。",
        descEn: "Configured unique title and description for all pages (home, gallery, profile, about, login, 404) in both languages.",
      },
      // 低优先级
      {
        type: "improvement",
        priority: "low",
        titleZh: "管理后台项目关联下拉选择",
        titleEn: "Admin project association dropdown",
        descZh: "照片表单的项目 ID 从手动输入改为下拉选择，展示系列标题而非晦涩 ID。",
        descEn: "Changed the photo form project field from manual input to a dropdown showing series titles instead of raw IDs.",
      },
      {
        type: "improvement",
        priority: "low",
        titleZh: "照片详情弹窗图片预加载",
        titleEn: "Photo modal image preloading",
        descZh: "打开或切换照片时自动预加载前后各一张，使用浏览器原生缓存减少切换延迟。",
        descEn: "Preloads the previous and next images on open/switch using native browser cache to reduce latency.",
      },
    ],
  },
  {
    version: "v0.1.0",
    date: "2026-02-12",
    summaryZh: "初始版本：核心功能搭建完成",
    summaryEn: "Initial release: core features established",
    changes: [
      {
        type: "feature",
        priority: "high",
        titleZh: "基础环境与设计系统",
        titleEn: "Base environment & design system",
        descZh: "搭建 Vite + React + TypeScript + Supabase 技术栈，确立极简黑白艺术风视觉系统。",
        descEn: "Set up Vite + React + TypeScript + Supabase stack with a minimalist black-and-white art aesthetic.",
      },
      {
        type: "feature",
        priority: "high",
        titleZh: "Supabase 数据库集成",
        titleEn: "Supabase database integration",
        descZh: "集成 photos、projects、profiles、likes、messages 五张表与 RLS 安全策略。",
        descEn: "Integrated five tables (photos, projects, profiles, likes, messages) with RLS policies.",
      },
      {
        type: "feature",
        priority: "high",
        titleZh: "核心展示页面",
        titleEn: "Core display pages",
        descZh: "完成首页（光影）、画廊、自白、回声四个核心页面。",
        descEn: "Completed four core pages: Light, Gallery, Confession, and Echo.",
      },
      {
        type: "feature",
        priority: "high",
        titleZh: "管理后台",
        titleEn: "Admin dashboard",
        descZh: "照片管理、叙事系列管理、留言管理三大模块。",
        descEn: "Three management modules: photos, narrative series, and messages.",
      },
      {
        type: "feature",
        priority: "high",
        titleZh: "认证系统",
        titleEn: "Authentication system",
        descZh: "仅限管理员登录，RLS 策略保护数据安全。",
        descEn: "Admin-only login with RLS-protected data.",
      },
      {
        type: "feature",
        priority: "medium",
        titleZh: "照片详情页增强",
        titleEn: "Photo detail enhancements",
        descZh: "新增上一张/下一张导航、自动播放、背景音乐、点赞功能。",
        descEn: "Added prev/next navigation, autoplay, background music, and likes.",
      },
      {
        type: "feature",
        priority: "medium",
        titleZh: "交互与动画优化",
        titleEn: "Interaction & animation polish",
        descZh: "使用 Framer Motion 实现页面过渡、悬浮动画、时间线视图等效果。",
        descEn: "Used Framer Motion for page transitions, hover animations, and timeline views.",
      },
      {
        type: "feature",
        priority: "medium",
        titleZh: "响应式适配与深色模式",
        titleEn: "Responsive & dark mode",
        descZh: "移动端适配、深色模式、中英文双语切换。",
        descEn: "Mobile adaptation, dark mode, and bilingual (zh/en) switching.",
      },
    ],
  },
];

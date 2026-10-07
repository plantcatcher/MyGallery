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
    version: "v0.2.1",
    date: "2026-10-07",
    summaryZh: "图片查看器声音与交互修复：关闭自动播放/弹窗时同步停止背景音乐，移动端可正常翻图",
    summaryEn: "Image viewer sound & interaction fixes: BGM now stops with autoplay/modal close, mobile navigation restored",
    changes: [
      {
        type: "fix",
        priority: "high",
        titleZh: "关闭自动播放不再残留背景音乐",
        titleEn: "Stop BGM when autoplay is turned off",
        descZh: "关闭自动播放时未同步停止音乐，导致声音持续播放。现已在关闭自动播放与关闭弹窗时同步停止背景音乐。",
        descEn: "Turning off autoplay no longer leaves the background music playing; music now stops together with autoplay and when the modal closes.",
      },
      {
        type: "fix",
        priority: "medium",
        titleZh: "移动端左右切换箭头常显",
        titleEn: "Mobile nav arrows always visible",
        descZh: "切换箭头原为 hover 显示，移动端无 hover 导致无法翻图。现改为移动端常显、桌面端 hover 显示。",
        descEn: "Nav arrows were hover-only and invisible on touch devices; now always visible on mobile and hover-revealed on desktop.",
      },
      {
        type: "improvement",
        priority: "low",
        titleZh: "图片解码与加载优化",
        titleEn: "Image decode & load optimizations",
        descZh: "全站图片加 decoding=\"async\"，index.html 设 lang=zh-CN 并预连接图片 CDN，减少阻塞、加快首屏与图片加载。",
        descEn: "Added decoding=\"async\" to images, set lang=zh-CN and preconnected the image CDN in index.html to cut blocking and speed up loads.",
      },
      {
        type: "feature",
        priority: "medium",
        titleZh: "图片查看器支持滑动手势",
        titleEn: "Swipe gestures in image viewer",
        descZh: "移动端在图片区域左右滑动即可切换上一张/下一张（左滑下一张、右滑上一张），仅响应以水平方向为主的滑动，避免与竖向滚动冲突。",
        descEn: "On touch devices, swipe left/right on the image to go next/previous; only horizontal-dominant swipes trigger navigation to avoid conflicting with vertical scroll.",
      },
      {
        type: "improvement",
        priority: "medium",
        titleZh: "新增 Open Graph / Twitter 分享标签",
        titleEn: "Open Graph & Twitter Card meta",
        descZh: "PageMeta 支持 og:title/description/image/url 与 twitter:card(summary_large_image)，首页、画廊页传入代表作品图。同时为兼容不执行 JS 的社交爬虫，在 index.html 静态注入默认 og/twitter 标签（域名 gallery.planetgis.cn，封面用 HongKongCity 作品）。",
        descEn: "PageMeta emits Open Graph + Twitter Card tags (home/gallery pass a featured photo). To support crawlers that don't run JS, index.html also carries static default OG/Twitter tags (domain gallery.planetgis.cn, cover = HongKongCity photo).",
      },
      {
        type: "improvement",
        priority: "high",
        titleZh: "画廊/首页启用缩略图与模糊占位",
        titleEn: "Thumbnails & blur-up placeholders",
        descZh: "图床不支持 URL 缩图，新增构建期脚本 scripts/gen-thumbnails.mjs：用 FFmpeg 把每张原图压成 600px WebP 缩略图 + 32px 模糊 LQIP，写入 public/photos/thumb 并回写 photos.json 的 thumbnail/lqip 字段。画廊网格与首页卡片改用缩略图（单张约 7–54KB，原图约 2.6MB），点开弹窗才加载完整原图，首屏与流量大幅优化。",
        descEn: "Since the CDN can't thumbnail on the fly, added a build-time script (scripts/gen-thumbnails.mjs) using FFmpeg to emit 600px WebP thumbnails + 32px blur LQIP into public/photos/thumb and back-fill photos.json. Grid/cards now use thumbnails (≈7–54KB vs ≈2.6MB), full image loads only on modal open.",
      },
      {
        type: "improvement",
        priority: "medium",
        titleZh: "动效升级为苹果风格",
        titleEn: "Apple-style motion polish",
        descZh: "统一缓动为 iOS 弹簧曲线（cubic-bezier(0.32,0.72,0,1)）；卡片 hover 去掉 2 秒慢缩放，改为 0.5 秒缓动缩至 1.04；画廊入场与弹窗大图改用 framer-motion spring 弹簧；去除大图 blur 滤镜进出场（避免卡顿）。",
        descEn: "Unified easing to the iOS spring curve; card hover now eases to scale 1.04 in 0.5s instead of a 2s slow zoom; gallery entrance and modal image use framer-motion springs; removed the expensive blur filter on the modal image.",
      },
      {
        type: "fix",
        priority: "high",
        titleZh: "修复图片切换时的闪烁",
        titleEn: "Fix image-switch flicker in viewer",
        descZh: "弹窗大图切换时因 2.6MB 原图用 key 强制重建 + decoding=async，解码完成的瞬间才画出像素，造成空白→清晰的硬闪。改为 blur-up：用本地 WebP 缩略图（几十 KB 秒开）打底，高清原图解码完成后 onLoad 淡入覆盖，切换不再闪。",
        descEn: "Modal image flickered because the 2.6MB full image was remounted via key + decoding=async, painting only after decode finished. Switched to blur-up: a local WebP thumbnail (tens of KB, instant) shows underneath, and the full image fades in on load — switching is now flicker-free.",
      },
      {
        type: "fix",
        priority: "medium",
        titleZh: "消除切换时的矩形闪屏",
        titleEn: "Remove rectangular flash on switch",
        descZh: "模糊占位用的是本地 webp 缩略图，配合 object-contain 居中留边、再叠加 blur，导致 webp 的硬矩形边界与 12px 模糊外晕在深色弹窗背景上显出一个矩形框。已将模糊底改为 object-cover 满铺（scale 提到 1.1），铺满图片区成为柔和色场，矩形边界消失；高清原图仍 object-contain 完整呈现。",
        descEn: "The blur placeholder was a local WebP thumbnail using object-contain (letterboxed) plus blur, so the WebP's hard rectangular edge and its 12px blur halo showed a rectangle against the dark modal background. Changed the blur layer to object-cover (scale 1.1) so it fills the area as a soft field with no visible rectangle; the full image stays object-contain and intact.",
      },
      {
        type: "improvement",
        priority: "medium",
        titleZh: "图片内部模糊→清晰过渡",
        titleEn: "In-image blur-to-sharp transition",
        descZh: "切换大图从「模糊底淡出 + 原图淡入」改为原图自身 blur(大)→blur(0) 的滤镜过渡（配合轻微 scale），底层模糊缩略图仅在未加载时垫着、加载完淡出。视觉上是一张图从模糊慢慢变清晰，而非两张图交叉。处理缓存命中时 onLoad 不触发的情况（用 complete + rAF 兜底）。",
        descEn: "Replaced the cross-fade with an in-image blur(2xl)→blur(0) filter transition (plus slight scale): the full image itself sharpens gradually, while the blur thumbnail only holds until load. Handles cached images via complete+rAF so the sharpen still plays.",
      },
      {
        type: "fix",
        priority: "medium",
        titleZh: "弹窗查看器改用原图（不再用缩略图）",
        titleEn: "Viewer uses full image, not thumbnail",
        descZh: "按需求，图片查看器（弹窗）切换时不再使用 webp 缩略图占位，直接用原图 photo.url；缩略图仅保留在画廊/首页网格做快速加载。弹窗仍保留原图自身的模糊→清晰(blur-2xl→blur-0)内部过渡。删除了弹窗里的 webp 模糊底图层，矩形框问题随之消失。",
        descEn: "Per request, the image viewer (modal) no longer uses the WebP thumbnail placeholder when switching — it shows the full image (photo.url) directly; thumbnails remain only in the gallery/home grids for fast loading. The modal keeps the in-image blur→sharp transition. The WebP placeholder layer was removed, which also eliminated the rectangular flash.",
      },
      {
        type: "improvement",
        priority: "medium",
        titleZh: "弹窗切换动效恢复为 GitHub 初始版本",
        titleEn: "Viewer switching reverted to original (GitHub)",
        descZh: "按需求把图片切换动效恢复为仓库初始提交的样子：图片区用 motion.img 带 blur(10px) 进出场 + 轻微位移(x±10)/缩放(0.98↔1.02) + mode=wait，duration 0.8s、ease [0.19,1,0.22,1]。即撤销了此前所有动效迭代（spring 缩放→blur-up 缩略图打底→内部清晰化→去模糊+左右滑→去回弹→交叉溶解→硬切）。本次仅恢复图片切换动效这一段，功能修复（自动播放关闭停音乐、关弹窗停音乐、移动端箭头常显、滑动手势、相邻预加载）均保留。",
        descEn: "Per request, the image-switch animation is back to the repo's initial commit: motion.img with blur(10px) in/out + slight x(±10)/scale(0.98↔1.02) + mode=wait, 0.8s on ease [0.19,1,0.22,1]. This undoes all prior animation iterations (spring → blur-up thumbnail → in-image sharpen → slide → no-bounce → cross-fade → hard cut). Only the switch animation was reverted; functional fixes (stop music when autoplay off, stop on close, mobile arrows always visible, swipe gestures, adjacent preload) are kept.",
      },
      {
        type: "fix",
        priority: "medium",
        titleZh: "去回弹 + 消除切换时的方形阴影框",
        titleEn: "No bounce & remove square shadow frame",
        descZh: "① 按需求去掉回弹：切换过渡由 spring 改为平滑 tween（duration 0.4, ease apple），不再过冲。② 修切换时看到的方形边框：原图是 absolute inset-0 w-full h-full + object-contain，被拉伸填满图片区矩形，而 shadow-2xl 画在元素边框盒上（非照片内容），故出现与照片比例无关的方形阴影框。改为 max-w-full max-h-[70vh]/md:max-h-full + object-contain，由父级 flex 居中，shadow 贴合照片真实形状，方形框消失。",
        descEn: "① Removed bounce: switch transition changed from spring to a smooth tween (duration 0.4, apple ease), no overshoot. ② Fixed the square frame seen while switching: the image was absolute inset-0 w-full h-full + object-contain (stretched to fill the area), and shadow-2xl is drawn on the element's border box (not the photo), producing a square shadow independent of the photo's aspect. Changed to max-w/max-h + object-contain centered by flex, so the shadow hugs the real photo shape and the square frame is gone.",
      },
    ],
  },
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

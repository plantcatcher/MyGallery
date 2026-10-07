// 博客模块：从 src/content/blog/*.md 加载文章
// 每篇 md 含 YAML frontmatter（title/date/location/excerpt/cover/tags/author）
// 与网站其它模块一致，采用构建期静态注入（import.meta.glob eager），无需运行时 fetch

import { marked } from "marked";

export interface BlogPost {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  location?: string;
  excerpt?: string;
  cover?: string;
  tags: string[];
  author: string;
  readingTime: number; // 预计阅读分钟数
  html: string;
}

// 构建期把全部 md 以原始文本形式打进 bundle
const modules = import.meta.glob("../content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = /^---\s*\n([\s\S]*?)\n---\s*\n?/.exec(raw);
  if (!match) return { data: {}, body: raw };
  const fm = match[1];
  const body = raw.slice(match[0].length);
  const data: Record<string, string> = {};
  for (const line of fm.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    val = val.replace(/^["']|["']$/g, "");
    if (key) data[key] = val;
  }
  return { data, body };
}

marked.setOptions({ gfm: true, breaks: false });

function buildPost(path: string, raw: string): BlogPost {
  const { data, body } = parseFrontmatter(raw);
  const slug = path.split("/").pop()!.replace(/\.md$/, "");
  const html = marked.parse(body, { async: false }) as string;

  // 中文按 ~350 字/分钟估算阅读时长
  const charCount = body.replace(/\s/g, "").length;
  const readingTime = Math.max(1, Math.round(charCount / 350));

  const tags = (data.tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? "",
    location: data.location || undefined,
    excerpt: data.excerpt || undefined,
    cover: data.cover || undefined,
    tags,
    author: data.author ?? "板牙",
    readingTime,
    html,
  };
}

export const blogPosts: BlogPost[] = Object.entries(modules)
  .map(([path, raw]) => buildPost(path, raw))
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAdjacentPosts(slug: string): { prev?: BlogPost; next?: BlogPost } {
  const idx = blogPosts.findIndex((p) => p.slug === slug);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? blogPosts[idx - 1] : undefined,
    next: idx < blogPosts.length - 1 ? blogPosts[idx + 1] : undefined,
  };
}

export function getAllTags(): string[] {
  const set = new Set<string>();
  blogPosts.forEach((p) => p.tags.forEach((t) => set.add(t)));
  return Array.from(set);
}

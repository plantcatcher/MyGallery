#!/usr/bin/env node
// 一次性生成缩略图 + LQIP，写入 public/photos/thumb，并回写 src/data/photos.json
// 依赖：本机已装 FFmpeg（含 libwebp）。零 npm 依赖。
//
// 用法：
//   node scripts/gen-thumbnails.mjs            # 处理全部照片
//   LIMIT=5 node scripts/gen-thumbnails.mjs    # 仅处理前 5 张（验证用）
//   FFMPEG_BIN=/path/ffmpeg node ...           # 自定义 ffmpeg 路径
//
// 已生成的文件会自动跳过（增量），可反复运行。

import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileP = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PHOTOS = path.resolve(ROOT, "src/data/photos.json");
const OUT = path.resolve(ROOT, "public/photos/thumb");

const FFMPEG =
  process.env.FFMPEG_BIN ||
  "C:\\Users\\ZhuanZ\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-full_build\\bin\\ffmpeg.exe";

const THUMB_W = 600; // 缩略图宽度(px)，WebP
const LQIP_W = 32; // 模糊占位宽度(px)
const CONCURRENCY = 4;

const toHttps = (u) => u.replace(/^http:\/\//i, "https://");

async function genOne(photo) {
  const id = photo.id;
  const thumbPath = path.join(OUT, `${id}.webp`);
  fs.mkdirSync(OUT, { recursive: true });

  // 1) 缩略图：缺失才下载原图生成（增量跳过，可离线）
  if (!fs.existsSync(thumbPath)) {
    const src = toHttps(photo.url);
    await execFileP(
      FFMPEG,
      [
        "-y",
        "-loglevel",
        "error",
        "-i",
        src,
        "-vf",
        `scale=${THUMB_W}:-1`,
        "-c:v",
        "libwebp",
        "-quality",
        "72",
        "-compression_level",
        "4",
        "-preset",
        "default",
        thumbPath,
      ],
      { maxBuffer: 64 * 1024 * 1024 }
    );
  }

  // 2) LQIP：从本地缩略图(已存在)缩到 32px，直接管道输出内联为 data URI，不落盘
  const { stdout } = await execFileP(
    FFMPEG,
    [
      "-y",
      "-loglevel",
      "error",
      "-i",
      thumbPath,
      "-vf",
      `scale=${LQIP_W}:-1,boxblur=1`,
      "-c:v",
      "libwebp",
      "-quality",
      "60",
      "-compression_level",
      "4",
      "-f",
      "webp",
      "-",
    ],
    { maxBuffer: 64 * 1024 * 1024, encoding: "buffer" }
  );
  const b64 = stdout.toString("base64");

  return {
    thumbnail: `/photos/thumb/${id}.webp`,
    lqip: `data:image/webp;base64,${b64}`,
  };
}

async function pool(items, worker, concurrency) {
  const ret = new Array(items.length);
  let i = 0;
  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (i < items.length) {
        const idx = i++;
        ret[idx] = await worker(items[idx], idx);
      }
    }
  );
  await Promise.all(runners);
  return ret;
}

async function main() {
  if (!fs.existsSync(PHOTOS)) {
    console.error("找不到", PHOTOS);
    process.exit(1);
  }
  const photos = JSON.parse(fs.readFileSync(PHOTOS, "utf8"));
  const limit = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : photos.length;
  const subset = photos.slice(0, limit);
  console.log(`缩略图生成：总计 ${photos.length} 张，本次处理前 ${subset.length} 张`);

  let ok = 0;
  const results = await pool(
    subset,
    async (p) => {
      try {
        const r = await genOne(p);
        ok++;
        return r;
      } catch (e) {
        console.error(`✗ ${p.id} (${p.url}):`, e.message || e);
        return null;
      }
    },
    CONCURRENCY
  );

  // 回写 photos.json
  const map = new Map();
  subset.forEach((p, idx) => {
    if (results[idx]) map.set(p.id, results[idx]);
  });
  let changed = 0;
  for (const p of photos) {
    const r = map.get(p.id);
    if (r && (p.thumbnail !== r.thumbnail || p.lqip !== r.lqip)) {
      p.thumbnail = r.thumbnail;
      p.lqip = r.lqip;
      changed++;
    }
  }
  fs.writeFileSync(PHOTOS, JSON.stringify(photos, null, 2) + "\n");
  console.log(`完成：成功 ${ok}/${subset.length}，photos.json 更新 ${changed} 条。`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

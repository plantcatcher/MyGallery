// 从 Supabase 导出照片和项目数据到本地 JSON
import https from "https";
import fs from "fs";

const SUPABASE_URL = "https://yqixrszpmsyscpnnnnis.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_9UpgHJH9tLkeJNUcTTIvwg_iIjdIwwn";

function fetchFromSupabase(table, orderBy) {
  return new Promise((resolve, reject) => {
    const path = orderBy
      ? `/rest/v1/${table}?select=*&order=${orderBy}`
      : `/rest/v1/${table}?select=*`;

    const options = {
      hostname: new URL(SUPABASE_URL).hostname,
      path,
      method: "GET",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

async function exportData() {
  console.log("正在从 Supabase 导出数据...");

  try {
    // 导出照片
    const photos = await fetchFromSupabase("photos", "date.desc");
    console.log(`✅ 导出了 ${photos.length} 张照片`);

    // 导出项目
    const projects = await fetchFromSupabase("projects", "year.desc");
    console.log(`✅ 导出了 ${projects.length} 个项目`);

    // 写入文件
    fs.writeFileSync(
      "src/data/photos.json",
      JSON.stringify(photos, null, 2) + "\n",
      "utf-8"
    );
    fs.writeFileSync(
      "src/data/projects.json",
      JSON.stringify(projects, null, 2) + "\n",
      "utf-8"
    );

    console.log("\n✅ 数据已保存到 src/data/photos.json 和 src/data/projects.json");
  } catch (error) {
    console.error("导出失败:", error.message);
    process.exit(1);
  }
}

exportData();

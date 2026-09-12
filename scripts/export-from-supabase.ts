// 从 Supabase 导出照片和项目数据到本地 JSON
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://yqixrszpmsyscpnnnnis.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_9UpgHJH9tLkeJNUcTTIvwg_iIjdIwwn";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function exportData() {
  console.log("正在从 Supabase 导出数据...");

  // 导出照片
  const { data: photos, error: photosError } = await supabase
    .from("photos")
    .select("*")
    .order("date", { ascending: false });

  if (photosError) {
    console.error("导出照片失败:", photosError);
    Deno.exit(1);
  }

  console.log(`✅ 导出了 ${photos.length} 张照片`);

  // 导出项目
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("*")
    .order("year", { ascending: false });

  if (projectsError) {
    console.error("导出项目失败:", projectsError);
    Deno.exit(1);
  }

  console.log(`✅ 导出了 ${projects.length} 个项目`);

  // 写入文件
  await Deno.writeTextFile(
    "src/data/photos.json",
    JSON.stringify(photos, null, 2) + "\n"
  );
  await Deno.writeTextFile(
    "src/data/projects.json",
    JSON.stringify(projects, null, 2) + "\n"
  );

  console.log("\n✅ 数据已保存到 src/data/photos.json 和 src/data/projects.json");
}

exportData();

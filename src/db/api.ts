import { supabase } from "./supabase";
import type { Photo, Project } from "@/types/photography";

// ==================== 点赞相关 API ====================

export async function likePhoto(photoId: string, userId?: string) {
  const sessionId = userId ? null : getSessionId();
  
  const { data, error } = await supabase
    .from("photo_likes")
    .insert([{ 
      photo_id: photoId, 
      user_id: userId || null,
      session_id: sessionId 
    }])
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(`点赞失败: ${error.message}`);
  }

  return data;
}

export async function unlikePhoto(photoId: string, userId?: string) {
  const sessionId = userId ? null : getSessionId();
  
  let query = supabase.from("photo_likes").delete().eq("photo_id", photoId);
  
  if (userId) {
    query = query.eq("user_id", userId);
  } else {
    query = query.eq("session_id", sessionId);
  }

  const { error } = await query;

  if (error) {
    throw new Error(`取消点赞失败: ${error.message}`);
  }
}

export async function getPhotoLikes(photoId: string): Promise<number> {
  const { data, error } = await supabase
    .from("photo_like_counts")
    .select("like_count")
    .eq("photo_id", photoId)
    .maybeSingle();

  if (error) {
    console.error("获取点赞数失败:", error);
    return 0;
  }

  return data?.like_count || 0;
}

export async function checkUserLiked(photoId: string, userId?: string): Promise<boolean> {
  const sessionId = userId ? null : getSessionId();
  
  let query = supabase.from("photo_likes").select("id").eq("photo_id", photoId);
  
  if (userId) {
    query = query.eq("user_id", userId);
  } else {
    query = query.eq("session_id", sessionId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("检查点赞状态失败:", error);
    return false;
  }

  return !!data;
}

// 生成或获取游客的 session ID
function getSessionId(): string {
  let sessionId = localStorage.getItem("guest_session_id");
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("guest_session_id", sessionId);
  }
  return sessionId;
}

// ==================== 照片相关 API ====================

export async function getAllPhotos(): Promise<Photo[]> {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("获取照片失败:", error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export async function getPhotosByCategory(category: string): Promise<Photo[]> {
  if (category === "all") {
    return getAllPhotos();
  }

  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("category", category)
    .order("date", { ascending: false });

  if (error) {
    console.error("获取分类照片失败:", error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export async function createPhoto(photo: Omit<Photo, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("photos")
    .insert([photo])
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(`创建照片失败: ${error.message}`);
  }

  return data;
}

export async function updatePhoto(id: string, updates: Partial<Photo>) {
  const { data, error } = await supabase
    .from("photos")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(`更新照片失败: ${error.message}`);
  }

  return data;
}

export async function deletePhoto(id: string) {
  const { error } = await supabase
    .from("photos")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`删除照片失败: ${error.message}`);
  }
}

// ==================== 项目相关 API ====================

export async function getAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("year", { ascending: false });

  if (error) {
    console.error("获取项目失败:", error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export async function createProject(project: Omit<Project, "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("projects")
    .insert([project])
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(`创建项目失败: ${error.message}`);
  }

  return data;
}

export async function updateProject(id: string, updates: Partial<Project>) {
  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(`更新项目失败: ${error.message}`);
  }

  return data;
}

export async function deleteProject(id: string) {
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`删除项目失败: ${error.message}`);
  }
}

// ==================== 留言板相关 API ====================

export async function getMessages() {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("获取留言失败:", error);
    return [];
  }

  return data || [];
}

export async function createMessage(message: { name: string; email?: string; content: string }) {
  const { error } = await supabase
    .from("messages")
    .insert([message]);

  if (error) {
    throw new Error(`提交留言失败: ${error.message}`);
  }
}

export async function deleteMessage(id: string) {
  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`删除留言失败: ${error.message}`);
  }
}

import type { Photo, Project } from "@/types/photography";
import photosData from "@/data/photos.json";
import projectsData from "@/data/projects.json";

// 判断是否为开发模式（有本地 API）
const IS_DEV = import.meta.env.DEV;

// ==================== 点赞相关 API（本地 localStorage 实现） ====================

const LIKES_STORAGE_KEY = "gallery_likes";
const LIKE_COUNTS_KEY = "gallery_like_counts";

function getLikedPhotos(): string[] {
  try {
    const data = localStorage.getItem(LIKES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setLikedPhotos(ids: string[]) {
  try {
    localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

function getLikeCounts(): Record<string, number> {
  try {
    const data = localStorage.getItem(LIKE_COUNTS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function setLikeCounts(counts: Record<string, number>) {
  try {
    localStorage.setItem(LIKE_COUNTS_KEY, JSON.stringify(counts));
  } catch {
    // ignore
  }
}

export async function likePhoto(photoId: string): Promise<void> {
  const liked = getLikedPhotos();
  if (!liked.includes(photoId)) {
    liked.push(photoId);
    setLikedPhotos(liked);
  }
  const counts = getLikeCounts();
  counts[photoId] = (counts[photoId] || 0) + 1;
  setLikeCounts(counts);
}

export async function unlikePhoto(photoId: string): Promise<void> {
  const liked = getLikedPhotos();
  const filtered = liked.filter(id => id !== photoId);
  setLikedPhotos(filtered);
  const counts = getLikeCounts();
  if (counts[photoId] && counts[photoId] > 0) {
    counts[photoId] -= 1;
    setLikeCounts(counts);
  }
}

export async function getPhotoLikes(photoId: string): Promise<number> {
  const counts = getLikeCounts();
  return counts[photoId] || 0;
}

export async function checkUserLiked(photoId: string): Promise<boolean> {
  const liked = getLikedPhotos();
  return liked.includes(photoId);
}

// ==================== 照片相关 API ====================

export async function getAllPhotos(): Promise<Photo[]> {
  if (IS_DEV) {
    try {
      const res = await fetch("/api/photos/");
      if (res.ok) {
        const data = await res.json();
        return [...data].sort(
          (a: Photo, b: Photo) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      }
    } catch {
      // 开发模式下 API 不可用时回退到静态数据
    }
  }
  return [...photosData].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getPhotosByCategory(category: string): Promise<Photo[]> {
  if (category === "all") {
    return getAllPhotos();
  }
  const allPhotos = await getAllPhotos();
  return allPhotos.filter((p) => p.category === category);
}

export async function createPhoto(photo: Omit<Photo, "id">): Promise<Photo> {
  if (!IS_DEV) {
    throw new Error("生产环境不支持新增照片，请在本地开发模式下操作");
  }
  const res = await fetch("/api/photos/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(photo),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "创建照片失败");
  }
  return res.json();
}

export async function updatePhoto(id: string, updates: Partial<Photo>): Promise<Photo> {
  if (!IS_DEV) {
    throw new Error("生产环境不支持更新照片，请在本地开发模式下操作");
  }
  const res = await fetch(`/api/photos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "更新照片失败");
  }
  return res.json();
}

export async function deletePhoto(id: string): Promise<void> {
  if (!IS_DEV) {
    throw new Error("生产环境不支持删除照片，请在本地开发模式下操作");
  }
  const res = await fetch(`/api/photos/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "删除照片失败");
  }
}

// ==================== 项目相关 API ====================

export async function getAllProjects(): Promise<Project[]> {
  if (IS_DEV) {
    try {
      const res = await fetch("/api/projects/");
      if (res.ok) {
        const data = await res.json();
        return [...data].sort((a: Project, b: Project) => {
          const yearA = parseInt(a.year.split("-")[0]);
          const yearB = parseInt(b.year.split("-")[0]);
          return yearB - yearA;
        });
      }
    } catch {
      // 开发模式下 API 不可用时回退到静态数据
    }
  }
  return [...projectsData].sort((a, b) => {
    const yearA = parseInt(a.year.split("-")[0]);
    const yearB = parseInt(b.year.split("-")[0]);
    return yearB - yearA;
  });
}

export async function createProject(project: Omit<Project, "id"> & { id?: string }): Promise<Project> {
  if (!IS_DEV) {
    throw new Error("生产环境不支持新增项目，请在本地开发模式下操作");
  }
  const res = await fetch("/api/projects/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "创建项目失败");
  }
  return res.json();
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  if (!IS_DEV) {
    throw new Error("生产环境不支持更新项目，请在本地开发模式下操作");
  }
  const res = await fetch(`/api/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "更新项目失败");
  }
  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  if (!IS_DEV) {
    throw new Error("生产环境不支持删除项目，请在本地开发模式下操作");
  }
  const res = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "删除项目失败");
  }
}

// ==================== 上传图片 ====================

export async function uploadImage(file: File): Promise<{ url: string; filename: string }> {
  if (!IS_DEV) {
    throw new Error("生产环境不支持上传图片，请在本地开发模式下操作");
  }
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "上传失败");
  }
  return res.json();
}

// ==================== 留言板相关（已移除，保留空函数避免编译错误） ====================

export interface PublicMessage {
  id: string;
  name: string;
  content: string;
  created_at: string;
}

export async function getMessages(): Promise<any[]> {
  return [];
}

export async function createMessage(_message: { name: string; email?: string; content: string }): Promise<void> {
  // 静态站点已移除留言功能
  throw new Error("留言功能已停用，请通过邮件联系");
}

export async function deleteMessage(_id: string): Promise<void> {
  // 静态站点已移除留言功能
}

export async function getPublicMessages(_limit = 50): Promise<PublicMessage[]> {
  return [];
}

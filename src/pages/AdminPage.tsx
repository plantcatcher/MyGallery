import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getAllPhotos, getAllProjects, createPhoto, updatePhoto, deletePhoto, createProject, updateProject, deleteProject, getMessages, deleteMessage } from "@/db/api";
import { Photo, Project } from "@/types/photography";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Image as ImageIcon, FolderOpen, ArrowLeft, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const AdminPage: React.FC = () => {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && profile?.role !== "admin") {
      toast.error("您没有权限访问此页面");
      navigate("/");
      return;
    }

    if (profile?.role === "admin") {
      fetchData();
    }
  }, [profile, authLoading, navigate]);

  const fetchData = async () => {
    setLoading(true);
    const [photosData, projectsData, messagesData] = await Promise.all([
      getAllPhotos(),
      getAllProjects(),
      getMessages()
    ]);
    setPhotos(photosData);
    setProjects(projectsData);
    setMessages(messagesData);
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground font-serif italic">加载中...</div>
      </div>
    );
  }

  if (profile?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-serif tracking-tighter">管理后台</h1>
            <p className="text-muted-foreground">管理您的照片和项目</p>
          </div>
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </div>

        <Tabs defaultValue="photos" className="w-full">
          <TabsList>
            <TabsTrigger value="photos">
              <ImageIcon className="w-4 h-4 mr-2" />
              照片管理
            </TabsTrigger>
            <TabsTrigger value="projects">
              <FolderOpen className="w-4 h-4 mr-2" />
              项目管理
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="w-4 h-4 mr-2" />
              留言管理
            </TabsTrigger>
          </TabsList>

          <TabsContent value="photos" className="space-y-6">
            <PhotosManager photos={photos} onRefresh={fetchData} />
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <ProjectsManager projects={projects} allPhotos={photos} onRefresh={fetchData} />
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <MessagesManager messages={messages} onRefresh={fetchData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// 照片管理组件
const PhotosManager: React.FC<{ photos: Photo[]; onRefresh: () => void }> = ({ photos, onRefresh }) => {
  const [open, setOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);

  const handleEdit = (photo: Photo) => {
    setEditingPhoto(photo);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这张照片吗？")) return;

    try {
      await deletePhoto(id);
      toast.success("照片已删除");
      onRefresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingPhoto(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif">照片列表</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPhoto(null)}>
              <Plus className="w-4 h-4 mr-2" />
              添加照片
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <PhotoForm photo={editingPhoto} onSuccess={() => { handleClose(); onRefresh(); }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <Card key={photo.id}>
            <CardHeader className="p-0">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <CardTitle className="text-lg">{photo.title}</CardTitle>
              <CardDescription className="line-clamp-2">{photo.description}</CardDescription>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">{photo.category}</span>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(photo)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(photo.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// 照片表单组件
const PhotoForm: React.FC<{ photo: Photo | null; onSuccess: () => void }> = ({ photo, onSuccess }) => {
  const [formData, setFormData] = useState({
    url: photo?.url || "",
    title: photo?.title || "",
    description: photo?.description || "",
    category: photo?.category || "landscape",
    project: photo?.project || "",
    date: photo?.date || new Date().toISOString().split("T")[0],
    location: photo?.location || ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (photo) {
        await updatePhoto(photo.id, formData);
        toast.success("照片已更新");
      } else {
        await createPhoto(formData as any);
        toast.success("照片已添加");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{photo ? "编辑照片" : "添加照片"}</DialogTitle>
        <DialogDescription>填写照片信息</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">图片链接 *</Label>
          <Input
            id="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://example.com/image.jpg"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">标题 *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="照片标题"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">描述</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="照片描述"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">分类 *</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="例如：风光、建筑、人文"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">日期 *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">地点 *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="拍摄地点"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="project">项目 ID（可选）</Label>
          <Input
            id="project"
            value={formData.project}
            onChange={(e) => setFormData({ ...formData, project: e.target.value })}
            placeholder="关联的项目 ID"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "保存中..." : photo ? "更新照片" : "添加照片"}
      </Button>
    </form>
  );
};

// 项目管理组件
const ProjectsManager: React.FC<{ projects: Project[]; allPhotos: Photo[]; onRefresh: () => void }> = ({ projects, allPhotos, onRefresh }) => {
  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个项目吗？")) return;

    try {
      await deleteProject(id);
      toast.success("项目已删除");
      onRefresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProject(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif">项目列表</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProject(null)}>
              <Plus className="w-4 h-4 mr-2" />
              添加项目
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <ProjectForm 
              project={editingProject} 
              allPhotos={allPhotos}
              onSuccess={() => { handleClose(); onRefresh(); }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader className="p-0">
              <div className="aspect-video overflow-hidden">
                <img src={project.cover_image} alt={project.title} className="w-full h-full object-cover" />
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{project.title}</CardTitle>
                <span className="text-xs text-muted-foreground">{project.year}</span>
              </div>
              <CardDescription>{project.description}</CardDescription>
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(project)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// 项目表单组件
// 项目表单组件
const ProjectForm: React.FC<{ project: Project | null; allPhotos: Photo[]; onSuccess: () => void }> = ({ project, allPhotos, onSuccess }) => {
  const [formData, setFormData] = useState({
    id: project?.id || "",
    title: project?.title || "",
    description: project?.description || "",
    cover_image: project?.cover_image || "",
    year: project?.year || new Date().getFullYear().toString()
  });
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      const associatedIds = allPhotos
        .filter(p => p.project === project.id)
        .map(p => p.id);
      setSelectedPhotoIds(associatedIds);
    }
  }, [project, allPhotos]);

  const togglePhoto = (id: string) => {
    setSelectedPhotoIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const projectId = project?.id || formData.id;
      
      // 1. 创建或更新项目
      if (project) {
        await updateProject(project.id, formData);
      } else {
        await createProject(formData as any);
      }

      // 2. 更新照片关联
      const updatePromises = allPhotos.map(photo => {
        const isSelected = selectedPhotoIds.includes(photo.id);
        const wasInThisProject = photo.project === projectId;

        if (isSelected && !wasInThisProject) {
          return updatePhoto(photo.id, { project: projectId });
        } else if (!isSelected && wasInThisProject) {
          return updatePhoto(photo.id, { project: "" });
        }
        return null;
      }).filter(p => p !== null);

      await Promise.all(updatePromises);
      
      toast.success(project ? "项目已更新" : "项目已添加");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <DialogHeader>
        <DialogTitle>{project ? "编辑叙事系列" : "添加叙事系列"}</DialogTitle>
        <DialogDescription>定义您的叙事结构与包含的作品</DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-id">项目唯一 ID *</Label>
            <Input
              id="project-id"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              placeholder="例如: tibet-journey"
              required
              disabled={!!project}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-title">标题 *</Label>
            <Input
              id="project-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="叙事系列名称"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">系列简介</Label>
            <Textarea
              id="project-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="讲述这个系列背后的故事..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cover-image">封面图片 URL *</Label>
              <Input
                id="cover-image"
                value={formData.cover_image}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                placeholder="封面图片链接"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-year">年份/跨度</Label>
              <Input
                id="project-year"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="2024 或 2023-2024"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 flex flex-col">
          <Label className="mb-2">选择包含的照片 ({selectedPhotoIds.length})</Label>
          <div className="border rounded-md p-4 flex-1 overflow-y-auto max-h-[400px] grid grid-cols-3 gap-2 bg-muted/20">
            {allPhotos.map(photo => (
              <div 
                key={photo.id}
                onClick={() => togglePhoto(photo.id)}
                className={cn(
                  "relative aspect-square cursor-pointer border-2 transition-all rounded-sm overflow-hidden",
                  selectedPhotoIds.includes(photo.id) ? "border-accent scale-[0.98]" : "border-transparent opacity-60 grayscale hover:opacity-100"
                )}
              >
                <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                {selectedPhotoIds.includes(photo.id) && (
                  <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                    <div className="bg-accent text-white rounded-full p-1">
                      <Plus className="w-3 h-3 rotate-45" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            {allPhotos.length === 0 && (
              <p className="col-span-3 text-center text-muted-foreground text-xs py-10">暂无照片可选，请先上传照片</p>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 italic">点击图片可将其加入或移除该系列</p>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "保存中..." : project ? "保存叙事系列" : "创建叙事系列"}
      </Button>
    </form>
  );
};

// 留言管理组件
const MessagesManager: React.FC<{ messages: any[]; onRefresh: () => void }> = ({ messages, onRefresh }) => {
  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这条留言吗？")) return;

    try {
      await deleteMessage(id);
      toast.success("留言已删除");
      onRefresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif">留言列表 ({messages.length})</h2>
      <div className="grid grid-cols-1 gap-4">
        {messages.map((msg) => (
          <Card key={msg.id} className="bg-muted/30">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-lg font-serif">{msg.name}</CardTitle>
                <CardDescription>{msg.email || "无邮箱"}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(msg.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              <div className="flex justify-between items-center mt-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  {new Date(msg.created_at).toLocaleString()}
                </p>
                {msg.email && (
                  <a href={`mailto:${msg.email}`} className="text-[10px] text-accent hover:underline uppercase tracking-widest">
                    回复邮件
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground py-20 font-serif italic">暂无留言</p>
        )}
      </div>
    </div>
  );
};

export default AdminPage;

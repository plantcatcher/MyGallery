import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getAllPhotos, getAllProjects } from "@/db/api";
import { ImageModal } from "@/components/ImageModal";
import { Photo, Project } from "@/types/photography";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Grid, Clock, Layers, ChevronRight, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import PageMeta from "@/components/common/PageMeta";

type ViewMode = "category" | "timeline" | "projects";

const ALL_CATEGORY = "__ALL__";

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>("category");
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllProjects, setShowAllProjects] = useState(false);

  // 动态提取标签
  const categories = useMemo(() => {
    const cats = Array.from(new Set(photos.map(p => p.category))).filter(Boolean);
    return [ALL_CATEGORY, ...cats];
  }, [photos]);

  const displayedCategories = categories.slice(0, 5);
  const moreCategories = categories.slice(5);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [photosData, projectsData] = await Promise.all([
        getAllPhotos(),
        getAllProjects()
      ]);
      setPhotos(photosData);
      setProjects(projectsData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredPhotos = useMemo(() => {
    if (viewMode === "category") {
      const filtered = activeCategory === ALL_CATEGORY
        ? photos
        : photos.filter((p) => p.category === activeCategory);
      return filtered.slice(0, 6); // 首页精简显示 6 张
    }
    return photos;
  }, [viewMode, activeCategory, photos]);

  const timelineData = useMemo(() => {
    const groups: { [key: string]: Photo[] } = {};
    // 创建副本再排序，避免修改原数组引发副作用
    [...photos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach((photo) => {
        const year = photo.date.split("-")[0];
        if (!groups[year]) groups[year] = [];
        groups[year].push(photo);
      });

    // 只显示最近 2 年，每年前 3 张
    return Object.entries(groups)
      .sort(([a], [b]) => parseInt(b) - parseInt(a))
      .slice(0, 2)
      .map(([year, photos]) => [year, photos.slice(0, 3)] as [string, Photo[]]);
  }, [photos]);

  const displayedProjects = useMemo(() => {
    return showAllProjects ? projects : projects.slice(0, 2);
  }, [projects, showAllProjects]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground font-serif italic">{t("home.loading")}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
      <PageMeta title={t("seo.homeTitle")} description={t("seo.homeDesc")} />
      {/* Hero Section */}
      <section className="py-24 md:py-40 space-y-12 text-center md:text-left">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 text-accent text-xs font-bold tracking-[0.3em] uppercase"
          >
            <div className="h-px w-8 bg-accent" />
            <span>{t("home.subtitle")}</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="text-6xl md:text-9xl font-serif tracking-tighter leading-[0.9]"
          >
            {t("home.title1")}<br />
            <span className="text-muted-foreground/30 italic hover:text-accent/50 transition-colors duration-1000">{t("home.title2")}</span>
            <br />
            {t("home.title3")}
          </motion.h1>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1.5 }}
          className="text-sm md:text-base text-muted-foreground max-w-lg leading-relaxed font-serif italic"
        >
          {t("home.quote")}
        </motion.p>
      </section>

      {/* View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-20 py-6 bg-background">
        <div className="flex bg-secondary/30 backdrop-blur-xl p-1.5 rounded-full border border-border/10">
          <Button
            variant={viewMode === "category" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("category")}
            className="rounded-full uppercase tracking-[0.2em] text-[9px] h-8 px-6"
          >
            {t("home.category")}
          </Button>
          <Button
            variant={viewMode === "timeline" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("timeline")}
            className="rounded-full uppercase tracking-[0.2em] text-[9px] h-8 px-6"
          >
            {t("home.timeline")}
          </Button>
          <Button
            variant={viewMode === "projects" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("projects")}
            className="rounded-full uppercase tracking-[0.2em] text-[9px] h-8 px-6"
          >
            {t("home.projects")}
          </Button>
        </div>

        {viewMode === "category" && (
          <div className="flex flex-wrap items-center gap-2">
            {displayedCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "text-xs uppercase tracking-widest px-4 py-2 transition-all",
                  activeCategory === cat
                    ? "text-foreground font-bold border-b-2 border-accent"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {cat === ALL_CATEGORY ? t("home.all") : cat}
              </button>
            ))}

            {moreCategories.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-xs uppercase tracking-widest px-4 py-2 text-muted-foreground hover:text-foreground flex items-center">
                    {t("home.more")} <ChevronRight className="w-3 h-3 ml-1 rotate-90" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-md border-border/50">
                  {moreCategories.map((cat) => (
                    <DropdownMenuItem
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className="text-xs uppercase tracking-widest cursor-pointer"
                    >
                      {cat === ALL_CATEGORY ? t("home.all") : cat}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>

      {/* Gallery Content */}
      <AnimatePresence mode="wait">
        {viewMode === "category" && (
          <div className="space-y-16">
            <motion.div
              key="category-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <LayoutGroup>
                {filteredPhotos.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    onClick={() => setSelectedPhoto(photo)}
                  />
                ))}
              </LayoutGroup>
            </motion.div>

            <div className="flex justify-center">
              <Link to="/gallery">
                <Button variant="outline" className="rounded-full px-8 font-serif italic tracking-widest">
                  {t("home.openGallery")} <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {viewMode === "timeline" && (
          <div className="space-y-16">
            <motion.div
              key="timeline-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-24"
            >
              {timelineData.map(([year, photos]) => (
                <div key={year} className="space-y-8">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-4xl font-bold tracking-tighter">{year}</h3>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {photos.map((photo) => (
                      <PhotoCard
                        key={photo.id}
                        photo={photo}
                        onClick={() => setSelectedPhoto(photo)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>

            <div className="flex justify-center">
              <Link to="/gallery">
                <Button variant="outline" className="rounded-full px-8 font-serif italic tracking-widest">
                  {t("home.browseTimeline")} <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {viewMode === "projects" && (
          <div className="space-y-16">
            <motion.div
              key="projects-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-24"
            >
              {displayedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  photos={photos}
                  onPhotoClick={setSelectedPhoto}
                />
              ))}
            </motion.div>

            {!showAllProjects && projects.length > 2 && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAllProjects(true)}
                  className="rounded-full px-8 font-serif italic tracking-widest"
                >
                  {t("home.expandProjects")} <ChevronRight className="w-4 h-4 ml-2 rotate-90" />
                </Button>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>

      <ImageModal
        photo={selectedPhoto}
        allPhotos={photos}
        onNavigate={setSelectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </div>
  );
};

const PhotoCard: React.FC<{ photo: Photo; onClick: () => void }> = ({ photo, onClick }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="group cursor-pointer relative"
      onClick={onClick}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted transition-all duration-700 ease-in-out group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
        <img
          src={photo.url}
          alt={photo.title}
          className="w-full h-full object-cover grayscale-[0.3] contrast-[1.1] transition-transform duration-[2s] group-hover:scale-105 group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col justify-end p-6">
          <p className="text-white font-serif italic text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
            {photo.description}
          </p>
        </div>
      </div>
      <div className="mt-6 space-y-1">
        <h4 className="font-serif text-xl tracking-tight">{photo.title}</h4>
        <div className="flex items-center space-x-2 text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
          <span>{photo.location}</span>
          <span>•</span>
          <span className="text-accent">{photo.category}</span>
        </div>
      </div>
    </motion.div>
  );
};

const ProjectCard: React.FC<{ project: Project; photos: Photo[]; onPhotoClick: (photo: Photo) => void }> = ({ project, photos, onPhotoClick }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const projectPhotos = useMemo(() => photos.filter(p => p.project === project.id), [photos, project.id]);

  return (
    <div className="space-y-8">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="group cursor-pointer relative overflow-hidden"
      >
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={project.cover_image}
            alt={project.title}
            className="w-full h-full object-cover grayscale-[0.5] transition-all duration-[2s] group-hover:scale-110 group-hover:grayscale-0"
          />
          <div className="absolute inset-0 bg-background/20 mix-blend-multiply transition-opacity group-hover:opacity-0" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
            <div className="space-y-4">
              <span className="text-[10px] text-accent font-bold tracking-[0.4em] uppercase">{project.year}</span>
              <h3 className="text-4xl md:text-7xl font-serif text-white tracking-tighter drop-shadow-2xl">{project.title}</h3>
              <p className="text-sm text-white/70 max-w-sm font-serif italic opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-200 transform translate-y-4 group-hover:translate-y-0">
                {project.description}
              </p>
              <div className="pt-4">
                <span className="text-[10px] text-white/50 uppercase tracking-[0.2em] flex items-center">
                  {isOpen ? t("home.collapseSeries") : t("home.exploreSeries")} ({projectPhotos.length} {t("home.photos")})
                  <ChevronRight className={cn("w-3 h-3 ml-2 transition-transform", isOpen ? "rotate-90" : "")} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
              {projectPhotos.map((photo) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="aspect-[3/4] cursor-pointer overflow-hidden group/item"
                  onClick={() => onPhotoClick(photo)}
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;

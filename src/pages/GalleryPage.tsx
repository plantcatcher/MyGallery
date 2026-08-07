import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { getAllPhotos } from "@/db/api";
import { ImageModal } from "@/components/ImageModal";
import { Photo } from "@/types/photography";
import { cn } from "@/lib/utils";
import PageMeta from "@/components/common/PageMeta";
import { Loader2, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const ALL_CATEGORY = "__ALL__";

const GalleryPage: React.FC = () => {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY);

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      const data = await getAllPhotos();
      setPhotos(data);
      setLoading(false);
    };
    fetchPhotos();
  }, []);

  // 动态提取分类
  const categories = useMemo(() => {
    const cats = Array.from(new Set(photos.map(p => p.category))).filter(Boolean);
    return [ALL_CATEGORY, ...cats];
  }, [photos]);

  const displayedCategories = categories.slice(0, 5);
  const moreCategories = categories.slice(5);

  // 根据分类过滤
  const filteredPhotos = useMemo(() => {
    if (activeCategory === ALL_CATEGORY) return photos;
    return photos.filter(p => p.category === activeCategory);
  }, [photos, activeCategory]);

  // 动画配置
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.2, 0.8, 0.2, 1] as const
      }
    },
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-muted-foreground font-serif italic tracking-widest">{t("gallery.loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageMeta title={t("seo.galleryTitle")} description={t("seo.galleryDesc")} />
      {/* 头部标题区 */}
      <section className="px-6 md:px-12 pt-12 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <span className="text-accent text-[10px] font-bold tracking-[0.5em] uppercase">{t("gallery.subtitle")}</span>
          <h1 className="text-5xl md:text-7xl font-serif tracking-tighter">{t("gallery.title")}</h1>
          <p className="text-muted-foreground font-serif italic max-w-lg mx-auto">
            {t("gallery.description")}
          </p>
        </motion.div>
      </section>

      {/* 分类筛选栏 */}
      <div className="px-6 md:px-12 mb-16">
        <div className="flex flex-wrap items-center justify-center gap-2">
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
              {cat === ALL_CATEGORY ? t("gallery.all") : cat}
            </button>
          ))}

          {moreCategories.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-xs uppercase tracking-widest px-4 py-2 text-muted-foreground hover:text-foreground flex items-center">
                  {t("gallery.more")} <ChevronRight className="w-3 h-3 ml-1 rotate-90" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-md border-border/50">
                {moreCategories.map((cat) => (
                  <DropdownMenuItem
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="text-xs uppercase tracking-widest cursor-pointer"
                  >
                    {cat === ALL_CATEGORY ? t("gallery.all") : cat}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {/* 当前结果计数 */}
        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-[0.3em] mt-6">
          {filteredPhotos.length} {t("gallery.photosUnit")}
        </p>
      </div>

      {/* 无缝流动的图片墙 */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeCategory}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0 }}
          className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-0 w-full px-6 md:px-12"
        >
          {filteredPhotos.map((photo) => (
            <motion.div
              key={photo.id}
              variants={itemVariants}
              className="relative group cursor-pointer overflow-hidden break-inside-avoid"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="relative overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-auto object-cover transition-transform duration-[2s] ease-out group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
                  loading="lazy"
                />
                
                {/* 悬浮遮罩 */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col justify-end p-4">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h4 className="text-white font-serif text-sm tracking-tight">{photo.title}</h4>
                    <p className="text-white/60 text-[10px] uppercase tracking-widest">{photo.location}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* 空状态 */}
      {filteredPhotos.length === 0 && (
        <div className="py-32 text-center">
          <p className="text-muted-foreground font-serif italic tracking-widest">
            {t("gallery.noPhotos")}
          </p>
        </div>
      )}

      {/* 底部装饰 */}
      <div className="py-24 text-center">
        <p className="text-muted-foreground text-xs font-serif italic tracking-[0.3em]">
          {t("gallery.footer")}
        </p>
      </div>

      <ImageModal
        photo={selectedPhoto}
        allPhotos={filteredPhotos}
        onNavigate={setSelectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </div>
  );
};

export default GalleryPage;

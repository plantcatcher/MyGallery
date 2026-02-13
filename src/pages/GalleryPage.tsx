import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllPhotos } from "@/db/api";
import { ImageModal } from "@/components/ImageModal";
import { Photo } from "@/types/photography";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const GalleryPage: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      const data = await getAllPhotos();
      setPhotos(data);
      setLoading(false);
    };
    fetchPhotos();
  }, []);

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
        <p className="text-muted-foreground font-serif italic tracking-widest">正在展开光影长卷...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 头部标题区 */}
      <section className="px-6 md:px-12 pt-12 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <span className="text-accent text-[10px] font-bold tracking-[0.5em] uppercase">全集展示</span>
          <h1 className="text-5xl md:text-7xl font-serif tracking-tighter">无边际画廊</h1>
          <p className="text-muted-foreground font-serif italic max-w-lg mx-auto">
            捕捉流动的瞬间，将破碎的时间编织成永恒的视觉长卷。
          </p>
        </motion.div>
      </section>

      {/* 无缝流动的图片墙 */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-0 w-full"
      >
        {photos.map((photo, index) => (
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

      {/* 底部装饰 */}
      <div className="py-24 text-center">
        <p className="text-muted-foreground text-xs font-serif italic tracking-[0.3em]">
          — 止于此，光影流转不息 —
        </p>
      </div>

      <ImageModal
        photo={selectedPhoto}
        allPhotos={photos}
        onNavigate={setSelectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </div>
  );
};

export default GalleryPage;

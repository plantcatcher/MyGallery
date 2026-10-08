import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, MapPin, Calendar, Info, Heart, Share2, ChevronLeft, ChevronRight, Play, Pause, Music, VolumeX, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Photo } from "@/types/photography";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { likePhoto, unlikePhoto, getPhotoLikes, checkUserLiked } from "@/db/api";
import { toast } from "sonner";

interface ImageModalProps {
  photo: Photo | null;
  allPhotos?: Photo[];
  onClose: () => void;
  onNavigate?: (photo: Photo) => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ photo, allPhotos = [], onClose, onNavigate }) => {
  const { t } = useTranslation();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [direction, setDirection] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const currentIndex = allPhotos.findIndex(p => p.id === photo?.id);

  // 初始化音频
  useEffect(() => {
    audioRef.current = new Audio("https://galleryphoto.planetgis.cn/bgm.mp3");
    audioRef.current.loop = true;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 音乐播放控制
  useEffect(() => {
    if (audioRef.current) {
      if (isPlayingMusic) {
        audioRef.current.play().catch(err => {
          console.error("Music playback failed:", err);
          setIsPlayingMusic(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlayingMusic]);

  // 关闭弹窗时停止自动播放与背景音乐，避免声音残留
  useEffect(() => {
    if (!photo) {
      setIsAutoPlaying(false);
      setIsPlayingMusic(false);
    }
  }, [photo]);

  const toggleMusic = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsPlayingMusic(!isPlayingMusic);
  };

  const toggleAutoPlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newAutoPlay = !isAutoPlaying;
    setIsAutoPlaying(newAutoPlay);

    // 开启自动播放且音乐未播放时，自动响起音乐
    if (newAutoPlay && !isPlayingMusic) {
      setIsPlayingMusic(true);
    }
    // 关闭自动播放时，同步停止音乐（否则声音会一直响）
    if (!newAutoPlay && isPlayingMusic) {
      setIsPlayingMusic(false);
    }
  };

  const navigateTo = useCallback((direction: 'prev' | 'next') => {
    if (!onNavigate || allPhotos.length === 0) return;
    
    let nextIndex = currentIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % allPhotos.length;
    } else {
      nextIndex = (currentIndex - 1 + allPhotos.length) % allPhotos.length;
    }
    setDirection(direction === 'next' ? 1 : -1);
    onNavigate(allPhotos[nextIndex]);
  }, [currentIndex, allPhotos, onNavigate]);

  // 移动端滑动手势：左滑下一张、右滑上一张（仅响应以水平方向为主的滑动，避免与竖向滚动冲突）
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      navigateTo(dx < 0 ? 'next' : 'prev');
    }
  };

  useEffect(() => {
    if (photo) {
      loadLikeData();
    }
  }, [photo]);

  // 预加载前后各一张图片，减少切换时的加载延迟
  useEffect(() => {
    if (!photo || allPhotos.length <= 1) return;
    const preloadIndices = [
      (currentIndex - 1 + allPhotos.length) % allPhotos.length,
      (currentIndex + 1) % allPhotos.length,
    ];
    preloadIndices.forEach((idx) => {
      const img = new Image();
      img.src = allPhotos[idx].url;
    });
  }, [photo, currentIndex, allPhotos]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigateTo('prev');
      if (e.key === 'ArrowRight') navigateTo('next');
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateTo, onClose]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying && photo) {
      interval = setInterval(() => {
        navigateTo('next');
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, photo, navigateTo]);

  const loadLikeData = async () => {
    if (!photo) return;
    
    const [count, isLiked] = await Promise.all([
      getPhotoLikes(photo.id),
      checkUserLiked(photo.id)
    ]);
    
    setLikeCount(count);
    setLiked(isLiked);
  };

  const handleLike = async () => {
    if (!photo || loading) return;
    
    setLoading(true);
    try {
      if (liked) {
        await unlikePhoto(photo.id);
        setLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
        toast.success(t("modal.unliked"));
      } else {
        await likePhoto(photo.id);
        setLiked(true);
        setLikeCount(prev => prev + 1);
        toast.success(t("modal.liked"));
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 分享当前作品：优先唤起系统原生分享面板，不支持时回退为复制"标题 + 描述 + 链接"
  const handleShare = async () => {
    if (!photo) return;

    const shareUrl = `${window.location.origin}/gallery?photo=${photo.id}`;
    const shareTitle = photo.title;
    const shareText = `${photo.title} · ${photo.location}\n${photo.description}`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        return;
      } catch (error: any) {
        // 用户主动取消分享时不做任何提示，其余情况继续走复制回退
        if (error && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast.success(t("modal.shareCopied"));
    } catch {
      toast.error(t("modal.shareFailed"));
    }
  };

  if (!photo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-background/95 backdrop-blur-xl p-2 md:p-12"
        onClick={onClose}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-[70] hover:bg-muted"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </Button>

        <div 
          className="relative w-full h-full max-w-7xl flex flex-col md:flex-row gap-4 md:gap-8 items-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 图片区域 */}
          <div
            className="flex-[2] md:flex-1 w-full h-full flex items-center justify-center overflow-hidden relative group/nav"
            style={{ touchAction: "pan-y" }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* 图片切换动效：恢复为 GitHub 初始版本（blur 进出场 + 轻微位移缩放 + mode=wait） */}
            <AnimatePresence mode="wait">
              <motion.img
                key={photo.id}
                initial={{ opacity: 0, scale: 0.98, x: 10, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.02, x: -10, filter: "blur(10px)" }}
                transition={{ 
                  duration: 0.8, 
                  ease: [0.19, 1, 0.22, 1]
                }}
                src={photo.url}
                alt={photo.title}
                className="max-w-full max-h-[70vh] md:max-h-full object-contain shadow-2xl"
              />
            </AnimatePresence>

            {/* 导航按钮 - 在手机端也保持可见或通过点击触发 */}
            <div className="absolute inset-0 flex items-center justify-between px-2 md:px-4 opacity-100 md:opacity-0 md:group-hover/nav:opacity-100 transition-opacity pointer-events-none">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateTo('prev')}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/40 backdrop-blur-md hover:bg-background/60 pointer-events-auto transition-all"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateTo('next')}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/40 backdrop-blur-md hover:bg-background/60 pointer-events-auto transition-all"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </Button>
            </div>
          </div>

          {/* 信息区域 */}
          <motion.div 
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="flex-1 w-full md:w-96 flex flex-col space-y-4 md:space-y-8 text-left p-4 md:p-0 overflow-y-auto"
          >
            {/* 这里的控制按钮现在在信息区域顶部，不会遮挡照片 */}
            <div className="flex items-center space-x-2 pt-0 md:pt-2 pb-4 border-b border-border/10">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleAutoPlay}
                className={cn(
                  "rounded-full font-serif text-[10px] tracking-[0.2em] uppercase transition-all",
                  isAutoPlaying ? "text-accent bg-accent/10" : "text-muted-foreground bg-background/20 backdrop-blur-md"
                )}
              >
                {isAutoPlaying ? <Pause className="w-3 h-3 mr-2" /> : <Play className="w-3 h-3 mr-2" />}
                {isAutoPlaying ? t("modal.stopPlay") : t("modal.autoPlay")}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleMusic}
                aria-label={isPlayingMusic ? "关闭背景音乐" : "开启背景音乐"}
                className={cn(
                  "w-8 h-8 rounded-full transition-all",
                  isPlayingMusic ? "text-accent bg-accent/10" : "text-muted-foreground bg-background/20 backdrop-blur-md"
                )}
              >
                {isPlayingMusic ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
              </Button>
            </div>

            <div className="space-y-4">
              <span className="text-accent text-[10px] font-bold tracking-[0.4em] uppercase">{photo.location}</span>
              <h2 className="text-4xl md:text-5xl font-serif tracking-tighter leading-tight">{photo.title}</h2>
              <p className="text-muted-foreground font-serif italic text-lg leading-relaxed">{photo.description}</p>
            </div>

            <div className="space-y-6 pt-8 border-t border-border/20">
              <div className="flex items-center space-x-4 text-xs tracking-widest uppercase">
                <Calendar className="w-3 h-3 text-accent" />
                <span>{photo.date}</span>
              </div>
              <div className="flex items-center space-x-4 text-xs tracking-widest uppercase">
                <Info className="w-3 h-3 text-accent" />
                <span>{photo.category}</span>
              </div>
            </div>

            <div className="mt-auto pt-12 flex items-center gap-3">
              <Button 
                className="flex-1 h-14 rounded-full font-serif tracking-widest group overflow-hidden relative" 
                variant={liked ? "default" : "outline"}
                onClick={handleLike}
                disabled={loading}
              >
                <Heart className={`w-5 h-5 mr-2 transition-all ${liked ? "fill-current" : ""}`} />
                <span className="relative z-10">{liked ? t("modal.likedBtn") : t("modal.likeBtn")} {likeCount > 0 && `(${likeCount})`}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-14 rounded-full px-5 md:px-6 font-serif tracking-widest shrink-0"
                onClick={handleShare}
                aria-label={t("modal.shareBtn")}
              >
                <Share2 className="w-5 h-5 mr-2" />
                <span>{t("modal.shareBtn")}</span>
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

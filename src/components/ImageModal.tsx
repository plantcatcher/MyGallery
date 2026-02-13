import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, MapPin, Calendar, Info, Heart, ChevronLeft, ChevronRight, Play, Pause, Music, VolumeX, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Photo } from "@/types/photography";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { likePhoto, unlikePhoto, getPhotoLikes, checkUserLiked } from "@/db/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ImageModalProps {
  photo: Photo | null;
  allPhotos?: Photo[];
  onClose: () => void;
  onNavigate?: (photo: Photo) => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ photo, allPhotos = [], onClose, onNavigate }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentIndex = allPhotos.findIndex(p => p.id === photo?.id);

  // 初始化音频
  useEffect(() => {
    audioRef.current = new Audio("https://planetgis.cn/bgm.mp3");
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
    
    // 如果开启自动播放且音乐没在播，则自动响起音乐
    if (newAutoPlay && !isPlayingMusic) {
      setIsPlayingMusic(true);
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
    onNavigate(allPhotos[nextIndex]);
  }, [currentIndex, allPhotos, onNavigate]);

  useEffect(() => {
    if (photo) {
      loadLikeData();
    }
  }, [photo, user]);

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
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, photo, navigateTo]);

  const loadLikeData = async () => {
    if (!photo) return;
    
    const [count, isLiked] = await Promise.all([
      getPhotoLikes(photo.id),
      checkUserLiked(photo.id, user?.id)
    ]);
    
    setLikeCount(count);
    setLiked(isLiked);
  };

  const handleLike = async () => {
    if (!photo || loading) return;
    
    setLoading(true);
    try {
      if (liked) {
        await unlikePhoto(photo.id, user?.id);
        setLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
        toast.success("已取消点赞");
      } else {
        await likePhoto(photo.id, user?.id);
        setLiked(true);
        setLikeCount(prev => prev + 1);
        toast.success("点赞成功");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!photo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-background/95 backdrop-blur-xl p-4 md:p-12"
        onClick={onClose}
      >
        <div className="absolute top-6 left-6 z-[70] flex items-center space-x-2">
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
            {isAutoPlaying ? "停止播放" : "自动播放"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleMusic}
            className={cn(
              "w-8 h-8 rounded-full transition-all",
              isPlayingMusic ? "text-accent bg-accent/10" : "text-muted-foreground bg-background/20 backdrop-blur-md"
            )}
          >
            {isPlayingMusic ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-6 right-6 z-[70] hover:bg-muted"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </Button>

        <div 
          className="relative w-full h-full max-w-7xl flex flex-col md:flex-row gap-8 items-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image Side */}
          <div className="flex-1 w-full h-full flex items-center justify-center overflow-hidden relative group/nav">
            <motion.img
              key={photo.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.05, opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
              src={photo.url}
              alt={photo.title}
              className="max-w-full max-h-full object-contain"
            />

            {/* Navigation Buttons */}
            <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover/nav:opacity-100 transition-opacity pointer-events-none">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateTo('prev')}
                className="w-12 h-12 rounded-full bg-background/20 backdrop-blur-md hover:bg-background/40 pointer-events-auto transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateTo('next')}
                className="w-12 h-12 rounded-full bg-background/20 backdrop-blur-md hover:bg-background/40 pointer-events-auto transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Info Side */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full md:w-96 flex flex-col space-y-8 text-left"
          >
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

            <div className="mt-auto pt-12">
              <Button 
                className="w-full h-14 rounded-full font-serif tracking-widest group overflow-hidden relative" 
                variant={liked ? "default" : "outline"}
                onClick={handleLike}
                disabled={loading}
              >
                <Heart className={`w-5 h-5 mr-2 transition-all ${liked ? "fill-current" : ""}`} />
                <span className="relative z-10">{liked ? "已点赞" : "点赞"} {likeCount > 0 && `(${likeCount})`}</span>
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

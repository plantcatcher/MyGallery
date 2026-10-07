import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import PageMeta from "@/components/common/PageMeta";
import { blogPosts, getAllTags } from "@/lib/blog";
import { cn } from "@/lib/utils";
import { MapPin, Clock } from "lucide-react";

const BlogListPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTag, setActiveTag] = useState<string>("all");
  const tags = useMemo(() => getAllTags(), []);

  const posts = useMemo(() => {
    if (activeTag === "all") return blogPosts;
    return blogPosts.filter((p) => p.tags.includes(activeTag));
  }, [activeTag]);

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 py-12 md:py-24">
      <PageMeta title={t("seo.blogTitle")} description={t("seo.blogDesc")} />

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 mb-14"
      >
        <span className="text-accent text-[10px] font-bold tracking-[0.4em] uppercase">
          {t("blog.subtitle")}
        </span>
        <h1 className="text-5xl md:text-7xl font-serif tracking-tighter leading-none">
          {t("blog.title")}
        </h1>
        <p className="text-muted-foreground font-serif italic max-w-xl leading-relaxed">
          {t("blog.description")}
        </p>
      </motion.section>

      {/* 标签筛选 */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-12 pb-6 border-b border-border/30">
          <TagChip active={activeTag === "all"} onClick={() => setActiveTag("all")}>
            {t("blog.allTags")}
          </TagChip>
          {tags.map((tag) => (
            <TagChip key={tag} active={activeTag === tag} onClick={() => setActiveTag(tag)}>
              {tag}
            </TagChip>
          ))}
        </div>
      )}

      {/* 文章列表 */}
      {posts.length === 0 ? (
        <p className="text-muted-foreground font-serif italic">{t("blog.empty")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-14">
          {posts.map((post, idx) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: Math.min(idx * 0.06, 0.3) }}
            >
              <Link to={`/blog/${post.slug}`} className="group block">
                {post.cover && (
                  <div className="overflow-hidden border border-border">
                    <img
                      src={post.cover}
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                )}
                <div className="pt-5 space-y-3">
                  <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <span>{post.date}</span>
                    {post.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {post.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readingTime} {t("blog.minRead")}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif tracking-tighter leading-tight group-hover:text-accent transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] uppercase tracking-widest text-accent/80 border border-accent/30 px-2 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      )}

      {/* 底部 */}
      <div className="py-24 text-center">
        <p className="text-muted-foreground text-xs font-serif italic tracking-[0.3em]">
          {t("blog.footer")}
        </p>
      </div>
    </div>
  );
};

const TagChip: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-colors",
      active
        ? "border-accent text-accent bg-accent/10"
        : "border-border text-muted-foreground hover:border-accent/50 hover:text-accent"
    )}
  >
    {children}
  </button>
);

export default BlogListPage;

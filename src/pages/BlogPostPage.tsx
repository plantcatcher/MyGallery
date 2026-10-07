import React from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import PageMeta from "@/components/common/PageMeta";
import { getBlogPost, getAdjacentPosts } from "@/lib/blog";
import { MapPin, Clock, ArrowLeft, ArrowRight } from "lucide-react";

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const post = slug ? getBlogPost(slug) : undefined;
  const { prev, next } = slug ? getAdjacentPosts(slug) : {};

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center space-y-6">
        <p className="text-muted-foreground font-serif italic">这一页，走失在风里了。</p>
        <Link to="/blog" className="inline-block text-accent hover:underline">
          {t("blog.backToList")}
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-6 md:px-12 py-12 md:py-20">
      <PageMeta
        title={`${post.title} | ${t("blog.title")}`}
        description={post.excerpt ?? post.title}
        image={post.cover}
        type="article"
        url={`/blog/${post.slug}`}
      />

      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors mb-10"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {t("blog.backToList")}
      </Link>

      {/* 元信息 + 标题 */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>{post.date}</span>
          {post.location && (
            <span className="flex items-center gap-1 text-accent">
              <MapPin className="w-3 h-3" />
              {post.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.readingTime} {t("blog.minRead")}
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-serif tracking-tighter leading-[1.1]">
          {post.title}
        </h1>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
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
      </motion.header>

      {/* 封面 */}
      {post.cover && (
        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="my-10 overflow-hidden border border-border"
        >
          <img
            src={post.cover}
            alt={post.title}
            decoding="async"
            className="w-full aspect-[16/9] object-cover"
          />
        </motion.div>
      )}

      {/* 正文（marked 渲染的 HTML） */}
      <div className="blog-prose" dangerouslySetInnerHTML={{ __html: post.html }} />

      {/* 上一篇 / 下一篇 */}
      <nav className="mt-20 pt-8 border-t border-border/40 grid grid-cols-2 gap-6">
        <div>
          {prev && (
            <Link to={`/blog/${prev.slug}`} className="group block space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> {t("blog.prev")}
              </span>
              <span className="font-serif tracking-tight group-hover:text-accent transition-colors">
                {prev.title}
              </span>
            </Link>
          )}
        </div>
        <div className="text-right">
          {next && (
            <Link to={`/blog/${next.slug}`} className="group block space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1 justify-end">
                {t("blog.next")} <ArrowRight className="w-3 h-3" />
              </span>
              <span className="font-serif tracking-tight group-hover:text-accent transition-colors">
                {next.title}
              </span>
            </Link>
          )}
        </div>
      </nav>
    </article>
  );
};

export default BlogPostPage;

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { changelog, ChangeItem, ChangeType } from "@/data/changelog";
import PageMeta from "@/components/common/PageMeta";
import { cn } from "@/lib/utils";
import { Sparkles, Bug, ArrowUp } from "lucide-react";

const typeConfig: Record<ChangeType, { icon: React.ReactNode; labelZh: string; labelEn: string; color: string }> = {
  feature: {
    icon: <Sparkles className="w-3.5 h-3.5" />,
    labelZh: "新增",
    labelEn: "Feature",
    color: "text-emerald-500",
  },
  improvement: {
    icon: <ArrowUp className="w-3.5 h-3.5" />,
    labelZh: "优化",
    labelEn: "Improved",
    color: "text-blue-500",
  },
  fix: {
    icon: <Bug className="w-3.5 h-3.5" />,
    labelZh: "修复",
    labelEn: "Fixed",
    color: "text-amber-500",
  },
};

const priorityDot: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-muted-foreground/40",
};

const ChangelogPage: React.FC = () => {
  const { t } = useTranslation();
  const isZh = i18n.language === "zh" || i18n.language.startsWith("zh");

  // 统计数据
  const stats = useMemo(() => {
    const all = changelog.flatMap((v) => v.changes);
    return {
      total: all.length,
      features: all.filter((c) => c.type === "feature").length,
      improvements: all.filter((c) => c.type === "improvement").length,
      fixes: all.filter((c) => c.type === "fix").length,
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 py-12 md:py-24">
      <PageMeta title={t("seo.changelogTitle")} description={t("seo.changelogDesc")} />

      {/* 标题区 */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 mb-20"
      >
        <span className="text-accent text-[10px] font-bold tracking-[0.4em] uppercase">
          {t("changelog.subtitle")}
        </span>
        <h1 className="text-5xl md:text-7xl font-serif tracking-tighter leading-none">
          {t("changelog.title")}
        </h1>
        <p className="text-muted-foreground font-serif italic max-w-lg leading-relaxed">
          {t("changelog.description")}
        </p>

        {/* 统计栏 */}
        <div className="flex flex-wrap gap-8 pt-6">
          <StatCard value={stats.total} label={t("changelog.statTotal")} />
          <StatCard value={stats.features} label={t("changelog.statFeatures")} />
          <StatCard value={stats.improvements} label={t("changelog.statImprovements")} />
          <StatCard value={stats.fixes} label={t("changelog.statFixes")} />
        </div>
      </motion.section>

      {/* 图例 */}
      <div className="flex flex-wrap items-center gap-6 mb-12 pb-6 border-b border-border/30">
        {(Object.keys(typeConfig) as ChangeType[]).map((key) => {
          const cfg = typeConfig[key];
          return (
            <div key={key} className="flex items-center space-x-2">
              <span className={cn("flex items-center space-x-1.5 text-[10px] uppercase tracking-widest", cfg.color)}>
                {cfg.icon}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {isZh ? cfg.labelZh : cfg.labelEn}
              </span>
            </div>
          );
        })}
        <div className="flex items-center space-x-2">
          <span className={cn("w-1.5 h-1.5 rounded-full", priorityDot.high)} />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {t("changelog.priorityHigh")}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={cn("w-1.5 h-1.5 rounded-full", priorityDot.medium)} />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {t("changelog.priorityMedium")}
          </span>
        </div>
      </div>

      {/* 版本时间线 */}
      <div className="space-y-20">
        {changelog.map((version, vIdx) => (
          <motion.div
            key={version.version}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* 版本头 */}
            <div className="flex items-center space-x-6">
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-accent font-bold tracking-[0.3em] uppercase">
                  {version.date}
                </span>
                <h2 className="text-4xl md:text-5xl font-serif tracking-tighter mt-1">
                  {version.version}
                </h2>
              </div>
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                {version.changes.length} {t("changelog.itemsUnit")}
              </span>
            </div>

            {/* 版本摘要 */}
            <p className="text-sm text-muted-foreground font-serif italic leading-relaxed max-w-2xl">
              {isZh ? version.summaryZh : version.summaryEn}
            </p>

            {/* 更新项目列表 */}
            <div className="space-y-3">
              {version.changes.map((item, idx) => (
                <ChangeRow key={`${version.version}-${idx}`} item={item} isZh={isZh} index={idx} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 底部 */}
      <div className="py-24 text-center">
        <p className="text-muted-foreground text-xs font-serif italic tracking-[0.3em]">
          {t("changelog.footer")}
        </p>
      </div>
    </div>
  );
};

// 统计卡片
const StatCard: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="space-y-1">
    <div className="text-3xl font-serif tracking-tighter">{value}</div>
    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
  </div>
);

// 更新项目行
const ChangeRow: React.FC<{ item: ChangeItem; isZh: boolean; index: number }> = ({ item, isZh, index }) => {
  const cfg = typeConfig[item.type];
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.05, 0.4) }}
      className="group relative pl-8 py-4 border-l border-border/40 hover:border-accent/40 transition-colors"
    >
      {/* 优先级圆点 */}
      <div className={cn(
        "absolute left-0 top-6 -translate-x-1/2 w-2 h-2 rounded-full transition-transform group-hover:scale-150",
        priorityDot[item.priority]
      )} />

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-3">
            <span className={cn("flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold", cfg.color)}>
              {cfg.icon}
              {isZh ? cfg.labelZh : cfg.labelEn}
            </span>
            <h3 className="text-sm font-serif tracking-tight">
              {isZh ? item.titleZh : item.titleEn}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed pl-1">
            {isZh ? item.descZh : item.descEn}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ChangelogPage;

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Award, Camera, Map, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import PageMeta from "@/components/common/PageMeta";

// 摄影师肖像图：替换为本地或稳定的 CDN 链接
const PHOTOGRAPHER_AVATAR = "https://miaoda-conversation-file.cdn.bcebos.com/user-9cva4ifsa1vk/conv-9kf03ktlf1ts/20260212/file-9kvi49kl9d6o.jpg";

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-24">
      <PageMeta title={t("seo.profileTitle")} description={t("seo.profileDesc")} />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 items-start">
        {/* Left: Image */}
        <div className="md:col-span-5 lg:col-span-4 md:sticky top-32">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="aspect-[3/4] overflow-hidden bg-muted"
          >
            {imgError ? (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                <Camera className="w-16 h-16 text-muted-foreground/20" />
                <span className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.3em]">
                  {t("profile.badge")}
                </span>
              </div>
            ) : (
              <img
                src={PHOTOGRAPHER_AVATAR}
                alt="Photographer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            )}
          </motion.div>
          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-bold tracking-tighter uppercase">{t("profile.badge")}</h3>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span className="text-sm">{t("profile.verified")}</span>
            </div>
          </div>
        </div>

        {/* Right: Text */}
        <div className="md:col-span-7 lg:col-span-8 space-y-20 relative z-10">
          <section className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <span className="text-accent text-xs font-bold tracking-[0.4em] uppercase">{t("profile.subtitle")}</span>
              <h1 className="text-5xl md:text-8xl font-serif tracking-tighter leading-tight">
                {t("profile.title1")}<br /><span className="italic text-muted-foreground/40">{t("profile.title2")}</span>{t("profile.titleEnd")}
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-serif italic text-lg md:text-xl text-muted-foreground leading-relaxed space-y-6 max-w-2xl"
            >
              <p>
                {t("profile.p1")}
              </p>
              <p>{t("profile.p2")}</p>
              <p>
                {t("profile.p3")}
              </p>
            </motion.div>
          </section>

          {/* Special Experience */}
          <section className="py-12 space-y-12">
            <h3 className="text-sm font-bold tracking-[0.3em] uppercase text-accent border-b border-accent/20 pb-4 inline-block">{t("profile.journeyTitle")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h4 className="font-serif text-2xl italic">{t("profile.exp1Title")}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{t("profile.exp1Desc")}</p>
              </div>
              <div className="space-y-4">
                <h4 className="font-serif text-2xl italic">{t("profile.exp2Title")}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{t("profile.exp2Desc")}</p>
              </div>
            </div>
          </section>

          {/* Equipment */}
          <section className="space-y-8">
            <h3 className="text-2xl font-bold tracking-tighter uppercase">{t("profile.gearTitle")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h4 className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Camera Bodies</h4>
                <ul className="space-y-2 text-sm">
                  <li>FUJI XT-3</li>
                  <li>DJI Action 3</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Lenses</h4>
                <ul className="space-y-2 text-sm">
                  <li>FE 12-24mm f/2.8 GM</li>
                  <li>FE 24-70mm f/2.8 GM II</li>
                  <li>FE 70-200mm f/2.8 GM OSS II</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

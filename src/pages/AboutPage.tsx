import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Mail, Instagram, Globe, ShieldCheck } from "lucide-react";
import PageMeta from "@/components/common/PageMeta";

const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-24 space-y-24">
      <PageMeta title={t("seo.aboutTitle")} description={t("seo.aboutDesc")} />
      {/* Contact Section */}
      <section className="space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <span className="text-accent text-xs font-bold tracking-[0.4em] uppercase">{t("about.subtitle")}</span>
          <h1 className="text-6xl md:text-9xl font-serif tracking-tighter leading-none">
            {t("about.title1")}<br />
            {t("about.title2")}<span className="italic text-muted-foreground/30">{t("about.title3")}</span>{t("about.titleEnd")}
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          <div className="space-y-12">
            <p className="text-xl md:text-2xl font-serif italic text-muted-foreground leading-relaxed max-w-md">
              {t("about.description")}
            </p>
            <div className="flex flex-col space-y-6">
              <a
                href="mailto:zaynhuang@outlook.com"
                className="text-2xl md:text-5xl font-serif hover:text-accent transition-all duration-700 flex items-center group"
              >
                <div className="w-12 h-px bg-accent mr-4 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700" />
                zaynhuang@outlook.com
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <SocialLink icon={<Instagram />} name="Instagram" handle="@zayn_huang_" url="https://www.instagram.com/zayn_huang_" />
            <SocialLink icon={<Globe />} name="500px" handle="zaynhuangphoto" url="https://500px.com.cn/zaynhuangphoto" />
          </div>
        </div>
      </section>

      {/* Copyright Section */}
      <section className="pt-24 border-t border-border/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="col-span-1 space-y-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-accent" />
              <h2 className="text-xl font-bold tracking-tighter uppercase">{t("about.copyrightTitle")}</h2>
            </div>
          </div>
          <div className="col-span-2 space-y-8 text-muted-foreground leading-relaxed">
            <p>
              {t("about.copyrightDesc")}
            </p>
            <div className="space-y-4">
              <h4 className="text-foreground font-bold">{t("about.commercialTitle")}</h4>
              <p>
                {t("about.commercialDesc")}
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-foreground font-bold">{t("about.nonCommercialTitle")}</h4>
              <p>
                {t("about.nonCommercialDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const SocialLink = ({ icon, name, handle, url }: { icon: React.ReactNode; name: string; handle: string; url?: string }) => (
  <a href={url || "#"} target={url ? "_blank" : undefined} rel={url ? "noopener noreferrer" : undefined} className="group block space-y-2">
    <div className="text-muted-foreground group-hover:text-accent transition-colors">
      {icon}
    </div>
    <div className="font-bold">{name}</div>
    <div className="text-xs text-muted-foreground">{handle}</div>
  </a>
);

export default AboutPage;

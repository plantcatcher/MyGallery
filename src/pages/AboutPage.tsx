import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Mail, Instagram, Globe, ShieldCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createMessage, getPublicMessages, PublicMessage } from "@/db/api";
import PageMeta from "@/components/common/PageMeta";
import { toast } from "sonner";

const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    content: ""
  });
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<PublicMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const loadMessages = useCallback(async () => {
    setLoadingMessages(true);
    const data = await getPublicMessages(50);
    setMessages(data);
    setLoadingMessages(false);
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.content) {
      toast.error(t("about.errorRequired"));
      return;
    }

    setLoading(true);
    try {
      await createMessage(formData);
      toast.success(t("about.successMessage"));
      setFormData({ name: "", email: "", content: "" });
      // 刷新留言列表
      loadMessages();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

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

      {/* Message Board Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-secondary/30 p-8 md:p-16 rounded-sm border border-border/10">
        <div className="space-y-6">
          <h2 className="text-4xl font-serif tracking-tighter">{t("about.messageBoard")}</h2>
          <p className="text-muted-foreground font-serif italic leading-relaxed">
            {t("about.messageDesc1")}<br />
            {t("about.messageDesc2")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("about.name")}</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("about.namePlaceholder")}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("about.email")}</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t("about.emailPlaceholder")}
                className="bg-background/50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("about.content")}</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder={t("about.contentPlaceholder")}
              rows={5}
              className="bg-background/50 resize-none"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-none font-serif tracking-widest bg-foreground text-background hover:bg-accent transition-all"
          >
            {loading ? t("about.submitting") : t("about.submit")}
            <Send className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </section>

      {/* 已有留言展示 */}
      <section className="space-y-12">
        <div className="space-y-4">
          <span className="text-accent text-[10px] font-bold tracking-[0.4em] uppercase">{t("about.echoWall")}</span>
          <h2 className="text-3xl md:text-5xl font-serif tracking-tighter">{t("about.echoesTitle")}</h2>
          <p className="text-muted-foreground font-serif italic max-w-md">
            {t("about.echoesDesc")}
          </p>
        </div>

        {loadingMessages ? (
          <p className="text-muted-foreground font-serif italic">{t("about.loadingMessages")}</p>
        ) : messages.length === 0 ? (
          <p className="text-muted-foreground font-serif italic py-8">{t("about.noPublicMessages")}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="border-l-2 border-accent/30 pl-6 py-2 space-y-3"
              >
                <p className="text-foreground/90 font-serif italic leading-relaxed whitespace-pre-wrap">
                  "{msg.content}"
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-serif tracking-tight">— {msg.name}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
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

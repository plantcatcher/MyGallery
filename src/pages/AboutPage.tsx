import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Instagram, Globe, ShieldCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createMessage } from "@/db/api";
import { toast } from "sonner";

const AboutPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    content: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.content) {
      toast.error("请填写姓名和内容");
      return;
    }

    setLoading(true);
    try {
      await createMessage(formData);
      toast.success("留言已送达，感谢您的反馈");
      setFormData({ name: "", email: "", content: "" });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-24 space-y-24">
      {/* Contact Section */}
      <section className="space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <span className="text-accent text-xs font-bold tracking-[0.4em] uppercase">联系与回声</span>
          <h1 className="text-6xl md:text-9xl font-serif tracking-tighter leading-none">
            所有的相遇<br />
            都是<span className="italic text-muted-foreground/30">久别重逢</span>。
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          <div className="space-y-12">
            <p className="text-xl md:text-2xl font-serif italic text-muted-foreground leading-relaxed max-w-md">
              如果你在我的作品里听到了某种回声，或者你想和我一起去捕捉那些易碎的光。
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
          <h2 className="text-4xl font-serif tracking-tighter">留言板</h2>
          <p className="text-muted-foreground font-serif italic leading-relaxed">
            在这里留下你的足迹。<br />
            无论是关于作品的感触，或是某种未曾言说的共鸣，我都会在这里细心聆听。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">姓名 *</label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="如何称呼您" 
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">邮箱</label>
              <Input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="以便我回复您" 
                className="bg-background/50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">内容 *</label>
            <Textarea 
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="此刻您的所思所感..." 
              rows={5}
              className="bg-background/50 resize-none"
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 rounded-none font-serif tracking-widest bg-foreground text-background hover:bg-accent transition-all"
          >
            {loading ? "递交中..." : "投递回声"}
            <Send className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </section>

      {/* Copyright Section */}
      <section className="pt-24 border-t border-border/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="col-span-1 space-y-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-accent" />
              <h2 className="text-xl font-bold tracking-tighter uppercase">版权与授权</h2>
            </div>
          </div>
          <div className="col-span-2 space-y-8 text-muted-foreground leading-relaxed">
            <p>
              本网站展示的所有摄影作品版权均归摄影师本人所有。受《中华人民共和国著作权法》及国际版权公约保护。
            </p>
            <div className="space-y-4">
              <h4 className="text-foreground font-bold">商业授权</h4>
              <p>
                如果您需要将作品用于商业用途（包括但不限于广告、出版、社交媒体推广等），请联系我获取官方授权协议。部分作品已同步至视觉中国（VCG）图库，您亦可通过该平台购买标准授权。
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-foreground font-bold">非商业使用</h4>
              <p>
                在保留水印且注明作者出处的前提下，欢迎个人学习交流性质的转载。严禁任何形式的去水印、二次创作或未经授权的商业转售。
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

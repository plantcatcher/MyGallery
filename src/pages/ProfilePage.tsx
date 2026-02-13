import React from "react";
import { motion } from "framer-motion";
import { Award, Camera, Map, CheckCircle2 } from "lucide-react";

const ProfilePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 items-start">
        {/* Left: Image */}
        <div className="md:col-span-5 lg:col-span-4 md:sticky top-32">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="aspect-[3/4] overflow-hidden bg-muted"
          >
            <img
              src="https://miaoda-conversation-file.cdn.bcebos.com/user-9cva4ifsa1vk/conv-9kf03ktlf1ts/20260212/file-9kvi49kl9d6o.jpg"
              alt="Photographer"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
          </motion.div>
          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-bold tracking-tighter uppercase">视觉中国签约摄影师</h3>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span className="text-sm">Verified Professional</span>
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
              <span className="text-accent text-xs font-bold tracking-[0.4em] uppercase">关于我的自白</span>
              <h1 className="text-5xl md:text-8xl font-serif tracking-tighter leading-tight">
                一个在荒野中<br /><span className="italic text-muted-foreground/40">收集光的人</span>。
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-serif italic text-lg md:text-xl text-muted-foreground leading-relaxed space-y-6 max-w-2xl"
            >
              <p>
                摄影对我来说，不是记录，而是寻找——寻找那些我无法用言语表达的、关于存在本身的细微震颤。我叫 Zayn，一个居住在深圳的摄影师。
              </p>
              <p>{"我的性格里有着典型的 INFP 特质：理想主义、总是在现实的边缘游走。镜头是我与这个世界沟通的桥梁。在那些渺无人烟的荒原，我感到的不是孤独，而是某种跨越时空的共鸣。"}</p>
              <p>
                每一张照片，都是我灵魂的一个切切片。我不追求完美的构图，我追求的是那个能让我心脏漏跳一拍的瞬间。
              </p>
            </motion.div>
          </section>

          {/* Special Experience */}
          <section className="py-12 space-y-12">
            <h3 className="text-sm font-bold tracking-[0.3em] uppercase text-accent border-b border-accent/20 pb-4 inline-block">旅程的印记</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h4 className="font-serif text-2xl italic">山脉的洗礼</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">在海拔5000米的冈仁波齐，我学会了向大自然低头。那里的空气稀薄得像是一场梦，每一口呼吸都提醒着我生命的脆弱与伟大。</p>
              </div>
              <div className="space-y-4">
                <h4 className="font-serif text-2xl italic">深圳的光影</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">我居住在深圳，这座城市的快节奏与我内心的慢节奏形成了奇妙的对比。在这里，我学会了在繁华中寻找宁静，在钢筋水泥中发现诗意。</p>
              </div>
            </div>
          </section>

          {/* Equipment */}
          <section className="space-y-8">
            <h3 className="text-2xl font-bold tracking-tighter uppercase">我的装备</h3>
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

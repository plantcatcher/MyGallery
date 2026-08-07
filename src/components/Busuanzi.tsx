import { useEffect, type FC } from "react";
import { useLocation } from "react-router-dom";

// 不蒜子（busuanzi）：免费、纯前端的访问量粗略统计
// 官方脚本地址；如遇官方域名不稳定，可切换为以下备用镜像之一：
//   备用1: https://busuanzi.webpipi.com/busuanzi.pure.mini.js
//   备用2: https://busuanzi.xinghuo123.top/busuanzi.pure.mini.js
const BUSUANZI_SRC = "https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";

// 模块级单例：脚本只注入一次；路由切换时仅靠 busuanzi.fetch() 刷新计数（适配 SPA）
let scriptInjected = false;

const Busuanzi: FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!scriptInjected) {
      scriptInjected = true;
      const s = document.createElement("script");
      s.async = true;
      s.src = BUSUANZI_SRC;
      document.body.appendChild(s);
    }

    // 路由变化后尝试刷新计数（本页 PV / 站点 PV）
    const timer = setTimeout(() => {
      const b = (window as any).busuanzi;
      if (b && typeof b.fetch === "function") {
        b.fetch();
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="flex items-center space-x-3 text-xs text-muted-foreground">
      <span id="busuanzi_container_site_pv" className="flex items-center space-x-1">
        <span>总访问</span>
        <span id="busuanzi_value_site_pv" className="font-medium text-foreground/70">
          --
        </span>
      </span>
      <span className="opacity-30">·</span>
      <span id="busuanzi_container_site_uv" className="flex items-center space-x-1">
        <span>访客</span>
        <span id="busuanzi_value_site_uv" className="font-medium text-foreground/70">
          --
        </span>
      </span>
      <span className="opacity-30">·</span>
      <span id="busuanzi_container_page_pv" className="flex items-center space-x-1">
        <span>本页</span>
        <span id="busuanzi_value_page_pv" className="font-medium text-foreground/70">
          --
        </span>
      </span>
    </div>
  );
};

export default Busuanzi;

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// 思源黑体/思源宋体（Noto Sans/Serif SC）自托管：简体中文子集，随本站资源打包，不依赖任何外部字体源
// 照 00PlanetGIS源码 的方式用 @fontsource 同款字库，Vite 构建时把 woff2 打进 dist/assets，全平台渲染一致
import "./fonts/noto-sans-sc-400.css";
import "./fonts/noto-sans-sc-500.css";
import "./fonts/noto-sans-sc-700.css";
import "./fonts/noto-serif-sc-400.css";
import "./fonts/noto-serif-sc-600.css";
import "./fonts/noto-serif-sc-700.css";
import "./index.css";
import "./i18n";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWrapper>
      <App />
    </AppWrapper>
  </StrictMode>
);

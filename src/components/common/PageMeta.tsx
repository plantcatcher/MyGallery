import { HelmetProvider, Helmet } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";

// 默认分享图：站点代表作品（社交爬虫要求绝对地址，建议图床同时支持 https）
const DEFAULT_OG_IMAGE = "https://galleryphoto.planetgis.cn/PicGo/2026-05-09-HongKongCity.jpg";
const SITE_NAME = "板牙摄影工作室";

const PageMeta = ({
  title,
  description,
  image,
  type = "website",
  url,
}: {
  title: string;
  description: string;
  image?: string;
  type?: string;
  url?: string;
}) => {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const pageUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const ogImage = image
    ? image.startsWith("http")
      ? image
      : `${origin}${image}`
    : DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="zh_CN" />
      {pageUrl && <meta property="og:url" content={pageUrl} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
};

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>
    <TooltipProvider>
      {children}
    </TooltipProvider>
  </HelmetProvider>
);

export default PageMeta;

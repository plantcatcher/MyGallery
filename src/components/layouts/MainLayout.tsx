import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Camera, Instagram, Mail, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import Busuanzi from "@/components/Busuanzi";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.gallery"), path: "/gallery" },
    { name: t("nav.profile"), path: "/profile" },
    { name: t("nav.about"), path: "/about" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent/30 selection:text-foreground">
      {/* Navigation */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-6 md:px-12 py-8",
          scrolled ? "bg-background/40 backdrop-blur-xl py-6 border-b border-border/20" : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Camera className="w-5 h-5 transition-transform duration-500 group-hover:rotate-[15deg] relative z-10" />
              <div className="absolute inset-0 bg-accent/20 blur-lg rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-serif text-lg tracking-[0.2em] uppercase">{t("nav.brand")}</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium tracking-widest uppercase transition-colors hover:text-accent",
                  location.pathname === link.path ? "text-accent" : "text-muted-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
            
            <LanguageSwitcher />
            <ThemeToggle />
          </nav>

          {/* Mobile Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background md:hidden pt-24 px-6"
          >
            <nav className="flex flex-col space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-3xl font-bold tracking-tighter uppercase",
                    location.pathname === link.path ? "text-accent" : "text-foreground"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="mt-12 pt-12 border-t flex items-center justify-between">
              <div className="flex space-x-6">
                <Instagram className="w-6 h-6 text-muted-foreground" />
                <Mail className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex items-center space-x-4">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 pt-24">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 border-t mt-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Zayn Huang. All rights reserved.
          </div>
          <div className="flex items-center space-x-8">
            <Link
              to="/changelog"
              className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center"
            >
              <ScrollText className="w-3.5 h-3.5 mr-1.5" />
              {t("nav.changelog")}
            </Link>
            <button
              onClick={() => {
                navigator.clipboard.writeText("zaynhuang@outlook.com");
                toast.success(t("common.emailCopied"));
              }}
              className="text-sm hover:text-accent transition-colors cursor-pointer"
            >
              Email
            </button>
            <a 
              href="https://www.instagram.com/zayn_huang_" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm hover:text-accent transition-colors"
            >
              Instagram
            </a>
            <a 
              href="https://500px.com.cn/zaynhuangphoto" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm hover:text-accent transition-colors"
            >
              500px
            </a>
            <Busuanzi />
          </div>
        </div>
      </footer>
    </div>
  );
};

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import PageMeta from "@/components/common/PageMeta";

const MIN_PASSWORD_LENGTH = 8;

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInWithUsername } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error(t("login.errorRequired"));
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      toast.error(t("login.passwordTooShort") || `密码至少需要 ${MIN_PASSWORD_LENGTH} 位`);
      return;
    }

    setLoading(true);
    const { error } = await signInWithUsername(username, password);
    setLoading(false);

    if (error) {
      toast.error(`${t("login.loginFailed")} ${error.message}`);
    } else {
      toast.success(t("login.loginSuccess"));
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <PageMeta title={t("seo.loginTitle")} description={t("seo.loginDesc")} />
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Camera className="w-12 h-12" />
              <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full scale-150" />
            </div>
          </div>
          <h1 className="text-4xl font-serif tracking-tighter">{t("login.title")}</h1>
          <p className="text-muted-foreground font-serif italic">{t("login.subtitle")}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("login.welcome")}</CardTitle>
            <CardDescription>{t("login.welcomeDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t("login.username")}</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={t("login.usernamePlaceholder")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("login.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("login.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("login.loggingIn") : t("login.loginBtn")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate("/")}>
            {t("login.backHome")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

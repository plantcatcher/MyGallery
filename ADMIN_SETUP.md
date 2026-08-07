# 管理员账号安全说明

> ⚠️ 本文件仅用于记录管理员账号的管理流程，**不再包含任何密码**。请使用密码管理器保管你的凭据。

## 当前状态

- 网站仅保留你个人的管理员账号，用于管理照片、项目和留言。
- 普通用户注册入口已关闭；登录页面不再自动创建新账号。
- 管理员权限通过 `profiles.role = 'admin'` 控制，由数据库 RLS 策略强制执行。

## 登录方式

1. 访问 `/login` 路径。
2. 输入完整邮箱地址（如 `your-email@example.com`）和密码。
3. 登录成功后，若账号为管理员，导航栏会显示“管理”入口。
4. 点击“管理”进入 `/admin` 后台。

## 密码要求

- 至少 8 位。
- 建议包含大小写字母、数字和符号。
- 不要使用与账号或网站相关的简单单词。

## 重置 / 创建管理员账号

### 方案 A：通过 Supabase Dashboard（推荐，一次性）

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)。
2. 进入项目 `Authentication → Users`。
3. 点击 **Add user** 或选择现有用户 **Send password reset**。
4. 创建用户后，在 SQL Editor 执行：

   ```sql
   UPDATE public.profiles
   SET role = 'admin'::user_role
   WHERE email = 'your-email@example.com';
   ```

5. 如果该用户还未同步到 `profiles` 表，先触发确认邮件，确认后再执行上面的 UPDATE。

### 方案 B：通过 Edge Function `create-admins`

1. 在 Supabase 项目设置中添加环境变量：
   - `ADMIN_SETUP_SECRET`：一个随机强密码（如 32 位随机字符串），仅用于调用此函数。
2. 部署 `supabase/functions/create-admins`。
3. 使用 curl 或 HTTP 工具调用：

   ```bash
   curl -X POST https://<project-ref>.supabase.co/functions/v1/create-admins \
     -H "Content-Type: application/json" \
     -H "x-admin-setup-secret: <ADMIN_SETUP_SECRET>" \
     -d '{
       "admins": [
         { "email": "your-email@example.com", "password": "<STRONG_PASSWORD>", "username": "yourname" }
       ]
     }'
   ```

4. 函数会创建或更新用户，并将其 `profiles.role` 设置为 `admin`。

## 安全加固清单

- [ ] 已将 `ADMIN_SETUP.md` 中的旧密码删除。
- [ ] 已执行 `supabase/migrations/00005_security_hardening.sql` 中的 SQL。
- [ ] 已在前端 `.env` 中确认 `VITE_SUPABASE_ANON_KEY` 是 publishable key（不可写入 Service Role Key）。
- [ ] 已将 `.env` 加入 `.gitignore`，不提交到仓库。
- [ ] 已删除不再需要的管理员账号（如 `zayn2`、`zayn@miaoda.com` 等测试账号）。
- [ ] 已在 Supabase 中开启邮件确认（Email Confirmations），除非你使用 Dashboard 手动创建用户。

## 注意事项

- 不要再把真实密码写进代码、Markdown 或聊天记录中。
- 如果怀疑凭据泄露，立即在 Supabase Dashboard 中重置密码。
- 定期（如每 3-6 个月）更换管理员密码。

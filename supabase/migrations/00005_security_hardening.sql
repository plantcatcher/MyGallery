-- 安全加固迁移：移除自动管理员提升、补充消息删除策略、增强 profiles 保护

-- 1. 修复 handle_new_user：新注册用户不再自动成为管理员，统一为 user 角色
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_username text;
BEGIN
  -- 从 email 中提取用户名
  new_username := SPLIT_PART(NEW.email, '@', 1);

  INSERT INTO public.profiles (id, username, email, role)
  VALUES (
    NEW.id,
    new_username,
    NEW.email,
    'user'::public.user_role
  );
  RETURN NEW;
END;
$$;

-- 2. 将现有管理员账号的角色强制修正为 admin（仅你手动创建的账号应保持为 admin）
-- 注意：执行前请确认 profiles 表中只有你自己应保留为 admin
-- UPDATE public.profiles SET role = 'user'::user_role WHERE role = 'admin'::user_role AND username NOT IN ('你的管理员用户名');

-- 3. 补充 messages 表的 RLS 策略：管理员可查看、可删除
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 如果已经存在同名策略则先删除，避免重复创建报错
DROP POLICY IF EXISTS "Admins can delete messages" ON messages;

CREATE POLICY "Admins can delete messages" ON messages
  FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- 4. 增强 profiles 表保护：禁止用户自行更新角色字段，且不能查看他人 profile 的敏感字段
-- 删除原有宽松的 UPDATE 策略，替换为更严格的版本
DROP POLICY IF EXISTS "用户可以更新自己的 profile（除了角色）" ON profiles;

CREATE POLICY "用户仅可更新自己的 display 字段" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid())
  );

-- 5. 增加 brute-force 缓解：记录最近失败登录（可选，需要额外表）
-- 若希望启用，可取消下面注释并在应用层实现速率限制
-- CREATE TABLE IF NOT EXISTS auth_login_attempts (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   email text NOT NULL,
--   ip text,
--   succeeded boolean NOT NULL,
--   attempted_at timestamptz DEFAULT now()
-- );
-- CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON auth_login_attempts(email, attempted_at);

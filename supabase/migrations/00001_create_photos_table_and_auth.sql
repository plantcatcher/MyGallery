-- 创建用户角色枚举
CREATE TYPE public.user_role AS ENUM ('user', 'admin');

-- 创建用户配置表
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text,
  role user_role NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 创建照片分类枚举
CREATE TYPE public.photo_category AS ENUM ('landscape', 'architecture', 'nature');

-- 创建照片表
CREATE TABLE public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  title text NOT NULL,
  description text,
  category photo_category NOT NULL,
  project text,
  date date NOT NULL,
  location text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 创建项目表
CREATE TABLE public.projects (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text,
  cover_image text NOT NULL,
  year text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 创建辅助函数检查是否为管理员
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;

-- 用户同步触发器
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
  new_username text;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- 从 email 中提取用户名（去掉 @miaoda.com）
  new_username := SPLIT_PART(NEW.email, '@', 1);
  
  INSERT INTO public.profiles (id, username, email, role)
  VALUES (
    NEW.id,
    new_username,
    NEW.email,
    CASE WHEN user_count = 0 THEN 'admin'::public.user_role ELSE 'user'::public.user_role END
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();

-- Profiles 权限策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "管理员可以完全访问 profiles" ON profiles
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "用户可以查看自己的 profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "用户可以更新自己的 profile（除了角色）" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

-- Photos 权限策略
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "所有人可以查看照片" ON photos
  FOR SELECT TO public USING (true);

CREATE POLICY "管理员可以管理照片" ON photos
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Projects 权限策略
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "所有人可以查看项目" ON projects
  FOR SELECT TO public USING (true);

CREATE POLICY "管理员可以管理项目" ON projects
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 插入初始数据
INSERT INTO photos (url, title, description, category, project, date, location) VALUES
('https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_88e4c539-2996-4e81-876c-6c0bb17f88b2.jpg', '众神栖息之所', '在稀薄的氧气中，我听见了群山的呼吸。那是光在雪脊上最后的一抹吻痕。', 'landscape', 'high-altitudes', '2024-01-15', '西藏，高海拔深处'),
('https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_f1b10fd5-c102-4107-92c0-067de177746b.jpg', '时间的褶皱', '森林里的雾是昨日残留的梦，阳光试图唤醒那些沉睡了百年的低语。', 'nature', 'mystic-nature', '2023-11-20', '北国，迷雾森林'),
('https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_2999a840-8343-488f-be20-8df542f2e8f4.jpg', '霓虹的寂寞', '城市的霓虹是失眠者的眼泪。在摩天大楼的影子里，藏着多少未寄出的信。', 'architecture', 'urban-pulse', '2024-02-05', '魔都，钢筋丛林'),
('https://miaoda-site-img.cdn.bcebos.com/images/MiaoTu_c3ee880f-44b0-4ff3-9047-eb962540394b.jpg', '海的留白', '如果海会说话，它一定会告诉我们关于永恒的秘密。蓝是宇宙最深沉的孤独。', 'landscape', 'deep-blue', '2023-08-12', '南海，宁静之滨'),
('https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_38a071ca-aaf7-4fe2-9ae1-e5abf2679976.jpg', '沙的几何', '风是最好的雕塑家。在沙漠的起伏中，我读懂了生命流动的姿态。', 'landscape', 'silent-sands', '2023-10-05', '边陲，流沙之海'),
('https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_c7202a58-e814-448d-a13c-a629477b0b3e.jpg', '水墨的呼吸', '山水本无情，但云烟赋予了它们灵魂。在这里，时间是静止的。', 'landscape', 'ink-wash-waters', '2023-05-20', '漓江，烟雨时分');

INSERT INTO projects (id, title, description, cover_image, year) VALUES
('high-altitudes', '荒原里的回声', '那些关于高度、寒冷与神性的瞬间。我们登顶，是为了看清自己的渺小。', 'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_88e4c539-2996-4e81-876c-6c0bb17f88b2.jpg', '2024'),
('urban-pulse', '被遗忘的城市', '在繁华的缝隙中寻找宁静，捕捉钢铁森林中那些柔软的、易碎的诗意。', 'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_2999a840-8343-488f-be20-8df542f2e8f4.jpg', '2023-2024'),
('silent-sands', '风的足迹', '关于流动与永恒。沙漠是地球上最接近外星的地方，它在沉默中讲述万物起源。', 'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_38a071ca-aaf7-4fe2-9ae1-e5abf2679976.jpg', '2023');
-- 创建点赞表
CREATE TABLE public.photo_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id uuid NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  session_id text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(photo_id, user_id),
  UNIQUE(photo_id, session_id)
);

-- 创建点赞统计视图
CREATE VIEW photo_like_counts AS
SELECT 
  photo_id,
  COUNT(*) as like_count
FROM photo_likes
GROUP BY photo_id;

-- 点赞表权限策略
ALTER TABLE photo_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "所有人可以查看点赞" ON photo_likes
  FOR SELECT TO public USING (true);

CREATE POLICY "已登录用户可以点赞" ON photo_likes
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "游客可以通过 session_id 点赞" ON photo_likes
  FOR INSERT TO anon
  WITH CHECK (session_id IS NOT NULL AND user_id IS NULL);

CREATE POLICY "用户可以取消自己的点赞" ON photo_likes
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "游客可以通过 session_id 取消点赞" ON photo_likes
  FOR DELETE TO anon
  USING (session_id IS NOT NULL AND user_id IS NULL);
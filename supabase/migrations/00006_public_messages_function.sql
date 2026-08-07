-- 06: 新增公开留言查询函数
-- 目的：允许匿名用户在留言板查看已发布的留言（仅 name / content / created_at，不暴露 email）
-- 通过 SECURITY DEFINER 函数绕过 RLS，但只返回脱敏后的字段

CREATE OR REPLACE FUNCTION get_public_messages(limit_count int DEFAULT 50)
RETURNS TABLE (
  id uuid,
  name text,
  content text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name, content, created_at
  FROM messages
  ORDER BY created_at DESC
  LIMIT GREATEST(1, LEAST(limit_count, 200));
$$;

-- 允许匿名与已认证用户调用该函数（仅返回公开字段）
GRANT EXECUTE ON FUNCTION get_public_messages(int) TO anon, authenticated;

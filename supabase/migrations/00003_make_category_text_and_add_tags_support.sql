-- 1. 将 photos 表的 category 列改为 text 类型
-- 首先，我们需要查一下当前的类型名称，通常是 'photo_category' 这种
ALTER TABLE photos ALTER COLUMN category TYPE text;

-- 2. 如果以后需要专门的标签管理，可以在这里扩展，目前先用 text 实现自定义

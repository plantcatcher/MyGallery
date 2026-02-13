CREATE TABLE messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS 策略
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert messages" ON messages
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Admins can view messages" ON messages
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

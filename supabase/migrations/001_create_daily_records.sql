-- 归位 Supabase 数据库迁移脚本
-- 在 Supabase Dashboard > SQL Editor 中运行此脚本

CREATE TABLE IF NOT EXISTS daily_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL DEFAULT 'default_user',
  date text NOT NULL,
  top_three_tasks jsonb DEFAULT '["", "", ""]',
  pauses jsonb DEFAULT '[]',
  actions jsonb DEFAULT '[]',
  preview_for_tomorrow jsonb DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- 创建索引提升查询性能
CREATE INDEX IF NOT EXISTS idx_daily_records_user_date ON daily_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_records_date ON daily_records(date);

-- 设置 RLS 策略（行级安全）
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;

-- 允许匿名读取（因为使用 anon key）
CREATE POLICY "Allow public read access" ON daily_records
  FOR SELECT USING (true);

-- 允许匿名插入
CREATE POLICY "Allow public insert" ON daily_records
  FOR INSERT WITH CHECK (true);

-- 允许匿名更新
CREATE POLICY "Allow public update" ON daily_records
  FOR UPDATE USING (true);

-- 允许匿名删除
CREATE POLICY "Allow public delete" ON daily_records
  FOR DELETE USING (true);
